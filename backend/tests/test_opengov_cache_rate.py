from app import integrations
import time


def test_opengov_cache_and_rate(monkeypatch):
    name = "Test Company"
    # clear caches
    integrations._cache.clear()
    integrations._buckets.clear()

    # first call should populate cache and succeed
    r1 = integrations.opengov_enrich(name)
    assert r1.get("enriched") is True

    # second call should hit cache (fast)
    t0 = time.time()
    r2 = integrations.opengov_enrich(name)
    t1 = time.time()
    assert r2 == r1
    assert (t1 - t0) < 0.05

    # exhaust tokens for the host
    host = f"opengov:{abs(hash(name)) % 10}"
    # consume remaining tokens
    while integrations._consume_token(host):
        pass

    # next call for a different name on same host should be rate_limited
    # find a different name that maps to the same host mod 10
    target_host = abs(hash(name)) % 10
    other = None
    for i in range(1000):
        cand = f"{name} {i}"
        if abs(hash(cand)) % 10 == target_host and cand != name:
            other = cand
            break
    assert other is not None
    r3 = integrations.opengov_enrich(other)
    assert r3.get("enriched") is False or r3.get("reason") == "rate_limited"
