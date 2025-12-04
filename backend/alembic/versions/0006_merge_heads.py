"""Merge heads: combine divergent branches into single head for CI

Revision ID: merge_0003_0005
Revises: 0003_create_telemetry_events, 0005_add_automation_flow
Create Date: 2025-11-29 20:00:00
"""

# revision identifiers, used by Alembic.
revision = "merge_0003_0005"
down_revision = ("0003_create_telemetry_events", "0005_add_automation_flow")
branch_labels = None
depends_on = None


def upgrade() -> None:
    # This is a merge-only revision to unify multiple heads; no DB changes.
    pass


def downgrade() -> None:
    # No-op: downgrading a merge node is not supported automatically.
    pass
