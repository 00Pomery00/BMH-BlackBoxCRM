from app import integrations


def test_opengov_enrich():
    enriched = integrations.opengov_enrich("ACME Ltd")
    assert enriched.get("enriched") is True
    assert "official_registry_id" in enriched


def test_webhook_dispatch_retry(monkeypatch):
    calls = {"count": 0}

    class DummyResp:
        def __init__(self, status_code):
            self.status_code = status_code

    def fake_post_fail_then_success(url, json, timeout):
        calls["count"] += 1
        if calls["count"] < 3:
            raise Exception("network")
        return DummyResp(200)

    import httpx as _httpx

    monkeypatch.setattr(_httpx, "post", fake_post_fail_then_success)

    success = integrations.webhook_dispatch(
        "http://example.test/webhook", {"a": 1}, retries=4
    )
    assert success is True
