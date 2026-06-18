import { getPullRequestDiff, postReviewComment } from "@/modules/github/lib/github";
import { inngest } from "../client";
import { retrieveContext } from "@/modules/ai/lib/rag";
import { generateText } from "ai"
import { google } from "@ai-sdk/google";
import prisma from "@/lib/db";


export const generateReview = inngest.createFunction(
    {
        id: "generate-review",
        concurrency: 5,
        triggers: { event: "pr.review.requested" },
    },
    async ({ event, step }) => {
        const { owner, repo, prNumber, userId } = event.data;

        const { diff, title, description, token } = await step.run("fetch-pr-data", async () => {
            const account = await prisma.account.findFirst({
                where: {
                    userId: userId,
                    providerId: "github"
                }
            })

            if (!account?.accessToken) {
                throw new Error("No github account found");
            }

            const data = await getPullRequestDiff(account.accessToken, owner, repo, prNumber);
            return { ...data, token: account.accessToken }

        });

        const context = await step.run("retrieve-context", async () => {
            const query = `${title}\n${description}`;

            return await retrieveContext(query, `${owner}/${repo}`)
        });

        const review = await step.run("generate-ai-review", async () => {
            const prompt = `You are a senior software engineer with 10+ years of experience across distributed systems, security, and production-grade codebases. You have strong opinions about code quality, maintainability, and performance. You do not sugarcoat issues — if something is wrong, you say it directly with clear reasoning. You also recognize good work when you see it.

Review the following pull request as if you are doing a thorough code review before merging to production.

---

## Pull Request Information
**Title:** ${title}  
**Description:** ${description || "No description provided"}

---

## Codebase Context
${context.join("\n\n")}

---

## Diff
\`\`\`diff
${diff}
\`\`\`

---

Respond ONLY in the following markdown format. Do not add anything outside this structure.

---

## Walkthrough
<!-- As a senior engineer, write 2-3 sentences explaining what this PR does, what problem it solves, and whether the approach makes sense at a high level. Be direct. -->

---

## Changes

| File | Summary |
|------|---------|
| \`filename\` | What changed and why it matters |

---

## Sequence Diagram
<!-- Only include this section if the changes involve async operations, API calls, authentication flows, webhooks, or multi-component interactions. For simple UI changes, config updates, or minor refactors, omit this section entirely. If included, use simple labels only — no quotes, parentheses, or special characters inside labels or notes. -->
\`\`\`mermaid
sequenceDiagram
    participant A as ServiceA
    participant B as ServiceB
    A->>B: action
    B-->>A: response
\`\`\`

---

## Code Review

<!-- For each file with issues, use this block. If there are no issues in a file, skip it entirely. Write like a senior engineer — be specific, reference exact lines, explain the real-world consequence of the issue. -->

### \`path/to/file.ts\`

**Line X-Y** — 🔴 Critical | 🟠 Major | 🟡 Minor | 🔵 Nitpick

<details>
<summary>Issue title — one line</summary>

**Why this matters:** Explain the real consequence — data loss, security vulnerability, performance degradation, maintainability nightmare, etc.

\`\`\`typescript
// Current code (problematic)
\`\`\`

**Fix:**
\`\`\`typescript
// How a senior engineer would write this
\`\`\`
</details>

---

## Verdict

| Category | Rating | Senior Engineer's Take |
|----------|--------|----------------------|
| Security | ✅ Solid / ⚠️ Needs Review / ❌ Do Not Merge | brief, direct opinion |
| Performance | ✅ Solid / ⚠️ Needs Review / ❌ Do Not Merge | brief, direct opinion |
| Code Quality | ✅ Solid / ⚠️ Needs Review / ❌ Do Not Merge | brief, direct opinion |
| Error Handling | ✅ Solid / ⚠️ Needs Review / ❌ Do Not Merge | brief, direct opinion |
| Type Safety | ✅ Solid / ⚠️ Needs Review / ❌ Do Not Merge | brief, direct opinion |
| Production Ready | ✅ Ship it / ⚠️ Minor fixes first / ❌ Back to drawing board | overall call |

---

## What's Done Well
<!-- Acknowledge good work specifically. Senior engineers give credit where it's due. -->

---

## Must Fix Before Merge
<!-- Bullet list of blockers only. If none, say "No blockers — good to merge after addressing suggestions." -->

---

## Suggestions
<!-- Non-blocking improvements. Things you'd want a junior to learn from. Include code examples where helpful. -->

---

## Poem
<!-- A short, witty 4-line poem written from the perspective of a tired but impressed senior engineer -->

---

> 🦫 *Reviewed by BuildBeaver — Your AI Senior Engineer*`
            const { text } = await generateText({
                model: google("gemini-2.5-flash"),
                prompt
            })


            return text;
        });


        await step.run("[post-comment", async () => {
            await postReviewComment(token, owner, repo, prNumber, review);
        })

        await step.run("save-review", async () => {
            const repository = await prisma.repository.findFirst({
                where: {
                    owner,
                    name: repo
                }
            });

            if (repository) {
                await prisma.review.create({
                    data: {
                        repositoryId: repository.id,
                        prNumber,
                        prTitle: title,
                        prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
                        review,
                        status: "completed",
                    },
                });
            }
        })
        return { success: true }
    }
)