import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
    GitPullRequest,
    ArrowLeft,
    GitBranch,
    User,
    GitCommit,
    Clock,
} from "@phosphor-icons/react/dist/ssr";

import { requireAuth } from "@/features/auth/actions";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { getPullRequest } from "@/features/pull-requests/server/get-pull-request";
import { AiReviewMarkdown } from "@/features/pull-requests/components/ai-review-markdown";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { statusBadge } from "@/features/dashboard/lib/status-style";
import type { PrStatus } from "@/features/pull-requests/lib/types";

export const metadata: Metadata = {
    title: "Pull Request Detail · Dashboard",
};

const STATUS_TONE: Record<PrStatus, Parameters<typeof statusBadge>[0]> = {
    pending: "warning",
    processing: "info",
    reviewed: "success",
    rate_limited: "danger",
};

const STATUS_LABEL: Record<PrStatus, string> = {
    pending: "Pending",
    processing: "Processing…",
    reviewed: "Reviewed",
    rate_limited: "Rate Limited",
};

type MetaItemProps = {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
};

/** Single labelled meta row in the PR information card. */
function MetaItem({ icon: Icon, label, value }: MetaItemProps) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{label}:</span>
            <span className="text-xs font-medium">{value}</span>
        </div>
    );
}

/** Card showing a "still processing" placeholder when the AI review isn't ready. */
function ReviewPending({ status }: { status: PrStatus }) {
    const messages: Record<string, string> = {
        pending: "This pull request is queued for review. It will be processed shortly.",
        processing:
            "The AI review is currently being generated. This usually takes under a minute.",
        rate_limited:
            "Review was skipped because the usage limit was reached. Upgrade your plan to re-enable reviews.",
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">AI Review</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    {messages[status] ?? "No review available."}
                </p>
            </CardContent>
        </Card>
    );
}

type PageProps = {
    params: Promise<{ id: string }>;
};

/**
 * Pull Request detail page.
 *
 * Fetches the PR by its internal DB id (CUID), shows the metadata card,
 * then renders the AI review as markdown — or a "pending / processing" state
 * when the review isn't ready yet.
 */
export default async function PullRequestDetailPage({ params }: PageProps) {
    // requireAuth redirects unauthenticated visitors; result is unused here
    // because the PR is fetched by id (not scoped by user in this query) but
    // we still enforce the session boundary.
    await requireAuth();

    const { id } = await params;
    const pr = await getPullRequest(id);

    if (!pr) {
        notFound();
    }

    const tone = STATUS_TONE[pr.status] ?? "neutral";
    const statusLabel = STATUS_LABEL[pr.status] ?? pr.status;

    return (
        <>
            <DashboardHeader
                title={`PR #${pr.prNumber}`}
                description={pr.repoFullName}
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Back link */}
                <Link
                    href="/dashboard/pull-requests"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                    <ArrowLeft className="size-3.5" />
                    All Pull Requests
                </Link>

                {/* PR meta card */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-none border border-border bg-muted text-muted-foreground">
                                    <GitPullRequest className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <CardTitle className="truncate text-sm">
                                        {pr.title}
                                    </CardTitle>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {pr.repoFullName} · #{pr.prNumber}
                                    </p>
                                </div>
                            </div>
                            <span className={statusBadge(tone, "shrink-0")}>
                                {statusLabel}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-2 sm:grid-cols-2">
                        {pr.authorLogin && (
                            <MetaItem
                                icon={User}
                                label="Author"
                                value={`@${pr.authorLogin}`}
                            />
                        )}
                        <MetaItem
                            icon={GitBranch}
                            label="Base branch"
                            value={
                                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                                    {pr.baseBranch}
                                </code>
                            }
                        />
                        <MetaItem
                            icon={GitCommit}
                            label="Head SHA"
                            value={
                                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                                    {pr.headSha.slice(0, 7)}
                                </code>
                            }
                        />
                        {pr.reviewedAt && (
                            <MetaItem
                                icon={Clock}
                                label="Reviewed"
                                value={formatDistanceToNow(new Date(pr.reviewedAt), {
                                    addSuffix: true,
                                })}
                            />
                        )}
                        <MetaItem
                            icon={Clock}
                            label="Updated"
                            value={formatDistanceToNow(new Date(pr.updatedAt), {
                                addSuffix: true,
                            })}
                        />
                    </CardContent>
                </Card>

                {/* AI Review section */}
                {pr.reviewComment ? (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">AI Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AiReviewMarkdown markdown={pr.reviewComment} />
                        </CardContent>
                    </Card>
                ) : (
                    <ReviewPending status={pr.status} />
                )}
            </div>
        </>
    );
}
