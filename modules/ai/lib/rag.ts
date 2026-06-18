import { pineconeIndex } from '@/lib/pinecone';
import type { RecordMetadata, PineconeRecord } from '@pinecone-database/pinecone';

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

export async function generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "models/gemini-embedding-001",
                content: { parts: [{ text }] },
                outputDimensionality: 768,
            }),
        }
    );

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Embedding API error: ${err}`);
    }

    const data = await response.json();
    return data.embedding.values;
}

export async function indexCodebase(
    repoId: string,
    files: { path: string; content: string }[]
) {
    console.log("indexCodebase called with", files.length, "files");

    const BATCH_EMBED = 2;
    const vectors: PineconeRecord<RecordMetadata>[] = [];

    for (let i = 0; i < files.length; i += BATCH_EMBED) {
        const batch = files.slice(i, i + BATCH_EMBED);

        const results = await Promise.all(
            batch.map(async (file) => {
                const content = `File: ${file.path}\n\n${file.content}`;
                const truncated = content.slice(0, 8000);

                try {
                    const embedding = await generateEmbedding(truncated);
                    console.log(`✅ Embedded: ${file.path} | dims: ${embedding.length}`);
                    return {
                        id: `${repoId}-${file.path.replace(/\//g, "_")}`,
                        values: embedding,
                        metadata: { repoId, path: file.path, content: truncated },
                    } as PineconeRecord<RecordMetadata>;
                } catch (err) {
                    console.error(`❌ Embedding failed: ${file.path}`, err);
                    return null;
                }
            })
        );

        vectors.push(...results.filter((r): r is PineconeRecord<RecordMetadata> => r !== null));
        await new Promise(resolve => setTimeout(resolve, 2000)); // 👈 add this

    }

    console.log(`Total vectors ready to upsert: ${vectors.length}`);

    if (vectors.length > 0) {
        for (let i = 0; i < vectors.length; i += 100) {
            const batch = vectors.slice(i, i + 100);
            try {
                await pineconeIndex.upsert({records: batch});
                console.log(`✅ Upserted ${batch.length} vectors`);
            } catch (err) {
                console.error("❌ Upsert error:", err);
            }
        }
    } else {
        console.log("⚠️ No vectors to upsert!");
    }

    console.log("indexing complete");
}



export async function retrieveContext(query: string,  repoId: string, topK=5) {
    const embedding = await generateEmbedding(query);

    const results = await pineconeIndex.query({
        vector: embedding,
        filter: {repoId},
        topK,
        includeMetadata:true
    })

    return results.matches.map(match=>match.metadata?.content as string).filter(Boolean)
}