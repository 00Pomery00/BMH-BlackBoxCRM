from fastapi.testclient import TestClient

from app import integrations, models
from backend.app.main import app

client = TestClient(app)


def test_admin_webhook_dlq_and_requeue():
    from backend.app.main import SessionLocal

    db = SessionLocal()
    # cleanup
    db.query(models.WebhookQueue).delete()
    db.commit()

    # enqueue and mark as dead manually
    w = integrations.enqueue_webhook(db, "http://example.invalid", {"x": 1})
    # simulate dead
    row = db.query(models.WebhookQueue).filter(models.WebhookQueue.id == w.id).first()
    row.attempts = 5
    row.dead = 1
    db.add(row)
    db.commit()

    # admin token
    from app import security

    admin_token = security.create_access_token(
        {"sub": "adminuser", "uid": 1, "role": "admin"}
    )

    r = client.get(
        "/admin/webhooks", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert r.status_code == 200
    data = r.json()
    assert any(wd["id"] == w.id for wd in data.get("webhooks", []))

    # requeue
    r2 = client.post(
        f"/admin/webhooks/{w.id}/requeue",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r2.status_code == 200
    row2 = db.query(models.WebhookQueue).filter(models.WebhookQueue.id == w.id).first()
    assert row2.dead == 0

    # cleanup
    db.query(models.WebhookQueue).delete()
    db.commit()
    db.close()
