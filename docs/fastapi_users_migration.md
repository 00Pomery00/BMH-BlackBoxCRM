## FastAPI-Users Migration Plan

This document describes how to migrate from the project's current `users` table
to a consolidated setup using `fastapi-users`.

Goals
- Provide robust user management (registration, password reset, email verification)
- Keep downtime minimal and provide a rollback path

High-level options

1) Conservative: keep existing `users` table and run `fastapi-users` using a
   separate `fu_users` table (current implementation).
   - Pros: minimal schema changes, fast rollout.
   - Cons: duplication of user data if you want a single source of truth.

2) Single-table migration: convert `users` into `fastapi-users` compatible schema
   and use a single table for both existing code and `fastapi-users`.
   - Pros: single source of truth, no duplication.
   - Cons: requires schema migration and careful data transformation.

Recommended approach (stepwise)

1. Deploy conservative path first (already available): `fu_users` table + routers
   under `/fu_auth`. This lets you enable `fastapi-users` features without
   touching existing `users` table.

2. Test registration/login flows against `/fu_auth` and confirm behaviour.

3. Prepare single-table migration (if desired):
   - Add new columns to `users` required by `fastapi-users` (e.g. `is_verified`,
     `is_superuser`, `hashed_password` already exists). Map `is_active` to boolean.
   - Create Alembic revision that adds columns and migrates values from `users`
     to `fu_users` if you choose to consolidate. Use a manual migration script
     that copies data and verifies integrity.

4. Cutover plan:
   - In maintenance window, run migration copying data and switching the app
     to use the single `users` table (update `fastapi_users_impl` or the main
     `fastapi-users` adapter to point at `models.User`).
   - Run smoke tests (register, login, admin) and monitor logs.

5. Rollback plan:
   - If issues, revert the app to the conservative path (`fu_users`) and/or
     restore DB from backup taken pre-migration. The migration should be
     idempotent and reversible if you keep a copy of migrated rows.

Notes and caveats
- Password hashing schemes should be consistent; `fastapi-users` supports
  multiple hashing backends. Verify that `hashed_password` format matches the
  configured password backend (bcrypt/argon2). Add migration logic if needed.
- Update Alembic scripts and CI to run migrations before tests/deploys (done).
- Consider using a feature flag to enable new auth endpoints for subsets of
  users before full migration.

Commands to run locally
```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM\backend'
.\.venv\Scripts\Activate.ps1
python -m alembic -c alembic.ini upgrade head
python -m pytest -q tests
```

If you want, I can prepare the single-table Alembic migration and the data
copy script next.
