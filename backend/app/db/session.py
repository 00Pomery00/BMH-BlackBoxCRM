from contextlib import asynccontextmanager

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine

from app.core.config import settings

engine: AsyncEngine = create_async_engine(
    settings.database_url, echo=False, future=True
)
AsyncSession = async_sessionmaker(engine, expire_on_commit=False)


@asynccontextmanager
async def get_db(tenant_id: str = None):
    async with AsyncSession() as session:
        if tenant_id:
            # set session-local variable used by RLS policies
            await session.execute(text("SET LOCAL bbx.tenant = :t"), {"t": tenant_id})
        yield session


def get_db_dep(tenant_id: str = None):
    async def _dep():
        async with get_db(tenant_id) as s:
            yield s

    return _dep
