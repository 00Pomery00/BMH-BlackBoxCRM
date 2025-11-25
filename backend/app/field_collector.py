from typing import Dict


def collect_lead_from_mobile(payload: Dict) -> Dict:
    lead = {
        "name": payload.get("name") or payload.get("company") or "Unknown",
        "lead_score": float(payload.get("lead_score", 0.0)),
        "source": payload.get("source", "mobile"),
    }
    return lead
