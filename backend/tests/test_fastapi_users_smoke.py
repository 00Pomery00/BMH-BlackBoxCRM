import uuid
from fastapi.testclient import TestClient

from app.main import app


def test_fu_auth_register_and_login():
    client = TestClient(app)

    # Use a unique email so test is idempotent across DB states
    email = f"smoke+{uuid.uuid4().hex}@example.com"
    password = "Password123"

    # register a new user (email + password)
    payload = {"email": email, "password": password}
    r = client.post("/fu_auth/register", json=payload)

    # If the user already exists we accept 400 (REGISTER_USER_ALREADY_EXISTS)
    assert r.status_code in (201, 200, 400)

    # login via JWT auth
    login_payload = {"username": email, "password": password}
    r2 = client.post("/fu_auth/jwt/login", data=login_payload)
    # fastapi-users returns 200 and JSON token on success
    assert r2.status_code in (200, 201)
    d = r2.json()
    assert "access_token" in d or "token" in d or "detail" not in d
