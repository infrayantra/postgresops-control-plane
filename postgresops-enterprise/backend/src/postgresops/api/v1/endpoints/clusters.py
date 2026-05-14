from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, status
from starlette.responses import Response

from postgresops.api.deps import DbSession
from postgresops.schemas.cluster import (
    ClusterCreate,
    ClusterProbeResult,
    ClusterRead,
    ClusterUpdate,
)
from postgresops.services.cluster_service import ClusterService
from postgresops.services.exceptions import ClusterNameConflict
from postgresops.util.probe import tcp_probe

router = APIRouter(prefix="/clusters", tags=["Fleet"])


@router.get("", response_model=list[ClusterRead])
async def list_clusters(session: DbSession) -> list[ClusterRead]:
    svc = ClusterService(session)
    return list(await svc.list_clusters())


@router.post("", response_model=ClusterRead, status_code=201)
async def register_cluster(payload: ClusterCreate, session: DbSession) -> ClusterRead:
    svc = ClusterService(session)
    try:
        return await svc.create_cluster(payload)
    except ClusterNameConflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A cluster with this name already exists",
        ) from None


@router.get("/{cluster_id}", response_model=ClusterRead)
async def get_cluster(cluster_id: uuid.UUID, session: DbSession) -> ClusterRead:
    svc = ClusterService(session)
    row = await svc.get_cluster(cluster_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster not found")
    return row


@router.patch("/{cluster_id}", response_model=ClusterRead)
async def patch_cluster(
    cluster_id: uuid.UUID, payload: ClusterUpdate, session: DbSession
) -> ClusterRead:
    svc = ClusterService(session)
    try:
        updated = await svc.update_cluster(cluster_id, payload)
    except ClusterNameConflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A cluster with this name already exists",
        ) from None
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster not found")
    return updated


@router.delete("/{cluster_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_cluster(cluster_id: uuid.UUID, session: DbSession) -> Response:
    svc = ClusterService(session)
    ok = await svc.delete_cluster(cluster_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{cluster_id}/probe", response_model=ClusterProbeResult)
async def probe_cluster(cluster_id: uuid.UUID, session: DbSession) -> ClusterProbeResult:
    svc = ClusterService(session)
    row = await svc.get_cluster(cluster_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster not found")
    ok, latency_ms, err = await tcp_probe(row.host, row.port)
    return ClusterProbeResult(
        cluster_id=row.id,
        host=row.host,
        port=row.port,
        ok=ok,
        latency_ms=latency_ms,
        error=err,
    )
