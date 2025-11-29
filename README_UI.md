**UI Development — Quick Guide**

Purpose: shrnutí kroků pro lokální vývoj frontendu, i18n a E2E testů.

1) Spuštění web-frontend (dev)

```powershell
cd web-frontend
npm install
npm run dev
```

2) Build pro E2E / statické nasazení

```powershell
cd web-frontend
npm run build
npx http-server dist -p 5173
```

3) Playwright (E2E)

Nejprve nainstalovat a spustit mock backend (pokud existuje):

```powershell
cd web-frontend
npm install
npx playwright install
# pokud používáte mock-backend/server.js
node mock-backend/server.js &
# potom spusťte testy
npx playwright test --reporter=list --workers=1
```

4) i18n
- Vytvořil jsem základní soubor `web-frontend/src/i18n/cs.json` s nalezenými klíči.
- Doporučený další krok: zaintegrovat `react-i18next` a přepnout komponenty na `t('key')` místo inline řetězců.

5) Data-testids
- Projekt už má `data-testid` pro lead list, KPI karty a další klíčové elementy.
- Další krok: doplnit `data-testid` pro header, hlavní CTA a taby; upravit Playwright testy, aby čekaly na `[data-testid="dashboard-leads-heading"]` než budou pokračovat.

6) Streamlit
- `app.py` je v kořeni projektu; funguje přes upload-only. Pro UI sjednocení doporučuji zachovat texty v `app.py` nebo extrahovat do pythoního i18n souboru (např. `app_i18n_cs.py`).

---
Pokud chcete, začnu teď: (A) plnou integrací i18n pro `web-frontend` (instalace `react-i18next`, wrapper + přepsání pár komponent), nebo (B) doplněním `data-testid` a úpravou testů pro stabilitu. Napište A nebo B.
