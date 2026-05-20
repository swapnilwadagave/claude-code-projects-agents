# Claude Code Projects & Agents

A workspace for Claude Code agent and automation projects — each sub-directory is a self-contained project.

## Projects

| Project | Stack | Description |
|---------|-------|-------------|
| [`portfolio/`](./portfolio/) | React + Vite, nginx, Docker Compose, ngrok | Personal developer portfolio served as a static site via Docker with a public ngrok tunnel |

## Directory Structure

```
claude-code-projects-agents/
├── .claude/                  # Claude Code configuration
│   ├── agents/               # Custom sub-agent definitions
│   ├── hooks/                # Lifecycle hook scripts
│   └── settings.json         # Project-level Claude settings
├── .mcp.json                 # MCP server definitions (GitHub)
├── CLAUDE.md                 # Claude Code workspace instructions
├── portfolio/                # Portfolio web app project
└── README.md                 # This file
```

## Running a Project

Each project has its own `README.md` with setup instructions. Navigate into the project directory and follow its guide.

```bash
cd portfolio
# see portfolio/README.md for full setup
docker compose up --build
```

## Planned Projects

The following projects are tracked in [issue #1](https://github.com/swapnilwadagave/claude-code-projects-agents/issues/1) and will be added over time:

- `github-agent/` — auto-triage GitHub issues using the GitHub MCP server
- `daily-standup-bot/` — generate daily standups from GitHub activity
- `code-review-agent/` — autonomous PR reviewer extending the existing sub-agent
- `cli-tool-starter/` — minimal Claude-powered Node.js CLI scaffold
- `mcp-server-starter/` — custom MCP server boilerplate in Node.js

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Claude Code](https://claude.ai/code) (optional, for AI-assisted development)
- Node.js 20+ (for projects that run outside Docker)
