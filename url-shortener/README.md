# URL Shortener

A full-stack URL shortener with a React dashboard, click analytics, and JWT authentication.

## Quick start (Docker Compose)

```bash
cp .env.example .env
# Edit .env — set POSTGRES_PASSWORD and generate JWT secrets (see comments in file)
docker compose up --build
```

- Frontend → http://localhost
- Backend API → http://localhost:3001

## Local dev (no Docker)

**Backend:**
```bash
cd backend
npm install
# Set DATABASE_URL pointing to a local Postgres instance in .env
npx prisma migrate dev
npm run dev       # http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev       # http://localhost:5173  (proxies /api → 3001)
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password |
| `JWT_ACCESS_SECRET` | Yes | ≥16 chars; signs access tokens |
| `JWT_REFRESH_SECRET` | Yes | ≥16 chars; signs refresh tokens |
| `BASE_URL` | No | Base for short URLs (default: `http://localhost`) |

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## API summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register (email + password) |
| POST | `/api/auth/login` | — | Login → access token + refresh cookie |
| POST | `/api/auth/refresh` | cookie | Rotate refresh token |
| POST | `/api/auth/logout` | — | Clear session |
| POST | `/api/urls` | optional | Create short URL |
| GET | `/api/urls` | required | List your URLs |
| GET | `/api/urls/:id` | required | URL details + analytics |
| PATCH | `/api/urls/:id` | required | Update URL |
| DELETE | `/api/urls/:id` | required | Delete URL |
| GET | `/:slug` | — | Redirect + record click |

## Architecture decisions

See [`decisions/`](./decisions/README.md).
