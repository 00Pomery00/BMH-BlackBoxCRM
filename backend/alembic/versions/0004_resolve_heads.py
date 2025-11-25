"""resolve multiple heads

Revision ID: 0004_resolve_heads
Revises: 0003_migrate_users_to_fu_users, 0003_merge_fu_users
Create Date: 2025-11-25 00:20:00.000000
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '0004_resolve_heads'
down_revision = ('0003_migrate_users_to_fu_users', '0003_merge_fu_users')
branch_labels = None
depends_on = None


def upgrade():
    # This migration intentionally merges two divergent heads into a single linear history.
    # No schema changes required here; data-moving migrations were performed earlier in the two heads.
    pass


def downgrade():
    pass
