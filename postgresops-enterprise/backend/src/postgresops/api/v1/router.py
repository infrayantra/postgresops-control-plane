from __future__ import annotations

from fastapi import APIRouter

from postgresops.api.v1.endpoints import clusters, health, meta

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(meta.router)
api_router.include_router(clusters.router)
