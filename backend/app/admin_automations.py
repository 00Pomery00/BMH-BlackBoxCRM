from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import security, models
from .main import get_db
from .automation import validate_flow, execute_flow

router = APIRouter(prefix="/admin/automations", tags=["admin-automations"]) 


def require_admin(user=Depends(security.get_current_user)):
    security.require_role(user, ("admin",))
    return user


@router.get("/")
def list_automations(db: Session = Depends(get_db), user=Depends(require_admin)):
    rows = db.query(models.AutomationFlow).all()
    out = []
    for r in rows:
        out.append({"id": r.id, "name": r.name, "is_active": bool(r.is_active), "allow_advanced_edit": bool(r.allow_advanced_edit)})
    return {"automations": out}


@router.get("/{fid}")
def get_automation(fid: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    row = db.query(models.AutomationFlow).filter(models.AutomationFlow.id == fid).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    return {"id": row.id, "name": row.name, "definition": row.definition, "is_active": bool(row.is_active)}


@router.post("/")
def create_automation(payload: dict, db: Session = Depends(get_db), user=Depends(require_admin)):
    name = payload.get("name")
    definition = payload.get("definition")
    if not name or not definition:
        raise HTTPException(status_code=400, detail="missing name or definition")
    valid, errors = validate_flow(definition)
    if not valid:
        raise HTTPException(status_code=400, detail={"validation_errors": errors})
    af = models.AutomationFlow(name=name, definition=definition, is_active=1, created_by=user.id)
    db.add(af)
    db.commit()
    db.refresh(af)
    return {"id": af.id, "name": af.name}


@router.put("/{fid}")
def update_automation(fid: int, payload: dict, db: Session = Depends(get_db), user=Depends(require_admin)):
    row = db.query(models.AutomationFlow).filter(models.AutomationFlow.id == fid).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    if row.protected:
        raise HTTPException(status_code=403, detail="flow is protected")
    name = payload.get("name")
    definition = payload.get("definition")
    if definition:
        valid, errors = validate_flow(definition)
        if not valid:
            raise HTTPException(status_code=400, detail={"validation_errors": errors})
        row.definition = definition
    if name:
        row.name = name
    row.updated_at = __import__("datetime").datetime.utcnow()
    db.add(row)
    db.commit()
    return {"id": row.id, "name": row.name}


@router.post("/{fid}/run")
def run_automation(fid: int, payload: dict = None, db: Session = Depends(get_db), user=Depends(require_admin)):
    row = db.query(models.AutomationFlow).filter(models.AutomationFlow.id == fid).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    if not row.is_active:
        raise HTTPException(status_code=400, detail="flow disabled")
    dry = bool(payload and payload.get("dry_run"))
    ctx = payload.get("context", {}) if payload else {}
    res = execute_flow(db, row, context=ctx, dry_run=dry)
    return res
