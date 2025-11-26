import json as _json
import os
from pathlib import Path
from urllib.parse import parse_qs as _parse_qs

from fastapi import APIRouter, Form, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from . import models, security
from .main import SessionLocal

router = APIRouter()


class ShimRegister(BaseModel):
    email: str
    password: str


def _dump_debug(tag: str, request: Request, extra: bytes | None = None) -> None:
    try:
        header_lines = []
        for k, v in request.headers.items():
            header_lines.append(f"{k}: {v}")
        body = b""
        try:
            body = (
                request._body
                if hasattr(request, "_body") and request._body is not None
                else b""
            )
        except Exception:
            body = b""
        if extra:
            body = body + b"\n" + extra
        # Write to an absolute log path inside the backend folder so it's
        # discoverable regardless of the process CWD.
        try:
            backend_dir = Path(__file__).resolve().parents[1]
            log_path = backend_dir.joinpath("login_debug.log")
            os.makedirs(str(log_path.parent), exist_ok=True)
        except Exception:
            log_path = Path("login_debug.log")

        with open(log_path, "ab") as f:
            f.write(b"---%s---\n" % tag.encode())
            f.write(b"HEADERS:\n")
            f.write(("\n".join(header_lines) + "\n").encode())
            f.write(b"BODY:\n")
            try:
                f.write(body + b"\n")
            except Exception:
                try:
                    f.write(str(body).encode(errors="ignore") + b"\n")
                except Exception:
                    pass
    except Exception:
        # never fail the request due to logging
        pass


@router.post("/fu_auth/register")
async def fu_register(request: Request):
    """Compatibility-register: accept JSON or form data (urlencoded/multipart).

    This mirrors the flexibility of fastapi-users endpoints used by the E2E suite.
    Returns 201 on created, 400 if user exists.
    """
    email = None
    password = None

    # Dump raw body for debugging (always)
    try:
        raw_body = await request.body()
        _dump_debug("FU_REGISTER_BODY", request, raw_body)
    except Exception:
        try:
            _dump_debug("FU_REGISTER_BODY", request, None)
        except Exception:
            pass

    # Try JSON body first
    try:
        body = raw_body if "raw_body" in locals() else await request.body()
        if body:
            s = body.decode(errors="ignore")
            try:
                parsed = _json.loads(s)
                if isinstance(parsed, dict):
                    inner = parsed.get("data") or parsed.get("json") or parsed
                    if isinstance(inner, dict):
                        email = inner.get("email") or inner.get("username")
                        password = inner.get("password")
                    else:
                        email = parsed.get("email") or parsed.get("username")
                        password = parsed.get("password")
            except Exception:
                # try urlencoded parse
                try:
                    q = _parse_qs(s)
                    email = (q.get("email") or q.get("username") or [None])[0]
                    password = (q.get("password") or [None])[0]
                except Exception:
                    pass
    except Exception:
        pass

    # Fallback to form parsing
    if not email or not password:
        try:
            form = await request.form()
            email = email or (form.get("email") or form.get("username"))
            password = password or form.get("password")
        except Exception:
            pass

    if not email or not password:
        try:
            raw = await request.body()
            _dump_debug("REGISTER_MISSING_FIELDS", request, raw)
        except Exception:
            try:
                _dump_debug("REGISTER_MISSING_FIELDS", request, None)
            except Exception:
                pass
        raise HTTPException(status_code=422, detail="email and password required")

    db: Session = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="REGISTER_USER_ALREADY_EXISTS")
        hashed = security.pwd_context.hash(password)
        u = models.User(username=email, email=email, hashed_password=hashed)
        db.add(u)
        db.commit()
        db.refresh(u)
        return {"email": u.email, "id": u.id}
    finally:
        db.close()


@router.post("/fu_auth/jwt/login")
async def fu_login(request: Request):
    """Compatibility shim for Playwright E2E: accept form-data or JSON.

    Some test clients send form-encoded fields (`username`, `password`),
    others send JSON. Support both to avoid 422 errors during E2E.
    """
    username = None
    password = None

    # Dump raw body for debugging (always)
    try:
        raw_body = await request.body()
        _dump_debug("FU_LOGIN_BODY", request, raw_body)
    except Exception:
        try:
            _dump_debug("FU_LOGIN_BODY", request, None)
        except Exception:
            pass

    # Try JSON or urlencoded in body
    try:
        body = raw_body if "raw_body" in locals() else await request.body()
        if body:
            s = body.decode(errors="ignore")
            try:
                parsed = _json.loads(s)
                if isinstance(parsed, dict):
                    inner = parsed.get("data") or parsed.get("json") or parsed
                    if isinstance(inner, dict):
                        username = inner.get("username") or inner.get("email")
                        password = inner.get("password")
                    else:
                        username = parsed.get("username") or parsed.get("email")
                        password = parsed.get("password")
            except Exception:
                try:
                    q = _parse_qs(s)
                    username = (q.get("username") or q.get("email") or [None])[0]
                    password = (q.get("password") or [None])[0]
                except Exception:
                    pass
    except Exception:
        pass

    # Fallback to form parsing
    if not username or not password:
        try:
            form = await request.form()
            username = username or (form.get("username") or form.get("email"))
            password = password or form.get("password")
        except Exception:
            pass

    if not username or not password:
        try:
            raw = await request.body()
            _dump_debug("LOGIN_MISSING_FIELDS", request, raw)
        except Exception:
            try:
                _dump_debug("LOGIN_MISSING_FIELDS", request, None)
            except Exception:
                pass
        raise HTTPException(status_code=422, detail="username and password required")

    db: Session = SessionLocal()
    try:
        u = db.query(models.User).filter(models.User.email == username).first()
        if not u or not u.hashed_password:
            raise HTTPException(status_code=401, detail="invalid credentials")
        if not security.pwd_context.verify(password, u.hashed_password):
            raise HTTPException(status_code=401, detail="invalid credentials")
        token = security.create_access_token(
            {"sub": u.email, "uid": u.id, "role": u.role}
        )
        return {"access_token": token, "token_type": "bearer"}
    finally:
        db.close()
