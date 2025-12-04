# Running BlackBox CRM Locally (without Docker)

This document explains how to run the backend locally for quick development on Windows using SQLite as a temporary local DB.

Prerequisites
- Python 3.11+
- Node.js 18+ (optional for frontend)

Steps (backend only)

1. Create and activate a virtual environment (PowerShell):

```powershell
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
```

2. Install backend dependencies:

```powershell
pip install -r backend/requirements.txt
```

3. Configure environment for local SQLite (temporary):

```powershell
setx DATABASE_URL "sqlite+aiosqlite:///./backend/test.db"
setx SECRET_KEY "dev-secret"
setx ACCESS_TOKEN_EXPIRE_MINUTES 60
```

4. Run the backend (from repo root):

```powershell
cd backend
uvicorn app.main:app --reload --port 8000
```

5. Verify health endpoint:

```powershell
Invoke-RestMethod http://localhost:8000/health
```

Notes
- SQLite is only for local development testing. Production uses Postgres (see `docker-compose.yml`).
- Alembic autogenerate with sqlite can be limited — use Postgres when running migrations for production.
