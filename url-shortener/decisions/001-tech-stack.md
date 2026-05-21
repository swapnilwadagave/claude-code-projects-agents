# ADR 001 — Tech Stack Selection

**Status:** Accepted

## Context
Need a URL shortener with a full React dashboard, REST API, and PostgreSQL persistence, deployed locally via Docker Compose.

## Decision
- **Backend:** Node 20 + Express + TypeScript — matches workspace conventions, large ecosystem
- **ORM:** Prisma — type-safe queries, built-in migration runner, excellent TS support
- **DB:** PostgreSQL 16 (Docker volume) — reliable, ACID, supports future reporting queries
- **Validation:** Zod — parse-don't-validate at all request boundaries
- **Frontend:** React 18 + Vite + TypeScript + React Router v6 — matches `portfolio/` stack

## Consequences
- Prisma migration runner must execute before the backend accepts traffic (handled in Dockerfile CMD).
- TypeScript adds a compile step; ts-node-dev used in development for fast iteration.
