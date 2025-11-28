# CRM Blackbox — Scaffold

Krátký úvod a checklist pro projekt CRM Blackbox (auto-generující CRM). Tento README slouží jako výchozí dokumentace a checklist pro další práci.

Struktura:

- `crm-blackbox/backend/` — Node.js + Express + TypeScript backend (services, repositories, init, mock).
- `crm-blackbox/frontend/` — React + TypeScript + Vite frontend (widgets, components, pages, stores).
- `crm-blackbox/catalog/` — JSON manifesty systémových objektů a widgetů.

Krátký checklist (revize / audit):

- [ ] Přidán MASTER_PROMPT v `crm-blackbox/.copilot`.
- [ ] Inicializační generátor katalogu `backend/src/init/generateDefaultCatalog.ts` — idempotentní.
- [ ] Základní manifesty v `catalog/objects/` pro povinné objekty.
- [ ] Mock data v `backend/mock/` pro rychlý vývoj (používá se `USE_MOCK=true`).

Frontend scaffold:
- `crm-blackbox/frontend/` — jednoduchý scaffold s widget registry
	- `package.json`, `tsconfig.json` — základní setup (spusťte `npm install` v adresáři frontend)
	- `src/hooks/useWidgets.ts` — hook pro čtení z widget registru
	- `src/registerWidgets.ts` — registrace `KpiWidget`

Jak spustit frontend (rychle):
1. cd into `crm-blackbox/frontend`
2. `npm install`
3. `npm run dev`

---

Final audit a doporučení
------------------------

- Rozsah: Prošel jsem repozitář a ověřil umístění JSON manifestů a mock dat. Hlavní zdroje manifestů a mocků jsou:
	- `crm-blackbox/catalog/objects/*.json` — manifesty systémových objektů
	- `crm-blackbox/backend/mock/*.json` — mock data pro rychlý vývoj

- Validace: Přidal jsem `backend/src/init/manifestSchema.ts` (Zod) a upravil generátor `generateDefaultCatalog.ts`, aby validoval existující manifesty, zálohoval nevalidní a případně je nahradil. Generátor je idempotentní.

- Frontend scaffold: Přidal jsem minimální Vite + React scaffold (`frontend/`) s registrací widgetů a ukázkovým `KpiWidget`.

- CI smoke: Přidal jsem workflow `.github/workflows/crm-smoke.yml`, který:
	1. nainstaluje Node
 2. spustí `npm ci` v `crm-blackbox/backend`
 3. spustí `npm run generate` (gen. catalogu)
 4. postaví backend (`npm run build`)
 5. spustí backend a spustí `node tools/check_endpoints.js` pro ověření endpointů

- Doporučení:
	- Konsolidovat zdroje manifestů v jediném adresáři (již provedeno: `crm-blackbox/catalog`). Pokud později vzniknou duplicity s jinými částmi repo, navrhuji migraci do centrálního registru.
	- Přidat CI krok, který spustí frontend build (`crm-blackbox/frontend`) a základní smoke testy proti preview buildu.
	- Přidat testy a lint krok pro `frontend` a `backend` v rámci CI matrix.

Pokud chcete, mohu vytvořit PR s těmito změnami nyní a/nebo rozšířit workflow o frontend build step.

- [ ] Frontend widget registry a sample widget v `frontend/src/widgets/`.
- [ ] Popis dalších kroků: CI, DB migrace, API endpoints, Zod validace.

První kroky pro developera:

1. `cd crm-blackbox/backend` — nainstalovat závislosti (`npm install`).
2. `cd crm-blackbox/frontend` — nainstalovat závislosti (`npm install`).
3. Spustit `node dist/init/generateDefaultCatalog.js` (nebo `ts-node`) pro inicializaci katalogu a mock dat.

Další doporučené kroky:

- Přidat `package.json` do backendu a frontend scaffold (pokud chybí), CI joby, a sqlite migrations.
- Implementovat Express API s validací Zod a repository vrstvou.
