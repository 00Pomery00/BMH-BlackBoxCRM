from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
import datetime

Base = declarative_base()


class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    lead_score = Column(Float, default=0.0)
    description = Column(Text, default="")


class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String)
    email = Column(String, index=True)
    company = relationship("Company", backref="contacts")


class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String)
    value = Column(Float, default=0.0)
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    type = Column(String)
    note = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Integer, default=1)
    role = Column(String, default="user")


class WebhookQueue(Base):
    __tablename__ = "webhook_queue"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    payload = Column(Text, nullable=False)
    attempts = Column(Integer, default=0)
    last_error = Column(Text, default="")
    next_attempt_at = Column(DateTime, default=datetime.datetime.utcnow)
    dead = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
