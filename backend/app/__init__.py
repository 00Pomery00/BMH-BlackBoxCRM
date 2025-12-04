"""App package initializer.

Avoid importing :mod:`app.main` at package import time because that module
performs side-effects (creates DB tables) which interfere with Alembic's
runtime when Alembic imports ``app.models`` during migrations. Import
``app.main`` lazily from callers that actually need the FastAPI ``app``
instance.
"""

__all__ = []
