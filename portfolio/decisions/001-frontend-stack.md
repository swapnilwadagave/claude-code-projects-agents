# ADR 001: Frontend Stack — React + Vite

**Date:** 2026-05-19  
**Status:** Accepted

## Decision
Use React 18 + Vite as the frontend stack.

## Alternatives considered
- **Next.js** — has built-in API routes which would be useful in Phase 2, but adds SSR complexity and a heavier runtime that isn't needed for a static portfolio. Phase 2 will add a separate Express service anyway.
- **Plain HTML/CSS/JS** — simplest Docker image, but makes component reuse and Phase 2 extension harder. No good story for dynamic data fetching.
- **Vue 3 + Vite** — comparable to React, but React was chosen because the owner's existing repos are React projects (reminder-reactapp-axios, React-Todo-App).

## Rationale
- React matches the owner's existing skill set and project history.
- Vite gives fast builds and HMR for local development.
- Static output (`vite build` → `dist/`) drops cleanly into an nginx container with no server runtime.
- Component model makes it easy to swap individual sections (e.g., Contact) in Phase 2 without touching others.
