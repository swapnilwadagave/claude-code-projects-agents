# URL Shortener

A self-hosted URL shortener with a React dashboard, per-link click analytics, JWT authentication, and QR code generation. Anonymous users can shorten links instantly; registered users get a full dashboard to manage, track, and delete their links.

---

## Features

- **Shorten any URL** — anonymous or authenticated, with optional custom slug
- **Link expiry** — set an `expiresAt` date; expired links return 410 Gone
- **Click analytics** — every redirect records browser, OS, device, and referrer
- **QR codes** — generated client-side for every shortened link
- **JWT auth** — short-lived access tokens in memory + rotating refresh tokens in httpOnly cookies
- **Rate limiting** — per-IP for anonymous requests, per-user for authenticated ones
- **Docker Compose** — one command spins up Postgres, backend, and frontend/nginx

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node 20 + Express + TypeScript |
| Database | PostgreSQL 16 (Docker volume) |
| ORM | Prisma (type-safe queries + migration runner) |
| Validation | Zod (all request bodies) |
| Auth | bcryptjs (passwords) + jsonwebtoken (access + refresh) |
| Slugs | nanoid (auto-generated, 6 chars) |
| Analytics | ua-parser-js (User-Agent parsing per click) |
| Rate limiting | express-rate-limit |
| Frontend | React 18 + Vite + TypeScript + React Router v6 |
| HTTP client | Axios (with JWT refresh interceptor) |
| QR codes | qrcode.react |
| Reverse proxy | nginx (serves SPA + proxies `/api` and slug routes to backend) |

---

## Project Structure

```
url-shortener/
├── .env.example              # Safe placeholder — copy to .env and fill in secrets
├── .gitignore
├── docker-compose.yml        # 3-service stack: postgres, backend, frontend
├── README.md
├── decisions/                # Architecture Decision Records
│   ├── README.md
│   ├── 001-tech-stack.md
│   └── 002-auth-strategy.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma     # User, RefreshToken, Url, Click models
│   │   └── migrations/       # SQL migrations (auto-applied on container start)
│   └── src/
│       ├── index.ts          # Express bootstrap
│       ├── config/
│       │   ├── env.ts        # Zod-validated environment variables
│       │   └── prisma.ts     # Shared PrismaClient singleton
│       ├── middleware/
│       │   ├── auth.ts       # Bearer token extraction + verification
│       │   ├── rateLimit.ts  # Four rate limiter instances
│       │   └── errorHandler.ts
│       ├── routes/
│       │   ├── auth.ts       # /api/auth/*
│       │   ├── urls.ts       # /api/urls/*
│       │   └── redirect.ts   # /:slug
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── urlController.ts
│       │   └── redirectController.ts
│       └── services/
│           ├── slugService.ts      # nanoid + collision retry
│           ├── analyticsService.ts # recordClick + aggregateClicks
│           └── jwtService.ts       # sign/verify access and refresh tokens
└── frontend/
    ├── Dockerfile            # Two-stage: Vite build → nginx serve
    ├── nginx.conf            # SPA routing + /api proxy + slug proxy
    ├── package.json
    ├── vite.config.ts        # Dev: proxies /api → http://localhost:3001
    └── src/
        ├── App.tsx           # Router + AuthProvider
        ├── api/client.ts     # Axios instance with 401 refresh interceptor
        ├── contexts/
        │   └── AuthContext.tsx  # Auth state (token in memory, not localStorage)
        ├── pages/
        │   ├── Home.tsx      # Public shortener form + result display
        │   ├── Login.tsx
        │   ├── Register.tsx
        │   └── Dashboard.tsx # Link list + analytics + delete + QR codes
        └── components/
            ├── Navbar.tsx
            ├── ShortenForm.tsx
            ├── LinkCard.tsx       # Per-link stats + QR code modal
            └── ProtectedRoute.tsx
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- Node.js 20+ and npm (only needed for local development without Docker)

---

## Quick Start — Docker Compose

This is the recommended way to run the full stack.

**1. Clone and enter the directory**

```bash
git clone https://github.com/swapnilwadagave/claude-code-projects-agents.git
cd claude-code-projects-agents/url-shortener
```

**2. Create your `.env` file**

```bash
cp .env.example .env
```

Open `.env` and fill in real values:

```dotenv
POSTGRES_PASSWORD=your_secure_password

# Generate each secret with:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=<64-byte hex string>
JWT_REFRESH_SECRET=<64-byte hex string>

