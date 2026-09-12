import { prisma } from "@/lib/db";
import { toPrStatus, type PrStatus } from "@/features/pull-requests/lib/types";
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
    status: PrStatus;
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
 * Runs two parallel DB queries:
 * 1. User's GitHub installation record (status + installationId).
 * 2. Repo sync counts (synced vs total).
 *
 * Followed by an installation-scoped query for the last 10 pull requests.
 *
 * All queries are read-only — no Inngest / webhook / backend logic changed.
 *
 * @param userId - Better-Auth user id from `requireAuth()`.
 */
export async function getOverview(userId: string): Promise<OverviewData> {
    const [installationRecord, syncedCount, totalCount] = await Promise.all([
        prisma.githubInstallation.findUnique({
            where: { userId },
            select: {
                installationId: true,
                accountLogin: true,
                createdAt: true,
            },
        }),
        prisma.repoSync.count({ where: { status: "synced" } }),
        prisma.repoSync.count(),
    ]);

    const installation: GithubInstallationStatus = installationRecord
        ? {
              connected: true,
              accountLogin: installationRecord.accountLogin,
              installedAt: installationRecord.createdAt.toISOString(),
          }
        : {
              connected: false,
              accountLogin: null,
              installedAt: null,
          };

    // Recent activity is scoped to the user's installation to avoid showing
    // other users' PRs. Falls back to [] when the user hasn't connected yet.
    const recentActivityRaw = installationRecord
        ? await prisma.pullRequest.findMany({
              where: { installationId: installationRecord.installationId },
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
        status: toPrStatus(pr.status),
        updatedAt: pr.updatedAt.toISOString(),
    }));

    return {
        installation,
        repoSummary: { synced: syncedCount, total: totalCount },
        recentActivity,
    };
}

