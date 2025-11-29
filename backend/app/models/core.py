from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.models.base import Base


class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    data = Column(JSONB, nullable=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())


class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())

    company = relationship("Company")


class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    name = Column(String(255), nullable=False)
    lead_score = Column(Integer, default=0)
    data = Column(JSONB, nullable=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())

    company = relationship("Company")


class DynamicSchema(Base):
    __tablename__ = "dynamic_schemas"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    object_class = Column(String(64), nullable=False, index=True)
    schema = Column(JSONB, nullable=False)
    version = Column(Integer, default=1)
    tenant_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())


class DsRecord(Base):
    __tablename__ = "ds_records"
    id = Column(Integer, primary_key=True)
    object_class = Column(String(64), nullable=False, index=True)
    data = Column(JSONB, nullable=False)
    tenant_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(Integer, primary_key=True)
    actor = Column(String(255), nullable=True)
    action = Column(String(255), nullable=False)
    object_class = Column(String(64), nullable=True)
    object_id = Column(Integer, nullable=True)
    before = Column(JSONB, nullable=True)
    after = Column(JSONB, nullable=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(150), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String(64), default="user")
    tenant_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())


class UserSession(Base):
    __tablename__ = "user_sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String(2048), nullable=True)
    client = Column(String(512), nullable=True)
    started_at = Column(DateTime, server_default=func.now())
    last_seen_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    ended_at = Column(DateTime, nullable=True)
    tenant_id = Column(String(64), nullable=False, index=True)


class TelemetryEvent(Base):
    __tablename__ = "telemetry_events"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True, index=True)
    event_type = Column(String(128), nullable=False, index=True)
    path = Column(String(1024), nullable=True)
    payload = Column(JSONB, nullable=True)
    client = Column(String(512), nullable=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())
