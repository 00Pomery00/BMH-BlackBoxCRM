from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class CompanyCreate(BaseModel):
    name: str
    data: Optional[Dict[str, Any]] = None
    tenant_id: str


class CompanyRead(BaseModel):
    id: int
    name: str
    data: Optional[Dict[str, Any]] = None
    model_config: ConfigDict = ConfigDict(from_attributes=True)


class DsRecordCreate(BaseModel):
    object_class: str
    data: Dict[str, Any]
    tenant_id: str


class DsRecordRead(BaseModel):
    id: int
    object_class: str
    data: Dict[str, Any]
    model_config: ConfigDict = ConfigDict(from_attributes=True)
