"""create telemetry events table

Revision ID: 0003_create_telemetry_events
Revises: 0002_add_user_fields_and_sessions
Create Date: 2025-11-27 00:00:00.000001
"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0003_create_telemetry_events"
down_revision = "0002_add_user_fields_and_sessions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    try:
        op.create_table(
            "telemetry_events",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=True, index=True),
            sa.Column("event_type", sa.String(length=128), nullable=False),
            sa.Column("path", sa.String(length=1024), nullable=True),
            sa.Column("payload", sa.JSON(), nullable=True),
            sa.Column("client", sa.String(length=512), nullable=True),
            sa.Column("tenant_id", sa.String(length=64), nullable=False),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        )
    except Exception:
        pass


def downgrade() -> None:
    try:
        op.drop_table("telemetry_events")
    except Exception:
        pass
