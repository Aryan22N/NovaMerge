import type { Metadata } from "next";
import Link from "next/link";

import { requireAuth } from "@/features/auth/actions";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { getInstallationStatus } from "@/features/github/server/installation";
import { getPullRequests } from "@/features/pull-requests/server/get-pull-requests";
import { PullRequestsList } from "@/features/pull-requests/components/pull-requests-list";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Pull Requests · Dashboard",
    description:
        "AI-generated code review history for all pull requests across your connected repositories.",
};

/**
 * Prompt shown when the user hasn't installed the GitHub App yet.
 * Mirrors the same guard pattern used by the Repositories page.
 */
function PullRequestsNotConnected() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <p className="text-sm text-muted-foreground">
                Install the GitHub App first to start receiving pull request events.
            </p>
            <Button
                nativeButton={false}
                render={<Link href={DASHBOARD_ROUTES.github} />}
            >
                Go to GitHub App
            </Button>
        </div>
    );
}

/**
 * Pull Requests list page.
 *
 * Guards against no GitHub installation, then fetches all PRs for the user's
 * installation and renders them in a sortable table.
 *
 * @returns Header plus either an install prompt or the interactive PR table.
 */
export default async function DashboardPullRequestsPage() {
    const session = await requireAuth();
    const installation = await getInstallationStatus(session.user.id);

    const header = (
        <DashboardHeader
            title="Pull Requests"
            description="AI-generated code reviews for all pull requests received by the GitHub App."
        />
    );

    if (!installation.connected) {
        return (
            <>
                {header}
                <PullRequestsNotConnected />
            </>
        );
    }

    const prs = await getPullRequests(session.user.id);

    return (
        <>
            {header}
            <PullRequestsList prs={prs} />
        </>
    );
}
