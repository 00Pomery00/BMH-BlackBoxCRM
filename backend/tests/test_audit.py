import os
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def read_audit_lines():
    p = os.path.join(os.getcwd(), "bmh_audit.log")
    if not os.path.exists(p):
        return []
    with open(p, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]


def test_audit_logs_request_and_response(tmp_path, monkeypatch):
    # Ensure logs write to workspace path - audit uses rotating file in cwd
    # Make a request
    r = client.get("/health")
    assert r.status_code == 200

    lines = read_audit_lines()
    # Expect at least two JSON lines (request and response)
    assert any('"event": "request"' in l for l in lines)
    assert any('"event": "response"' in l for l in lines)
