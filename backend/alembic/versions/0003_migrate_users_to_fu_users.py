# ruff: noqa: E501
"""migrate existing users into fu_users

Revision ID: 0003_migrate_users_to_fu_users
Revises: 0002_add_fu_users
Create Date: 2025-11-25 00:10:00.000000
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0003_migrate_users_to_fu_users"
down_revision = "0002_add_fu_users"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    # Insert users into fu_users if not already present. For users without an
    # email, construct a fallback from username.
    insert_sql = """
        INSERT INTO fu_users (email, hashed_password, is_active, is_superuser, is_verified)
        SELECT
            CASE WHEN email IS NOT NULL AND email != '' THEN email ELSE username || '@local' END as email,
            COALESCE(hashed_password, '') as hashed_password,
            CASE WHEN is_active = 1 THEN 1 ELSE 0 END as is_active,
            CASE WHEN role = 'admin' THEN 1 ELSE 0 END as is_superuser,
            0 as is_verified
        FROM users
        WHERE (email IS NOT NULL OR username IS NOT NULL)
            AND NOT EXISTS (
                SELECT 1 FROM fu_users fu WHERE fu.email = (CASE WHEN users.email IS NOT NULL AND users.email != '' THEN users.email ELSE users.username || '@local' END)
            );
        """
    conn.execute(sa.text(insert_sql))


def downgrade():
    conn = op.get_bind()
    # Best-effort: remove rows that look like migrated entries (those with @local)
    delete_sql = """
        DELETE FROM fu_users WHERE email LIKE '%@local' OR email IN (SELECT email FROM users WHERE email IS NOT NULL AND email != '');
        """
    conn.execute(sa.text(delete_sql))
