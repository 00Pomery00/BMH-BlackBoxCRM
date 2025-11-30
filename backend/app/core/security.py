import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
ALGORITHM = "HS256"

_logger = logging.getLogger("app.core.security")


def _truncate_password_to_bcrypt_limit(password: Optional[str]) -> str:
    # bcrypt limit: 72 bytes. Work at the byte level to avoid multi-byte surprises.
    if password is None:
        return ""
    pw = str(password)
    b = pw.encode("utf-8", errors="ignore")
    if len(b) <= 72:
        return pw
    _logger.warning(
        "Password longer than 72 bytes detected; truncating to bcrypt limit"
    )
    truncated = b[:72]
    # decode back to str, ignore partial multibyte sequences at the end
    return truncated.decode("utf-8", errors="ignore")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password = _truncate_password_to_bcrypt_limit(plain_password)
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    pw = _truncate_password_to_bcrypt_limit(password)
    return pwd_context.hash(pw)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return {}
