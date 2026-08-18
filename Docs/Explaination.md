1. we have installed the next.js using npx create-next-app@latest
2. we have installed the shadcn/ui using npx shadcn@latest init --preset b6GMM7ajb --template next --pointer 
(we can find the shadcn configuration in the components.json file)
3. using (npx shadcn@latest add) to install all the components we want 
4. using this we are going to add dark/light mode (npm install next-themes)
5. Making a folder named providers and add the `theme-provider.tsx` file 
(this is a provider that is going to provide the dark/light mode to the application)
also change in layout add the ThemeProviders given in docs
after this we have implemented the dark-light theme 
6. add one more component add in ui named mode-toggle.tsx
At this point we have successfully added the dark and light mode toggle theme feature
7. Now adding the tanstack Router (npm i @tanstack/react-query) now we have to set up this 
8. make the provider query-provider.tsx 
-----------------------------------------------------------------------------------
9. Spinning up database (Neon-postgress) ans add the database_url in .env 
10. Now we will gona set up postgress
(npm install prisma @types/pg --save-dev)
(npm install @prisma/client @prisma/adapter-pg pg dotenv)
Now we will set up some basic things 
11. npx prisma init  
This will create a prisma folder with a schema.prisma file and a prisma.config.ts file 
12. in lib add the db.ts file 
(import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
}

function createPrismaClient(){
    const url=process.env.DATABASE_URL;
    if(!url) throw new Error("Please provide the DATABASE_URL in .env file"); 

    const adapter=new PrismaPg({connectionString:url});
    return new PrismaClient({adapter});
}

export const prisma=globalForPrisma.prisma ?? createPrismaClient();

if(process.env.NODE_ENV!=="production") globalForPrisma.prisma=prisma;
)
13. using npx prisma generate
(This will generate the prisma client)
14. 
For the testing purpose we will make the model in schema.prisma file as this 
model Test{
id String @id @default(cuid())
title String
}
15. by using (npx prisma migrate dev) we can create the model in the database 
this will create the model in the database 
by using (npx prisma generate) this will generate the prisma client

we have sucessfully set up db 
----------------------------------------------------------------------------------
Now we are going to set up Better Auth
using (npm install better-auth) add better_auth_secret and better_auth_url in .env file
16. In lin make the file named auth.ts
17. using(npx auth@latest generate) to generate all the schemas for auth 
using npx prisma generate and npx prisma migrate dev to migrate all the tables of auth
18. Now make the folder in app api/auth/[...all]/route.ts
19. In gitHub in settings in Developer settings in OAuth apps add the github app
In app we made the folder (auth) in that another folder sign-in with file page.tsx
20. make another folder in root named features inside it another 3 folder one is auth ,ai,github
in components add file named github-sign-in-form.tsx 
in action add index.ts
21. make the utils folder in features/auth also one file index.ts here This utility ensures all login redirects in your Server Actions and client components are internal-only and safe, keeping user authentication secure.

Besically we are making the flow like if the user is authenticated it should move to dashboard but if not then it should move to login page , if user expelicitely type /sign-in and user is authenticated then it should move to dashboard 

22. Making proxy.ts file in the root 
23. again make one utility function named auth-proxt.ts 
24. make the file user-menu 
D:\Final Projects\Nova_Merge\pr_reviewer\features\auth\components\user-menu.tsx
Whenever you need a user profile menu or sign-out button in headers or sidebars, you simply render <UserMenuWithSession />.

Till Now we have completed the auuth Flow
----------------------------------------------------------------------------------

25. making the ui of dashboard

Making of UI dashboard using Shadcn ui 
-----------------------------------------------------------------------------------
26. Making the GitHub app , For Repo Fetching 
    Come in  developer setting in github and 
But Before we are going to set up ngrok 

ngrok http 3000 --domain=manhole-ducking-retread.ngrok-free.dev --host-header=rewrite

After doing this operations 
we need to install the package called (npm i octokit)
--------------------------------------------------------------
Complete till GitHub app Installation and App connection 
---------------------------------------------------------------

# Nova Merge — Project Setup (Pointwise)

---

## ⚙️ 1. Project Initialization
- Bootstrapped Next.js using `npx create-next-app@latest`
- App Router (`app/` dir), TypeScript, Tailwind CSS enabled by default

---

## 🎨 2. shadcn/ui Design System
- Initialized via `npx shadcn@latest init --preset b6GMM7ajb --template next --pointer`
- Config stored in `components.json`; utility function in `lib/utils.ts` (`cn()`)
- Components added via `npx shadcn@latest add <component>`

---

## 🌗 3. Dark / Light Mode
- Installed `next-themes` via `npm install next-themes`
- Created `components/providers/theme-provider.tsx` (client wrapper)
- Wrapped `app/layout.tsx` children with `<ThemeProvider>`
- Added toggle component: `components/ui/mode-toggle.tsx`

---

## 🔄 4. TanStack React Query
- Installed via `npm i @tanstack/react-query`
- Created `components/providers/query-provider.tsx` — provides global `QueryClient`
- Wrapped in `app/layout.tsx` alongside theme provider

---

## 🗄️ 5. Database — Neon PostgreSQL + Prisma
- Provisioned **Neon** serverless Postgres; added `DATABASE_URL` to `.env`
- Installed Prisma: `npm install prisma @types/pg --save-dev`
- Installed client + adapters: `npm install @prisma/client @prisma/adapter-pg pg dotenv`
- Initialized: `npx prisma init` → creates `prisma/schema.prisma`
- Created singleton DB client in `lib/db.ts` (prevents HMR connection leaks)
- Added test model, ran `npx prisma migrate dev` + `npx prisma generate`

---

