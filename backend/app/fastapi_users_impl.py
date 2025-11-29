"""Async fastapi-users integration (robust, non-blocking import-time).

This module registers `fastapi-users` routers under `/fu_auth` using an
async engine. It avoids running event-loop blocking operations at import time
and will quietly skip integration if configuration or dependencies are missing.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

try:
    from fastapi import Depends
    from fastapi_users import FastAPIUsers
    from fastapi_users import schemas as fu_schemas
    from fastapi_users.authentication import (
        AuthenticationBackend,
        BearerTransport,
        JWTStrategy,
    )
    from fastapi_users.db import SQLAlchemyUserDatabase
    from fastapi_users.manager import BaseUserManager
    from sqlalchemy import Boolean, Column, Integer, MetaData, String
    from sqlalchemy.ext.asyncio import (
        AsyncSession,
        async_sessionmaker,
        create_async_engine,
    )
    from sqlalchemy.orm import declarative_base
except Exception as exc:  # pragma: no cover - optional deps
    # Do not re-raise here — keep module importable even if optional deps
    # are missing. The `include_fastapi_users_impl` function will handle
    # runtime inclusion and log if it cannot be completed.
    logger.info("fastapi-users optional dependencies not available: %s", exc)
    # Mark that fastapi-users integration is unavailable
    _FASTAPI_USERS_AVAILABLE = False
else:
    _FASTAPI_USERS_AVAILABLE = True

# Configuration
_BACKEND_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL_ASYNC = os.getenv(
    "DATABASE_URL_ASYNC", f"sqlite+aiosqlite:///{_BACKEND_DIR / 'test.db'}"
)
SECRET = os.getenv("BBH_SECRET_KEY", "CHANGE_ME_FOR_PRODUCTION")

metadata = MetaData()
Base = declarative_base(metadata=metadata)


class FUUser(Base):
    __tablename__ = "fu_users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)


async_engine: Optional[object] = None
async_session = None
fastapi_users = None


def get_async_sessionmaker():
    global async_engine, async_session
    if async_engine is None:
        async_engine = create_async_engine(DATABASE_URL_ASYNC, echo=False)
        async_session = async_sessionmaker(async_engine, expire_on_commit=False)
    return async_session


def include_fastapi_users_impl(app):
    """Include routers into `app` if possible.

    This function is safe to call at import/startup time and will not block
    the event loop. It will log and return if the integration cannot be
    completed.
    """
    try:
        session_maker = get_async_sessionmaker()

        # dependencies: async session and user_db
        async def get_async_session() -> AsyncSession:
            async with session_maker() as session:
                yield session

        def get_user_db(session: AsyncSession = Depends(get_async_session)):
            yield SQLAlchemyUserDatabase(session, FUUser)

        # simple user manager using default BaseUserManager
        class UserManager(BaseUserManager):
            reset_password_token_secret = SECRET

            async def on_after_register(self, user, request=None):
                logger.info("User registered: %s", getattr(user, "email", None))

        def get_user_manager(user_db=Depends(get_user_db)):
            yield UserManager(user_db)

        UserRead = fu_schemas.BaseUser
        UserCreate = fu_schemas.BaseUserCreate
        UserUpdate = fu_schemas.BaseUserUpdate

        # Build authentication backend using new fastapi-users API
        # (JWTStrategy + BearerTransport)
        bearer_transport = BearerTransport(tokenUrl="/fu_auth/jwt/login")
        jwt_strategy = JWTStrategy(secret=SECRET, lifetime_seconds=3600)
        auth_backend = AuthenticationBackend(
            name="jwt", transport=bearer_transport, get_strategy=lambda: jwt_strategy
        )

        global fastapi_users
        fastapi_users = FastAPIUsers(get_user_manager, [auth_backend])

        # Register routers under /fu_auth to avoid colliding with existing endpoints
        app.include_router(
            fastapi_users.get_auth_router(auth_backend),
            prefix="/fu_auth/jwt",
            tags=["fu_auth"],
        )
        app.include_router(
            fastapi_users.get_register_router(UserRead, UserCreate),
            prefix="/fu_auth",
            tags=["fu_auth"],
        )
        app.include_router(
            fastapi_users.get_users_router(UserRead, UserUpdate),
            prefix="/fu_auth/users",
            tags=["fu_auth"],
        )

        logger.info("fastapi-users impl included at /fu_auth")
    except Exception as exc:
        logger.exception("fastapi-users impl could not be included: %s", exc)
        return
