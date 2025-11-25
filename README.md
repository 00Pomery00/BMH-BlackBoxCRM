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

Triggerování nasazení přes GitHub Actions (SSH)

1. V GitHub Actions UI otevřete workflow `Deploy via SSH (from artifacts)` (soubor `.github/workflows/deploy-via-ssh.yml`) a spusťte ho ručně (`Run workflow`).
2. Workflow stáhne artifacty pojmenované `docker-images` (očekává `backend-image.tar` a `frontend-image.tar`) a přenese je na vzdálený host přes `scp`.
3. Na vzdáleném hostu se obrazy načtou (`docker load`) a spustí se `docker compose up -d`.

Požadované `secrets` v repozitáři (Settings → Secrets):

- `DEPLOY_SSH_KEY` — privátní SSH klíč (obsah souboru, včetně hlavičky `-----BEGIN OPENSSH PRIVATE KEY-----`).
- `DEPLOY_HOST` — uživatel a host (např. `ubuntu@1.2.3.4`).
- `DEPLOY_DIR` — cílový adresář na vzdáleném stroji, kam se nahrají tar soubory (např. `/home/ubuntu/deploy`).

Poznámka: workflow vypíná kontrolu host key (`StrictHostKeyChecking=no`) pro pohodlí; v produkci raději přidejte ověřování host keys.
Pro bezpečnější nasazení můžete do `Secrets` přidat také:

- `DEPLOY_KNOWN_HOSTS` — obsah souboru `known_hosts` (výstup `ssh-keyscan your.host`), workflow pak použije ověřování host key namísto vypnutí kontroly.

Runbook: bezpečná produkční migrace `fu_users` → `users`

1. Zálohujte databázi a soubory (nezbytné):

```powershell
Copy-Item backend\test.db backend\test.db.bak
# nebo dump v produkci podle DB engine
```

2. Spusťte preview migrace:

```powershell
python scripts\migrate_fu_users_to_users.py --db ./backend/test.db --dry-run
```

3. Pokud preview vypadá správně, spusťte migraci v režimu apply (nejlépe v maintenance okně):

```powershell
python scripts\migrate_fu_users_to_users.py --db ./backend/test.db --apply
```

4. Ověřte integritu dat (počty uživatelů, mapping emailů) a proveďte rollback z backupu, pokud je potřeba.

5. Po úspěšné migraci můžete odstranit staré `fu_users` tabulky pomocí Alembic migrace nebo ručně s db adminem.

Poznámka: v produkci proveďte migraci na read-only módu nebo s maintenance stránkou, aby se zabránilo konkurenčním zápisům během převodu.
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

Release & Versioning

This repository uses a simple semantic versioning approach for releases. To prepare a release locally, create an annotated git tag and optionally build images for distribution.

I included a small helper script `scripts/prepare_release.ps1` (PowerShell) which prints the recommended commands to create a tag, build Docker images and save them as tar artifacts. The script does not perform remote pushes — it only prepares the steps so you can review and run them yourself.

Example usage (PowerShell):

```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM'
.\scripts\prepare_release.ps1 v1.0.0

# then locally create and push tag when ready
git tag -a v1.0.0 -m 'Release v1.0.0'
git push origin v1.0.0
```

If you want me to push tags or images to a remote repository or registry, tell me and provide the remote URL (I will not push without explicit permission).

Playwright E2E (lokálně a v CI)

Spuštění E2E lokálně (rychlý návod):

1) Připrav frontend a nainstalujte Playwright browsere:

```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM\web-frontend'
npm ci
npm run build
npx playwright install --with-deps
```

2) Spustit testy bez backendu (používá `file://` build):

```powershell
# z adresáře web-frontend
npx playwright test
```

3) Spustit testy proti lokálnímu backendu (seedování provádějí testy samy):

```powershell
# nastavte proměnné prostředí a spusťte testy
$env:BACKEND_URL = 'http://localhost:8000'
$env:FRONTEND_URL = 'http://localhost:5173' # volitelné, pokud používáte dev server
npx playwright test
```

Poznámky:
- Testy v `web-frontend/e2e/tests` obsahují scénáře, které mohou:
	- seedovat leady přes `/mobile/leads` (pokud je `BACKEND_URL` dostupné),
	- registrovat uživatele a přihlásit se přes `/fu_auth/register` a `/fu_auth/jwt/login` pro API-based login.
- CI obsahuje job `e2e-with-backend`, který spustí backend v runneru, provede migrace, buildne frontend, spustí Playwright a nahraje trace/artefakty (`playwright-results`, `playwright-report`, `backend.log`) pro snadné ladění selhání.
