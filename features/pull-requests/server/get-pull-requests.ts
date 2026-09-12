import { prisma } from "@/lib/db";
import { toPrStatus, type PullRequestRow } from "@/features/pull-requests/lib/types";

/**
 * Fetches all pull requests that belong to the given user's GitHub App installation,
 * ordered by most recently updated first.
 *
 * Strategy:
 * 1. Look up the user's installation row (installationId).
 * 2. Query `pull_request` filtered by that installationId.
 *
 * No backend / webhook / Inngest logic is touched here — read-only Prisma query.
 *
 * @param userId - Better-Auth user id (from `requireAuth()`)
 * @returns Array of `PullRequestRow` objects (empty array if no installation or no PRs).
 */
export async function getPullRequests(userId: string): Promise<PullRequestRow[]> {
    const installation = await prisma.githubInstallation.findUnique({
        where: { userId },
        select: { installationId: true },
    });

    if (!installation) {
        return [];
    }

    const rows = await prisma.pullRequest.findMany({
        where: { installationId: installation.installationId },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            repoFullName: true,
            prNumber: true,
            title: true,
            authorLogin: true,
            baseBranch: true,
            status: true,
            reviewedAt: true,
            updatedAt: true,
        },
    });

    return rows.map((row) => ({
        ...row,
        status: toPrStatus(row.status),
        reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
        updatedAt: row.updatedAt.toISOString(),
    }));
}
