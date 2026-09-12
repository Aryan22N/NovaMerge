import type { Metadata } from "next";

import { requireAuth } from "@/features/auth/actions";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { getOverview } from "@/features/overview/server/get-overview";
import { OverviewCards } from "@/features/overview/components/overview-cards";

export const metadata: Metadata = {
    title: "Overview · Dashboard",
    description: "Summary of your GitHub App connection, synced repositories, and recent pull request activity.",
};

/**
 * Dashboard Overview page.
 *
 * Fetches real data from the database (GitHub installation, repo sync counts,
 * recent PRs) and renders them as overview cards. No mocks — all live data.
 */
export default async function DashboardPage() {
    const session = await requireAuth();
    const overview = await getOverview(session.user.id);

    return (
        <>
            <DashboardHeader
                title="Overview"
                description="Your NovaMerge workspace at a glance."
            />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <OverviewCards data={overview} />
            </div>
        </>
    );
}