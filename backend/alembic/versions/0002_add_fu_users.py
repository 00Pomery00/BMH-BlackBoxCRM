"""add fu_users table

Revision ID: 0002_add_fu_users
Revises: 0001_initial
Create Date: 2025-11-25 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002_add_fu_users"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "fu_users",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")
        ),
        sa.Column(
            "is_superuser", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "is_verified", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
    )


def downgrade():
    op.drop_table("fu_users")
