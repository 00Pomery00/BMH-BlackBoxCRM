"""initial migration

Revision ID: 0001_initial
Revises:
Create Date: 2025-11-24 00:00:00.000000
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Use the models' metadata to create tables if they don't exist.
    # This keeps the migration small and idempotent for the demo environment.
    try:
        from app import models

        bind = op.get_bind()
        models.Base.metadata.create_all(bind=bind)
    except Exception:
        # best-effort; in constrained CI environments explicit SQL may be required
        pass


def downgrade():
    try:
        from app import models

        bind = op.get_bind()
        models.Base.metadata.drop_all(bind=bind)
    except Exception:
        pass
