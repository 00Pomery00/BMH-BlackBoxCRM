import os

from app.main import app
from fastapi.testclient import TestClient

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
    assert any('"event": "request"' in line for line in lines)
    assert any('"event": "response"' in line for line in lines)
