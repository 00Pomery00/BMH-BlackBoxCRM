"""merge fu_users into users

Revision ID: 0003_merge_fu_users
Revises: 0002_add_fu_users
Create Date: 2025-11-25 00:10:00.000000
"""

# ruff: noqa: E501

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0003_merge_fu_users"
down_revision = "0002_add_fu_users"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    # Ensure target columns exist on `users` table
    users_cols = [c["name"] for c in inspector.get_columns("users")]
    if "is_superuser" not in users_cols:
        op.add_column(
            "users",
            sa.Column(
                "is_superuser",
                sa.Boolean(),
                nullable=False,
                server_default=sa.text("0"),
            ),
        )
    if "is_verified" not in users_cols:
        op.add_column(
            "users",
            sa.Column(
                "is_verified", sa.Boolean(), nullable=False, server_default=sa.text("0")
            ),
        )

    # If fu_users exists, copy non-duplicating rows into users
    tables = inspector.get_table_names()
    if "fu_users" in tables:
        # Insert rows from fu_users where email not already present in users
        conn.execute(
            sa.text(
                """
            INSERT INTO users (email, hashed_password, is_active, role, is_superuser, is_verified)
            SELECT email, hashed_password, CASE WHEN is_active=1 THEN 1 ELSE 0 END,
                   CASE WHEN is_superuser=1 THEN 'admin' ELSE 'user' END,
                   is_superuser, is_verified
            FROM fu_users
            WHERE email IS NOT NULL
              AND email NOT IN (SELECT email FROM users WHERE email IS NOT NULL)
        """
            )
        )


def downgrade():
    # Keep downgrade conservative: remove added columns if present.
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    users_cols = [c["name"] for c in inspector.get_columns("users")]
    if "is_verified" in users_cols:
        op.drop_column("users", "is_verified")
    if "is_superuser" in users_cols:
        op.drop_column("users", "is_superuser")
