from __future__ import annotations

from fastapi.testclient import TestClient

from postgresops.main import app

client = TestClient(app)


def test_live_health() -> None:
    r = client.get("/api/v1/health/live")
    assert r.status_code == 200
    assert r.json()["status"] == "live"


def test_meta() -> None:
    r = client.get("/api/v1/meta")
    assert r.status_code == 200
    data = r.json()
    assert data["service"] == "postgresops-control-plane"
    assert "version" in data
    assert "build_id" in data
    assert "env" in data


def test_metrics_exposed() -> None:
    r = client.get("/metrics")
    assert r.status_code == 200
    body = r.text
    assert "# HELP" in body or "http_requests" in body


def test_request_id_headers() -> None:
    r = client.get("/api/v1/health/live", headers={"X-Request-ID": "custom-req-id"})
    assert r.status_code == 200
    assert r.headers.get("X-Request-ID") == "custom-req-id"
    assert "X-Response-Time-Ms" in r.headers


def test_validation_error_shape() -> None:
    r = client.get("/api/v1/clusters/not-a-uuid")
    assert r.status_code == 422
    body = r.json()
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["request_id"]
