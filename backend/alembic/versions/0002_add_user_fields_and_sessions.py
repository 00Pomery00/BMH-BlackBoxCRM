"""add username, role and user_sessions table

Revision ID: 0002_add_user_fields_and_sessions
Revises: 0001_initial
Create Date: 2025-11-27 00:00:00.000000
"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0002_add_user_fields_and_sessions"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add optional username column
    try:
        op.add_column(
            "users",
            sa.Column("username", sa.String(length=150), nullable=True),
        )
    except Exception:
        pass

    # Add role column with default
    try:
        op.add_column(
            "users",
            sa.Column(
                "role", sa.String(length=64), nullable=False, server_default="user"
            ),
        )
    except Exception:
        pass

    # Create user_sessions table
    try:
        op.create_table(
            "user_sessions",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=False, index=True),
            sa.Column("token", sa.String(length=2048), nullable=True),
            sa.Column("client", sa.String(length=512), nullable=True),
            sa.Column("started_at", sa.DateTime(), server_default=sa.func.now()),
            sa.Column(
                "last_seen_at",
                sa.DateTime(),
                server_default=sa.func.now(),
                onupdate=sa.func.now(),
            ),
            sa.Column("ended_at", sa.DateTime(), nullable=True),
            sa.Column("tenant_id", sa.String(length=64), nullable=False),
        )
    except Exception:
        pass


def downgrade() -> None:
    try:
        op.drop_table("user_sessions")
    except Exception:
        pass

    try:
        op.drop_column("users", "role")
    except Exception:
        pass

    try:
        op.drop_column("users", "username")
    except Exception:
        pass
