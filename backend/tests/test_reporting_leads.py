from fastapi.testclient import TestClient

from app import crud, models
from app.main import app

client = TestClient(app)


def test_leads_export_filters():
    # create some companies
    # NOTE: test DB is the same test.db used by the app
    from app.main import SessionLocal

    db = SessionLocal()
    # cleanup companies table for predictable test
    db.query(models.Contact).delete()
    db.query(models.Company).delete()
    db.commit()

    crud.create_company(db, "Alpha Co", "desc", lead_score=10)
    crud.create_company(db, "Beta Ltd", "desc", lead_score=3)
    crud.create_company(db, "Gamma Inc", "desc", lead_score=7)

    # CSV all
    r = client.get("/reports/leads.csv")
    assert r.status_code == 200
    txt = r.text
    assert "Alpha Co" in txt and "Beta Ltd" in txt

    # JSON filter min_score
    r2 = client.get("/reports/leads.json", params={"min_score": 6})
    assert r2.status_code == 200
    data = r2.json()
    names = [lead["name"] for lead in data.get("leads", [])]
    assert "Alpha Co" in names and "Gamma Inc" in names and "Beta Ltd" not in names

    # name contains
    r3 = client.get("/reports/leads.json", params={"name": "Beta"})
    data3 = r3.json()
    assert len(data3.get("leads", [])) == 1

    # cleanup
    db.query(models.Contact).delete()
    db.query(models.Company).delete()
    db.commit()
    db.close()
