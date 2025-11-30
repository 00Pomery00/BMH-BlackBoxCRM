from app import integrations, models
from backend.app.integrations import SessionLocal


def test_enqueue_and_process(monkeypatch):
    # create a local db session
    db = SessionLocal()

    # ensure clean queue
    db.query(models.WebhookQueue).delete()
    db.commit()

    # monkeypatch httpx.post to fail once then succeed
    calls = {"count": 0}

    def fake_post(url, json=None, timeout=None):
        class R:
            def __init__(self, status):
                self.status_code = status

        calls["count"] += 1
        if calls["count"] == 1:
            raise Exception("network error")
        return R(200)

    monkeypatch.setattr("httpx.post", fake_post)

    # enqueue a webhook
    w = integrations.enqueue_webhook(db, "http://example.invalid/webhook", {"x": 1})
    assert w.id is not None

    # first process - fake_post will raise and we should increase attempts
    processed = integrations.process_queue_once(db=db, max_attempts=3)
    assert processed == 0
    row = db.query(models.WebhookQueue).filter(models.WebhookQueue.id == w.id).first()
    assert row.attempts == 1

    # make row due immediately (fast-forward backoff) and process again - should succeed
    import datetime

    row = db.query(models.WebhookQueue).filter(models.WebhookQueue.id == w.id).first()
    row.next_attempt_at = datetime.datetime.now(
        datetime.timezone.utc
    ) - datetime.timedelta(seconds=1)
    db.add(row)
    db.commit()
    processed = integrations.process_queue_once(db=db, max_attempts=3)
    assert processed == 1

    # cleanup
    db.query(models.WebhookQueue).delete()
    db.commit()
    db.close()