## 🔐 6. Authentication — Better Auth
- Installed: `npm install better-auth`
- Added `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` to `.env`
- Created `lib/auth.ts` (server config) and `lib/auth-client.ts` (client hooks)
- Generated auth schemas: `npx auth@latest generate` → injected User, Session, Account, Verification tables into `schema.prisma`
- Migrated: `npx prisma migrate dev`
- Created catch-all API route: `app/api/auth/[...all]/route.ts`

---

## 🐙 7. GitHub OAuth — Sign In
- Registered a **GitHub OAuth App** in Developer Settings:
  - Homepage URL: `http://localhost:3000`
  - Callback URL: `http://localhost:3000/api/auth/callback/github`
- Added `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env`
- Created `app/(auth)/sign-in/page.tsx` with shared `app/(auth)/layout.tsx`
- Sign-in logic lives in `features/auth/components/github-sign-in-form.tsx` + `features/auth/actions/index.ts`

---

## 🏗️ 8. Feature-Driven Architecture
- Root `features/` folder with sub-modules: `auth/`, `ai/`, `github/`, `dashboard/`
- Each module owns its own `components/`, `actions/`, `server/`, `utils/`

---

## 🛡️ 9. Auth Utilities & Route Protection
- `features/auth/utils/index.ts` — safe callback path guard (prevents open redirects), route constants (`SIGN_IN_PATH`, `DEFAULT_AUTH_CALLBACK`)
- `features/auth/actions/index.ts` — `getServerSession()`, `requireAuth()`, `requireUnauth()` server helpers
- `app/(auth)/layout.tsx` — calls `requireUnauth()` (redirects logged-in users away from sign-in)
- `app/(protected)/layout.tsx` — calls `requireAuth()` (redirects guests to sign-in)

---

## 🔀 10. Middleware / Proxy
- `features/auth/utils/auth-proxy.ts` — edge-level route guard logic (`handleAuthProxy`)
- `proxy.ts` (root) — delegates to `handleAuthProxy`; matched on `/sign-in`, `/dashboard`, `/dashboard/:path*`

---

## 👤 11. User Menu Component
- `features/auth/components/user-menu.tsx`
- `<UserMenu />` — presentational dropdown with avatar, initials fallback, sign-out
- `<UserMenuWithSession />` — smart wrapper using `authClient.useSession()`, used in headers/sidebars

---

## 🖥️ 12. Dashboard UI
- Dashboard shell built with Shadcn/ui components
- Sidebar navigation defined in `features/dashboard/lib/routes.ts` (`DASHBOARD_NAV_ITEMS`)
- Routes: Overview, Repositories, Pull Requests, **GitHub App**, Settings
- Components: `dashboard-sidebar.tsx`, `dashboard-nav.tsx`, `dashboard-shell.tsx`, `dashboard-header.tsx`

---

## 🐙 13. GitHub App Setup (ngrok + Octokit)
- **Why ngrok?** GitHub App webhooks require a public HTTPS URL → `ngrok http 3000 --domain=<your-domain>`
- Registered a **GitHub App** in Developer Settings (not OAuth App):
  - Webhook URL: `https://<ngrok-domain>/api/github/webhook`
  - Webhook secret set and stored as `GITHUB_WEBHOOK_SECRET` in `.env`
  - Generated a **private key** (`.pem` file); value stored as `GITHUB_APP_PRIVATE_KEY` in `.env`
  - `GITHUB_APP_ID` stored in `.env`
  - `GITHUB_APP_NAME=novamerge`; public link: `NEXT_PUBLIC_GITHUB_PUBLIC_LINK`
- Installed `octokit`: `npm i octokit`

---

## 🔧 14. GitHub App Singleton (`github-app.ts`)
- `features/github/utils/github-app.ts`
- `getGithubApp()` — lazy-initializes `octokit.App` with `appId`, `privateKey`, and `webhooks.secret`
- `getGithubInstallUrl(userId)` — builds the GitHub App install URL with `state=userId` for callback association

---

## 💾 15. GithubInstallation — Database Model
- Added `GithubInstallation` model to `prisma/schema.prisma`:
  - Fields: `userId` (unique FK → User), `installationId` (GitHub numeric ID), `accountLogin`, `accountType`, `createdAt`
- Migrated and generated client

---

## 🔌 16. Installation Server Logic (`installation.ts`)
- `features/github/server/installation.ts`
- `getInstallationStatus(userId)` — checks DB for a linked installation
- `saveInstallation(userId, installationId)` — calls GitHub API to fetch account details, upserts to DB
- `deleteInstallation(userId)` — removes installation record from DB
- `getUserIdByInstallationId(installationId)` — reverse-lookup by GitHub installation ID
- `getUserInstallationId(userId)` — gets GitHub installation ID from DB for a user

---

## 📡 17. GitHub App Callback API Route
- `app/api/github/callback/route.ts`
- Handles `GET /api/github/callback?installation_id=<id>`
- If unauthenticated → redirects to `/sign-in?callbackUrl=...` preserving `installation_id`
- If authenticated → calls `saveInstallation()` → redirects to `/dashboard/github`

---

## 🔗 18. GitHub App Server Action
- `features/github/actions/index.ts`
- `disconnectGithubApp()` — verifies session, calls `deleteInstallation()`, redirects to `/dashboard/github`

---

## 🃏 19. GitHub Connect Card UI
- `features/dashboard/components/github-connect-card.tsx`
- Shows **Connected** (green border, account login, disconnect button) or **Disconnected** (feature list, install button)
- Install button links to `getGithubInstallUrl(userId)` with `state` param for secure callback association
- Page: `app/(protected)/dashboard/github/page.tsx` — fetches session + installation status server-side