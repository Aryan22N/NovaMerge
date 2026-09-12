import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
    GithubLogo,
    Database,
    GitPullRequest,
    CheckCircle,
    Clock,
    Spinner,
    XCircle,
} from "@phosphor-icons/react/dist/ssr";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { statusBadge } from "@/features/dashboard/lib/status-style";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import type { OverviewData, RecentPrActivity } from "@/features/overview/server/get-overview";

/** Icon map for PR statuses used in the activity feed. */
const ACTIVITY_ICON: Record<string, React.ElementType> = {
    reviewed: CheckCircle,
    processing: Spinner,
    pending: Clock,
    rate_limited: XCircle,
};

/** Tone map for PR status badges in the activity feed. */
const ACTIVITY_TONE: Record<
    string,
    Parameters<typeof statusBadge>[0]
> = {
    pending: "warning",
    processing: "info",
    reviewed: "success",
    rate_limited: "danger",
};

const ACTIVITY_LABEL: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    reviewed: "Reviewed",
    rate_limited: "Rate Limited",
};

// ─── GitHub Connection Card ───────────────────────────────────────────────────

function GithubConnectionCard({
    connected,
    accountLogin,
    installedAt,
    userId,
}: {
    connected: boolean;
    accountLogin: string | null;
    installedAt: string | null;
    userId?: string;
}) {
    return (
        <Card className={connected ? "border-green-500/30" : "border-border"}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span
                            className={`flex size-9 items-center justify-center rounded-none border ${
                                connected
                                    ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
                                    : "border-border bg-muted text-muted-foreground"
                            }`}
                        >
                            <GithubLogo className="size-4" />
                        </span>
                        <div>
                            <CardTitle className="text-sm">GitHub App</CardTitle>
                            <CardDescription className="text-xs">
                                {connected ? "Connected" : "Not connected"}
                            </CardDescription>
                        </div>
                    </div>
                    <span className={statusBadge(connected ? "success" : "neutral")}>
                        {connected ? "Connected" : "Not connected"}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {connected ? (
                    <p className="text-xs text-muted-foreground">
                        Installed for{" "}
                        <span className="font-medium text-green-700 dark:text-green-400">
                            @{accountLogin}
                        </span>
                        {installedAt
                            ? ` · ${formatDistanceToNow(new Date(installedAt), { addSuffix: true })}`
                            : ""}
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-muted-foreground">
                            Install the GitHub App to start receiving pull request review events.
                        </p>
                        <Button
                            nativeButton={false}
                            render={<Link href={DASHBOARD_ROUTES.github} />}
                            variant="outline"
                            size="sm"
                            className="w-fit"
                        >
                            Install GitHub App
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Repository Summary Card ──────────────────────────────────────────────────

function RepoSummaryCard({ synced, total }: { synced: number; total: number }) {
    const percentSynced = total > 0 ? Math.round((synced / total) * 100) : 0;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-none border border-border bg-muted text-muted-foreground">
                        <Database className="size-4" />
                    </span>
                    <div>
                        <CardTitle className="text-sm">Codebase Sync</CardTitle>
                        <CardDescription className="text-xs">
                            Repository context indexed for AI reviews
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-end justify-between gap-2">
                    <div>
                        <p className="text-2xl font-semibold tabular-nums">
                            {synced}
                            <span className="ml-1 text-sm font-normal text-muted-foreground">
                                / {total}
                            </span>
                        </p>
                        <p className="text-xs text-muted-foreground">repositories synced</p>
                    </div>
                    {total > 0 && (
                        <span className={statusBadge(synced === total ? "success" : synced > 0 ? "warning" : "neutral")}>
                            {percentSynced}%
                        </span>
                    )}
                </div>
                {total === 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Sync a repository from the{" "}
                        <Link
                            href={DASHBOARD_ROUTES.repos}
                            className="underline underline-offset-2 hover:text-foreground"
                        >
                            Repositories
                        </Link>{" "}
                        page to improve review quality.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Recent Activity Feed ─────────────────────────────────────────────────────

function ActivityItem({ pr }: { pr: RecentPrActivity }) {
    const tone = ACTIVITY_TONE[pr.status] ?? "neutral";
    const label = ACTIVITY_LABEL[pr.status] ?? pr.status;
    const Icon = ACTIVITY_ICON[pr.status] ?? GitPullRequest;

    return (
        <Link
            href={`/dashboard/pull-requests/${pr.id}`}
            className="flex items-start gap-3 rounded-none px-1 py-2 hover:bg-muted/60 transition-colors"
        >
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center text-muted-foreground">
                <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium">{pr.title}</span>
                    <span className={statusBadge(tone, "shrink-0")}>{label}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {pr.repoFullName} · #{pr.prNumber}
                    {pr.authorLogin ? ` · @${pr.authorLogin}` : ""}
                    {" · "}
                    {formatDistanceToNow(new Date(pr.updatedAt), { addSuffix: true })}
                </p>
            </div>
        </Link>
    );
}

function RecentActivityCard({ activity }: { activity: RecentPrActivity[] }) {
    return (
        <Card className="md:col-span-2">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-none border border-border bg-muted text-muted-foreground">
                        <GitPullRequest className="size-4" />
                    </span>
                    <div>
                        <CardTitle className="text-sm">Recent Pull Requests</CardTitle>
                        <CardDescription className="text-xs">
                            Latest activity across all connected repositories
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {activity.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                        No pull requests yet. Open or update a PR on a connected repository.
                    </p>
                ) : (
                    <div className="divide-y divide-border">
                        {activity.map((pr) => (
                            <ActivityItem key={pr.id} pr={pr} />
                        ))}
                    </div>
                )}
                {activity.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                        <Button
                            nativeButton={false}
                            render={<Link href={DASHBOARD_ROUTES.pullRequests} />}
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground hover:text-foreground"
                        >
                            View all pull requests →
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Composed Overview Cards ──────────────────────────────────────────────────

type OverviewCardsProps = {
    data: OverviewData;
    userId?: string;
};

/**
 * Renders the three overview cards: GitHub connection, repo summary, recent activity.
 * Pure server component — receives pre-fetched data from `getOverview()`.
 */
export function OverviewCards({ data }: OverviewCardsProps) {
    const { installation, repoSummary, recentActivity } = data;

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <GithubConnectionCard
                connected={installation.connected}
                accountLogin={installation.accountLogin}
                installedAt={installation.installedAt}
            />
            <RepoSummaryCard
                synced={repoSummary.synced}
                total={repoSummary.total}
            />
            <RecentActivityCard activity={recentActivity} />
        </div>
    );
}
