"""Safe migration helper: copy rows from `fu_users` into `users`.

Usage:
  python migrate_fu_users_to_users.py --dry-run
  python migrate_fu_users_to_users.py --apply

The script is careful: it will not overwrite existing users with the same email.
It prints a summary of planned inserts. When run with `--apply` it performs the inserts
inside a transaction.
"""

import argparse
import sqlite3
import os
import sys
# ruff: noqa: E501


def get_db_path():
    # Use ALEMBIC config default if present, else fallback to ./test.db
    return os.path.join(os.path.dirname(__file__), "..", "..", "test.db")


def plan_migration(conn):
    cur = conn.cursor()
    # Ensure tables exist
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='fu_users'")
    if not cur.fetchone():
        print("No `fu_users` table found; nothing to do.")
        return []

    cur.execute(
        "SELECT email, hashed_password, is_active, is_superuser, is_verified FROM fu_users WHERE email IS NOT NULL"
    )
    fu_rows = cur.fetchall()

    planned = []
    for email, hashed_password, is_active, is_superuser, is_verified in fu_rows:
        cur.execute("SELECT 1 FROM users WHERE email = ? LIMIT 1", (email,))
        if cur.fetchone():
            # Skip existing user
            continue
        role = "admin" if is_superuser else "user"
        planned.append(
            (
                email,
                hashed_password or "",
                int(is_active or 0),
                role,
                int(is_superuser or 0),
                int(is_verified or 0),
            )
        )

    return planned


def apply_migration(conn, planned):
    cur = conn.cursor()
    cur.execute("BEGIN")
    try:
        for row in planned:
            cur.execute(
                "INSERT INTO users (email, hashed_password, is_active, role, is_superuser, is_verified) VALUES (?, ?, ?, ?, ?, ?)",
                row,
            )
        conn.commit()
    except Exception:
        conn.rollback()
        raise


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Perform the migration")
    parser.add_argument("--db", default=None, help="Path to sqlite DB file")
    args = parser.parse_args()

    db_path = args.db or get_db_path()
    db_path = os.path.abspath(db_path)

    if not os.path.exists(db_path):
        print(f"DB not found at {db_path}")
        sys.exit(1)

    conn = sqlite3.connect(db_path)
    try:
        planned = plan_migration(conn)
        print(f"Planned inserts: {len(planned)}")
        if planned:
            for p in planned[:20]:
                print("  ", p[0], "role=", p[3])
            if len(planned) > 20:
                print(f"  ... and {len(planned)-20} more")
        else:
            print("Nothing to insert.")

        if args.apply:
            confirm = input("Apply these changes? type YES to continue: ")
            if confirm == "YES":
                apply_migration(conn, planned)
                print("Applied.")
            else:
                print("Aborted by user.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
