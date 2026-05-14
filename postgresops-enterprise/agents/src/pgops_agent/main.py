"""pgops-agent — edge collector (Phase 1 stub).

Future: mTLS registration, metric batches, WAL/replication probes, command channel.
"""

from __future__ import annotations

import asyncio
import os

import httpx


async def probe_control_plane() -> None:
    base = os.environ.get("POSTGRESOPS_CONTROL_PLANE_URL", "http://127.0.0.1:8000").rstrip("/")
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(f"{base}/api/v1/health/live")
        r.raise_for_status()
        print("control_plane_ok", r.json())


def main() -> None:
    asyncio.run(probe_control_plane())


if __name__ == "__main__":
    main()
