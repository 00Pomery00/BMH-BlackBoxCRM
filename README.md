# BlackBox CRM — demo

Krátký návod pro spuštění projektu lokálně a v kontejneru.

Lokální vývoj (Windows / PowerShell):

1. Backend

```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM\backend'
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m alembic -c alembic.ini upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Frontend

```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM\web-frontend'
npm install
npm run dev
```

Spuštění v Docker Compose (rychlý staging):

```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM'
docker compose up --build
```

Deployment z CI (artefakty):

1. CI vytvoří artefakty `backend-image.tar` a `frontend-image.tar` (job `build-images`). Stáhněte je z GitHub Actions runu.
2. Na cílovém stroji nahrajte tar soubory a načtěte do Dockeru:

```bash
docker load -i backend-image.tar
docker load -i frontend-image.tar
```

3. Spusťte `docker compose up -d` (přizpůsobte `docker-compose.yml` pro produkční nastavení a sítě).

Automatické pushování do Docker Hubu:

Přidal jsem workflow `.github/workflows/publish-images.yml`, které při pushi na `main` sestaví a pushne obrazy do Docker Hubu pokud jsou nastaveny tyto `secrets` v GitHub repozitáři:

- `DOCKERHUB_USERNAME` — vaše Docker Hub uživatelské jméno
- `DOCKERHUB_TOKEN` — personal access token (nebo heslo) pro Docker Hub

Po nastavení secretů workflow automaticky pushne `blackboxcrm-backend:latest` a `blackboxcrm-frontend:latest` do vašeho Docker Hub účtu.
Testy (backend):

```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM\backend'
.\.venv\Scripts\Activate.ps1
python -m pytest -q
```

Migrace a datová konsolidace `fu_users` → `users`:

```powershell
# preview
python scripts\migrate_fu_users_to_users.py --db ./test.db

# apply (vo výchozím režimu vás skript požádá o potvrzení)
python scripts\migrate_fu_users_to_users.py --db ./test.db --apply
```

Poznámka: projekt je demo; před nasazením do produkce doplňte správu secretů, zálohování a bezpečnostní hardening.
# BlackBoxCRM (demo)

This workspace contains a demo CRM (FastAPI backend, React frontend, mobile addon scaffold).

Quick backend setup (Windows PowerShell):

```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM\backend'
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Run backend tests:

```powershell
# from workspace root
python -m pytest -q backend/tests
```

Environment / secrets
```powershell
# Copy .env.example to .env and set a strong secret in BBH_SECRET_KEY
Copy-Item backend\.env.example backend\.env
# Then ensure venv activated and run as above
```

CI: a GitHub Actions workflow is included at `.github/workflows/ci.yml` which installs backend dependencies and runs tests.
