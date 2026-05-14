from __future__ import annotations

import asyncio
import time


async def tcp_probe(
    host: str, port: int, *, timeout_s: float = 3.0
) -> tuple[bool, float | None, str | None]:
    """Attempt a TCP connection to ``host:port``.

    Returns ``(ok, latency_ms, error)``. Does not perform TLS or PostgreSQL protocol.
    """
    start = time.perf_counter()
    try:
        _reader, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port),
            timeout=timeout_s,
        )
        writer.close()
        try:
            await writer.wait_closed()
        except Exception:
            pass
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return True, latency_ms, None
    except TimeoutError:
        return False, None, "timeout"
    except OSError as e:
        return False, None, str(e)
