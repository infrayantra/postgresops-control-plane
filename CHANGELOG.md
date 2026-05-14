# Changelog

All notable changes to **PostgresOps Control Plane** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) where applicable.

## [Unreleased]

### Planned (later phases)

- Broader monitoring pipeline, Celery workers, AI advisory flows  
- Patroni / replication orchestration, backup runners  
- Richer multi-tenant auth (OAuth2 / LDAP / SAML) and air-gapped bundles  

---

## [0.1.0] — 2026-05-14

First public **Phase 1** drop: monorepo, runnable API + UI, Docker packaging, and operational docs.

### Added

**Backend (`postgresops/`, FastAPI)**

- Async SQLAlchemy 2 control-plane API with structured logging and Prometheus metrics  
- **Health** and **readiness** endpoints for orchestration  
- **Cluster registry** CRUD (`/api/v1/clusters`) and related schemas/services  
- **Meta** endpoint for build/version context  
- **Alembic** migrations (initial cluster registry schema)  
- Pytest coverage for core API surface  

**Frontend (React 18 + TypeScript + Vite + Tailwind)**

- Operations console shell: dashboard, fleet, metrics-oriented pages  
- TanStack Query integration and shared API client types  
- Vite dev server proxying `/api`, `/docs`, `/redoc`, `/openapi.json`, `/metrics` to the API for integrated local dev  

**Containers and runtime**

- **Unified image** (`docker/Dockerfile.unified`): nginx + static UI + Uvicorn behind supervisor  
- **Compose** stacks: local dev (`docker-compose.yml`) and **Docker Hub pull** stack with Postgres 17 + Redis (`docker-compose.hub.yml`, `env.hub.example`)  
- **Public image** on Docker Hub: [`infrayantra/postgresops-control-plane`](https://hub.docker.com/r/infrayantra/postgresops-control-plane) (`latest`, semver tags)  
- Makefile targets: `dev-up`, `hub-up`, `docker-build`, `docker-push`, `dev-integrated`, `dev-deps`, etc.  

**Agents and packaging stubs**

- Lightweight **`pgops-agent`** package layout for future telemetry push  
- Helm chart stub, Kubernetes and Terraform README placeholders, plugin/SDK doc stubs  

**Documentation**

- Architecture and runbook material under `postgresops-enterprise/docs/`  
- **Docker Hub** guide: pull/run, manual publish, Hub overview copy (`DOCKERHUB_OVERVIEW.md`)  
- Environment templates under `examples/`  

**Repository**

- Public GitHub: [infrayantra/postgresops-control-plane](https://github.com/infrayantra/postgresops-control-plane)  
- Root `.gitignore` for secrets, caches, and local env files  

### Notes

- Default Compose credentials are **lab-only**; change passwords, TLS, and network exposure before production (see `postgresops-enterprise/docs/RUNBOOK.md`).  
- GitHub Actions workflows were removed in favor of **manual** image build/push (`make docker-push`) and Hub publishing you control locally.  

### References

| Artifact | Location |
|----------|----------|
| Source | https://github.com/infrayantra/postgresops-control-plane |
| Docker image | `docker pull infrayantra/postgresops-control-plane:0.1.0` (or `:latest`) |
| Version (backend) | `postgresops-enterprise/backend/pyproject.toml` → `0.1.0` |
| Version (UI) | `postgresops-enterprise/frontend/package.json` → `0.1.0` |
| Image tag default (Makefile) | `VERSION=0.1.0` |

---

When tagging a GitHub release, use tag **`v0.1.0`** and paste the **0.1.0** section above (from the heading through the table) as the release description, or link to this file.
