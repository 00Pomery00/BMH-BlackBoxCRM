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
    username: str
    role: str = "user"

    class Config:
        orm_mode = True
