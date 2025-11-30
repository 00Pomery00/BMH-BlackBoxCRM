from fastapi import APIRouter, Depends, HTTPException, status

from ...core.deps import get_current_user

router = APIRouter()


@router.get("/ping")
async def ping(current_user=Depends(get_current_user)):
    if not getattr(current_user, "is_superuser", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="admin only")
    return {"role": "admin"}
