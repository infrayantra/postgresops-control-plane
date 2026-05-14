from __future__ import annotations

import uuid
from typing import Any

import structlog
from fastapi import Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

log = structlog.get_logger(__name__)


def _rid(request: Request) -> str:
    return getattr(request.state, "request_id", str(uuid.uuid4()))


def register_exception_handlers(app):  # type: ignore[no-untyped-def]
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        body: dict[str, Any] = {
            "error": {
                "code": "http_error",
                "message": str(exc.detail),
                "request_id": _rid(request),
            }
        }
        return JSONResponse(status_code=exc.status_code, content=body)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        body = {
            "error": {
                "code": "validation_error",
                "message": "Request validation failed",
                "fields": jsonable_encoder(exc.errors()),
                "request_id": _rid(request),
            }
        }
        return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=body)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        log.error(
            "unhandled_error",
            path=str(request.url.path),
            request_id=_rid(request),
            exc_info=exc,
        )
        body = {
            "error": {
                "code": "internal_error",
                "message": "An unexpected error occurred",
                "request_id": _rid(request),
            }
        }
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=body,
        )

    return app
