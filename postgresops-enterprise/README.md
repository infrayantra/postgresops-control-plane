# PostgresOps Control Plane

Enterprise PostgreSQL operations, automation, monitoring, AI-assisted diagnostics, HA management, and fleet control. This repository is the **control plane monorepo**: FastAPI backend, React console, edge agents, packaging, and documentation.

## Status

**Phase 1 (this drop):** monorepo layout, architecture, working **PostgresOps Control Plane** API (health + cluster inventory CRUD), **Alembic** migrations, **Docker Compose** (unified **nginx + UI + API** image, Redis, control Postgres), **React/TypeScript** console, **telemetry agent** skeleton, **Helm** chart stub, and operational docs.

Later phases extend: full monitoring pipeline, Celery workers, AI advisory service, Patroni/replication orchestration, backup runners, multi-tenant auth (JWT/OAuth2/LDAP/SAML), and air-gapped bundles.

## Repository layout

| Path | Purpose |
|------|---------|
| `backend/` | FastAPI control plane, SQLAlchemy 2 async, domain modules |
| `frontend/` | React 18 + TypeScript + Vite + Tailwind + TanStack Query |
| `agents/` | Lightweight `pgops-agent` for secure telemetry push |
| `docker/` | Container images and compose stacks |
| `helm/` | Kubernetes Helm chart(s) |
| `kubernetes/` | Raw manifests for environments without Helm |
| `docs/` | Architecture, runbooks, air-gap notes |
| `scripts/` | Dev and installer helpers |
| `plugins/` | Extension hooks (interface contracts) |
| `sdk/` | Generated / hand-written API clients |
| `terraform/` | Cloud IaC stubs |
| `ansible/` | RHEL-style automation stubs |
| `tests/` | Pytest, API, future Playwright |
| `examples/` | Environment templates |

## Docker Hub (ship / pull)

- Full checklist: [`docs/DOCKER_HUB.md`](docs/DOCKER_HUB.md) (`docker pull`, `make hub-up`, manual `docker-build` / `docker-push`, and **how to update the Hub overview**).
- **Public image:** `infrayantra/postgresops-control-plane` — overview copy lives in [`docker/DOCKERHUB_OVERVIEW.md`](docker/DOCKERHUB_OVERVIEW.md) (paste into Docker Hub’s repository description).

## Quick start — integrated backend (Docker, recommended)

One container (**`control-plane`**) runs **nginx + React build + FastAPI**; Postgres and Redis are separate services.

1. Copy `examples/env.example` to `postgresops-enterprise/.env` and adjust secrets.
2. From `postgresops-enterprise/`:

```bash
make dev-up
```

(or: `docker compose -f docker/docker-compose.yml up --build -d`)

3. **Single URL for everything:** [http://localhost:8080](http://localhost:8080) — nginx serves the UI and proxies **`/api/*`**, **`/docs`**, **`/redoc`**, **`/openapi.json`**, and **`/metrics`** to FastAPI on loopback inside the same image.

4. **Swagger:** [http://localhost:8080/docs](http://localhost:8080/docs)

Supporting services: **control-db** (catalog Postgres) and **redis**. Published ports by default: **8080** (UI+API), **55432** (Postgres), **56379** (Redis).

Rebuild the unified image after UI/API code changes:

```bash
make rebuild
```

## Local dev — integrated backend (Vite + API on your machine)

Use this when you want **hot-reload UI** with the **same integrated routing** as production (Vite proxies API, Swagger, and metrics to port **8000**).

1. **Dependencies in Docker** (catalog DB + Redis only):

   ```bash
   make dev-deps
   ```

2. **Python API** (once): from `backend/`, create a venv, `pip install -e ".[dev]"`, and ensure `.env` at `postgresops-enterprise/.env` has `POSTGRESOPS_DATABASE_URL` pointing at `localhost:55432` (see `examples/env.example`).

3. **Install orchestrator + start both processes** from `postgresops-enterprise/`:

   ```bash
   npm install
   npm run dev
   ```

   This runs **uvicorn** (reload) and **Vite** together. Open **[http://localhost:5173](http://localhost:5173)** — the browser talks only to Vite; **`/api`**, **`/docs`**, **`/redoc`**, **`/openapi.json`**, and **`/metrics`** are proxied to **http://127.0.0.1:8000** (same integration model as the Docker image, split across two local ports).

Shortcut: `make dev-integrated` starts **control-db** + **redis** and prints the same URLs.

## Product naming

- **Product:** PostgresOps Control Plane (console + API)  
- **Python package:** `postgresops`  
- **CLI (future):** `pgopsctl`  

## License

Proprietary / assign as needed by your organization.
