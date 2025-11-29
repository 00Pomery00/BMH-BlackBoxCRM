import uuid

from fastapi.testclient import TestClient

from app.main import app


def test_fu_auth_register_and_login():
    client = TestClient(app)

    # Use a unique email per test run so the test is idempotent across DB states
    email = f"smoke+{uuid.uuid4().hex}@example.com"
    pwd = "TestPass123!"

    # Register
    r = client.post("/fu_auth/register", json={"email": email, "password": pwd})
    assert r.status_code in (200, 201), f"register failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("email") == email

    # Login (JWT auth uses OAuth2 form; endpoint under /fu_auth/jwt/login)
    r2 = client.post("/fu_auth/jwt/login", data={"username": email, "password": pwd})
    assert r2.status_code == 200, f"login failed: {r2.status_code} {r2.text}"
    token_data = r2.json()
    assert "access_token" in token_data
