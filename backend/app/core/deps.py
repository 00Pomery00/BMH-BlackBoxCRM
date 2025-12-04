from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select

from ..db.session import AsyncSession
from ..models.core import User
from .security import decode_access_token

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token"
        )
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    user_id = int(payload.get("sub"))
    async with AsyncSession() as session:
        q = await session.execute(select(User).where(User.id == user_id))
        user = q.scalars().first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
            )
        return user


async def get_db(current_user=Depends(get_current_user)):
    # yield a DB session with tenant set for RLS enforcement
    async with AsyncSession() as session:
        try:
            await session.execute(
                "SET LOCAL bbx.tenant = :t", {"t": current_user.tenant_id}
            )
        except Exception:
            pass
        yield session
