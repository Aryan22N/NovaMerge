import { prisma } from "@/lib/db";
import { getInstallationStatus } from "@/features/github/server/installation";
import type { GithubInstallationStatus } from "@/features/dashboard/lib/types";

/** Aggregated counts for the repository summary card. */
export type RepoSummaryData = {
    synced: number;
    total: number;
};

/** Compact PR row used in the recent-activity feed. */
export type RecentPrActivity = {
    id: string;
    repoFullName: string;
    prNumber: number;
    title: string;
    authorLogin: string | null;
    status: string;
    updatedAt: string;
};

/** All data required to render the Overview page. */
export type OverviewData = {
    installation: GithubInstallationStatus;
    repoSummary: RepoSummaryData;
    recentActivity: RecentPrActivity[];
};

/**
 * Aggregates real data for the dashboard Overview page.
 *
 * Runs three independent DB queries:
 * 1. GitHub installation status (re-uses existing `getInstallationStatus`).
 * 2. Repo sync counts (synced vs total).
 * 3. Last 10 pull requests ordered by `updatedAt` desc.
 *
 * All queries are read-only — no Inngest / webhook / backend logic changed.
 *
 * @param userId - Better-Auth user id from `requireAuth()`.
 */
export async function getOverview(userId: string): Promise<OverviewData> {
    const [installation, syncedCount, totalCount, installation2] =
        await Promise.all([
            getInstallationStatus(userId),
            prisma.repoSync.count({ where: { status: "synced" } }),
            prisma.repoSync.count(),
            prisma.githubInstallation.findUnique({
                where: { userId },
                select: { installationId: true },
            }),
        ]);

    // Recent activity is scoped to the user's installation to avoid showing
    // other users' PRs. Falls back to [] when the user hasn't connected yet.
    const recentActivityRaw = installation2
        ? await prisma.pullRequest.findMany({
              where: { installationId: installation2.installationId },
              orderBy: { updatedAt: "desc" },
              take: 10,
              select: {
                  id: true,
                  repoFullName: true,
                  prNumber: true,
                  title: true,
                  authorLogin: true,
                  status: true,
                  updatedAt: true,
              },
          })
        : [];

    const recentActivity: RecentPrActivity[] = recentActivityRaw.map((pr) => ({
        ...pr,
        updatedAt: pr.updatedAt.toISOString(),
    }));

    return {
        installation,
        repoSummary: { synced: syncedCount, total: totalCount },
        recentActivity,
    };
}
