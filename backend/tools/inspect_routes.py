import importlib
import os
import sys
import traceback

print("cwd=", os.getcwd())
print("sys.path[0]=", sys.path[0])
print("sys.path sample=", sys.path[:5])

# Ensure project root (backend) is on sys.path so 'app' package can be imported
proj_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if proj_root not in sys.path:
    sys.path.insert(0, proj_root)
    print("Inserted proj_root to sys.path:", proj_root)

print("Inspecting fastapi_users_impl import...")
try:
    m = importlib.import_module("app.fastapi_users_impl")
    print("fastapi_users_impl imported:", getattr(m, "__name__", repr(m)))
except Exception:
    print("fastapi_users_impl import failed:")
    traceback.print_exc()

print("\nInspecting app.main routes...")
try:
    import app.main as main

    print([r.path for r in main.app.routes])
except Exception:
    print("app.main import failed:")
    traceback.print_exc()
