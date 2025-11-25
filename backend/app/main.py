from fastapi import FastAPI, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import weakref
from app import crud, ai_processor, gamification, models, schemas, security, integrations, reporting
import os
import asyncio

DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Wrap the sessionmaker so we can keep weakrefs to created Session instances.
_maker = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class SessionFactory:
    def __init__(self, maker):
        self._maker = maker
        self._instances = weakref.WeakSet()

    def __call__(self):
        s = self._maker()
        try:
            self._instances.add(s)
        except Exception:
            pass
        return s

    def expire_all(self):
        for s in list(self._instances):
            try:
                s.expire_all()
            except Exception:
                pass

SessionLocal = SessionFactory(_maker)

from sqlalchemy import text

# Try to ensure the `dead` column exists on older DBs created before the column
# was introduced. If the table doesn't exist yet, creating all tables will set
# up the full schema.
models.Base.metadata.create_all(bind=engine)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE webhook_queue ADD COLUMN dead INTEGER DEFAULT 0"))
        conn.commit()
except Exception:
    # if the table doesn't exist yet or column already present, ignore errors
    pass

# Ensure user table has expected columns for auth (best-effort ALTERs for demo)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR"))
        conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR"))
        conn.execute(text("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1"))
        conn.commit()
except Exception:
    pass

app = FastAPI(title="BlackBox CRM 2025 - Demo")

# Register audit middleware for structured logging
from app import audit
app.middleware("http")(audit.audit_middleware)

# --- Admin UI (sqladmin) registration ---
try:
    from sqladmin import Admin, ModelView

    admin = Admin(app, engine, base_url="/_admin")
    admin.add_view(ModelView(models.Company, engine))
    admin.add_view(ModelView(models.Contact, engine))
    admin.add_view(ModelView(models.Opportunity, engine))
    admin.add_view(ModelView(models.Activity, engine))
    admin.add_view(ModelView(models.User, engine))
    admin.add_view(ModelView(models.WebhookQueue, engine))
except Exception:
    # If sqladmin isn't installed in the environment, skip admin registration.
    pass
# Register auth routes
from app.users import router as users_router
app.include_router(users_router)

# Optionally include fastapi-users scaffold or implementation (best-effort)
try:
    from .fastapi_users import include_fastapi_users as _include_fu
    _include_fu(app)
except Exception:
    pass

try:
    from .fastapi_users_impl import include_fastapi_users_impl as _include_fu_impl
    _include_fu_impl(app)
except Exception:
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/companies")
def get_companies(db=Depends(get_db)):
    companies = crud.get_companies(db)
    scored = ai_processor.apply_demo_scoring([c.__dict__ for c in companies])
    return {"companies": scored}


@app.post("/leads")
def add_lead(lead: dict, db=Depends(get_db)):
    created = crud.create_lead(db, lead)
    return {"status": "ok", "lead": {"id": created.id, "name": created.name}}


@app.get("/gamification")
def get_gamification(user_id: int = 1):
    return gamification.get_demo_stats(user_id)


@app.post("/mobile/leads")
def mobile_add_lead(payload: dict, db=Depends(get_db)):
    normalized = ai_processor.apply_demo_scoring([payload], deterministic=True)[0]
    created = crud.create_or_update_lead(db, normalized)
    return {"status": "ok", "lead_id": created.id, "lead_score": created.lead_score}


@app.post("/mobile/sync")
def mobile_sync(payload: dict, db=Depends(get_db)):
    leads = payload.get("leads", [])
    results = []
    for l in leads:
        normalized = ai_processor.apply_demo_scoring([l], deterministic=True)[0]
        comp = crud.create_or_update_lead(db, normalized)
        results.append({"lead_id": comp.id, "name": comp.name, "lead_score": comp.lead_score})
    return {"status": "ok", "synced": len(results), "results": results}


@app.get("/mobile/status")
def mobile_status():
    return {"status": "ready", "version": "demo-0.1"}


@app.post("/gamification/award")
def gamification_award(payload: dict):
    user_id = int(payload.get("user_id", 1))
    xp = int(payload.get("xp", 0))
    coins = int(payload.get("salescoins", 0))
    badge = payload.get("badge")
    result = {}
    if xp:
        result = gamification.award_xp(user_id, xp)
    if coins:
        result = gamification.award_salescoins(user_id, coins)
    if badge:
        result = gamification.unlock_badge(user_id, badge)
    return {"status": "ok", "stats": result}


