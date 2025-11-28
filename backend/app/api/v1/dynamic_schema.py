from typing import List

from app.core.deps import get_current_user, get_db
from app.models.core import DsRecord, DynamicSchema
from app.schemas.core import DsRecordCreate, DsRecordRead
from app.services.dynamic_schema import SchemaValidationError, validate_against_schema
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.post("/records", response_model=DsRecordRead)
async def create_record(
    payload: DsRecordCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant = current_user.tenant_id
    # validate payload against schema if available for the object_class
    stmt = (
        select(DynamicSchema)
        .where(
            DynamicSchema.object_class == payload.object_class,
            DynamicSchema.tenant_id == tenant,
        )
        .limit(1)
    )
    res = await db.execute(stmt)
    schema = res.scalars().first()
    if schema:
        try:
            validate_against_schema(schema.schema, payload.data)
        except SchemaValidationError as e:
            raise HTTPException(status_code=422, detail=str(e))

    obj = DsRecord(
        object_class=payload.object_class, data=payload.data, tenant_id=tenant
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.get("/records", response_model=List[DsRecordRead])
async def list_records(
    object_class: str = None,
    limit: int = 50,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant = current_user.tenant_id
    stmt = select(DsRecord).where(DsRecord.tenant_id == tenant)
    if object_class:
        stmt = stmt.where(DsRecord.object_class == object_class)
    stmt = stmt.limit(limit)
    res = await db.execute(stmt)
    records = res.scalars().all()
    return records


@router.get("/schemas")
async def list_schemas(
    current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    tenant = current_user.tenant_id
    stmt = select(DynamicSchema).where(DynamicSchema.tenant_id == tenant).limit(100)
    res = await db.execute(stmt)
    items = res.scalars().all()
    return items


@router.post("/schemas", status_code=201)
async def create_schema(
    payload: dict,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant = current_user.tenant_id
    ds = DynamicSchema(
        name=payload.get("name", ""),
        object_class=payload.get("object_class"),
        schema=payload.get("schema", {}),
        tenant_id=tenant,
    )
    db.add(ds)
    await db.commit()
    await db.refresh(ds)
    return ds


@router.get("/schemas/{schema_id}")
async def get_schema(
    schema_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant = current_user.tenant_id
    stmt = select(DynamicSchema).where(
        DynamicSchema.id == schema_id, DynamicSchema.tenant_id == tenant
    )
    res = await db.execute(stmt)
    ds = res.scalars().first()
    if not ds:
        raise HTTPException(status_code=404, detail="schema not found")
    return ds


@router.delete("/schemas/{schema_id}", status_code=204)
async def delete_schema(
    schema_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant = current_user.tenant_id
    stmt = select(DynamicSchema).where(
        DynamicSchema.id == schema_id, DynamicSchema.tenant_id == tenant
    )
    res = await db.execute(stmt)
    ds = res.scalars().first()
    if not ds:
        raise HTTPException(status_code=404, detail="schema not found")
    await db.delete(ds)
    await db.commit()
    return {}
