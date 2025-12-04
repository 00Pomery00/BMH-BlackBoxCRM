from fastapi import APIRouter, Depends
from sqlalchemy import func

from app import models

from ..core import security
from ..main import SessionLocal

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/telemetry/summary")
def telemetry_summary(user: models.User = Depends(security.get_current_user)):
    # require admin role
    security.require_role(user, ("admin",))
    db = SessionLocal()
    try:
        total_events = db.query(func.count(models.TelemetryEvent.id)).scalar() or 0
        events_by_type = (
            db.query(
                models.TelemetryEvent.event_type, func.count(models.TelemetryEvent.id)
            )
            .group_by(models.TelemetryEvent.event_type)
            .all()
        )
        top_paths = (
            db.query(models.TelemetryEvent.path, func.count(models.TelemetryEvent.id))
            .filter(models.TelemetryEvent.path is not None)
            .group_by(models.TelemetryEvent.path)
            .order_by(func.count(models.TelemetryEvent.id).desc())
            .limit(10)
            .all()
        )
        active_sessions = (
            db.query(func.count(models.UserSession.id))
            .filter(models.UserSession.ended_at is None)
            .scalar()
            or 0
        )
        return {
            "total_events": int(total_events),
            "events_by_type": [{"type": t, "count": int(c)} for t, c in events_by_type],
            "top_paths": [{"path": p, "count": int(c)} for p, c in top_paths],
            "active_sessions": int(active_sessions),
        }
    finally:
        db.close()
