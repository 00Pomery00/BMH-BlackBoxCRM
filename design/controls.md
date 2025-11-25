# Ovládací prvky - rozdělení a doporučené použití

Níže je stručné rozdělení ovládacích prvků podle zaslaných návrhových ikon a komponent (viz přílohy). Cílem je oddělit atomické UI prvky a doporučit, kde je použít v CRM (dashboard, filtry, mobilní sběr, gamifikace apod.).

1) Ikony tlačítek (kružnice s ikonou)
- Komponenta: `IconButton` (`web-frontend/src/components/ui/IconButton.jsx`)
- Použití: akční tlačítka v řádcích (delete, export, open), toolbary, mapové ovládací prvky.
- Poznámka: poskytovat tooltip/title a ARIA label.

2) Přepínače / toggle
- Komponenta: `ToggleSwitch` (`.../ToggleSwitch.jsx`)
- Použití: zapnout/vypnout filtr, zobrazit aktivní režim (night mode), quick-enable/disable notifikací.

3) Progres / indikátory výkonu
- Komponenta: `ProgressBar` (`.../ProgressBar.jsx`)
- Použití: zobrazit stav gamifikačního levelu (XP progress), průběh importů/exports, načítání větších operací.

4) Filtry a štítky
- Komponenta: `FilterChip` (`.../FilterChip.jsx`)
- Použití: aktivní filtry nad seznamem leadů, multi-select aktivní tagy; lze kombinovat s dropdowny a date range.

5) Rozbalovací výběry
- Komponenta: `Dropdown` (`.../Dropdown.jsx`)
- Použití: výběr stavu, priorita, owner při hromadných operacích.

6) Rozsah dat / časové filtry
- Komponenta: `DateRangePicker` (`.../DateRangePicker.jsx`)
- Použití: reporting (trend grafy), exporty podle data založení/aktivity.

7) Vyhledávání + fulltext
- Komponenta: (použít existující `Search` v projektu nebo přidat) – doporučit samostatný `SearchBar` se seznamem návrhů a debounce.
- Použití: globální vyhledávání v dashboardu, vyhledávání v seznamu leadů.

Mapování ikon z příloh na komponenty a místa použití (rychle):
- Lupa: `IconButton` (detail / search)
- Filtr (trychtýř): `Dropdown` + `FilterChip` (kombinovat)
- Export / PDF: `IconButton` (akce export)
- Kalendář: `DateRangePicker` nebo DatePicker (datumové filtry)
- Přepínač (switch): `ToggleSwitch` (např. priority / only open)
- Notifikace / zvonek: `IconButton` (notifikace)
- AI / mozek: použít jako `IconButton` nebo stavová ikona v Dashboard widgetu (AI insights)

Doporučení UX:
- Oddělit vizuální ikonu od interakční logiky: vždy komponenta vrací callback (`onClick`, `onRemove`, `onChange`).
- Při kombinování filter UI: používat `FilterChip` pro aktivní stav a `Dropdown` pro volbu filtru; zobrazit počet aktivních filtrů.
- Pro mobil: minimalizovat počet inline dropdownů — použít modal nebo bottom sheet pro výběry.

Implementační poznámky
- Vytvořené soubory jsou jednoduché, bez závislosti na design systému; doporučuji doplnit styl (`src/index.css` nebo Tailwind utility) a testy.
- Následující kroky: implementovat `SearchBar`, doplnit stories (Storybook) a přidat unit testy pro komponenty.
