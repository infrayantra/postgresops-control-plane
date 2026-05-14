# PostgresOps Enterprise — Control Plane API

FastAPI application: cluster registry, health, future modules (monitoring, AI, automation).

## Local development

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -e ".[dev]"
set POSTGRESOPS_DATABASE_URL=postgresql+asyncpg://postgres:postgres@127.0.0.1:55432/postgresops
set POSTGRESOPS_DATABASE_URL_SYNC=postgresql+psycopg://postgres:postgres@127.0.0.1:55432/postgresops
alembic upgrade head
uvicorn postgresops.main:app --reload --host 0.0.0.0 --port 8000
```

OpenAPI: `http://127.0.0.1:8000/docs`

## Layout

- `src/postgresops/core/` — configuration, logging
- `src/postgresops/db/` — async engine, session
- `src/postgresops/models/` — SQLAlchemy ORM
- `src/postgresops/schemas/` — Pydantic DTOs
- `src/postgresops/services/` — domain services
- `src/postgresops/api/v1/` — HTTP routers
- `src/postgresops/modules/*/` — vertical slices (monitoring, AI, …)
