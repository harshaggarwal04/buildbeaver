import prisma from "@/lib/db";
import { inngest } from "../client"
import { getRepoFileContents } from "@/modules/github/lib/github";
import { indexCodebase } from "@/modules/ai/lib/rag";
import { success } from "better-auth";


export const indexRepo = inngest.createFunction(
  {id: "index-repo",
    triggers: {
      event: "repository.connected"
    }
  },

  async ({event, step})=>{
    const {owner, repo, userId} = event.data;

    // fetch all the files
    const files = await step.run("fetch-files", async()=>{


      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "github"
        }
      })

      if(!account?.accessToken){
        throw new Error("No Github Access Token Found");
      }

      return await getRepoFileContents(account.accessToken, owner, repo);

    })

    await step.run("index-codebase", async()=>{
      await indexCodebase(`${owner}/${repo}`, files)
    })

    return{ 
      success: true,
      indexedFiles: files.length
    }
  }
)