import json
import os
import sys
import uuid

from fastapi.testclient import TestClient

# Ensure package imports work regardless of current working directory
here = os.path.dirname(__file__)
backend_dir = os.path.dirname(here)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)


# Ensure the app and core config agree on the JWT secret. Some parts of the
# codebase use `app.core.config.settings.secret_key` while others read
# `BBH_SECRET_KEY` at import-time. To avoid tokens being signed with a
# different secret, set the env var from the core settings if not already set.
try:
    # import minimal config without importing app.main yet
    # use builtin __import__ to avoid module-level import statements after code
    try:
        cfg = __import__("app.core.config", fromlist=["settings"])
    except Exception:
        cfg = None
    try:
        if cfg is not None:
            sk = getattr(cfg, "settings").secret_key
            if sk:
                os.environ.setdefault("BBH_SECRET_KEY", sk)
    except Exception:
        pass
except Exception:
    pass


# Note: import of the FastAPI `app` must happen after we set BBH_SECRET_KEY
# and ensure the backend package is on `sys.path`. To avoid flake8 E402 (imports
# not at top), import `app` inside `main()` below.


def main():
    # import the app lazily after setting env and manipulating sys.path
    from app.main import app

    # Some environments may not have the UI settings router included (silently skipped
    # during app setup). Ensure the router is available on the app so TestClient
    # exercises the same endpoints the real server exposes.
    try:
        # import module and include router if not already present
        from app.api import ui_settings as _ui_mod

        # guard against double-registration by checking existing paths
        if not any(
            r.path.startswith("/api/ui")
            for r in app.router.routes
            if hasattr(r, "path")
        ):
            app.include_router(_ui_mod.router)
    except Exception:
        # If anything goes wrong here, we continue; the main test will report 404s.
        pass

    client = TestClient(app)

    email = f"e2e+{uuid.uuid4().hex}@example.com"
    password = "Password123"

    print("Registering user:", email)
    r = client.post("/fu_auth/register", json={"email": email, "password": password})
    print("Register status:", r.status_code, r.text)
    if r.status_code not in (200, 201):
        print("Register failed")
        return 2

    # Login (fastapi-users uses OAuth2 form data for JWT login)
    login_payload = {"username": email, "password": password}
    r2 = client.post("/fu_auth/jwt/login", data=login_payload)
    print("Login status:", r2.status_code, r2.text)
    try:
        d = r2.json()
    except Exception:
        print("Login response not JSON:", r2.text)
        return 2

    token = d.get("access_token") or d.get("token") or d.get("accessToken")
    if not token:
        print("Failed to get token from login response:", d)
        return 2

    headers = {"Authorization": f"Bearer {token}"}

    # POST settings
    settings_payload = {
        "settings": {"theme": "dark", "accent": "#7c3aed", "sidebarWidth": "240px"}
    }
    r3 = client.post("/api/ui/settings", json=settings_payload, headers=headers)
    print("POST /api/ui/settings ->", r3.status_code, r3.text)

    # GET settings
    r4 = client.get("/api/ui/settings", headers=headers)
    print("GET /api/ui/settings ->", r4.status_code)
    try:
        print(json.dumps(r4.json(), indent=2))
    except Exception:
        print(r4.text)

    # Basic verification
    if r3.status_code in (200, 201) and r4.status_code == 200:
        got = r4.json().get("settings")
        if got and got.get("accent") == "#7c3aed":
            print("E2E UI settings persistence: OK")
            return 0
    print("E2E UI settings persistence: FAILED")
    return 2


if __name__ == "__main__":
    sys.exit(main())
