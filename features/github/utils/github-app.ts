import { App } from 'octokit'

let gitHubApp: App | null = null;

export function getGithubApp() {
    if (!gitHubApp) {
        gitHubApp = new App({
            appId: process.env.GITHUB_APP_ID!,
            privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            webhooks: {
                secret: process.env.GITHUB_WEBHOOK_SECRET || process.env.GIT_WEBHOOK_SECRET || ""
            }
        })
    }

    return gitHubApp;
}

export function getGithubInstallUrl(userId: string) {
    const url = new URL(`https://github.com/apps/novamerge/installations/new`);
    url.searchParams.set("state", userId);
    return url.toString();
}