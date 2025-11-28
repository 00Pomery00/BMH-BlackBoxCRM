from typing import Optional

from pydantic import BaseModel, Field


class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = ""


class CompanyCreate(CompanyBase):
    lead_score: Optional[float] = 0.0


class Company(CompanyBase):
    id: int
    lead_score: float

    class Config:
        orm_mode = True


class User(BaseModel):
    id: int = Field(default=0)
    username: Optional[str] = None
    email: Optional[str] = None
    role: str = "user"

    class Config:
        orm_mode = True


class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SessionInfo(BaseModel):
    id: int
    user_id: int
    client: Optional[str] = None
    started_at: Optional[str] = None
    last_seen_at: Optional[str] = None


class TelemetryEventIn(BaseModel):
    event_type: str
    path: Optional[str] = None
    payload: Optional[dict] = None
    user_id: Optional[int] = None

    class Config:
        orm_mode = True
