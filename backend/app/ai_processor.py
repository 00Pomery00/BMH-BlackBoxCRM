import random
from typing import List, Dict, Optional


def score_lead(lead: Dict, seed: Optional[int] = None) -> float:
    if seed is not None:
        random.seed(seed)

    base = 0.0
    if lead.get("lead_score") is not None:
        try:
            base = float(lead.get("lead_score", 0.0))
        except Exception:
            base = 0.0

    if lead.get("email"):
        base += 0.15
    name = lead.get("name") or lead.get("company") or ""
    if len(name) > 10:
        base += 0.05

    noise = (random.random() - 0.5) * 0.08
    score = max(0.0, min(1.0, base + noise))
    return round(score, 4)


def recommend_next_action(score: float) -> str:
    if score >= 0.85:
        return "Call now"
    if score >= 0.6:
        return "Schedule meeting"
    if score >= 0.3:
        return "Nurture via email"
    return "Cold outreach"


def enrich_with_opengov(lead: Dict) -> Dict:
    name = (lead.get("name") or lead.get("company") or "").strip()
    if not name:
        return {}
    return {
        "official_registry_id": f"OG-{abs(hash(name)) % 100000}",
        "industry": "Unknown",
        "enriched": True,
    }


def apply_demo_scoring(
    companies: List[Dict], deterministic: bool = False
) -> List[Dict]:
    scored = []
    for idx, c in enumerate(companies):
        seed = idx if deterministic else None
        sc = score_lead(c, seed=seed)
        action = recommend_next_action(sc)
        enriched = enrich_with_opengov(c)
        item = dict(c)
        item["lead_score"] = sc
        item["recommended_action"] = action
        item.update(enriched)
        scored.append(item)
    return scored
