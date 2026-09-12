# NovaMerge — AI-Powered Pull Request Reviewer

> **NovaMerge** is a Next.js application that automatically reviews every pull request on your GitHub repositories using AI. When a PR is opened or updated, a webhook fires, the diff is chunked and embedded into a vector store, the AI generates a structured code review, and the result is posted as a comment directly on the PR — all without manual intervention.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **GitHub OAuth Sign-In** | One-click login with your GitHub account |
| 🐙 **GitHub App Integration** | Install the reviewer app on any repo you own or manage |
| 📦 **Repository Management** | View all repos available to the app with infinite scroll |
| 🔄 **Codebase Sync** | Index your full repo into Pinecone for richer AI context |
| 🤖 **AI Code Reviews** | Automatic, structured reviews posted as PR comments |
| 📋 **Pull Requests Dashboard** | Browse every review with status, author, and timestamps |
| 🔍 **Review Detail Page** | Read the full AI-generated markdown review per PR |
| 📊 **Overview Dashboard** | At-a-glance: GitHub connection, sync status, recent activity |
| 🌗 **Dark / Light Mode** | Persistent theme toggle |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) — App Router, RSC, Server Actions |
| UI | [shadcn/ui](https://ui.shadcn.com) (base-mira style) + Tailwind CSS v4 |
| Icons | [@phosphor-icons/react](https://phosphoricons.com) |
| Auth | [Better Auth](https://better-auth.com) + GitHub OAuth |
| Database | [Neon](https://neon.tech) Serverless PostgreSQL |
| ORM | [Prisma](https://prisma.io) v7 with `@prisma/adapter-pg` |
| AI | [Vercel AI SDK](https://sdk.vercel.ai) + [OpenRouter](https://openrouter.ai) |
| Background Jobs | [Inngest](https://inngest.com) (durable functions / job queue) |
| Vector Store | [Pinecone](https://pinecone.io) (semantic search over code chunks) |
| Data Fetching | [TanStack React Query](https://tanstack.com/query) v5 |
| Webhooks (dev) | [ngrok](https://ngrok.com) public tunnel |

---

## 📁 Project Structure

```
pr_reviewer/
├── app/
│   ├── (auth)/sign-in/          # Login page (GitHub OAuth)
│   ├── (protected)/dashboard/
│   │   ├── page.tsx             # Overview — GitHub status, repo counts, recent PRs
│   │   ├── repos/               # Repository list with infinite scroll
│   │   ├── pull-requests/       # PR list page
│   │   │   └── [id]/            # PR detail + AI review page
│   │   └── github/              # GitHub App install / disconnect
│   └── api/
│       ├── auth/[...all]/       # Better Auth catch-all handler
│       ├── github/callback/     # Post-install callback from GitHub
│       ├── github/repos/        # Paginated repo list API
│       └── github/webhook/      # Incoming webhook from GitHub
│
├── features/
│   ├── auth/                    # Sign-in, session helpers, route guards
│   ├── dashboard/               # Sidebar, nav, header, shared types & styles
│   ├── github/                  # GitHub App singleton, installation DB logic, repos
│   ├── pull-requests/           # PR list/detail server functions & components
│   ├── overview/                # Overview data aggregation & cards
│   ├── reviews/                 # AI review generation, Inngest function
│   ├── repo-sync/               # Codebase indexing into Pinecone
│   ├── billing/                 # Usage / rate-limit guards
│   ├── ai/                      # OpenRouter AI client
│   ├── inngest/                 # Inngest client setup
│   └── pinecone/                # Pinecone client setup
│
├── components/
│   ├── ui/                      # shadcn/ui components (button, card, table, etc.)
│   └── providers/               # Theme + React Query providers
│
├── lib/
│   ├── auth.ts                  # Better Auth server config
│   ├── auth-client.ts           # Better Auth client hooks
│   ├── db.ts                    # Singleton Prisma client
│   └── utils.ts                 # cn() helper
│
├── prisma/
│   ├── schema.prisma            # DB models: User, Session, PullRequest, RepoSync, …
│   └── migrations/              # Auto-generated SQL migration files
│
└── Docs/
    ├── Explaination.md          # Step-by-step pointwise build notes
    └── DetailedExp.md           # Deep technical architecture reference
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- A [Neon](https://neon.tech) PostgreSQL database
- A [GitHub OAuth App](https://github.com/settings/developers) (for login)
- A [GitHub App](https://github.com/settings/apps) (for webhooks + repo access)
- An [OpenRouter](https://openrouter.ai) API key
- A [Pinecone](https://pinecone.io) index
- [ngrok](https://ngrok.com) (local webhook tunnel)

### 1. Clone & Install

```bash
git clone <repo-url>
cd pr_reviewer
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET=<random-32-char-secret>
BETTER_AUTH_URL=https://<your-ngrok-domain>

# GitHub OAuth App (for user login)
GITHUB_CLIENT_ID=<oauth-app-client-id>
GITHUB_CLIENT_SECRET=<oauth-app-client-secret>

# GitHub App (for webhooks + repo access)
GITHUB_APP_ID=<app-id>
GITHUB_APP_NAME=novamerge
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GITHUB_WEBHOOK_SECRET=<webhook-secret>
NEXT_PUBLIC_GITHUB_PUBLIC_LINK=https://github.com/apps/novamerge

# AI
OPENROUTER_API_KEY=<openrouter-key>

# Pinecone
PINECONE_API_KEY=<pinecone-key>
PINECONE_INDEX=<index-name>

# Inngest (local dev)
INNGEST_DEV=1
```

### 3. Set Up the Database

```bash
npx prisma migrate dev    # Create all tables
npx prisma generate       # Generate Prisma client
```

### 4. Start ngrok (required for webhooks)

```bash
ngrok http 3000 --domain=<your-ngrok-domain> --host-header=rewrite
```

### 5. Start the Dev Server

```bash
npm run dev               # Next.js on http://localhost:3000
```

### 6. Start Inngest Dev Server (background jobs)

```bash
npx inngest-cli@latest dev   # Inngest dashboard on http://localhost:8288
```

---

## 🔄 How the AI Review Pipeline Works

```
GitHub Webhook (PR opened/updated)
        │
        ▼
POST /api/github/webhook
        │  validates HMAC signature
        │  saves PullRequest row (status: "pending")
        │  checks billing limit
        ▼
Inngest Event: github/pr.received
        │
        ├─ step: mark-processing     → status: "processing"
        ├─ step: breakdown-code      → fetches diff, chunks into CodeChunks
        ├─ step: save-vectors        → upserts chunks to Pinecone namespace
        ├─ step: wait 10s            → Pinecone indexing delay
        ├─ step: search-repo-context → semantic search in codebase namespace
        ├─ step: generate-ai-review  → calls OpenRouter LLM with diff + context
        ├─ step: post-pr-comment     → posts review markdown to GitHub PR
        └─ step: mark-reviewed       → status: "reviewed", saves reviewComment
```

---

## 📊 Database Schema (key models)

| Model | Purpose |
|-------|---------|
| `User` | Authenticated user (Better Auth managed) |
| `Session` | Active sessions (Better Auth managed) |
| `GithubInstallation` | Links a user ↔ GitHub App installation ID |
| `RepoSync` | Tracks codebase indexing status per repo |
| `PullRequest` | Every PR received — status, AI review, metadata |

---

## 📋 Dashboard Pages

| Route | What you see |
|-------|-------------|
| `/dashboard` | **Overview** — GitHub connection, repo sync counts, last 10 PR activities |
| `/dashboard/repos` | **Repositories** — all repos accessible via the GitHub App, with sync button |
| `/dashboard/pull-requests` | **Pull Requests** — full history table with status badges |
| `/dashboard/pull-requests/[id]` | **PR Detail** — metadata card + rendered AI review |
| `/dashboard/github` | **GitHub App** — install / disconnect the reviewer app |

---

## 📖 Documentation

- [Explaination.md](./Docs/Explaination.md) — Step-by-step pointwise build notes covering all setup phases
- [DetailedExp.md](./Docs/DetailedExp.md) — In-depth technical reference for every file, pattern, and architectural decision

---

## 📄 License

Private project — all rights reserved.
