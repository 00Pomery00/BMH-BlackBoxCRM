"""add automation flow table

Revision ID: 0005_add_automation_flow
Revises: 0004_resolve_heads
Create Date: 2025-11-25 00:40:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0005_add_automation_flow"
down_revision = "0004_resolve_heads"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "automation_flows",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("definition", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Integer(), nullable=False, server_default="1"),
        sa.Column(
            "allow_advanced_edit", sa.Integer(), nullable=False, server_default="0"
        ),
        sa.Column("protected", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=True),
    )


def downgrade():
    op.drop_table("automation_flows")
