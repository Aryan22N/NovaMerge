/** All possible statuses a pull request can be in after webhook ingestion. */
export type PrStatus = "pending" | "processing" | "reviewed" | "rate_limited";

const VALID_PR_STATUSES = new Set<PrStatus>([
    "pending",
    "processing",
    "reviewed",
    "rate_limited",
]);

/**
 * Runtime sanitizer that converts an arbitrary status string (e.g. from DB)
 * to a type-safe `PrStatus`, falling back to `"pending"` if unknown.
 */
export function toPrStatus(status: string): PrStatus {
    if (VALID_PR_STATUSES.has(status as PrStatus)) {
        return status as PrStatus;
    }
    return "pending";
}

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
