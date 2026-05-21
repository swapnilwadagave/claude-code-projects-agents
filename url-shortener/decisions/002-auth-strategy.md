# ADR 002 — Authentication Strategy

**Status:** Accepted  
**Date:** 2026-05-21

## Context

The app supports two classes of users:

- **Anonymous** — can shorten URLs immediately, no account required.
- **Registered** — additionally get a dashboard with link management, analytics, and delete.

The auth strategy must:
1. Be stateless enough for a Docker Compose deployment (no Redis session store).
2. Protect against XSS (no tokens in `localStorage`).
3. Support forced logout / token revocation.
4. Keep the UX smooth — page refreshes should not log the user out.

## Decision

### Token types

| Token | TTL | Storage | Transport |
|---|---|---|---|
| **Access token** (JWT, HS256) | 15 min | JavaScript memory (module-level variable in `api/client.ts`) | `Authorization: Bearer` header |
| **Refresh token** (JWT, HS256) | 7 days | httpOnly, SameSite=Lax cookie | Sent automatically by browser |

### Refresh token storage in DB

Refresh tokens are stored **hashed** (SHA-256) in the `RefreshToken` table:

- The raw token is never persisted — only its hash.
- On `/api/auth/refresh`: hash the incoming token, look it up, verify expiry, delete the old row, insert a new one (rotation).
- On `/api/auth/logout`: hash the incoming token, delete the DB row, clear the cookie.

Storing the hash (not the raw token) means a database breach does not expose usable tokens.

### Token rotation

Every call to `/api/auth/refresh` invalidates the old refresh token and issues a new one. This limits the window of exposure if a refresh token is somehow captured.

### Silent refresh flow

```
1. User logs in   → access token stored in memory; refresh cookie set
2. User refreshes page → memory cleared; frontend calls /api/auth/refresh on mount
3. /api/auth/refresh   → validates cookie, issues new access token + rotates refresh token
4. App continues as if never reloaded
```

The Axios response interceptor handles mid-session expiry:

```
Request fails with 401
  → call POST /api/auth/refresh
  → if refresh succeeds: retry the original request with new access token
  → if refresh fails (expired/revoked): redirect to /login
```

### Cookie settings

```
httpOnly: true       // not accessible to JavaScript — XSS-safe
sameSite: 'lax'      // sent on same-site navigations + top-level cross-site GETs
secure: false        // set to true in production behind HTTPS
path: /api/auth      // scoped so the cookie is only sent to auth endpoints
maxAge: 7d           // matches refresh token TTL
```

## Consequences

- **No Redis required** — revocability is achieved via DB rows; acceptable for a single-node deployment.
- **One DB read per refresh** — the `RefreshToken` lookup adds latency to every page load (silent refresh) and every 15-minute renewal. At low scale this is negligible.
- **Page refresh = one extra request** — the access token is in memory, so every hard refresh triggers a `/api/auth/refresh` call before the app renders the authenticated state. A loading spinner guards the UI during this check.
- **Forced logout works** — an admin can delete a `RefreshToken` row to invalidate a session, even if the access token hasn't expired yet (the user will be fully logged out within 15 minutes).
- **Anonymous URLs** — `Url.userId` is nullable; anonymous links are not accessible via the dashboard but still redirect and record clicks.

## Rejected alternatives

| Alternative | Reason rejected |
|---|---|
| Access token in `localStorage` | Vulnerable to XSS; any injected script can read and exfiltrate the token. |
| Session cookies (server-side state) | Requires a shared session store (Redis/DB) to scale; more complex than JWT for this use case. |
| Access token in httpOnly cookie | Can't attach to `Authorization` header from JavaScript; requires every backend route to read from cookie instead — less standard. |
| No refresh tokens (long-lived access tokens) | Can't revoke individual sessions; expiry must be set very long, increasing blast radius if a token is leaked. |
