import pytest

from backend.app.services.dynamic_schema import (
    SchemaValidationError,
    validate_against_schema,
)


def test_validate_missing_required():
    schema = {
        "fields": [
            {"id": "name", "type": "string", "required": True},
            {"id": "score", "type": "integer", "required": False},
        ]
    }
    payload = {"score": 10}
    with pytest.raises(SchemaValidationError):
        validate_against_schema(schema, payload)


def test_validate_ok():
    schema = {"fields": [{"id": "name", "type": "string", "required": True}]}
    payload = {"name": "ACME"}
    # should not raise
    validate_against_schema(schema, payload)
