from app import models
from app.main import SessionLocal
from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


class TelemetryPayload(BaseModel):
    event_type: str
    path: str | None = None
    payload: dict | None = None
    user_id: int | None = None


@router.post("/event")
def post_event(payload: TelemetryPayload, request: Request):
    db = SessionLocal()
    try:
        client = None
        if request.client:
            client = f"{request.client.host}:{request.client.port}"
        te = models.TelemetryEvent(
            user_id=payload.user_id,
            event_type=payload.event_type,
            path=payload.path,
            payload=payload.payload,
            client=client,
            tenant_id=getattr(request.state, "tenant_id", "default") or "default",
        )
        db.add(te)
        db.commit()
        db.refresh(te)
        return {"status": "ok", "id": te.id}
    finally:
        db.close()


class HeartbeatPayload(BaseModel):
    user_id: int
    session_id: int | None = None
    last_seen_at: str | None = None


@router.post("/heartbeat")
def heartbeat(payload: HeartbeatPayload, request: Request):
    db = SessionLocal()
    try:
        # optional: update session last_seen_at
        if payload.session_id:
            try:
                sess = db.query(models.UserSession).get(payload.session_id)
                if sess:
                    sess.last_seen_at = None
                    db.add(sess)
                    db.commit()
            except Exception:
                db.rollback()
        # record a lightweight telemetry event
        te = models.TelemetryEvent(
            user_id=payload.user_id,
            event_type="heartbeat",
            path=None,
            payload={"session_id": payload.session_id},
            client=getattr(request, "client", None),
            tenant_id=getattr(request.state, "tenant_id", "default") or "default",
        )
        db.add(te)
        db.commit()
        db.refresh(te)
        return {"status": "ok", "id": te.id}
    finally:
        db.close()
