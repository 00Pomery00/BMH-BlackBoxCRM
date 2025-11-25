# Evaluace projektu a počáteční audit

Datum: 25. listopadu 2025

Poznámka: tento dokument je počátečním výstupem auditu a rozhodovacím podkladem pro další hloubkové kroky. Projekt v repozitáři používá primárně FastAPI (backend). Uživatelská žádost obsahuje evaluaci "jak z Djanga tak z Notion" — v dokumentu jsou proto uvedena kritéria pro vyhodnocení případné migrace na Django a doporučení pro organizaci obsahu v Notion.

## Cíl
- Zmapovat současný stav kódu, CI/CD a dokumentace.
- Poskytnout rozhodovací kritéria a rizika pro migraci na Django (pokud se zvažuje).
- Navrhnout strukturu a šablony pro Notion pro provozní runbooky, checklisty a sprint backlog.
- Vygenerovat prioritní seznam doporučených oprav a kroků k implementaci.

## Rozsah auditu
- Kód: `backend/`, `web-frontend/` a `.github/workflows/`.
- Migrace: Alembic migrace pod `backend/alembic/versions/` a skript `backend/scripts/migrate_fu_users_to_users.py`.
- CI/CD: soubory v `.github/workflows/` (build, e2e, build-images, deploy-via-ssh).
- Dokumentace: `docs/`, `README.md`, Notion‑friendly dokumenty.

## Klíčová fakta (známé)
- Backend: FastAPI + SQLAlchemy + Alembic (nikoli Django). Při zadání uváděno "vyhodnoceni jak z Djanga" — považujte to za požadavek porovnat architekturu a provozní dopady, ne povinný přechod.
- Frontend: Vite + React + Tailwind, Playwright E2E testy.
- CI: GitHub Actions — pipeline ukládá Docker tar artefakty a má workflow pro SSH deploy.

## Kritéria evaluace — Django vs současné řešení (FastAPI)
- Architektura a vývojová produktivita: existující kód je postaven pro ASGI; migrace vyžaduje přepis rout, view/serializers, ORM mapping (SQLAlchemy -> Django ORM) nebo použití `django` + `django-rest-framework`.
- Auth a uživatelé: fastapi-users vs Django auth — porovnat podporu pro social loginy, migrace dat (`fu_users -> users`).
- Migrations & DB: Alembic vs Django migrations (migrace by bylo nutné převést, riziko chyb při převodu); časová náročnost závisí na rozsahu modelů.
- Performance & škálovatelnost: FastAPI má výhodu v asynchronních IO scénářích; Django je robustní, ale může vyžadovat přidání asynchronních komponent pro stejné chování.
- Ekosystém: Django poskytuje admin UI, batteries‑included; FastAPI je lehčí a více modulární.

## Notion — doporučení pro strukturu a export
- Hlavní stránky: `Project Overview`, `Runbooks`, `Migrations`, `CI/CD`, `Incident Response`, `Onboarding`.
- Databáze: `Tasks` (kanban), `Releases`, `Incidents`, `Knowledge base` (MD export friendly).
- Šablony: Migration checklist, Deploy checklist, Playwright E2E report template, Postmortem template.

## Audit checklist (počáteční)
1. Spustit unit tests (backend) a E2E (Playwright) a zaznamenat výsledky.
2. Statická analýza: flake8/ruff/mypy (Python), ESLint (frontend).
3. Dependency audit: `pip-audit` / `safety` pro Python; `npm audit` pro frontend.
4. Secrets check: hledat hardcoded credentials v repozitáři.
5. Alembic migrations: zkontrolovat více-heads, merge migration a konzistenci schématu.
6. CI workflows: ověřit bezpečné používání secrets, časové limity, retryy, ukládání artefaktů.
7. Docker images: review Dockerfile pro bezpečnost a menší image size.
8. Runtime: kontrola defaultních konfigurací (debug flags, CORS, CSP, JWT expiration, rate limiting).

## První zjištění (placeholder)
- Tento dokument je vytvořen jako počáteční krok. Další konkrétní zjištění budou doplněna po spuštění testů a skenů.

## Aktuální zjištění (25.11.2025)
- Spuštěny automatizované kontroly: unit tests, pip-audit, ruff, mypy, npm audit, Playwright E2E.
- Kompletní výsledky a doporučení jsou v `docs/tests-report.md` (shrnutí problémů s testy, závislostmi a statickou analýzou).

## Doporučené následující kroky
1. Potvrdit, zda chcete hlubší evaluaci s konkrétním návrhem migrace na Django (včetně odhadu práce).
2. Spustit automatizované testy a audity: `pytest`, `npx playwright test`, `pip-audit`, `npm audit`.
3. Provést statickou analýzu a dependency report; vytvořit seznam rychlých oprav (1–3 dny) a větších úprav (více než 3 dny).
4. Doplňující: vygenerovat Notion šablony a ERD návrh.

## Výstupy, které připravím dál
- Kompletní `docs/evaluation-and-audit.md` s nalezenými issue (po spuštění testů).
- `docs/notion-templates.md` s copy/paste připravenými šablonami.
- Prioritizovaný backlog oprav a soubor pro export (`audit-report.zip`).

---
Podle vašeho potvrzení spustím testy a bezpečnostní skeny a doplním konkrétní zjištění a prioritu oprav.

Aktuální doporučení: prosím odsouhlaste, které konkrétní akce chcete, abych provedl okamžitě (např. "odstranit demo secret a commitnout", "opravit registraci fastapi-users tras", "spustit ruff --fix a commit").
