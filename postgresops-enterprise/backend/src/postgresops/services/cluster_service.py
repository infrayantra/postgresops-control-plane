from __future__ import annotations

import uuid
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from postgresops.models.cluster import Cluster
from postgresops.schemas.cluster import ClusterCreate, ClusterRead, ClusterUpdate
from postgresops.services.exceptions import ClusterNameConflict


class ClusterService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def _get_row(self, cluster_id: uuid.UUID) -> Cluster | None:
        result = await self._session.execute(select(Cluster).where(Cluster.id == cluster_id))
        return result.scalar_one_or_none()

    async def list_clusters(self) -> Sequence[ClusterRead]:
        result = await self._session.execute(select(Cluster).order_by(Cluster.name))
        rows = result.scalars().all()
        return [ClusterRead.model_validate(r) for r in rows]

    async def get_cluster(self, cluster_id: uuid.UUID) -> ClusterRead | None:
        row = await self._get_row(cluster_id)
        return ClusterRead.model_validate(row) if row else None

    async def create_cluster(self, payload: ClusterCreate) -> ClusterRead:
        row = Cluster(
            name=payload.name,
            environment=payload.environment,
            host=payload.host,
            port=payload.port,
            database=payload.database,
            ssl_mode=payload.ssl_mode,
            tags=payload.tags,
            agent_id=payload.agent_id,
        )
        self._session.add(row)
        try:
            await self._session.commit()
        except IntegrityError as e:
            await self._session.rollback()
            raise ClusterNameConflict from e
        await self._session.refresh(row)
        return ClusterRead.model_validate(row)

    async def update_cluster(
        self, cluster_id: uuid.UUID, payload: ClusterUpdate
    ) -> ClusterRead | None:
        row = await self._get_row(cluster_id)
        if row is None:
            return None
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(row, key, value)
        try:
            await self._session.commit()
        except IntegrityError as e:
            await self._session.rollback()
            raise ClusterNameConflict from e
        await self._session.refresh(row)
        return ClusterRead.model_validate(row)

    async def delete_cluster(self, cluster_id: uuid.UUID) -> bool:
        row = await self._get_row(cluster_id)
        if row is None:
            return False
        self._session.delete(row)
        await self._session.commit()
        return True
