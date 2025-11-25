from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from . import schemas
import os
from dotenv import load_dotenv
import warnings

# Load environment from .env in development
load_dotenv()

# Secrets and settings (use env vars in production)
SECRET_KEY = os.getenv("BBH_SECRET_KEY") or os.getenv("SECRET_KEY") or "demo-secret-key-change-me"
if SECRET_KEY == "demo-secret-key-change-me":
    warnings.warn("Using demo SECRET_KEY; set BBH_SECRET_KEY in environment for production")

ALGORITHM = os.getenv("BBH_JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("BBH_ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# Simple in-memory MFA store for demo/testing purposes
_MFA_STORE = {}


def mfa_request(username: str):
    """Generate and store a short MFA code for the given username (demo only)."""
    if not username:
        return None
    import random
    code = f"{random.randint(100000, 999999)}"
    _MFA_STORE[username] = code
    return code


def mfa_verify(username: str, code: str) -> bool:
    """Verify provided MFA code for username."""
    if not username or not code:
        return False
    expected = _MFA_STORE.get(username)
    if expected and expected == str(code):
        # once verified, remove the code
        _MFA_STORE.pop(username, None)
        return True
    return False


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> schemas.User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role", "user")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return schemas.User(id=int(payload.get("uid", 0)), username=username, role=role)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")


def require_role(user: schemas.User, roles=("admin",)):
    if user.role not in roles:
        raise HTTPException(status_code=403, detail="Insufficient privileges")
