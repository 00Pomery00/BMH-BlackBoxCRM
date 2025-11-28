import os
from typing import Optional


class Settings:
    def __init__(self):
        self.project_name: str = os.getenv("BBH_PROJECT_NAME", "BlackBox CRM")
        self.environment: str = os.getenv("BBH_ENVIRONMENT", "development")
        self.database_url: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
        self.redis_url: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
        self.secret_key: str = os.getenv("BBH_SECRET_KEY", "CHANGEME")
        self.access_token_expire_minutes: int = int(
            os.getenv("BBH_ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
        )
        try:
            self.port: int = int(os.getenv("PORT", "8000"))
        except Exception:
            self.port = 8000


settings = Settings()
