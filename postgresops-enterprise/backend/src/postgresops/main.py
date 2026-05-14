from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from postgresops import __version__
from postgresops.api.errors import register_exception_handlers
from postgresops.api.middleware.request_context import RequestContextMiddleware
from postgresops.api.v1.router import api_router
from postgresops.core.config import settings
from postgresops.core.logging import configure_logging, get_logger

log = get_logger("postgresops.main")


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    log.info("startup", env=settings.env, build_id=settings.build_id)
    yield
    log.info("shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title="PostgresOps Control Plane",
        version=__version__,
        description="Fleet catalog, health, metrics, and automation APIs (phased rollout).",
        lifespan=lifespan,
    )
    register_exception_handlers(app)
    app.include_router(api_router, prefix="/api/v1")

    _wildcard_cors = settings.cors_origin_list == ["*"]
    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=not _wildcard_cors,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=True,
        excluded_handlers=["/metrics"],
    ).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

    @app.get("/")
    async def root() -> dict[str, str]:
        return {
            "service": "postgresops-control-plane",
            "version": __version__,
            "docs": "/docs",
        }

    return app


app = create_app()
