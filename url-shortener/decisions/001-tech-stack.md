# ADR 001 — Tech Stack Selection

**Status:** Accepted  
**Date:** 2026-05-21

## Context

Need a URL shortener with a full React dashboard, REST API, click analytics, and PostgreSQL persistence deployed locally via Docker Compose. The workspace already contains a React+Vite frontend project (`portfolio/`), so reusing the same toolchain reduces cognitive overhead.

## Decision

### Backend

| Choice | Rationale |
|---|---|
| **Node 20 + Express + TypeScript** | Matches workspace conventions; large middleware ecosystem; TypeScript gives end-to-end type safety across Prisma, Zod, and JWT payloads. |
| **Prisma ORM** | Type-safe query builder, auto-generated client from schema, and built-in migration runner (`migrate deploy`) that runs on container start without manual SQL. |
| **PostgreSQL 16** | ACID-compliant; relational model fits User → Url → Click hierarchy; supports future aggregate reporting queries (GROUP BY, window functions). |
| **Zod** | Parse-don't-validate at every request boundary; errors produce structured messages that map directly to HTTP 400 responses. |
| **bcryptjs** | Pure-JS bcrypt implementation; no native bindings needed on Alpine. |
| **jsonwebtoken** | Standard JWT library; supports HS256 for both access and refresh tokens with separate secrets. |
| **nanoid** | URL-safe 6-char slugs; cryptographically random; tiny bundle size. |
| **ua-parser-js** | Parses `User-Agent` header into browser/OS/device fields; runs synchronously in the redirect handler. |
| **express-rate-limit** | Pluggable key generators allow per-IP (anonymous) and per-user (authenticated) strategies on the same endpoint. |

### Frontend

| Choice | Rationale |
|---|---|
| **React 18 + Vite + TypeScript** | Matches `portfolio/` stack; Vite's dev proxy eliminates CORS issues during local development. |
| **React Router v6** | Declarative nested routing; `<Navigate>` and `<Outlet>` support `ProtectedRoute` cleanly. |
| **Axios** | Interceptors enable the silent JWT refresh flow (on 401: call `/api/auth/refresh`, retry, or redirect to `/login`). |
| **qrcode.react** | Client-side QR generation with no server round-trip. |
| **date-fns** | Lightweight date formatting for `createdAt` / `expiresAt` display. |

### Infrastructure

| Choice | Rationale |
|---|---|
| **Docker Compose** | Single-command local stack with service dependency ordering (`depends_on: condition: service_healthy`). |
| **nginx (frontend container)** | Serves compiled Vite assets, handles SPA client-side routing (`try_files /index.html =404`), and reverse-proxies `/api/*` and `/:slug` to the backend — no separate domain required. |
| **Multi-stage Dockerfile (backend)** | `deps` → `builder` → `runner` stages keep the final image small; `apk add openssl` is required in both `deps` and `runner` for Prisma's query engine on Alpine. |

## Consequences

- Prisma migration runner must complete before the backend accepts traffic — handled via `CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]`.
- TypeScript adds a compile step; `ts-node-dev` is used in development for fast iteration without a separate `tsc --watch` process.
- nanoid slugs are 6 chars (alphanumeric) — collision probability is negligible at low scale but the slug service retries up to 3 times on `P2002` (unique constraint violation).
- Access tokens stored in JavaScript memory are lost on page refresh; the refresh cookie silently restores the session, which means one extra network request on every page load.
