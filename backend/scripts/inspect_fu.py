import importlib
import traceback
import sys
import os

print("== IMPORTING app.fastapi_users_impl ==")
print("cwd=", os.getcwd())
print("sys.path[0]=", sys.path[0])
print("sys.path sample=", sys.path[:5])

# Ensure project backend/ is on sys.path (when running scripts/*)
proj_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if proj_root not in sys.path:
    sys.path.insert(0, proj_root)
    print("inserted proj_root to sys.path:", proj_root)
try:
    m = importlib.import_module("app.fastapi_users_impl")
    print("MODULE_OK", hasattr(m, "include_fastapi_users_impl"))
except Exception:
    traceback.print_exc()

print("\n== LISTING ROUTES FROM app.main ==")
try:
    from app import main

    print([r.path for r in main.app.routes])
except Exception:
    traceback.print_exc()
