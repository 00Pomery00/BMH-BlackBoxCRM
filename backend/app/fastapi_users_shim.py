from fastapi import APIRouter, HTTPException, Form
from sqlalchemy.orm import Session
from .main import SessionLocal
from . import security, models
from pydantic import BaseModel

router = APIRouter()

class ShimRegister(BaseModel):
    email: str
    password: str


@router.post("/fu_auth/register")
def fu_register(payload: ShimRegister):
    db: Session = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.email == payload.email).first()
        if existing:
            # mimic fastapi-users behavior: return 400 on already exists
            raise HTTPException(status_code=400, detail="REGISTER_USER_ALREADY_EXISTS")
        hashed = security.pwd_context.hash(payload.password)
        u = models.User(username=payload.email, email=payload.email, hashed_password=hashed)
        db.add(u)
        db.commit()
        db.refresh(u)
        return {"email": u.email, "id": u.id}
    finally:
        db.close()


@router.post("/fu_auth/jwt/login")
def fu_login(username: str = Form(...), password: str = Form(...)):
    db: Session = SessionLocal()
    try:
        u = db.query(models.User).filter(models.User.email == username).first()
        if not u or not u.hashed_password:
            raise HTTPException(status_code=401, detail="invalid credentials")
        if not security.pwd_context.verify(password, u.hashed_password):
            raise HTTPException(status_code=401, detail="invalid credentials")
        token = security.create_access_token({"sub": u.email, "uid": u.id, "role": u.role})
        return {"access_token": token, "token_type": "bearer"}
    finally:
        db.close()
