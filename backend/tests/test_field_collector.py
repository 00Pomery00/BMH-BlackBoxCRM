from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_mobile_status():
    r = client.get("/mobile/status")
    assert r.status_code == 200
    assert r.json().get("status") == "ready"


def test_mobile_add_and_sync():
    lead = {"name": "SyncCo", "email": "a@syncco.com", "lead_score": 0.4}
    r = client.post("/mobile/leads", json=lead)
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert "lead_id" in data

    batch = {
        "leads": [lead, {"name": "SyncCo", "email": "a@syncco.com", "lead_score": 0.9}]
    }
    r2 = client.post("/mobile/sync", json=batch)
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2.get("synced") == 2
