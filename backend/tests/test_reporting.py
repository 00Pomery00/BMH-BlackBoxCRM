from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_companies_csv_export():
    r = client.get("/reports/companies.csv")
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("text/csv")
    text = r.text
    assert "id" in text and "name" in text


def test_companies_json_export():
    r = client.get("/reports/companies.json")
    assert r.status_code == 200
    data = r.json()
    assert "companies" in data
    assert isinstance(data["companies"], list)
