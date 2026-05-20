# ADR 002: GitHub Data Strategy — Build-Time Static Fetch

**Date:** 2026-05-19  
**Status:** Accepted

## Decision
Fetch GitHub repos once at Docker build time via a `prebuild` Node.js script (`fetch-github.mjs`). The result is baked into `src/data/github-repos.json` and bundled with the static output.

## Alternatives considered
- **Runtime fetch in the browser** — always fresh data, but hits the unauthenticated GitHub API (60 req/hr rate limit), adds a loading state to the Projects section, and fails if GitHub is unreachable.
- **Manually curated JSON** — full control but requires manual updates every time a repo is added or updated.

## Rationale
- No runtime API dependency means the site works offline once deployed.
- Avoids rate limiting for public visitors.
- The fetch script includes a hardcoded fallback snapshot, so the Docker build never fails due to a network issue.
- When Phase 2 backend is added, the Projects section can optionally switch to a live `/api/projects` endpoint (which caches upstream GitHub calls server-side) — this is a one-line change in `Projects.jsx`.

## Fallback behavior
If the GitHub API call fails during build, `fetch-github.mjs` writes a hardcoded snapshot of known repos so the build still succeeds.
