import logging
import logging.handlers
import json
from fastapi import Request

AUDIT_LOG = "bmh_audit.log"

logger = logging.getLogger("bmh.audit")
if not logger.handlers:
    handler = logging.handlers.RotatingFileHandler(AUDIT_LOG, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8")
    formatter = logging.Formatter("%(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


async def audit_middleware(request: Request, call_next):
    user = getattr(request.state, "user", None)
    entry = {
        "ts": request.scope.get("server")[0] if request.scope.get("server") else None,
        "client": request.client.host if request.client else None,
        "method": request.method,
        "path": request.url.path,
        "query": str(request.url.query) if request.url.query else "",
        "user": {"username": getattr(user, "username", None), "role": getattr(user, "role", None)} if user else None,
    }
    # attempt to log pre-call
    logger.info(json.dumps({"event": "request", "data": entry}, ensure_ascii=False))
    response = await call_next(request)
    # log response status
    resp_entry = {"status_code": response.status_code}
    logger.info(json.dumps({"event": "response", "path": request.url.path, "data": resp_entry}, ensure_ascii=False))
    return response
