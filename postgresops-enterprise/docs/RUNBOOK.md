# Operational runbook (Phase 1)

## Services (Docker Compose)

- **control-db:** PostgreSQL 17 catalog (`postgresops` database).
- **redis:** message bus placeholder for Celery / streaming.
- **control-plane:** single container running **supervisord** → **uvicorn** (FastAPI on `127.0.0.1:8000`) + **nginx** on port 80 (published as **8080** on the host). Migrations run on container start.

## Common tasks

### Apply migrations locally

```bash
cd backend
alembic upgrade head
```

### Register a cluster (example)

Use the same host port as the UI (unified gateway). Example for Windows PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/clusters" `
  -ContentType "application/json" `
  -Body '{"name":"lab-1","environment":"staging","host":"127.0.0.1","port":5432,"database":"postgres","ssl_mode":"prefer","tags":{"region":"local"}}'
```

### Air-gapped notes

- Mirror container images and Python wheels into the enclave.
- Replace public font CDNs in `frontend/index.html` with self-hosted assets before building the console bundle.
- Ship `docker/` compose overrides that point to internal registries and private S3-compatible object stores.
