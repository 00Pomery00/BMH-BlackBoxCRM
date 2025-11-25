from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, security
from app.main import SessionLocal
from pydantic import BaseModel
from typing import Optional
from app import schemas

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
        existing = (
            db.query(models.User)
            .filter(models.User.username == payload.username)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="username taken")
        hashed = security.pwd_context.hash(payload.password)
        u = models.User(
            username=payload.username, email=payload.email, hashed_password=hashed
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        return {"status": "ok", "user_id": u.id}
    finally:
        db.close()


@router.post("/login")
def login(payload: LoginPayload):
    db: Session = SessionLocal()
    try:
        u = (
            db.query(models.User)
            .filter(models.User.username == payload.username)
            .first()
        )
        if not u or not u.hashed_password:
            raise HTTPException(status_code=401, detail="invalid credentials")
        if not security.pwd_context.verify(payload.password, u.hashed_password):
            raise HTTPException(status_code=401, detail="invalid credentials")
        token = security.create_access_token(
            {"sub": u.username, "uid": u.id, "role": u.role}
        )
        return {"access_token": token, "token_type": "bearer"}
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
