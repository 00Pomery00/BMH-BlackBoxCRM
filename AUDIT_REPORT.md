# BlackBox CRM — AI Audit Report (initial)

Datum: 27.11.2025
Autor: GitHub Copilot (asistent)

Shrnutí:
Tento dokument sumarizuje výsledky rychlého AI auditu vašeho projektu (SPECIFICATION + aktuální kód), identifikuje klíčové problémy, navrhuje priority oprav a obsahuje seznam konkrétních změn provedených nyní.

1) Hlavní zjištění (vysoká priorita)
- Nekonzistentní model `User`: kód očekává `username` a `role`, zatímco model měl pouze `email` a `is_superuser`. To vede k chybám při registraci/login a v testech.
- Závislost na `pydantic` BaseSettings (`pydantic-settings`) vedla k importní chybě v některých prostředích. Přepsal jsem konfiguraci na jednoduché `os.getenv` řešení.
- Telemetrie / audit middleware loguje, ale chyběla struktura session-tracking; doplnil jsem `UserSession` model a zapisování session při přihlášení.

2) Další zjištění (střední priorita)
- Některé endpoints a moduly předpokládají sloupce/názvy, které nemusí existovat v databázi (best-effort ALTER v `main.py` je pouze demo). Doporučuji migrations/Alembic spravovat schéma konzistentně.
- V kódu jsou smíšené async a sync přístupy (některé moduly používají SQLAlchemy ORM sync, jinde je async styl). To může komplikovat nasazení v produkci.
- SPECIFICATION.md je velmi rozsáhlý; je třeba rozdělit na iterativní MVP a technické milníky.

3) Doporučené kroky (priorita order)
1. Ujistit se, že `User` model obsahuje `username`, `role`, a že migrations jsou generovány a aplikovány (Alembic).
2. Zjednodušit konfiguraci pro běh lokálně (hotfixy už aplikovány v `app/core/config.py`).
3. Zajistit konzistentní přístup k DB (buď zcela sync ORM pro demo, nebo přejít na async everywhere). Pro teď držíme sync pro testy.
4. Přidat integrační testy pro auth flows (register/login/me) a E2E hranice.
5. Rozdělit specifikaci na MVP: auth+core models+dynamic schema+ui engine minimal.

4) Změny provedené nyní
- `backend/SPECIFICATION.md` (přidáno) — obsahuje kompletní specifikaci.
- `backend/app/core/config.py` — odstraněna závislost na `pydantic` BaseSettings, nyní používá `os.getenv`.
- `backend/app/models/core.py` — přidány sloupce `username` a `role` do `User` a `UserSession` model byl doplněn.
- `backend/app/users.py` — `register` a `login` upraveny tak, aby vytvářely záznamy v `AuditLog` a `UserSession`.

5) Další kroky které doporučuji nasadit okamžitě
- Vygenerovat Alembic migraci reflektující nové sloupce (`username`, `role`, `user_sessions`, atd.) a spustit ji na testovací DB.
- Upravit testy / přidat integrační testy pro auth routes.
- Rozdělit SPECIFICATION do `SPEC/MVP.md`, `SPEC/ADMIN.md`, `SPEC/IKY.md` pro lepší plánování.

6) Poznámky o bezpečnosti
- Tajemství a klíče nemají být commitovány — nastavte `BBH_SECRET_KEY` v prostředí/secret manageru.
- Audit log obsahuje potenciálně citlivá pole; zajistěte, aby přístup k audit souborům byl omezen.

---

Pokračuji teď spuštěním unit testů a aplikací dalších drobných oprav podle výsledků testů.

---

7) Kroky dokončené během tohoto auditu
- Přepsání `app/core/config.py` na jednoduché `os.getenv` konfigurace pro lokální běh.
- Doplnění `username` a `role` do `User` modelu a přidání `UserSession` modelu.
- Přidání modelu `TelemetryEvent` a API routeru `POST /telemetry/event` a `POST /telemetry/heartbeat`.
- Uprava `register` a `login` endpointů: zapisování `AuditLog` a tvorba `UserSession`; `login` nyní vrací `session_id`.
- Přidání frontend snippet `web-frontend/public/telemetry.js` pro jednoduché zasílání page events a heartbeat.
- Vytvoření Alembic migrací `0002` a `0003` pro nové sloupce a telemetry tabulku.
- Dokončení a rozšíření Pydantic DTO (`app/schemas.py`) pro User/Token/Session/Telemetry.
- Spuštění testů (lokálně v rámci projektu) — kompletní test suite prošla (`29 passed`).

8) Zbývající problémy / rizika (doporučené další práce)
- Migrace: nyní jsou v repozitáři ale je potřeba spustit `alembic upgrade head` proti cílové DB (Postgres) v testovacím prostředí a zkontrolovat RLS politiky.
- Přechod na Pydantic v2: část kódu stále používá staré `Config`/`orm_mode` styly — doporučuji audit a migraci na `ConfigDict` nebo standardizovat Pydantic verzi.
- Async vs sync: projekt kombinuje sync SQLAlchemy ORM a některé async přístupy; doporučuji sjednotit (nebo vyčlenit adaptér vrstvy DB).
- Bezpečnost: implementovat rotaci tajemství, zabezpečené úložiště klíčů a audit přístupů.
- Telemetrie: uchovávání citlivých informací v payloadu — standardizovat filtrování/PII masking.

9) Doporučené krátkodobé next-steps (priorita)
1. Spustit Alembic migrace na testovací Postgres + ověřit RLS.
2. Vložit frontend telemetry snippet do `index.html` a předat `session_id` po loginu.
3. Přidat admin endpoint pro agregovanou telemetrii (top eventy, aktivní sessions).
4. Revize Pydantic usage a případná fixace verze v `requirements.txt`.
5. Zvážit přechod na async SQLAlchemy/asyncpg pro vyšší škálovatelnost nebo udržet sync a dokumentovat limitace.

---

Kontakt: pokud chcete, mohu automaticky vytvořit PR s těmito změnami a připravit krok pro spuštění migrací v CI pipeline.
