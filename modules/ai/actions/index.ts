"use server";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { getPullRequestDiff } from "@/modules/github/lib/github";
import { canCreateReview, incrementReviewCount } from "@/modules/payment/lib/subscription";
import { success } from "better-auth";

export async function reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
) {


    try {
        const repository = await prisma.repository.findFirst({
            where: {
                owner: owner,
                name: repo
            },
            include: {
                user: {
                    include: {
                        accounts: {
                            where: {
                                providerId: 'github'
                            }
                        }
                    }
                }
            }
        })

        if (!repository) {
            throw new Error(`Repositor ${owner}/${repo} not found in database. Please reconnect the repository`)
        }

        const canReview = await canCreateReview(repository.user.id, repository.id);

        if(!canCreateReview){
            throw new Error("Review Limit Reached For this repository. Please upgrade to Pro for unlimited reviews")
        }

        const githubAccount = repository.user.accounts[0];

        if (!githubAccount?.accessToken) {
            throw new Error("No github access token found for repository owner")
        }


        const token = githubAccount.accessToken;

        const { title } = await getPullRequestDiff(token, owner, repo, prNumber);

        await inngest.send({
            name: "pr.review.requested",
            data: {
                owner,
                repo,
                prNumber,
                userId: repository.user.id
            }
        })


        await incrementReviewCount(repository.user.id, repository.id);
        
        return { success: true, message: "Review Queued" }

    } catch (error) {
        try {
            const repository = await prisma.repository.findFirst({
                where: {
                    owner,
                    name: repo
                }
            })

            if (repository) {
                await prisma.review.create({
                    data: {
                        repositoryId: repository.id,
                        prNumber,
                        prTitle: "failed to fetch pr",
                        prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
                        review: `Error ${error instanceof Error ? error.message : "Unknown error"}`,
                        status: "failed"
                    }
                })
            }
        } catch (dbError) {
            console.log("Failed to save error to Database", dbError);
        }
    }

}


