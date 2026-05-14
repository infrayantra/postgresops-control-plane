from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ClusterBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    environment: str = Field(default="production", max_length=64)
    host: str = Field(..., max_length=255)
    port: int = Field(default=5432, ge=1, le=65535)
    database: str = Field(default="postgres", max_length=128)
    ssl_mode: str = Field(default="prefer", max_length=32)
    tags: dict[str, Any] = Field(default_factory=dict)
    agent_id: str | None = Field(default=None, max_length=64)


class ClusterCreate(ClusterBase):
    pass


class ClusterUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=128)
    environment: str | None = Field(default=None, max_length=64)
    host: str | None = Field(default=None, max_length=255)
    port: int | None = Field(default=None, ge=1, le=65535)
    database: str | None = Field(default=None, max_length=128)
    ssl_mode: str | None = Field(default=None, max_length=32)
    tags: dict[str, Any] | None = None
    agent_id: str | None = Field(default=None, max_length=64)


class ClusterRead(ClusterBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ClusterProbeResult(BaseModel):
    cluster_id: uuid.UUID
    host: str
    port: int
    ok: bool
    latency_ms: float | None = None
    error: str | None = None
