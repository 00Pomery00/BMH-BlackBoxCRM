---
# BlackBox CRM – jediná vývojová větev a best practices

Tento repozitář obsahuje pouze jednu oficiální vývojovou větev a jedinou pravdu pro vývoj, testování, deployment i dokumentaci.

## Struktura projektu

- `backend/` – FastAPI backend (produkční, testy, migrace, katalog, mock data)
- `web-frontend/` – React frontend (Vite, Playwright, E2E, mock-backend)
- `mobile-addon/` – mobilní demo (volitelně)
- `app.py` – analytický/reportovací nástroj (Streamlit)
- `scripts/`, `tools/`, `docs/`, `design/` – utility, dokumentace, návrhy

Všechny ostatní složky a soubory jsou archivní, pomocné nebo dočasné a nejsou určeny pro další vývoj.

## Rychlý start

### Backend (Windows / PowerShell)
```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM\backend'
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m alembic -c alembic.ini upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM\web-frontend'
npm install
npm run dev
```

### Docker Compose (rychlý staging)
```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM'
docker compose up --build
```

### Testy (backend)
```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM\backend'
.\.venv\Scripts\Activate.ps1
python -m pytest -q
```

### E2E testy (frontend)
```powershell
Set-Location 'C:\BMH\SW\BMH-BlackBoxCRM\web-frontend'
npx playwright test
```

## Best practices a prevence duplicit

- Všechny nové funkce, katalogy, schémata a testy přidávejte pouze do složek `backend/` a `web-frontend/`.
- Před implementací nové funkce vždy zkontrolujte, zda již podobná neexistuje (vyhledávání v kódu, katalogu, testech).
- Všechny manifesty a mock data jsou pouze v `backend/catalog/objects/` a `backend/mock/`.
- Historické a archivní složky (`crm-blackbox/`, `_archive/`, staré frontendy/backendy) jsou pouze pro referenci a nikdy se do nich nevyvíjí.
- Dokumentace, onboarding a návody jsou pouze v tomto README a v `docs/`.
- CI/CD, build a testy jsou popsány v `.github/workflows/` a reflektují pouze tuto strukturu.

## Pravidla pro budoucí vývoj

- Každý nový požadavek musí být nejprve ověřen, zda již není implementován.
- Pokud je potřeba rozšířit katalog, vždy zachovejte zpětnou kompatibilitu a dokumentujte změnu.
- Všechny změny musí být popsány v changelogu nebo v pull requestu.
- Při refaktoringu vždy nejprve archivujte starý kód, až poté mažte.

## Historie a poznámky pro vývojáře

Všechny staré větve, duplicity a experimentální scaffoldy byly přesunuty do archivu nebo odstraněny. Pokud potřebujete historická data, najdete je ve složkách `_archive/` nebo v historii repozitáře.

---
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
Set-Location 'C:\BMH\SW\BMHBlackBoxCRM\backend'
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
Set-Location 'C:\BMH\SW\BMHBlackBoxCRM'
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
Set-Location 'C:\BMH\SW\BMHBlackBoxCRM\web-frontend'
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
