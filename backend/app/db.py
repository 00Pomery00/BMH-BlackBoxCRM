import weakref
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from . import models

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'test.db'}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Wrap the sessionmaker so we can keep weakrefs to created Session instances.
_maker = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class SessionFactory:
    def __init__(self, maker):
        self._maker = maker
        self._instances = weakref.WeakSet()

    def __call__(self):
        s = self._maker()
        try:
            self._instances.add(s)
        except Exception:
            pass
        return s

    def expire_all(self):
        for s in list(self._instances):
            try:
                s.expire_all()
            except Exception:
                pass


SessionLocal = SessionFactory(_maker)


# Ensure tables exist and attempt best-effort schema migration for demo
models.Base.metadata.create_all(bind=engine)
try:
    with engine.connect() as conn:
        conn.execute(
            text("ALTER TABLE webhook_queue ADD COLUMN dead INTEGER DEFAULT 0")
        )
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR"))
        conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR"))
        conn.execute(text("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1"))
        conn.commit()
except Exception:
    pass
