Usage:

Run migrations from the `backend` folder using the alembic CLI. Example:

```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM\backend'
# create a virtualenv and install alembic if not present
python -m venv .venv && .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt alembic
alembic -c alembic.ini upgrade head
```

This project includes a simple first migration `0001_initial` which uses the SQLAlchemy
models metadata to create tables. For production workflows, replace with explicit
column-level migrations and commit them to `backend/alembic/versions/`.
