Release notes — aktuální stav

Datum: 26. listopadu 2025

Krátké shrnutí změn v tomto repozitáři (hotovo):

- Upraveny CI E2E kroky tak, aby frontend během buildu používal `VITE_API_URL=http://127.0.0.1:8002`.
- Opraveny pre-commit hook problémy (skript s executable bitem + odstranění runtime logů z indexu).
- Stahování a analýza artefaktů z GitHub Actions; vyřešen problém s `bmh_audit.log` a ignorovány lokální artefakty.
- E2E testy upraveny pro odstranění závodních podmínek (polling `/companies` po seeding).
- Frontend přeložen do češtiny (hlavní komponenty v `web-frontend/src/components`).
- Lokální build frontendu úspěšný a Playwright E2E testy prošly lokálně (6/6).
- Ověřeno: poslední Actions E2E run (ID 19715903000) proběhl úspěšně a artefakty byly zkontrolovány.

Jak ověřit lokálně (rychle):

1) Aktivujte Python v rootu (pokud je potřeba):

```powershell
& .\\.venv\\Scripts\\Activate.ps1
Set-Location 'backend'
python -m uvicorn app.main:app --host 127.0.0.1 --port 8002
```

2) Ve zvláštním terminálu sestavte a serve frontend:

```powershell
Set-Location 'web-frontend'
npm ci
VITE_API_URL=http://127.0.0.1:8002 npm run build
npx http-server dist -p 5173
```

3) Spusťte Playwright lokálně (z `web-frontend`):

```powershell
# v PowerShellu nastavte proměnné takto:
$env:BACKEND_URL='http://127.0.0.1:8002'
$env:FRONTEND_URL='http://127.0.0.1:5173'
npx playwright test
```

Poznámky a doporučení:

- Pokud chcete podporu vícejazyčnosti (i18n), doporučuji přidat jednoduchý JSON-based překladový modul (např. `react-intl` nebo `i18next`) a extrahovat stringy z komponent.
- Pokud CI běží v pomalejším prostředí, zvažte zvýšení timeoutů pollingu v testech (aktuálně 15s/10s). Můžu to změnit na 30s, pokud chcete.
- V repozitáři jsou ignorovány adresáře `artifacts/`, `ci-artifacts/` a `web-frontend/test-results/` — stažené artefakty tak nebudou omylem commitnuty.

Kontaktujte mě, pokud chcete, abych:
- vytvořil PR místo přímého commitu (pro code review),
- implementoval plnou i18n podporu,
- nebo zvýšil timeouty testů.
