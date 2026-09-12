/** All possible statuses a pull request can be in after webhook ingestion. */
export type PrStatus = "pending" | "processing" | "reviewed" | "rate_limited";

/**
 * Lightweight row used in the PR list table.
 * Excludes the heavy `reviewComment` field that is only needed on the detail page.
 */
export type PullRequestRow = {
    id: string;
    repoFullName: string;
    prNumber: number;
    title: string;
    authorLogin: string | null;
    baseBranch: string;
    status: PrStatus;
    reviewedAt: string | null;
    updatedAt: string;
};

/**
 * Full pull request detail, including the AI-generated markdown review.
 * Extends `PullRequestRow` with all persisted fields.
 */
export type PullRequestDetail = PullRequestRow & {
    headSha: string;
    reviewComment: string | null;
    installationId: number;
    createdAt: string;
};
