import csv
from io import StringIO

from app import crud
from fastapi.responses import JSONResponse, StreamingResponse


def _filter_companies(
    db, name_contains: str = None, min_score: float = None, max_score: float = None
):
    comps = crud.get_companies(db, skip=0, limit=1000)
    out = []
    for c in comps:
        if name_contains and name_contains.lower() not in (c.name or "").lower():
            continue
        score = float(getattr(c, "lead_score", 0.0) or 0.0)
        if min_score is not None and score < float(min_score):
            continue
        if max_score is not None and score > float(max_score):
            continue
        out.append(c)
    return out


def get_leads_csv_buffer(
    db, name_contains: str = None, min_score: float = None, max_score: float = None
):
    companies = _filter_companies(db, name_contains, min_score, max_score)
    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(["id", "name", "lead_score", "description"])
    for c in companies:
        writer.writerow(
            [
                getattr(c, "id", ""),
                getattr(c, "name", ""),
                getattr(c, "lead_score", ""),
                getattr(c, "description", ""),
            ]
        )
    si.seek(0)
    return si


def leads_csv_response(
    db, name_contains: str = None, min_score: float = None, max_score: float = None
):
    buf = get_leads_csv_buffer(db, name_contains, min_score, max_score)
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads.csv"},
    )


def leads_json_response(
    db, name_contains: str = None, min_score: float = None, max_score: float = None
):
    companies = _filter_companies(db, name_contains, min_score, max_score)
    data = []
    for c in companies:
        data.append(
            {
                "id": getattr(c, "id", None),
                "name": getattr(c, "name", None),
                "lead_score": getattr(c, "lead_score", None),
                "description": getattr(c, "description", None),
            }
        )
    return JSONResponse({"leads": data})


def get_companies_csv_buffer(db):
    companies = crud.get_companies(db)
    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(["id", "name", "email", "website", "lead_score"])
    for c in companies:
        writer.writerow(
            [
                getattr(c, "id", ""),
                getattr(c, "name", ""),
                getattr(c, "email", ""),
                getattr(c, "website", ""),
                getattr(c, "lead_score", ""),
            ]
        )
    si.seek(0)
    return si


def companies_csv_response(db):
    buf = get_companies_csv_buffer(db)
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=companies.csv"},
    )


def companies_json_response(db):
    companies = crud.get_companies(db)
    data = []
    for c in companies:
        data.append(
            {
                "id": getattr(c, "id", None),
                "name": getattr(c, "name", None),
                "email": getattr(c, "email", None),
                "website": getattr(c, "website", None),
                "lead_score": getattr(c, "lead_score", None),
            }
        )
    return JSONResponse({"companies": data})
