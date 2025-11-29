
from datetime import timedelta

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import AsyncSession
from app.models.core import User
from app.schemas.auth import Token, UserCreate, UserRead
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

router = APIRouter()


@router.get("/me", tags=["auth"])
async def me(current_user=Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email}


# Compatibility endpoints expected by existing E2E tests (fastapi-users style)
@router.post("/fu_auth/register")
async def fu_register(payload: dict):
    # payload may contain email & password
    # tenant not provided in tests — default to 'default'
    email = payload.get("email")
    password = payload.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="email and password required")
    async with AsyncSession() as session:
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            tenant_id=payload.get("tenant_id", "default"),
        )
        session.add(user)
        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            return {"detail": "already exists"}
        await session.refresh(user)
        return {"id": user.id, "email": user.email}


@router.post("/fu_auth/jwt/login")
async def fu_jwt_login(payload: dict):
    # tests send JSON { username, password }
    username = payload.get("username") or payload.get("email")
    password = payload.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="username and password required")
    async with AsyncSession() as session:
        q = await session.execute(select(User).where(User.email == username))
        user = q.scalars().first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        token = create_access_token(
            {"sub": str(user.id), "tenant_id": user.tenant_id},
            expires_delta=access_token_expires,
        )
        return {"access_token": token, "token_type": "bearer"}


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    async with AsyncSession() as session:
        user = User(
            email=payload.email,
            hashed_password=get_password_hash(payload.password),
            tenant_id=payload.tenant_id,
        )
        session.add(user)
        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            raise HTTPException(status_code=400, detail="User already exists")
        await session.refresh(user)
        return user


@router.post("/token", response_model=Token)
async def login(form_data: UserCreate):
    async with AsyncSession() as session:
        q = await session.execute(select(User).where(User.email == form_data.email))
        user = q.scalars().first()
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        token = create_access_token(
            {"sub": str(user.id), "tenant_id": user.tenant_id},
            expires_delta=access_token_expires,
        )
        return Token(access_token=token)
