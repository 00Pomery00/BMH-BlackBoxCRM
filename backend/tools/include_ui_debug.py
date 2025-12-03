import importlib

from app import main

u = importlib.import_module("app.api.ui_settings")
main.app.include_router(u.router)
print("included ui_settings, /api routes:")
for r in main.app.router.routes:
    if getattr(r, "path", "").startswith("/api"):
        print(r.path, getattr(r, "methods", None))
