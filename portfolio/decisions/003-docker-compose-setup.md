# ADR 003: Docker Setup — Compose with nginx + ngrok Services

**Date:** 2026-05-19  
**Status:** Accepted

## Decision
Use Docker Compose to orchestrate two services:
1. `frontend` — multi-stage image: node builds the React app, nginx serves `dist/`
2. `ngrok` — official `ngrok/ngrok` image, tunnels port 80 of the `frontend` service

## Alternatives considered
- **Run ngrok separately (outside Docker)** — more flexible but requires the user to remember to start two processes. Compose gives a single `docker compose up --build` workflow.
- **Single container (nginx + ngrok in one image)** — violates one-process-per-container best practice; harder to upgrade either component independently.

## Rationale
- One command (`docker compose up --build`) brings the entire stack up.
- `ngrok/ngrok` official image is maintained and accepts `NGROK_AUTHTOKEN` from an `.env` file — no custom wrapper needed.
- nginx serves on internal port 80; ngrok is the only service with an external tunnel, keeping the attack surface minimal.
- The `frontend` service name is used as the ngrok upstream hostname (`http://frontend:80`) via Docker's internal DNS.

## ngrok config
```yaml
ngrok:
  image: ngrok/ngrok:latest
  environment:
    - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}
  command: http frontend:80
  depends_on:
    - frontend
  ports:
    - "4040:4040"  # ngrok web inspector UI
```
Port 4040 is the ngrok inspector — visit `http://localhost:4040` to see the public URL.
