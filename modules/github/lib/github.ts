import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

// getting the github access token

export const getGithubToken = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error("Unauthorized!")
    }

    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            providerId: "github"
        }
    })

    if (!account?.accessToken) {
        throw new Error("No github access token found");
    }

    return account.accessToken;
    console.log("ACCOUNT:", account);
}

export async function fetchUserContribution(token: string, username: string) {
    const octokit = new Octokit({ auth: token });

    const query = `query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            color
          }
        }
      }
    }
  }
}`;


    try {

        const response: any = await octokit.graphql(query, {
            username
        })

        return response.user.contributionsCollection.contributionCalendar

    } catch (error) {
        console.error(error)
    }


}

export const getRepositories = async (page: number = 1, perPage: number = 10) => {
    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        direction: "desc",
        visibility: "public",
        per_page: perPage,
        page: page
    })

    return data;
}


export const createWebhook = async (owner: string, repo: string) => {
    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

    const { data: hooks } = await octokit.rest.repos.listWebhooks({
        owner,
        repo
    })

    const existingHook = hooks.find(hook => hook.config.url === webhookUrl);

    if (existingHook) return existingHook;

    const { data } = await octokit.rest.repos.createWebhook({
        owner, repo,
        config: {
            url: webhookUrl,
            content_type: "json"
        },
        events: ["pull_request"]
    })

    return data

}


export const deleteWebhook = async (owner: string, repo: string) => {
    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

    try {
        const { data: hooks } = await octokit.rest.repos.listWebhooks({
            owner,
            repo
        });

        const hookToDelete = hooks.find(hook => hook.config.url === webhookUrl);

        if (hookToDelete) {
            await octokit.rest.repos.deleteWebhook({
                owner,
                repo,
                hook_id: hookToDelete.id
            })

            return true;
        }

        return false




    } catch (error) {
        console.error("error deleting webhook: ", error);
        return false;
    }

}


export async function getRepoFileContents(
    token: string,
    owner: string,
    repo: string
): Promise<{ path: string; content: string }[]> {
    const octokit = new Octokit({ auth: token });

    const repoData = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoData.data.default_branch;

    const { data } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: "true",
    });

    const files = (data.tree as any[])
        .filter(
            (item) =>
                item.type === "blob" &&
                item.path &&
                item.size && item.size < 200000 &&
                !item.path.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|lock)$/i) &&
                !item.path.match(/node_modules\//) // 👈 skip node_modules
        )
        .slice(0, 50);

    const results: { path: string; content: string }[] = [];

    for (const file of files) {
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: file.path!,
            });

            if ("content" in data && data.content) {
                results.push({
                    path: file.path!,
                    content: Buffer.from(data.content, "base64").toString("utf-8"),
                });
            }
        } catch (err) {
            console.log("skip file:", file.path);
        }
    }

    return results;
}