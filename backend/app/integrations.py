import httpx
import time
import json
import logging
from typing import Dict
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models
import datetime
from threading import Lock

# Simple in-memory cache and rate limiter for OpenGov enrichment
_cache = {}
_cache_lock = Lock()

# cache entries: name -> (ts, value)
_CACHE_TTL = int(60 * 60)  # 1 hour

# simple token-bucket per-host
_buckets = {}
_buckets_lock = Lock()
_RATE_CAPACITY = 5
_RATE_REFILL_PER_SEC = 1

# Use the same sqlite file as the app for demo purposes
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def opengov_enrich(name: str) -> Dict:
    if not name:
        return {}
    # check cache first
    now = datetime.datetime.utcnow().timestamp()
    with _cache_lock:
        entry = _cache.get(name)
        if entry:
            ts, val = entry
            if now - ts < _CACHE_TTL:
                return val
            else:
                _cache.pop(name, None)

    # rate limit by host (mock: host derived from name hash)
    host = f"opengov:{abs(hash(name)) % 10}"
    if not _consume_token(host):
        # too many requests; return empty or stale
        return {"enriched": False, "reason": "rate_limited"}

    # simulate enrichment
    key = abs(hash(name)) % 100000
    result = {
        "official_registry_id": f"OG-{key}",
        "industry": "Services" if key % 2 == 0 else "Manufacturing",
        "enriched": True,
    }
    with _cache_lock:
        _cache[name] = (now, result)
    return result


def _consume_token(host: str) -> bool:
    now = datetime.datetime.utcnow().timestamp()
    with _buckets_lock:
        bucket = _buckets.get(host)
        if not bucket:
            # (tokens, last_ts)
            _buckets[host] = [_RATE_CAPACITY, now]
            return True
        tokens, last = bucket
        # refill
        delta = now - last
        refill = int(delta * _RATE_REFILL_PER_SEC)
        if refill > 0:
            tokens = min(_RATE_CAPACITY, tokens + refill)
            last = now
        if tokens <= 0:
            _buckets[host] = [tokens, last]
            return False
        tokens -= 1
        _buckets[host] = [tokens, last]
        return True


def webhook_dispatch(url: str, payload: Dict, retries: int = 3, backoff: float = 0.5) -> bool:
    for attempt in range(1, retries + 1):
        try:
            r = httpx.post(url, json=payload, timeout=5.0)
            if 200 <= r.status_code < 300:
                return True
        except Exception as e:
            logging.debug("webhook_dispatch attempt %s failed: %s", attempt, e)
        time.sleep(backoff * attempt)
    return False


def enqueue_webhook(db, url: str, payload: Dict):
    w = models.WebhookQueue(url=url, payload=json.dumps(payload), attempts=0, next_attempt_at=datetime.datetime.utcnow())
    db.add(w)
    db.commit()
    db.refresh(w)
    return w


def process_queue_once(db=None, max_attempts: int = 5):
    """Process due webhooks once. Returns number processed."""
    local_db = False
    if db is None:
        db = SessionLocal()
        local_db = True
    now = datetime.datetime.utcnow()
    rows = db.query(models.WebhookQueue).filter(models.WebhookQueue.next_attempt_at <= now).all()
    processed = 0
    for row in rows:
        payload = json.loads(row.payload)
        try:
            ok = webhook_dispatch(row.url, payload, retries=1, backoff=0.1)
            if ok:
                db.delete(row)
                db.commit()
                processed += 1
                continue
            else:
                row.attempts = (row.attempts or 0) + 1
                row.last_error = (row.last_error or "") + ";failed"
                # exponential backoff
                delay = (2 ** row.attempts) * 1
                row.next_attempt_at = datetime.datetime.utcnow() + datetime.timedelta(seconds=delay)
                if row.attempts >= max_attempts:
                    # mark as dead-letter (keep record for admin review)
                    row.dead = 1
                    row.last_error = (row.last_error or "") + ";max_attempts"
                    row.next_attempt_at = None
                    db.add(row)
                else:
                    db.add(row)
                db.commit()
        except Exception as e:
            row.attempts = (row.attempts or 0) + 1
            row.last_error = str(e)
            row.next_attempt_at = datetime.datetime.utcnow() + datetime.timedelta(seconds=30)
            db.add(row)
            db.commit()
    if local_db:
        db.close()
    return processed
