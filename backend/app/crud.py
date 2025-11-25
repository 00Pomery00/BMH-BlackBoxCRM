from sqlalchemy.orm import Session
from . import models


def get_companies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Company).offset(skip).limit(limit).all()


def create_company(
    db: Session, name: str, description: str = "", lead_score: float = 0.0
):
    company = models.Company(name=name, description=description, lead_score=lead_score)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def create_lead(db: Session, lead: dict):
    name = lead.get("name") or lead.get("company") or "Unknown"
    score = float(lead.get("lead_score", 0.0))
    return create_company(
        db, name=name, description=lead.get("description", ""), lead_score=score
    )


def find_company_by_name_or_email(db: Session, name: str = None, email: str = None):
    q = db.query(models.Company)
    if name:
        q = q.filter(models.Company.name == name)
    results = q.all()
    if email:
        for comp in results:
            for c in comp.contacts:
                if c.email == email:
                    return comp
    return results[0] if results else None


def create_or_update_lead(db: Session, lead: dict):
    name = lead.get("name") or lead.get("company") or "Unknown"
    email = lead.get("email")
    existing = find_company_by_name_or_email(db, name=name, email=email)
    if existing:
        try:
            new_score = float(lead.get("lead_score", 0.0))
        except Exception:
            new_score = 0.0
        if new_score > (existing.lead_score or 0.0):
            existing.lead_score = new_score
            db.add(existing)
            db.commit()
            db.refresh(existing)
        return existing
    comp = create_company(
        db,
        name=name,
        description=lead.get("description", ""),
        lead_score=float(lead.get("lead_score", 0.0)),
    )
    if email:
        contact = models.Contact(
            company_id=comp.id, name=lead.get("contact_name", name), email=email
        )
        db.add(contact)
        db.commit()
    return comp