# Base URL shown in shortened links (no trailing slash)
BASE_URL=http://localhost
```

**3. Build and start**

```bash
docker compose up --build
```

Docker Compose will:
1. Start **PostgreSQL 16** and wait for it to be healthy
2. Build and start the **backend** — runs `prisma migrate deploy` automatically before accepting traffic
3. Build and start the **frontend** (nginx) — serves the React SPA and reverse-proxies API + slug requests to the backend

**4. Open the app**

| URL | What |
|---|---|
| http://localhost | React frontend (SPA) |
| http://localhost/api | Backend REST API (via nginx proxy) |
| http://localhost:3001 | Backend direct (bypasses nginx) |

**5. Stop**

```bash
docker compose down          # stop containers, keep database volume
docker compose down -v       # stop containers AND delete database volume
```

---

## Local Development (without Docker)

Use this when you want fast iteration with hot reload.

You still need a running PostgreSQL instance. The easiest way:

```bash
# Start only the database from Docker Compose
docker compose up postgres -d
```

**Backend**

```bash
cd backend
npm install

# Copy root .env to backend/ OR export variables directly
export DATABASE_URL="postgresql://postgres:<POSTGRES_PASSWORD>@localhost:5432/urlshortener"
export JWT_ACCESS_SECRET="your_access_secret"
export JWT_REFRESH_SECRET="your_refresh_secret"
export PORT=3001
export BASE_URL="http://localhost"

