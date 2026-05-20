# Portfolio

A personal developer portfolio built with React + Vite, served by nginx inside Docker, and exposed publicly via ngrok.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | CSS Modules |
| Server | nginx (multi-stage Docker image) |
| Tunnel | ngrok (official Docker image) |
| Orchestration | Docker Compose |

## Project Structure

```
portfolio/
├── decisions/              # Architecture Decision Records (ADRs)
│   ├── README.md           # ADR index
│   ├── 001-frontend-stack.md
│   ├── 002-github-data-strategy.md
│   ├── 003-docker-compose-setup.md
│   └── 004-phased-backend-design.md
├── frontend/
│   ├── src/
│   │   ├── components/     # React components (Hero, About, Projects, Skills, Contact, Navbar)
│   │   ├── data/           # github-repos.json (generated at build time, not committed)
│   │   └── styles/         # Global CSS
│   ├── scripts/
│   │   └── fetch-github.mjs  # Prebuild script — fetches GitHub repos at Docker build time
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env                    # Local secrets — never committed (see .env.example)
├── .env.example            # Template — copy to .env and fill in values
└── .gitignore
```

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- A [ngrok account](https://ngrok.com) and auth token
- A GitHub personal access token (optional, increases API rate limit from 60 to 5000 req/hr during build)

## Setup

### 1. Clone and enter the project

```bash
git clone https://github.com/swapnilwadagave/claude-code-projects-agents.git
cd claude-code-projects-agents/portfolio
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
NGROK_AUTHTOKEN=your_ngrok_token_here
GITHUB_TOKEN=your_github_pat_here   # optional but recommended
```

### 3. Start the stack

```bash
docker compose up --build
```

This runs two services:
- **frontend** — builds the React app and serves `dist/` via nginx on port 80
- **ngrok** — creates a public HTTPS tunnel to the frontend

### 4. Find your public URL

Visit the ngrok inspector at **http://localhost:4040** to see your public URL.

## Local Development (without Docker)

```bash
cd frontend
npm install
npm run dev         # starts Vite dev server at http://localhost:5173
```

> The GitHub repos data will use the committed fallback snapshot in dev mode since `fetch-github.mjs` only runs as part of the Docker build.

## How GitHub Data Works

At Docker build time, `scripts/fetch-github.mjs` calls the GitHub API and writes the result to `src/data/github-repos.json`, which Vite bundles into the static output. If the API call fails, a hardcoded fallback snapshot is used so the build always succeeds.

See [ADR 002](./decisions/002-github-data-strategy.md) for full rationale.

## Roadmap — Phase 2

Phase 2 adds a Node.js/Express backend and PostgreSQL for a working contact form and live GitHub data proxy. Only three files change from Phase 1 — see [ADR 004](./decisions/004-phased-backend-design.md) for the full plan.

## Architecture Decisions

See the [`decisions/`](./decisions/) directory for all ADRs.
