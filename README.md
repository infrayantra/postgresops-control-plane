# PostgresOps Control Plane (workspace root)

This repository root holds **PostgresOps Control Plane** — an API-first control plane for PostgreSQL fleet operations, monitoring, and automation (phased implementation).

**Public source:** [github.com/infrayantra/postgresops-control-plane](https://github.com/infrayantra/postgresops-control-plane)

## Where everything lives

All active code, Docker, frontend, agents, and documentation are under:

**[`postgresops-enterprise/`](postgresops-enterprise/README.md)**

### Quick start (Docker — UI + API integrated in one container)

From `postgresops-enterprise/`:

```bash
docker compose -f docker/docker-compose.yml up --build -d
```

- **Web console, REST API, Swagger, metrics:** http://localhost:8080 (nginx serves the UI and proxies `/api`, `/docs`, `/redoc`, `/metrics` to FastAPI in the same **`control-plane`** container)  
- **Catalog Postgres (optional host access):** localhost:55432  

### Local dev with integrated backend (hot reload)

From `postgresops-enterprise/`: start Postgres + Redis with Compose, then `npm install` and `npm run dev` (runs API + Vite; Vite proxies the same paths as production). Details in the enterprise README.

See [`postgresops-enterprise/README.md`](postgresops-enterprise/README.md) for full workflows.

**Public image (Docker Hub):** `infrayantra/postgresops-control-plane` — `docker pull infrayantra/postgresops-control-plane:latest` and run steps in [`postgresops-enterprise/docs/DOCKER_HUB.md`](postgresops-enterprise/docs/DOCKER_HUB.md).

**Release notes:** [`CHANGELOG.md`](CHANGELOG.md) (e.g. **v0.1.0** — 2026-05-14).

---

*Earlier coursework materials (Flask demo app, screenshots, phase docs) were removed from this root to reduce clutter; restore from version control if you still need them.*