npx prisma migrate dev   # applies migrations and generates Prisma Client
npm run dev              # starts ts-node-dev with hot reload → http://localhost:3001
```

**Frontend**

```bash
cd frontend
npm install
npm run dev              # Vite dev server → http://localhost:5173
```

Vite proxies `/api/*` to `http://localhost:3001` automatically (configured in `vite.config.ts`), so the frontend talks to your local backend.

---

## Database Migrations

Migrations live in `backend/prisma/migrations/`. They are applied automatically on container startup (`prisma migrate deploy`).

For local development, use `prisma migrate dev` which creates new migration files and re-generates the Prisma Client:

```bash
cd backend
npx prisma migrate dev --name describe_your_change
```

To inspect the database interactively:

```bash
cd backend
npx prisma studio    # opens browser UI at http://localhost:5555
```

---

## API Reference

All JSON requests must include `Content-Type: application/json`.  
Authenticated endpoints require `Authorization: Bearer <access_token>`.

### Authentication — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account. Body: `{ email, password }`. Returns `{ accessToken, user }` and sets refresh cookie. |
| POST | `/api/auth/login` | — | Sign in. Body: `{ email, password }`. Returns `{ accessToken, user }` and sets refresh cookie. |
| POST | `/api/auth/refresh` | cookie | Rotate refresh token. Returns new `{ accessToken }`. |
| POST | `/api/auth/logout` | — | Revoke refresh token and clear cookie. |

**Register / Login response**
```json
{
  "accessToken": "eyJ...",
  "user": { "id": "...", "email": "user@example.com" }
}
```

**Rate limit:** 5 requests / 15 min per IP on `/register` and `/login`.

---

### URLs — `/api/urls`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/urls` | optional | Create a short URL. |
| GET | `/api/urls` | required | List your URLs (newest first, paginated). |
| GET | `/api/urls/:id` | required | URL detail + full click analytics. Owner only. |
| PATCH | `/api/urls/:id` | required | Update `longUrl` or `expiresAt`. Owner only. |
| DELETE | `/api/urls/:id` | required | Delete URL and all its clicks. Owner only. |

**POST `/api/urls` — request body**
```json
{
  "longUrl": "https://example.com/very/long/path",
  "slug": "my-slug",          // optional; auto-generated if omitted
  "expiresAt": "2026-12-31T00:00:00Z"  // optional ISO 8601
}
```

**POST `/api/urls` — response**
```json
{
  "id": "clx...",
  "slug": "my-slug",
  "shortUrl": "http://localhost/my-slug",
  "longUrl": "https://example.com/very/long/path",
  "expiresAt": "2026-12-31T00:00:00.000Z",
  "createdAt": "2026-05-21T12:00:00.000Z"
}
```

**GET `/api/urls/:id` — analytics included**
```json
{
  "id": "clx...",
  "slug": "my-slug",
  "longUrl": "https://example.com/very/long/path",
  "expiresAt": null,
  "createdAt": "2026-05-21T12:00:00.000Z",
  "totalClicks": 42,
  "clicks": [
    {
      "id": "...",
      "referrer": "https://twitter.com",
      "browser": "Chrome",
      "os": "macOS",
      "device": "desktop",
      "createdAt": "2026-05-21T13:00:00.000Z"
    }
  ]
}
```

**Rate limit:** Anonymous — 10 requests / 15 min per IP. Authenticated — 100 requests / 15 min per user.

---

### Redirects — `/:slug`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/:slug` | — | Redirect to the long URL (302). Records browser/OS/device/referrer. |

- Returns **302** on success.
- Returns **410 Gone** if the link has expired or been deleted.
- Returns **404** if the slug doesn't exist.

**Rate limit:** 60 requests / 60 sec per IP.

---

## How Authentication Works

```
Browser                     Backend
  │                            │
  │── POST /api/auth/login ───►│
  │◄── { accessToken } ────────│  (+ httpOnly refresh cookie, 7d)
  │                            │
  │── GET /api/urls ──────────►│  Authorization: Bearer <accessToken> (15 min TTL)
  │◄── [...urls] ──────────────│
  │                            │
  │  [access token expires]    │
  │── POST /api/auth/refresh ─►│  sends refresh cookie automatically
  │◄── { accessToken } ────────│  (old refresh token revoked, new one set)
  │                            │
  │── GET /api/urls ──────────►│  new access token
```

- **Access token** — stored in JavaScript memory (not localStorage); lost on page refresh, silently renewed via the refresh cookie.
- **Refresh token** — stored as SHA-256 hash in the database; rotated on every use.
- Logout deletes the DB row, invalidating the refresh token server-side.

---

## Rate Limits Summary

| Limiter | Endpoint(s) | Window | Limit | Key |
|---|---|---|---|---|
| `authLimiter` | POST `/api/auth/login`, `/register` | 15 min | 5 | IP |
| `anonCreateUrlLimiter` | POST `/api/urls` (anonymous) | 15 min | 10 | IP |
| `createUrlLimiter` | POST `/api/urls` (authenticated) | 15 min | 100 | user ID |
| `redirectLimiter` | GET `/:slug` | 60 sec | 60 | IP |

Exceeded limits return `429 Too Many Requests`.

---

## Smoke Tests (curl)

Replace `TOKEN` with the `accessToken` from the login response.

```bash
# Register
curl -s -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}' | jq .

# Login
curl -s -c cookies.txt -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}' | jq .

# Shorten a URL (anonymous)
curl -s -X POST http://localhost/api/urls \
  -H "Content-Type: application/json" \
  -d '{"longUrl":"https://github.com"}' | jq .

# Shorten with custom slug (authenticated)
curl -s -X POST http://localhost/api/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"longUrl":"https://github.com","slug":"gh"}' | jq .

# Follow a short link (should redirect)
curl -v http://localhost/gh 2>&1 | grep "< Location"

# List your URLs
curl -s http://localhost/api/urls \
  -H "Authorization: Bearer TOKEN" | jq .

# Refresh access token (uses cookie)
curl -s -b cookies.txt -X POST http://localhost/api/auth/refresh | jq .
```

---

## Troubleshooting

**Backend won't start — `prisma migrate deploy` fails**

The backend waits for Postgres to be healthy before starting. If migration still fails, check logs:
```bash
docker compose logs backend
```
Common cause: the `DATABASE_URL` in `.env` doesn't match the `POSTGRES_PASSWORD`.

**Frontend shows blank page or 404 on routes like `/dashboard`**

nginx serves the React SPA for known routes (`/`, `/login`, `/register`, `/dashboard`). If you added a new frontend route, add a matching `location` block to `frontend/nginx.conf`.

**"invalid signature" or "jwt malformed" from API**

The `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` in `.env` doesn't match what was used to sign the tokens. Restart containers after editing `.env`:
```bash
docker compose down && docker compose up
```

**Port 80 or 3001 already in use**

Change the host port in `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"    # access at http://localhost:8080
```

**Reset the database**

```bash
docker compose down -v   # removes pg_data volume
docker compose up --build
```

---

## Architecture Decisions

See [`decisions/`](./decisions/README.md) for the full ADR index.

- [ADR 001 — Tech stack selection](./decisions/001-tech-stack.md)
- [ADR 002 — Authentication strategy](./decisions/002-auth-strategy.md)
