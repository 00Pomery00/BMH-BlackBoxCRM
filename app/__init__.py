"""Top-level ``app`` package that exposes the backend implementation.

This package adjusts its import search path so that imports like
``import app.core`` or ``from app import users`` resolve to the
``backend/app/*`` tree. That mirrors the behaviour when running from
the ``backend`` working directory and avoids needing to change all
internal import sites.

We avoid importing submodules at package import time to prevent side
effects; only the import machinery will load the requested submodule
from the backend implementation when needed.
"""

import os
from pathlib import Path

# If the backend implementation exists at ./backend/app, add it to the
# package search path so submodule imports (e.g. `import app.core`)
# find files under backend/app.
_ROOT = Path(__file__).resolve().parent
# backend/app is a sibling of this `app/` directory at the repository root
_BACKEND_APP = str((_ROOT.parent / "backend" / "app").resolve())
if os.path.isdir(_BACKEND_APP):
    # Prepend so the repo-local shim does not override files under
    # backend/app when the import system searches for submodules.
    __path__.insert(0, _BACKEND_APP)

__all__ = []
