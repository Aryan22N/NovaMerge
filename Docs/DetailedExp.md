# Nova Merge / PR Reviewer - Detailed Project Architecture & Setup Guide

This document provides a comprehensive, step-by-step breakdown of how the project is configured, the technology stack chosen, why each library/tool is used, how the code works under the hood, and the exact purpose of every file and directory created in the repository.

---

## Table of Contents
1. [Next.js Framework Setup](#1-nextjs-framework-setup)
2. [shadcn/ui Design System Initialization](#2-shadcnui-design-system-initialization)
3. [Installing UI Components via shadcn CLI](#3-installing-ui-components-via-shadcn-cli)
4. [Dark/Light Mode Setup with next-themes](#4-darklight-mode-setup-with-next-themes)
5. [Theme Provider & Root Layout Integration](#5-theme-provider--root-layout-integration)
6. [Mode Toggle Component](#6-mode-toggle-component)
7. [TanStack React Query Installation](#7-tanstack-react-query-installation)
8. [Query Client Provider Setup](#8-query-client-provider-setup)
9. [Database Provisioning (Neon Serverless Postgres)](#9-database-provisioning-neon-serverless-postgres)
10. [Prisma ORM & PostgreSQL Driver Adapters](#10-prisma-orm--postgresql-driver-adapters)
11. [Prisma Initialization](#11-prisma-initialization)
12. [Singleton Database Client Configuration](#12-singleton-database-client-configuration)
13. [Prisma Client Generation](#13-prisma-client-generation)
14. [Database Schema Test Model](#14-database-schema-test-model)
15. [Database Migrations](#15-database-migrations)
16. [Better Auth Integration](#16-better-auth-integration)
17. [Better Auth Schema Generation & Migration](#17-better-auth-schema-generation--migration)
18. [Catch-All Auth API Route Handler](#18-catch-all-auth-api-route-handler)
19. [GitHub OAuth App Setup & Sign-In Page](#19-github-oauth-app-setup--sign-in-page)
20. [Feature-Driven Architecture & Security Best Practices](#20-feature-driven-architecture--security-best-practices)
21. [Auth Utilities & Safe Callback Path Guard](#21-auth-utilities--safe-callback-path-guard)
22. [Server-Side Session Helpers & Auth Requirements](#22-server-side-session-helpers--auth-requirements)
23. [Layout Guards (Protected vs. Guest Routes)](#23-layout-guards-protected-vs-guest-routes)
24. [Authentication Proxy Logic (`auth-proxy.ts`)](#24-authentication-proxy-logic-auth-proxyts)
25. [Root Middleware / Proxy Integration (`proxy.ts`)](#25-root-middleware--proxy-integration-proxyts)
26. [User Profile & Session Menu Component (`user-menu.tsx`)](#26-user-profile--session-menu-component-user-menutsx)

---

### 1. Next.js Framework Setup
- **Command Used**:
  ```bash
  npx create-next-app@latest
  ```
- **Why it is used**: Next.js is a production-grade React framework offering hybrid rendering (Server Side Rendering - SSR, Static Site Generation - SSG, Server-Side React Components - RSC), built-in API routing, automatic code splitting, optimized image assets, and full TypeScript support out of the box.
- **What it is doing**: It bootstraps a structured React project using Next.js App Router (`app/` directory), configures Tailwind CSS, ESLint, TypeScript compilation rules (`tsconfig.json`), and installs base npm dependencies (`package.json`).
- **How the code works with this**: All pages, layouts, and API routes reside inside the `app/` directory. Next.js maps the filesystem structure directly to browser URLs (e.g. `app/(auth)/sign-in/page.tsx` maps to `/sign-in`).
- **Use of files and folders**:
  - `app/`: Contains all App Router layouts, pages, loading UI, error boundaries, and API endpoints.
  - `public/`: Stores static public assets such as SVGs, logos (`/logo2.svg`), icons, and fonts.
  - `next.config.ts`: Central Next.js configuration for build settings, compiler flags, and environment variables.

---

### 2. shadcn/ui Design System Initialization
- **Command Used**:
  ```bash
  npx shadcn@latest init --preset b6GMM7ajb --template next --pointer
  ```
- **Why it is used**: Unlike traditional component libraries (e.g. Material UI, Ant Design) that ship as immutable `node_modules` binaries, `shadcn/ui` copies fully customizable, accessible code directly into your repository. Using presets automates initial setup (Tailwind theme tokens, Radix UI primitives, icon choices).
- **What it is doing**:
  1. Configures CSS variables inside `app/globals.css` for background, foreground, border, card, and primary colors.
  2. Sets up TypeScript path aliases (`@/components`, `@/lib`, `@/features`).
  3. Creates `components.json` to store CLI preferences.
  4. Generates utility functions in `lib/utils.ts`.
- **How the code works with this**: All UI components leverage Tailwind CSS classes linked to CSS variables, allowing seamless dark/light theme switching and style modification directly inside the project code.
- **Use of files and folders**:
  - `components.json`: CLI configuration file detailing component output directory, style engine, utility paths, and CSS variable usage.
  - `lib/utils.ts`: Exports `cn()`, a helper that combines `clsx` (conditional class names) and `tailwind-merge` (deduplicating conflicting Tailwind utility classes).

---

### 3. Installing UI Components via shadcn CLI
- **Command Used**:
  ```bash
  npx shadcn@latest add button card field spinner
  ```
- **Why it is used**: Automatically downloads accessible, unstyled UI primitives (built on Radix UI) directly into your project's `components/ui/` folder.
- **What it is doing**: Fetches source code for components (such as `Button`, `Card`, `FieldSet`, `Spinner`) and installs required Radix UI dependencies (e.g. `@radix-ui/react-slot`).
- **How the code works with this**: You import components directly in your pages or feature forms:
  ```tsx
  import { Button } from "@/components/ui/button";
  ```
- **Use of files and folders**:
  - `components/ui/`: Contains atomic, project-owned design components (`button.tsx`, `card.tsx`, `field.tsx`, `spinner.tsx`, `mode-toggle.tsx`).

---

### 4. Dark/Light Mode Setup with next-themes
- **Command Used**:
  ```bash
  npm install next-themes
  ```
- **Why it is used**: `next-themes` handles client-side theme persistence (Dark Mode, Light Mode, System preference) without Flash of Unstyled Content (FOUC) and automatically syncs with the system preference (`prefers-color-scheme`).
- **What it is doing**: It injects an inline script into the head during initial render, toggling the `dark` class on the `<html>` element dynamically based on user selection or system settings.
- **How the code works with this**: CSS rules in `globals.css` respond to `.dark`, instantly swapping all `--background`, `--foreground`, `--border`, and `--primary` color variables across the application.

---

### 5. Theme Provider & Root Layout Integration
- **Files Created / Modified**:
  - `components/providers/theme-provider.tsx`
  - `app/layout.tsx`
- **Why it is used**: In Next.js App Router, Server Components are the default. `next-themes` relies on React Context (`useContext`), which requires a Client Component wrapper (`"use client"`).
- **What it is doing**:
  - `theme-provider.tsx` wraps `ThemeProvider` from `next-themes`.
  - `app/layout.tsx` wraps the entire application `{children}` inside `<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>`.
- **How the code works with this**: All pages rendered under `app/layout.tsx` gain access to the theme state and CSS class toggling without needing custom state handlers.
- **Use of files and folders**:
  - `components/providers/`: Directory for client-side context providers (Theme, React Query, Auth Context).
  - `components/providers/theme-provider.tsx`: Client wrapper enabling `next-themes` inside server layouts.
  - `app/layout.tsx`: Root layout shell defining global HTML structure, fonts, CSS imports, and global providers.

---

### 6. Mode Toggle Component
- **File Created**: `components/ui/mode-toggle.tsx`
- **Why it is used**: Provides an interactive UI control (Dropdown Menu / Button) for users to explicitly select Light, Dark, or System mode.
- **What it is doing**: Uses the `useTheme()` hook exported by `next-themes` to invoke `setTheme("dark")` or `setTheme("light")`.
- **How the code works with this**: Placed in top navbars or footers. When clicked, it mutates the active theme state instantly across the UI.
- **Use of files and folders**:
  - `components/ui/mode-toggle.tsx`: Isolated component managing theme switching interactions.

---

### 7. TanStack React Query Installation
- **Command Used**:
  ```bash
  npm i @tanstack/react-query
  ```
- **Why it is used**: Manages asynchronous client-side server state, automatic background re-fetching, query caching, deduplication of network requests, error handling, and optimistic updates.
- **What it is doing**: Maintains an in-memory cache of API responses keyed by unique query keys (`['session']`, `['prs']`), eliminating repetitive network fetches.
- **How the code works with this**: Client components use hooks like `useQuery` or `useMutation` to read or mutate server state effortlessly without writing manual `useEffect` logic.

---

### 8. Query Client Provider Setup
- **File Created**: `components/providers/query-provider.tsx`
- **Why it is used**: React Query requires a `QueryClientProvider` at the top level of the component tree to supply the `QueryClient` cache instance.
- **What it is doing**: Instantiates a single `QueryClient` instance (persisted across client re-renders) and provides it to all child components.
- **How the code works with this**: Wrapped inside `app/layout.tsx` alongside `ThemeProvider`.
- **Use of files and folders**:
  - `components/providers/query-provider.tsx`: Client component instantiating and providing the global TanStack `QueryClient`.

---

### 9. Database Provisioning (Neon Serverless Postgres)
- **Actions**: Provisioning a Neon PostgreSQL cloud database and configuring `DATABASE_URL` in `.env`.
- **Why it is used**: Neon provides modern, serverless PostgreSQL built specifically for cloud workloads, offering instant branching, autoscaling, connection pooling, and low latency.
- **What it is doing**: Connection string format:
  ```env
  DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
  ```
  Grants Prisma ORM secure encrypted access to execute SQL queries.
- **How the code works with this**: Prisma client reads `process.env.DATABASE_URL` at runtime to query PostgreSQL.
- **Use of files and folders**:
  - `.env`: Holds confidential credentials (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`). **Must be listed in `.gitignore`** so secrets are never pushed to GitHub.

---

### 10. Prisma ORM & PostgreSQL Driver Adapters
- **Commands Used**:
  ```bash
  npm install prisma @types/pg --save-dev
  npm install @prisma/client @prisma/adapter-pg pg dotenv
  ```
- **Why it is used**: Serverless Next.js environments (Vercel/Node.js) require efficient database pool connection handling. `@prisma/adapter-pg` paired with `pg` enables Prisma ORM to run over standard serverless database connections without exhausting database connections.
- **What it is doing**: Installs Prisma CLI for schema management (`prisma`), the generated type-safe ORM runtime (`@prisma/client`), and PostgreSQL connection pool adapters (`@prisma/adapter-pg`).
- **How the code works with this**: Provides autocompleted, type-safe database queries such as `prisma.user.findUnique()`.

---

### 11. Prisma Initialization
- **Command Used**:
  ```bash
  npx prisma init
  ```
- **Why it is used**: Initializes the database ORM workflow inside the Next.js repository.
- **What it is doing**: Creates the `prisma/` folder containing `schema.prisma` (and optionally `prisma.config.ts`).
- **How the code works with this**: `schema.prisma` serves as the single source of truth for all database entity models, field definitions, database relations, and generator settings.
- **Use of files and folders**:
  - `prisma/`: Folder housing database model definitions and SQL migration histories.
  - `prisma/schema.prisma`: Master schema file defining PostgreSQL provider settings, client output paths, and database tables.

---

### 12. Singleton Database Client Configuration
- **File Created**: `lib/db.ts`
- **Why it is used**: In Next.js development mode, Hot Module Replacement (HMR) clears Node.js module caches on save. Re-evaluating file scopes would create new `PrismaClient` instances repeatedly, quickly exhausting database connection limits.
- **What it is doing**: Implements a global singleton pattern that attaches the active `PrismaClient` instance to `globalThis.prisma` during development.
- **How the code works with this**:
  ```ts
  import { PrismaPg } from "@prisma/adapter-pg";
  import { PrismaClient } from "./generated/prisma/client";

  const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined;
  };

  function createPrismaClient() {
      const url = process.env.DATABASE_URL;
      if (!url) throw new Error("Please provide the DATABASE_URL in .env file");

      const adapter = new PrismaPg({ connectionString: url });
      return new PrismaClient({ adapter });
  }

  export const prisma = globalForPrisma.prisma ?? createPrismaClient();

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```
- **Use of files and folders**:
  - `lib/db.ts`: Central database instance exported for Server Actions, API routes, and Auth handlers.

---

### 13. Prisma Client Generation
- **Command Used**:
  ```bash
  npx prisma generate
  ```
- **Why it is used**: Reads `prisma/schema.prisma` and compiles strongly typed TypeScript client code specifically generated for your data models.
- **What it is doing**: Outputs type definitions into `lib/generated/prisma` or `node_modules/@prisma/client`.
- **How the code works with this**: Enables full static type safety, autocomplete, and strict type-checking across your Next.js application when querying database models.

---

### 14. Database Schema Test Model
- **Action**: Adding a test model to `prisma/schema.prisma`:
  ```prisma
  model Test {
    id    String @id @default(cuid())
    title String
  }
  ```
- **Why it is used**: Serves as an initial verification step to confirm database connection stability and migration workflows prior to adding complex auth schemas.
- **What it is doing**: Defines a `Test` table with a unique CUID string primary key `id` and a `title` field.

---

### 15. Database Migrations
- **Command Used**:
  ```bash
  npx prisma migrate dev
  ```
- **Why it is used**: Applies schema changes from `schema.prisma` directly to the active Neon PostgreSQL database.
- **What it is doing**:
  1. Generates a new SQL migration file in `prisma/migrations/`.
  2. Executes SQL statements against Neon Postgres to build/modify tables.
  3. Automatically runs `npx prisma generate` to sync TypeScript types.
- **How the code works with this**: Ensures the physical PostgreSQL database tables stay 100% in sync with the codebase schema definitions.

---

### 16. Better Auth Integration
- **Command Used**:
  ```bash
  npm install better-auth
  ```
- **Files Created**:
  - `lib/auth.ts` (Server Auth configuration)
  - `lib/auth-client.ts` (Client Auth helper)
- **Why it is used**: Better Auth is a modern, lightweight, type-safe authentication framework built for Next.js App Router, offering out-of-the-box support for Prisma ORM, session handling, HTTP-only secure cookies, and social OAuth providers (GitHub, Google).
- **What it is doing**: Manages user session creation, token validation, secure cookie set/get headers, and social provider login logic.
- **How the code works with this**:
  - `lib/auth.ts`: Exports server auth handler `auth`.
  - `lib/auth-client.ts`: Exports client auth hooks (`useSession`, `signIn`, `signOut`).
- **Use of files and folders**:
  - `lib/auth.ts`: Server-side authentication configuration using Prisma adapter and GitHub OAuth credentials.
  - `lib/auth-client.ts`: Client-side helper exposing React hooks for auth state management.

---

### 17. Better Auth Schema Generation & Migration
- **Commands Used**:
  ```bash
  npx auth@latest generate
  npx prisma generate
  npx prisma migrate dev
  ```
- **Why it is used**: Better Auth requires relational database tables (`User`, `Session`, `Account`, `Verification`).
- **What it is doing**: `npx auth@latest generate` automatically injects the required Better Auth tables directly into `prisma/schema.prisma`. Then `prisma migrate dev` creates and runs the corresponding SQL statements on Neon Postgres.
- **How the code works with this**: Allows Better Auth to read and store authenticated users, linked social accounts, and session tokens natively inside your PostgreSQL database.

---

### 18. Catch-All Auth API Route Handler
- **File Created**: `app/api/auth/[...all]/route.ts`
- **Why it is used**: Better Auth needs to handle multiple authentication API endpoints (e.g. `/api/auth/sign-in/social`, `/api/auth/callback/github`, `/api/auth/sign-out`, `/api/auth/session`).
- **What it is doing**: Next.js optional catch-all route `[...all]` catches all HTTP requests made under `/api/auth/*` and forwards them to Better Auth's HTTP route handler.
- **How the code works with this**:
  ```ts
  import { auth } from "@/lib/auth";
  import { toNextJsHandler } from "better-auth/next-js";

  export const { GET, POST } = toNextJsHandler(auth);
  ```
- **Use of files and folders**:
  - `app/api/auth/[...all]/route.ts`: Central endpoint servicing all authentication HTTP requests seamlessly.

---

### 19. GitHub OAuth App Setup & Sign-In Page
- **Action**:
  1. Registered a GitHub Developer OAuth App:
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
  2. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`.
  3. Created sign-in page at `app/(auth)/sign-in/page.tsx` with shared layout in `app/(auth)/layout.tsx`.
- **Why it is used**: Allows users to log in securely with their GitHub credentials with a single click.
- **What it is doing**: When a user submits the login form, they are redirected to GitHub's authorization consent screen. Once approved, GitHub returns an auth code to `/api/auth/callback/github`, which Better Auth exchanges for an access token and sets a secure session cookie.
- **How the code works with this**: `app/(auth)/sign-in/page.tsx` renders a branded card with logo, title, and the `GithubSignInForm` component inside a centered screen layout.
- **Use of files and folders**:
  - `app/(auth)/`: Route group (parentheses prevent route URL prefixing) grouping authentication pages under a shared, centered `layout.tsx`.
  - `app/(auth)/sign-in/page.tsx`: The sign-in page component.

---

### 20. Feature-Driven Architecture & Security Best Practices
- **Folder Structure Created**:
  - `features/`: Root folder for domain-driven feature modules.
    - `features/auth/`: Module containing all authentication components and server actions.
      - `components/github-sign-in-form.tsx`: Client form component displaying "Continue with GitHub", managing submission states (`useFormStatus`), and rendering spinner icons.
      - `actions/index.ts`: Next.js Server Action (`"use server"`) calling `auth.api.signInSocial({ provider: "github", callbackURL: "/dashboard" })` to trigger OAuth redirection safely on the server.
    - `features/ai/`: Reserved module for AI code review processing logic.
    - `features/github/`: Reserved module for GitHub PR fetching and webhook event listeners.
- **Why it is used**: Feature-driven organization scales cleanly as applications grow, keeping UI components, server actions, API helpers, and state hooks co-located by feature domain rather than fragmented across global folders.
- **What it is doing**:
  - `github-sign-in-form.tsx` uses `useFormStatus()` to provide immediate user feedback ("Redirecting to GitHub…") when submitting.
  - `actions/index.ts` handles the server action redirect safely without exposing secrets to client bundles.
- **Security & `.gitignore` Rule**:
  - All secret files (`.env`, `.env.local`, `.env.production`) containing database credentials (`DATABASE_URL`), secret auth keys (`BETTER_AUTH_SECRET`), and OAuth client secrets (`GITHUB_CLIENT_SECRET`) are explicitly specified inside `.gitignore`.
  - This guarantees that secret keys are **never** committed or leaked to public or private version control repositories.

---

### 21. Auth Utilities & Safe Callback Path Guard
- **File Created**: `features/auth/utils/index.ts`
- **Why it is used**: Defines global auth route constants (`SIGN_IN_PATH = "/sign-in"`, `DEFAULT_AUTH_CALLBACK = "/dashboard"`) and prevents **Open Redirect Vulnerabilities** (phishing attacks).
- **What it is doing**:
  - `getSafeCallbackPath(callbackUrl)` verifies whether an incoming `callbackUrl` is a valid relative internal path starting with a single slash (`/`) and NOT a protocol-relative external link (starting with `//`).
  - If valid (e.g., `/dashboard`), it returns `callbackUrl`. If invalid or external (e.g. `https://attacker.com` or `//attacker.com`), it safely falls back to `DEFAULT_AUTH_CALLBACK` (`"/dashboard"`).
- **How the code works with this**: Used by Server Actions in `features/auth/actions/index.ts` and authentication middleware handlers in `auth-proxy.ts` before triggering OAuth login redirects.
- **Use of files and folders**:
  - `features/auth/utils/index.ts`: Utility module housing path constants and security validation logic.

---

### 22. Server-Side Session Helpers & Auth Requirements
- **File Modified**: `features/auth/actions/index.ts`
- **Why it is used**: Exposes server-side helper functions for session retrieval and explicit route guards inside React Server Components and Layouts.
- **What it is doing**:
  - `getServerSession()`: Reads incoming HTTP headers (`headers()`) and queries Better Auth (`auth.api.getSession`) on the server.
  - `requireAuth(redirectTo = SIGN_IN_PATH)`: Checks if a session exists; if not, immediately invokes `redirect(redirectTo)` to send the user to `/sign-in`.
  - `requireUnauth(redirectTo = DEFAULT_AUTH_CALLBACK)`: Checks if a session exists; if user is already authenticated, immediately invokes `redirect(redirectTo)` to send them to `/dashboard`.
- **How the code works with this**: Called directly inside async layouts (`app/(auth)/layout.tsx`, `app/(protected)/layout.tsx`) or server page components.

---

### 23. Layout Guards (Protected vs. Guest Routes)
- **Files Modified / Created**:
  - `app/(auth)/layout.tsx` (Guest layout guard)
  - `app/(protected)/layout.tsx` (Protected layout guard)
  - `app/(protected)/dashboard/page.tsx` (Dashboard page)
- **Why it is used**: Layout-level route protection ensures that entire subtrees of routes enforce authentication rules automatically before child pages are rendered.
- **What it is doing**:
  - `app/(auth)/layout.tsx` calls `await requireUnauth()` at the top. If a logged-in user navigates to `/sign-in`, they are immediately redirected to `/dashboard`.
  - `app/(protected)/layout.tsx` calls `await requireAuth()` at the top. If a guest user navigates to `/dashboard`, they are immediately redirected to `/sign-in`.
- **How the code works with this**: Next.js App Router runs layout server functions before rendering any child `page.tsx` components.

---

### 24. Authentication Proxy Logic (`auth-proxy.ts`)
- **File Created**: `features/auth/utils/auth-proxy.ts`
- **Why it is used**: Encapsulates the core authentication route-guard decision tree for Next.js edge request proxying/middleware.
- **What it is doing**:
  - `handleAuthProxy(request)`:
    1. **Public Route (`/`)**: Passes through immediately (`NextResponse.next()`).
    2. **Session Verification**: Checks session status via `auth.api.getSession({ headers: request.headers })`.
    3. **Sign-In Route (`/sign-in`)**: If user is already authenticated, redirects them to `getPostAuthRedirectPath(request)` (or `/dashboard`).
    4. **Protected Routes (`/dashboard`, etc.)**: If user is unauthenticated, calls `redirectToSignIn(request, pathname)` to send them to `/sign-in?callbackUrl=<original_path>`.
  - `redirectToSignIn(request, pathname)`: Preserves original request path and query parameters in `callbackUrl` so users return to where they left off after logging in.
- **How the code works with this**: Delegated directly by `proxy.ts` at the root of the project.
- **Use of files and folders**:
  - `features/auth/utils/auth-proxy.ts`: Isolated utility executing edge-level route authorization checks.

---

### 25. Root Middleware / Proxy Integration (`proxy.ts`)
- **File Created**: `proxy.ts` (Root)
- **Why it is used**: Integrates Next.js middleware / request proxying at the root level, configuring route matchers for edge execution.
- **What it is doing**:
  ```ts
  import type { NextRequest } from "next/server";
  import { handleAuthProxy } from "./features/auth/utils/auth-proxy";

  export async function proxy(request: NextRequest) {
      return handleAuthProxy(request);
  }

  export const config = {
      matcher: ["/sign-in", "/dashboard", "/dashboard/:path*"],
  };
  ```
  Applies the `handleAuthProxy` guard specifically to `/sign-in`, `/dashboard`, and all sub-routes under `/dashboard/*`.
- **How the code works with this**: Runs on every matching request at the edge boundary before Next.js processes server layouts or page components.

---

### 26. User Profile & Session Menu Component (`user-menu.tsx`)
- **File Created**: `features/auth/components/user-menu.tsx`
- **Files Modified**: `app/page.tsx`, `app/(protected)/dashboard/page.tsx`
- **Why it is used**: Provides a clean user profile menu, avatar, name/email display, subscription badge, and one-click sign-out functionality.
- **What it is doing**:
  - `<UserMenu />`: Pure presentational dropdown menu component supporting `compact` (avatar-only) and `profile` (avatar + name + caret) triggers. Features initials fallback (`getInitials`) and sign-out handler (`authClient.signOut`).
  - `<UserMenuWithSession />`: Smart wrapper that connects directly to `authClient.useSession()`, automatically rendering user data and handling session state cleanly across pages.
- **How the code works with this**: Whenever a user profile menu or sign-out button is needed in headers or sidebars, render `<UserMenuWithSession />`:
  ```tsx
  import { UserMenuWithSession } from "@/features/auth/components/user-menu";

  // In app/page.tsx or app/(protected)/dashboard/page.tsx
  <UserMenuWithSession variant="compact" />
  ```
