from app import security
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_mfa_flow():
    # request a code for user 'tester'
    r = client.post("/mfa/request", json={"username": "tester"})
    assert r.status_code == 200
    data = r.json()
    assert data.get("mfa_code_demo") is not None
    code = data.get("mfa_code_demo")

    # verify correct code
    r2 = client.post("/mfa/verify", json={"username": "tester", "code": code})
    assert r2.status_code == 200
    assert r2.json().get("verified") is True

    # verify that reusing the code fails
    r3 = client.post("/mfa/verify", json={"username": "tester", "code": code})
    assert r3.status_code == 200
    assert r3.json().get("verified") is False


def test_admin_rbac():
    # create tokens with admin and user roles
    admin_token = security.create_access_token(
        {"sub": "adminuser", "uid": 1, "role": "admin"}
    )
    user_token = security.create_access_token(
        {"sub": "normaluser", "uid": 2, "role": "user"}
    )

    # admin can access
    r = client.get("/admin/ping", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert r.json().get("role") == "admin"

    # normal user cannot
    r2 = client.get("/admin/ping", headers={"Authorization": f"Bearer {user_token}"})
    assert r2.status_code == 403
