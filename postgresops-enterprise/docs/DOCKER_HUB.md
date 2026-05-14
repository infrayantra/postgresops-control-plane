# Docker Hub: PostgresOps Control Plane

The **public** image is **`infrayantra/postgresops-control-plane`** — one container with the React console, nginx, and the FastAPI control plane (see `docker/Dockerfile.unified`).

- **Hub:** [https://hub.docker.com/r/infrayantra/postgresops-control-plane](https://hub.docker.com/r/infrayantra/postgresops-control-plane)

---

## Docker Hub page (overview & short description)

Docker Hub does **not** read the Git repository for the long-form overview unless you configure a separate integration. To update what visitors see on [the image page](https://hub.docker.com/r/infrayantra/postgresops-control-plane):

1. Sign in to Docker Hub → **Repositories** → **infrayantra/postgresops-control-plane** → **Edit** (or **Manage repository**).
2. **Short description** (Docker Hub one-line summary, ~100 characters):

   `Unified PostgresOps Control Plane: React UI, FastAPI, nginx — run with Postgres + Redis (see Overview).`

   (Same line is documented in [`docker/DOCKERHUB_OVERVIEW.md`](../docker/DOCKERHUB_OVERVIEW.md) for convenience.)
3. **Full description / Overview:** open [`docker/DOCKERHUB_OVERVIEW.md`](../docker/DOCKERHUB_OVERVIEW.md) and paste **only** the Markdown **between** `<!-- BEGIN_DOCKERHUB_PASTE -->` and `<!-- END_DOCKERHUB_PASTE -->`**—exclude** those marker lines themselves.

Keep the Hub text in sync whenever you change supported tags, ports, or required environment variables.

---

## Anyone: pull and run locally

You need Docker (and Compose v2). This stack pulls the **control plane** image plus local **Postgres** and **Redis** for the catalog.

```bash
git clone <repository-url>
cd postgresops-enterprise
cp docker/env.hub.example docker/.env.hub
# Default DOCKERHUB_IMAGE=infrayantra/postgresops-control-plane:latest is already set in the example
make hub-up
```

Open [http://localhost:8080](http://localhost:8080) (UI + API) and [http://localhost:8080/docs](http://localhost:8080/docs) (Swagger).

Or without Make:

```bash
docker compose -f docker/docker-compose.hub.yml --env-file docker/.env.hub up -d --pull always
```

**Lab defaults:** Compose uses `postgres/postgres` on the bundled Postgres service — change passwords and exposure before any real deployment (see `docs/RUNBOOK.md`).

---

## Maintainers: first-time Hub repository

1. Sign in at [https://hub.docker.com](https://hub.docker.com).
2. **Repositories → Create repository**.
3. Name: **`postgresops-control-plane`** under user **`infrayantra`** (image reference: `infrayantra/postgresops-control-plane`).
4. Visibility: **Public**.
5. Paste the overview from [`docker/DOCKERHUB_OVERVIEW.md`](../docker/DOCKERHUB_OVERVIEW.md) as described above.

---

## Maintainers: build and push (manual)

Publishing is **manual** (no GitHub Actions in this repo): from `postgresops-enterprise/` after `docker login -u infrayantra`:

```bash
make docker-build
make docker-push
```

Overrides: `DOCKERHUB_NS=...` `IMAGE_NAME=...` `VERSION=...` (defaults: `infrayantra`, `postgresops-control-plane`, `0.1.0`).

---

## Production notes

- Pin an **immutable tag** (semver) instead of only `latest` when you care about reproducibility.
- Replace Google Fonts in `frontend/index.html` with self-hosted assets for strict air-gapped builds (see `docs/RUNBOOK.md`).
