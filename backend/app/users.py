from datetime import datetime
from typing import Optional

from app import models, schemas, security
from app.main import SessionLocal
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterPayload(BaseModel):
    username: str
    password: str
    email: Optional[str]


class LoginPayload(BaseModel):
    username: str
    password: str


@router.post("/register")
def register(payload: RegisterPayload):
    db: Session = SessionLocal()
    try:
        # best-effort check for existing user by username or email
        existing = None
        try:
            existing = (
                db.query(models.User)
                .filter(
                    (models.User.username == payload.username)
                    | (models.User.email == payload.email)
                )
                .first()
            )
        except Exception:
            # fallback if model doesn't have username column
            existing = (
                db.query(models.User).filter(models.User.email == payload.email).first()
            )
        if existing:
            raise HTTPException(status_code=400, detail="username/email taken")
        hashed = security.pwd_context.hash(payload.password)
        # create user with available fields
        u = models.User(
            email=payload.email or payload.username,
            hashed_password=hashed,
        )
        # attempt to set username if model supports it
        try:
            setattr(u, "username", payload.username)
        except Exception:
            pass
        db.add(u)
        db.commit()
        db.refresh(u)
        # insert audit log
        try:
            al = models.AuditLog(
                actor=getattr(u, "username", None) or u.email,
                action="user.register",
                object_class="user",
                object_id=u.id,
                after={"email": u.email},
                tenant_id=getattr(u, "tenant_id", "default"),
            )
            db.add(al)
            db.commit()
        except Exception:
            db.rollback()
        return {"status": "ok", "user_id": u.id}
    finally:
        db.close()


@router.post("/register_and_login")
def register_and_login(payload: RegisterPayload, request: Request = None):
    # convenience endpoint for tests/seed: register user and return token+session
    out = register(payload)
    if out.get("status") != "ok":
        return out
    # auto-login
    login_payload = LoginPayload(username=payload.username, password=payload.password)
    return login(login_payload, request=request)


@router.post("/login")
def login(payload: LoginPayload, request: Request = None):
    db: Session = SessionLocal()
    try:
        # find by username or email
        try:
            u = (
                db.query(models.User)
                .filter(models.User.username == payload.username)
                .first()
            )
        except Exception:
            u = (
                db.query(models.User)
                .filter(models.User.email == payload.username)
                .first()
            )
        if not u or not u.hashed_password:
            raise HTTPException(status_code=401, detail="invalid credentials")
        if not security.pwd_context.verify(payload.password, u.hashed_password):
            raise HTTPException(status_code=401, detail="invalid credentials")
        token = security.create_access_token(
            {
                "sub": getattr(u, "username", u.email),
                "uid": u.id,
                "role": getattr(u, "role", "user"),
            }
        )
        # create session record
        try:
            client = None
            if request:
                ua = request.headers.get("user-agent")
                client = f"{request.client.host}:{ua}" if request.client else ua
            sess = models.UserSession(
                user_id=u.id,
                token=token,
                client=client,
                tenant_id=getattr(u, "tenant_id", "default"),
            )
            db.add(sess)
            db.commit()
            db.refresh(sess)
            # write audit log
            al = models.AuditLog(
                actor=getattr(u, "username", u.email),
                action="user.login",
                object_class="session",
                object_id=sess.id,
                after={"session_id": sess.id},
                tenant_id=getattr(u, "tenant_id", "default"),
            )
            db.add(al)
            db.commit()
        except Exception:
            db.rollback()
        # return session id so frontend can track session
        sess_id = None
        try:
            sess_id = getattr(sess, "id", None)
        except Exception:
            sess_id = None
        return {"access_token": token, "token_type": "bearer", "session_id": sess_id}
    finally:
        db.close()


# --- Additional user management endpoints ---
class RoleChange(BaseModel):
    username: str
    role: str


@router.get("/me")
def me(user: schemas.User = Depends(security.get_current_user)):
    return {
        "username": user.username,
        "role": user.role,
        "email": getattr(user, "email", None),
    }


@router.get("/list")
def list_users(user: schemas.User = Depends(security.get_current_user)):
    security.require_role(user, ("admin",))
    db: Session = SessionLocal()
    try:
        rows = db.query(models.User).all()
        out = []
        for r in rows:
            out.append(
                {
                    "id": r.id,
                    "username": r.username,
                    "email": r.email,
                    "role": r.role,
                    "is_active": bool(r.is_active),
                }
            )
        return {"users": out}
    finally:
        db.close()


@router.post("/role")
def change_role(
    payload: RoleChange, user: schemas.User = Depends(security.get_current_user)
):
    security.require_role(user, ("admin",))
    db: Session = SessionLocal()
    try:
        target = (
            db.query(models.User)
            .filter(models.User.username == payload.username)
            .first()
        )
        if not target:
            raise HTTPException(status_code=404, detail="user not found")
        target.role = payload.role
        db.add(target)
        db.commit()
        return {"status": "ok"}
    finally:
        db.close()


class DeactivatePayload(BaseModel):
    username: str


@router.post("/deactivate")
def deactivate_user(
    payload: DeactivatePayload, user: schemas.User = Depends(security.get_current_user)
):
    security.require_role(user, ("admin",))
    db: Session = SessionLocal()
    try:
        target = (
            db.query(models.User)
            .filter(models.User.username == payload.username)
            .first()
        )
        if not target:
            raise HTTPException(status_code=404, detail="user not found")
        target.is_active = 0
        db.add(target)
        db.commit()
        return {"status": "ok"}
    finally:
        db.close()


class ChangePasswordPayload(BaseModel):
    old_password: str
    new_password: str


@router.post("/change-password")
def change_password(
    payload: ChangePasswordPayload,
    user: schemas.User = Depends(security.get_current_user),
):
    db: Session = SessionLocal()
    try:
        u = db.query(models.User).filter(models.User.id == user.id).first()
        if not u or not u.hashed_password:
            raise HTTPException(status_code=401, detail="invalid user")
        if not security.pwd_context.verify(payload.old_password, u.hashed_password):
            raise HTTPException(status_code=401, detail="invalid credentials")
        u.hashed_password = security.pwd_context.hash(payload.new_password)
        db.add(u)
        db.commit()
        return {"status": "ok"}
    finally:
        db.close()
