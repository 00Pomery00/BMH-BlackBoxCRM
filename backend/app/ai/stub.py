"""AI module stubs.

These are placeholders to show structure and integration points for real models.
"""
from typing import Any, Dict


def score_lead(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Return a dummy lead score and explanation."""
    # real implementation would call ML model or external service
    name = payload.get("name", "")
    score = min(100, (len(name) * 3) if name else 0)
    return {
        "score": score,
        "explanation": f"Heuristic based on name length ({len(name)})",
    }


def summarize_communications(messages: str) -> str:
    # trivial summarizer stub
    if not messages:
        return ""
    return messages[:240] + ("..." if len(messages) > 240 else "")
