from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, security
from ..main import get_db

router = APIRouter(prefix="/api/ui", tags=["ui"])


@router.get("/settings")
def get_settings(
    user: security.schemas.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    # return all settings for the user as a dict
    try:
        us = crud.get_user_setting(db, user.id, "ui_settings")
        if not us:
            return {"settings": {}}
        import json

        return {"settings": json.loads(us.value)}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to load settings")


@router.post("/settings")
def post_settings(
    payload: dict,
    user: security.schemas.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    # expect JSON body with settings object
    settings = payload.get("settings")
    if settings is None:
        raise HTTPException(status_code=400, detail="Missing settings body")
    import json

    try:
        raw = json.dumps(settings)
        s = crud.set_user_setting(db, user.id, "ui_settings", raw)
        return {"status": "ok", "updated_at": s.updated_at}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save settings")
