# Projekt — souhrn a ASCII přehled

Datum: 25. listopadu 2025

Krátké shrnutí stavu projektu
- Backend: FastAPI + SQLAlchemy + Alembic. Autentizace: `fastapi-users` (volitelně) plus shim pro testy. Implementovány moduly: `integrations` (webhook queue), `automation` (admin flows), `ai_processor`, `gamification`, `reporting`.
- Frontend: Vite + React + Tailwind. E2E testy: Playwright (file:// fallback pro CI).
- CI: GitHub Actions — `ci.yml`, image build + artifact upload, conditional publish jobs, `deploy-via-ssh` workflow.
- Admin: `sqladmin` integration (optional). API pro správu automatizací přístupné pod `/admin/automations` (role `admin`).
- Dokumentace: `docs/` obsahuje audit, tests-report, automation guide, Notion-friendly materiály.

Co je dokončeno (vybrané):
- Unit tests: backend 24 passed.
- Bezpečnostní a statické skeny: `pip-audit`, `ruff`, `mypy` spuštěny — výsledky v `docs/tests-report.md`.
- Přidána `AutomationFlow` funkce (model, migration, admin API, runner) s bezpečným schematem a whitelist akcí.
- Vytvořeny pomocné runbooky a dokumenty v `docs/`.

Další prioritní kroky:
- Dokončit kódový audit (ruší se ruff/mypy chyby), opravit nalezené security findings.
- Upravit CI tak, aby E2E job spouštěl backend (migrace + uvicorn) před Playwright testy.
- Přidat UI pro správu automatizací do `web-frontend` (volitelné).

ASCII přehled architektury (barevné štítky jsou názvy barev, renderer CLI může aplikovat barvy lokálně)

Legend: [CYAN]=Frontend, [GREEN]=Backend, [YELLOW]=DB, [MAGENTA]=CI/CD, [BLUE]=Admin/UI, [RED]=Automation

                                                                              [MAGENTA] GitHub Actions
                                                                                      |
                                                                                      v
    [CYAN] Frontend (Vite/React/Tailwind)  <--->  Browser/Playwright (E2E)   --->  [GREEN] Backend (FastAPI)
                |                                         ^                                |
                |                                         |                                v
                |                                         |                          Integrations / Webhooks
                v                                         |                                |
           Static build (dist) ---------------------------+                                v
                                                                                   [YELLOW] Database (SQLite/Postgres)

  [BLUE] Admin UI (sqladmin)  <-->  [GREEN] Backend admin APIs  <-->  [RED] AutomationFlow (definition stored in DB)

Popis toků:
- Frontend volá API na Backend -> Backend čte/píše do DB a volá `integrations.enqueue_webhook` pro asynchronní dispatch.
- CI build job vytváří artefakty (tar image), e2e job spouští frontend + backend (v runneru nebo services) a běží Playwright.
- Admin může vytvořit/aktualizovat `AutomationFlow` přes `/admin/automations`; spouštění používá bezpečný runner (`automation.execute_flow`).

Poznámky k bezpečnosti a provozu
- Nikdy nenechávat `BBH_SECRET_KEY` v repozitáři; v `backend/app/security.py` je nyní logika generování ephemeral secretu pokud env var chybí.
- Flow validace omezena JSON schema + whitelist akcí; `protected` flag zabraňuje úpravám kritických flow přes API.
- Doporučeno: přidat audit log pro každé spuštění flow a přidat roli `automation_editor` pro méně privilegované editory.

Soubor s koncovými body a důležitými cestami:
- Backend entry: `backend/app/main.py`
- Automation runner: `backend/app/automation.py`
- Admin automation API: `backend/app/admin_automations.py` (`/admin/automations`)
- FastAPI users shim: `backend/app/fastapi_users_shim.py` (test/dev compatibility)
- Frontend entry: `web-frontend/` (Vite)
- CI workflows: `.github/workflows/ci.yml`, `.github/workflows/deploy-via-ssh.yml`

---
Napište, jak chcete pokračovat: připravím UI pro automatizace, opravím ruff/mypy issues nebo sestavím PR s navrhovanými změnami.
