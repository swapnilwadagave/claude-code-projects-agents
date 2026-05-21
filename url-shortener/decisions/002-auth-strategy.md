# ADR 002 — Authentication Strategy

**Status:** Accepted

## Context
The app allows anonymous URL shortening. Registered users additionally get a dashboard with link management and analytics.

## Decision
- **JWT access token** (~15 min TTL) returned in response body; stored in memory by the frontend (not localStorage — avoids XSS exposure).
- **JWT refresh token** (7 day TTL) stored in an httpOnly, SameSite=Lax cookie — not accessible to JavaScript.
- Refresh tokens are stored **hashed** in the `RefreshToken` table; rotation on every `/auth/refresh` call invalidates the old token.
- Logout deletes the DB row and clears the cookie.

## Consequences
- Page refresh loses the in-memory access token; the refresh flow silently issues a new one via the cookie.
- Storing refresh tokens in the DB enables forced logout / revocation, at the cost of one DB read per refresh.
