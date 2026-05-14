from __future__ import annotations

from fastapi import APIRouter

from postgresops import __version__
from postgresops.core.config import settings

router = APIRouter(prefix="/meta", tags=["Meta"])


@router.get("")
async def meta() -> dict[str, str]:
    return {
        "service": "postgresops-control-plane",
        "version": __version__,
        "build_id": settings.build_id,
        "env": settings.env,
    }
