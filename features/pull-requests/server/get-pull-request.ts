import { prisma } from "@/lib/db";
import type { PullRequestDetail } from "@/features/pull-requests/lib/types";

/**
 * Fetches a single pull request by its internal database id for the detail page.
 *
 * Returns `null` when the record does not exist (triggers `notFound()` in the page).
 * All fields are returned including `reviewComment` (AI-generated markdown).
 *
 * @param id - The `PullRequest.id` cuid string from the URL segment.
 */
export async function getPullRequest(id: string): Promise<PullRequestDetail | null> {
    const row = await prisma.pullRequest.findUnique({
        where: { id },
    });

    if (!row) {
        return null;
    }

    return {
        id: row.id,
        repoFullName: row.repoFullName,
        prNumber: row.prNumber,
        title: row.title,
        authorLogin: row.authorLogin,
        baseBranch: row.baseBranch,
        headSha: row.headSha,
        status: row.status as PullRequestDetail["status"],
        reviewComment: row.reviewComment,
        reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
        updatedAt: row.updatedAt.toISOString(),
        createdAt: row.createdAt.toISOString(),
        installationId: row.installationId,
    };
}