@app.get("/gamification/leaderboard")
def gamification_leaderboard(top: int = 10):
    return {"leaderboard": gamification.get_leaderboard(top)}


@app.get("/reports/companies.csv")
def export_companies_csv(db=Depends(get_db)):
    return reporting.companies_csv_response(db)


@app.get("/reports/companies.json")
def export_companies_json(db=Depends(get_db)):
    return reporting.companies_json_response(db)


@app.get("/reports/leads.csv")
def export_leads_csv(name: str = None, min_score: float = None, max_score: float = None, db=Depends(get_db)):
    return reporting.leads_csv_response(db, name_contains=name, min_score=min_score, max_score=max_score)


@app.get("/reports/leads.json")
def export_leads_json(name: str = None, min_score: float = None, max_score: float = None, db=Depends(get_db)):
    return reporting.leads_json_response(db, name_contains=name, min_score=min_score, max_score=max_score)


# --- Security / Admin / MFA demo endpoints ---
@app.post("/mfa/request")
def mfa_request(payload: dict):
    username = payload.get("username")
    code = security.mfa_request(username)
    # In a real system we would send this via SMS/Email; for demo/tests we return it
    return {"status": "ok", "mfa_code_demo": code}


@app.post("/mfa/verify")
def mfa_verify(payload: dict):
    username = payload.get("username")
    code = payload.get("code")
    ok = security.mfa_verify(username, code)
    return {"status": "ok" if ok else "failed", "verified": bool(ok)}


@app.get("/admin/ping")
def admin_ping(user: schemas.User = Depends(security.get_current_user)):
    security.require_role(user, ("admin",))
    return {"status": "ok", "user": user.username, "role": user.role}


@app.post("/webhook/enqueue")
def webhook_enqueue(payload: dict, db=Depends(get_db)):
    """Enqueue a webhook for later dispatch. JSON body: {"url": "https://...", "payload": {...}}"""
    url = payload.get("url")
    pl = payload.get("payload", {})
    if not url:
        return {"status": "error", "message": "missing url"}
    w = integrations.enqueue_webhook(db, url, pl)
    return {"status": "ok", "id": w.id}


from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background worker
    stop_worker = False

    async def _worker():
        while not stop_worker:
            try:
                await asyncio.to_thread(integrations.process_queue_once)
            except Exception:
                pass
            await asyncio.sleep(5)

    task = asyncio.create_task(_worker())
    try:
        yield
    finally:
        # signal worker to stop and wait for it
        stop_worker = True
        try:
            task.cancel()
        except Exception:
            pass

app.router.lifespan_context = lifespan

# --- Admin UI (sqladmin) ---
try:
    from sqladmin import Admin, ModelView

    admin = Admin(app, engine, base_url="/_admin")
    admin.add_view(ModelView(models.Company, engine))
    admin.add_view(ModelView(models.Contact, engine))
    admin.add_view(ModelView(models.Opportunity, engine))
    admin.add_view(ModelView(models.Activity, engine))
    admin.add_view(ModelView(models.User, engine))
    admin.add_view(ModelView(models.WebhookQueue, engine))
except Exception:
    # optional dependency; ignore if sqladmin not installed or fails to init in CI
    pass


@app.get("/admin/webhooks")
def admin_list_webhooks(user: schemas.User = Depends(security.get_current_user), db=Depends(get_db)):
    security.require_role(user, ("admin",))
    rows = db.query(models.WebhookQueue).all()
    out = []
    for r in rows:
        out.append({
            "id": r.id,
            "url": r.url,
            "attempts": r.attempts,
            "last_error": r.last_error,
            "next_attempt_at": r.next_attempt_at.isoformat() if r.next_attempt_at else None,
            "dead": bool(r.dead),
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return {"webhooks": out}


@app.post("/admin/webhooks/{wid}/requeue")
def admin_requeue_webhook(wid: int, user: schemas.User = Depends(security.get_current_user), db=Depends(get_db)):
    security.require_role(user, ("admin",))
    row = db.query(models.WebhookQueue).filter(models.WebhookQueue.id == wid).first()
    if not row:
        return {"status": "error", "message": "not found"}
    row.attempts = 0
    row.last_error = ""
    row.dead = 0
    import datetime
    row.next_attempt_at = datetime.datetime.utcnow()
    db.add(row)
    db.commit()
    # Ensure any other in-process sessions (like test sessions) see this update
    try:
        if hasattr(SessionLocal, "expire_all"):
            SessionLocal.expire_all()
    except Exception:
        pass
    return {"status": "ok"}
