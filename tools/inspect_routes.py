import importlib
import json
import os

os.chdir(r"C:\BMH\SW\BMHBlackBoxCRM\backend")
app = importlib.import_module("app.main").app
out = []
for r in app.routes:
    p = getattr(r, "path", None)
    if hasattr(r, "endpoint"):
        out.append(
            {
                "path": p,
                "module": getattr(r.endpoint, "__module__", None),
                "name": getattr(r.endpoint, "__name__", None),
            }
        )
    else:
        out.append({"path": p, "type": type(r).__name__})
print(json.dumps(out, indent=2))
