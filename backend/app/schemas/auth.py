from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    tenant_id: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    model_config: ConfigDict = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
