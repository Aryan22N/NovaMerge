import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { GitPullRequest } from "@phosphor-icons/react/dist/ssr";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { statusBadge } from "@/features/dashboard/lib/status-style";
import type { PrStatus, PullRequestRow } from "@/features/pull-requests/lib/types";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";

/** Maps each PR status to the semantic tone used by `statusBadge()`. */
const STATUS_TONE: Record<PrStatus, Parameters<typeof statusBadge>[0]> = {
    pending: "warning",
    processing: "info",
    reviewed: "success",
    rate_limited: "danger",
};

/** Human-readable label for each status value. */
const STATUS_LABEL: Record<PrStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    reviewed: "Reviewed",
    rate_limited: "Rate Limited",
};

type PullRequestsListProps = {
    prs: PullRequestRow[];
};

/**
 * Server component — renders a table of pull requests.
 * Shows an empty state when there are no PRs to display.
 *
 * @param prs - Array of pull request rows (from `getPullRequests`).
 */
export function PullRequestsList({ prs }: PullRequestsListProps) {
    if (prs.length === 0) {
        return (
            <div className="flex flex-1 flex-col p-6">
                <Empty className="border border-dashed">
                    <EmptyMedia variant="icon">
                        <GitPullRequest />
                    </EmptyMedia>
                    <EmptyHeader>
                        <EmptyTitle>No pull requests yet</EmptyTitle>
                        <EmptyDescription>
                            Pull requests will appear here once the GitHub App receives its
                            first webhook event. Open or update a PR on a connected
                            repository to get started.
                        </EmptyDescription>
                    </EmptyHeader>
                    <Button
                        nativeButton={false}
                        render={<Link href={DASHBOARD_ROUTES.github} />}
                        variant="outline"
                        size="sm"
                    >
                        Check GitHub App
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-6">
            <p className="text-xs text-muted-foreground">
                {prs.length} pull request{prs.length !== 1 ? "s" : ""} found
            </p>

            <div className="rounded-none border border-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Repository</TableHead>
                            <TableHead>PR #</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Updated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {prs.map((pr) => (
                            <PullRequestRow key={pr.id} pr={pr} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function PullRequestRow({ pr }: { pr: PullRequestRow }) {
    const tone = STATUS_TONE[pr.status] ?? "neutral";
    const label = STATUS_LABEL[pr.status] ?? pr.status;

    return (
        <TableRow className="cursor-pointer hover:bg-muted/50">
            <TableCell>
                <Link
                    href={`/dashboard/pull-requests/${pr.id}`}
                    className="block w-full"
                >
                    <span className="text-xs text-muted-foreground">{pr.repoFullName}</span>
                </Link>
            </TableCell>
            <TableCell>
                <Link
                    href={`/dashboard/pull-requests/${pr.id}`}
                    className="block w-full"
                >
                    <span className="font-mono text-sm text-muted-foreground">
                        #{pr.prNumber}
                    </span>
                </Link>
            </TableCell>
            <TableCell className="max-w-xs">
                <Link
                    href={`/dashboard/pull-requests/${pr.id}`}
                    className="block w-full"
                >
                    <span className="line-clamp-1 font-medium">{pr.title}</span>
                </Link>
            </TableCell>
            <TableCell>
                <Link
                    href={`/dashboard/pull-requests/${pr.id}`}
                    className="block w-full"
                >
                    <span className="text-sm text-muted-foreground">
                        {pr.authorLogin ? `@${pr.authorLogin}` : "—"}
                    </span>
                </Link>
            </TableCell>
            <TableCell>
                <Link
                    href={`/dashboard/pull-requests/${pr.id}`}
                    className="block w-full"
                >
                    <span className={statusBadge(tone)}>{label}</span>
                </Link>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
                <Link
                    href={`/dashboard/pull-requests/${pr.id}`}
                    className="block w-full"
                >
                    {formatDistanceToNow(new Date(pr.updatedAt), { addSuffix: true })}
                </Link>
            </TableCell>
        </TableRow>
    );
}
