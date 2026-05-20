# ADR 004: Phased Backend Design

**Date:** 2026-05-19  
**Status:** Accepted

## Decision
Design Phase 1 so Phase 2 (Node.js/Express + PostgreSQL) can be added by only **adding** new files and making at most two small changes to existing frontend components.

## Phase 1 → Phase 2 change surface
| File | Change needed in Phase 2 |
|---|---|
| `frontend/src/components/Contact.jsx` | Replace `mailto:` with `fetch('/api/contact', {method:'POST',...})` |
| `frontend/src/components/Projects.jsx` | Optionally replace static import with `fetch('/api/projects')` |
| `portfolio/docker-compose.yml` | Add `backend` and `db` services |

Everything else (Navbar, Hero, About, Skills, nginx config, Dockerfile) is untouched.

## New files added in Phase 2 (nothing removed or renamed)
```
portfolio/
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── routes/projects.js   # GitHub proxy with token + in-memory cache
│   │   ├── routes/contact.js    # POST → insert into PostgreSQL
│   │   └── index.js             # Express app, /api/* routing
│   └── package.json
└── db/
    └── init.sql                 # contacts table schema
```

## Rationale
- Isolating all backend code to a new `backend/` directory means Phase 2 work can't accidentally break Phase 1 behavior.
- Express is kept to a minimal REST API (`/api/projects`, `/api/contact`) — no templating, no session management needed.
- PostgreSQL is only used for contact form submissions in Phase 2; projects data can remain static or be upgraded to a DB-backed cache.
- Using Docker Compose service names for inter-service communication (`backend` → `db:5432`) means no hardcoded IPs.
