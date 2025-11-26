import json
import logging
import time
from typing import Any, Dict, List, Tuple

from jsonschema import Draft7Validator

from . import crud, integrations

logger = logging.getLogger(__name__)

# Allowed action types and a simple schema for validation
ALLOWED_ACTIONS = ["create_lead", "send_webhook", "delay"]

FLOW_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "steps": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "type": {"type": "string", "enum": ALLOWED_ACTIONS},
                    "params": {"type": "object"},
                },
                "required": ["type"],
            },
        },
    },
    "required": ["steps"],
}

validator = Draft7Validator(FLOW_SCHEMA)


def validate_flow(definition: str) -> Tuple[bool, List[str]]:
    """Validate a flow definition JSON string against the safe schema.

    Returns (is_valid, errors)
    """
    try:
        d = json.loads(definition)
    except Exception as e:
        return False, [f"invalid JSON: {e}"]

    errors = []
    for err in validator.iter_errors(d):
        errors.append(f"{err.message} at {'/'.join(map(str, err.absolute_path))}")
    return (len(errors) == 0), errors


def execute_flow(
    db, flow, context: Dict[str, Any] = None, dry_run: bool = False
) -> Dict[str, Any]:
    """
    Execute a validated flow definition.

    Only a small whitelisted set of actions are allowed.

    Returns dict with run results and any errors.
    """
    results = {"steps": []}
    context = context or {}
    try:
        definition = json.loads(flow.definition)
    except Exception as e:
        return {"ok": False, "error": f"invalid flow JSON: {e}"}

    steps = definition.get("steps", [])
    for step in steps:
        step_id = step.get("id")
        typ = step.get("type")
        params = step.get("params", {})
        entry = {"id": step_id, "type": typ}
        try:
            if typ == "create_lead":
                if dry_run:
                    entry["result"] = "dry-run: would create lead"
                else:
                    lead = params.get("lead", {})
                    comp = crud.create_or_update_lead(db, lead)
                    entry["result"] = {"lead_id": comp.id}
            elif typ == "send_webhook":
                if dry_run:
                    entry["result"] = "dry-run: would enqueue webhook"
                else:
                    url = params.get("url")
                    payload = params.get("payload", {})
                    # Enqueue via existing integrations helper
                    w = integrations.enqueue_webhook(db, url, payload)
                    entry["result"] = {"webhook_id": w.id}
            elif typ == "delay":
                # delay in seconds
                secs = float(params.get("seconds", 1))
                if not dry_run:
                    time.sleep(
                        min(secs, 5)
                    )  # limit max blocking sleep to 5s for safety
                entry["result"] = {"slept": secs}
            else:
                entry["error"] = "unsupported action"
        except Exception as e:
            logger.exception("automation step failed: %s", e)
            entry["error"] = str(e)
        results["steps"].append(entry)
    return {"ok": True, "results": results}
