# Test & Audit Report

Datum: 25. listopadu 2025

Krátké shrnutí provedených kontrol:

- Backend unit tests: 24 testů spuštěno — 22 passed, 2 failed.
- Python dependency audit (`pip-audit`): 2 známé zranitelnosti (ecdsa 0.19.1, pip 25.2).
- Statická analýza (`ruff`): 28 chyb (12 fixovatelných automaticky).
- Typová analýza (`mypy`): 68 chyb (různé problémy s typy a implicitními Optional hodnotami).
- Frontend `npm audit`: 2 moderate vulnerabilities.
- Playwright E2E: 5 testů spuštěno — 1 passed, 4 failed (chybí běžící backend nebo očekávané elementy nejsou ve file:// buildu).
- Secrets scan: nalezen demo secret v `backend/app/security.py` a několik použití GitHub Secrets v workflow souborech (očekávané).

Detaily (výstupy z běhu):

1) Backend unit tests
- Výsledky: 2 selhávající testy:
  - `tests/test_fastapi_users_smoke.py::test_fu_auth_register_and_login` — očekává endpoint `/fu_auth/register`, server v testu vrací 404. Nejpravděpodobnější příčina: příslušné fastapi-users trasy nejsou registrovány při inicializaci aplikace v `app.main`.
  - `tests/test_fu_auth_smoke.py::test_fu_auth_register_and_login` — stejná chyba 404 při pokusu o registraci.

2) `pip-audit`
- Nalezené zranitelnosti:
  - `ecdsa 0.19.1` (GHSA-wj6h-64fc-37mp) — doporučeno aktualizovat na bezpečnou verzi
  - `pip 25.2` (GHSA-4xh5-x5gv-qwph) — doporučeno aktualizovat pip

3) `ruff` (statická analýza)
- Nálezy: 28 chyb (ukázky): E402 (imports not at top), F401 (unused imports), F811 (redefinition), E741 (ambiguous variable `l`), E401 (multiple imports on one line). 12 z nich lze opravit pomocí `ruff --fix`.

4) `mypy`
- Nález: 68 chyb; hlavní třídy problémů:
  - Neplatné typy pro SQLAlchemy modely (přechod mezi runtime Base a typy vyžaduje doplnění anotací a použití `typing.TYPE_CHECKING` nebo `from __future__ import annotations`).
  - Funkce s implicitními `None` defaulty a neoznačenými Optional parametry — potřeba upravit signatury nebo přidat `Optional[...]`.

5) Frontend & Playwright
- `npm audit` reportován 2 moderate vulnerabilities — doporučen krok `npm audit fix` následovaný reviewem breaking changes.
- Playwright: 4 selhávající testy. Hlavní příčiny:
  - `connect ECONNREFUSED ::1:8000` při volání backend API — Playwright očekává běžící backend na `http://localhost:8000`.
  - UI elementy nebyly nalezeny při otevření `file://` buildu — může být mismatch mezi očekávanými HTML selektory a aktuálním buildem, nebo timing (data nejsou seedována při testu).

6) Secrets scan
- Nalezeno: demo secret v `backend/app/security.py` (`demo-secret-key-change-me`) — bezpečnostní riziko, zmíněno v dokumentaci, ale musí být odstraněno nebo přepsáno na použití env var bez fallbacku v produkci.
- GitHub workflows odkazují na `secrets.*` — to je očekávané, ale je potřeba zajistit správné nastavení v repozitáři (GH Secrets) a že nejsou vypsány do logů.

Doporučené opravné kroky (prioritizované)

1) Bezpečnost (kritické / rychlé)
  - Odstranit defaultní demo secret z `backend/app/security.py`. Udělat `raise` pokud env var není nastavena v produkčním profilu, nebo logovat varování jen v dev.
  - Aktualizovat zranitelné závislosti: nejprve `ecdsa`, následně další, a otestovat aplikaci.

2) Funkčnost a testy (vysoká priorita)
  - Opravit registraci fastapi-users tras (`/fu_auth/*`). Zkontrolovat `backend/app/fastapi_users_impl.py` a způsob jejich zahrnutí v `backend/app/main.py`.
  - Spustit testy opakovaně po opravě; cílem je 0 fail.
  - Upravit Playwright testy nebo CI startovací krok tak, aby backend běžel (např. `uvicorn backend.app.main:app --port 8000 &`) před testy, nebo upravit testy aby mockovaly závislosti.

3) Kódová hygiena (střední priorita)
  - Spustit `ruff --fix` a opravit zbývající problémy manuálně.
  - Iterativně řešit `mypy` chyby: začít s import-guards, explicitními Optional typy a postupně refaktorem modelů pro kompatibilitu s typovou kontrolou.

4) CI / E2E (střední)
  - V CI workflow přidat krok, který spustí backend (migrace + uvicorn) před Playwright jobem, nebo spustit e2e job s `services` kontejnery.
  - Zajistit, že secrets nejsou echo-ovány; použít `ACTIONS_STEP_DEBUG` jen pro debug.

5) Notion & dokumentace (nízká)
  - Doplnit Notion šablony a runbooky pro migraci uživatelů a deploy; uložit do `docs/notion-templates.md`.

Následující kroky, které provedu dál (pokud schválíte)

- Opravit demo secret a commitnout drobný patch (bez publikování credentialů).
- Opravit registraci fastapi-users tras nebo přidat test-skip s jasnou poznámkou, pokud je to bezpečnější.
- Spustit `ruff --fix` a zkompilovat report z automatických oprav; zbytek chyb seřadím a připravím PR návrh.
- Vytvořit `docs/notion-templates.md` a aktualizovat `docs/evaluation-and-audit.md` s těmito zjištěními.

Dejte mi vědět, které kroky chcete, abych provedl hned: odstranění demo secret + commit, oprava `fu_auth` rout, spuštění `ruff --fix` a commity, nebo připravit PR přehled oprav a dalšího postupu.
