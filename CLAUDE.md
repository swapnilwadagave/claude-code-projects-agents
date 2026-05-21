# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a workspace for Claude Code agent and automation projects. Each sub-directory is a self-contained project.

## Projects

### `portfolio/`
React + Vite static portfolio served via nginx + ngrok Docker Compose stack.

- **Start:** `docker compose up --build` (from `portfolio/`)
- **Dev:** `cd portfolio/frontend && npm install && npm run dev`
- **Config:** Copy `portfolio/.env.example` → `portfolio/.env` and fill in `NGROK_AUTHTOKEN` and optionally `GITHUB_TOKEN`
- **Secrets:** `portfolio/.env` and `.claude/settings.local.json` are git-ignored — never commit them
- **ADRs:** `portfolio/decisions/` — see `portfolio/decisions/README.md` for the index

### `url-shortener/`
Full-stack URL shortener — Node/Express backend + React dashboard + PostgreSQL, all via Docker Compose.

- **Start:** `docker compose up --build` (from `url-shortener/`)
- **Dev backend:** `cd url-shortener/backend && npm install && npx prisma migrate dev && npm run dev`
- **Dev frontend:** `cd url-shortener/frontend && npm install && npm run dev`
- **Config:** Copy `url-shortener/.env.example` → `url-shortener/.env`; fill in `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- **Secrets:** `url-shortener/.env` is git-ignored — never commit it
- **ADRs:** `url-shortener/decisions/` — see `url-shortener/decisions/README.md` for the index

## Notes

- Update this file with build commands, architecture notes, and dev workflows as new projects are added.
- Always add `.env` to `.gitignore` before the first commit in any new project.
- MCP servers are configured in `.mcp.json`; secrets for them live in `.claude/settings.local.json` (git-ignored).
