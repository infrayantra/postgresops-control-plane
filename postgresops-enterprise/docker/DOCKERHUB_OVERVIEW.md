<!--
  Maintainer: Docker Hub does not read this file automatically.
  1) Open https://hub.docker.com/r/infrayantra/postgresops-control-plane → Edit repository
  2) Set "Short description" (one line, ~100 chars) to the SHORT_DESCRIPTION line below.
  3) In "Full description" / Overview, paste ONLY the markdown between
     BEGIN_DOCKERHUB_PASTE and END_DOCKERHUB_PASTE (those lines themselves are omitted).

  SHORT_DESCRIPTION (copy into Hub "short description" field):
  Unified PostgresOps Control Plane: React UI, FastAPI, nginx — run with Postgres + Redis (see Overview).
-->

<!-- BEGIN_DOCKERHUB_PASTE -->

## PostgresOps Control Plane

**PostgresOps** is an API-first control plane for PostgreSQL fleet operations. This image ships a **single production-style container**: **nginx** serves the **React** console and proxies **`/api`**, **`/docs`**, **`/redoc`**, **`/openapi.json`**, and **`/metrics`** to **FastAPI** (Uvicorn) on the same host.

Use it when you want the web UI and REST API together without building Node or Python on your machines—pull, wire catalog **Postgres** + **Redis**, and go.

### What is inside the image

| Layer | Role |
|-------|------|
| **nginx** | Static UI + reverse proxy to the API |
| **FastAPI** | Control plane REST API, OpenAPI docs, health endpoints |
| **React (built)** | Operations console (Vite production build) |

The image does **not** bundle a PostgreSQL server for your fleet data. For the **recommended** local/lab stack, run this image next to **Postgres 17** (catalog DB) and **Redis**. A reference stack is **`docker-compose.hub.yml`** in the PostgresOps Control Plane source tree (`postgresops-enterprise/docker/`), alongside **`env.hub.example`** for `DOCKERHUB_IMAGE`.

### Tags

- **`latest`** — current stable pointer (pin a version tag for reproducible deploys).
- **`0.1.0`** (and future **`x.y.z`**) — semver tags you can pin in production.

### Quick start (Docker Compose)

From a checkout of the project, in `postgresops-enterprise/`:

```bash
cp docker/env.hub.example docker/.env.hub
# DOCKERHUB_IMAGE defaults to infrayantra/postgresops-control-plane:latest
docker compose -f docker/docker-compose.hub.yml --env-file docker/.env.hub up -d --pull always
```

Then open **http://localhost:8080** (UI + API) and **http://localhost:8080/docs** (Swagger).

### Pull only

```bash
docker pull infrayantra/postgresops-control-plane:latest
```

You still need **Postgres** and **Redis** reachable from the container, plus env vars (see below). Raw `docker run` is possible but Compose is the supported path for a full stack.

### Required environment (typical)

| Variable | Purpose |
|----------|---------|
| `POSTGRESOPS_DATABASE_URL` | Async SQLAlchemy URL, e.g. `postgresql+asyncpg://user:pass@host:5432/postgresops` |
| `POSTGRESOPS_REDIS_URL` | Redis for sessions/cache, e.g. `redis://host:6379/0` |
| `POSTGRESOPS_JWT_SECRET` | Strong secret for signing JWTs (set in real deployments) |
| `POSTGRESOPS_CORS_ORIGINS` | Browser origins allowed for CORS (e.g. `http://localhost:8080`) |

Optional: `POSTGRESOPS_ENV`, `POSTGRESOPS_BUILD_ID`, `POSTGRESOPS_LOG_JSON`, OpenTelemetry endpoints—see project `examples/env.example`.

### Ports

- Container listens on **port 80** (HTTP). Example Compose maps **`8080:80`** on the host.

### Security and scope

- Treat **`latest`** as a moving target; use **semver tags** when you need repeatable rollouts.
- Default Compose examples often use **lab passwords**; change credentials, network exposure, and TLS before production.
- This is a **control plane** image: it manages metadata and APIs—it is not a replacement for hardened database images or network policies.

### License and support

Software license and support channels follow the **upstream project** that publishes this image. For build recipes and runbooks, use the repository that contains `docker/Dockerfile.unified`.

**Maintainer:** [infrayantra](https://hub.docker.com/u/infrayantra) on Docker Hub.

<!-- END_DOCKERHUB_PASTE -->
