# Automation (Admin) — overview

Tento dokument popisuje novou administrátorskou funkci pro vytváření a spouštění jednoduchých automatizačních flow (podobně jako n8n, ale výrazně omezeno a bezpečné pro demo/produkci).

Cílem: umožnit pokročilým uživatelům (administrátorům) vytvářet a upravovat bezpečné procesy bez možnosti spustit libovolný kód nebo ohrozit hlavní CRM data.

---

## Co bylo přidáno
- Datový model `AutomationFlow` (`backend/app/models.py`) — ukládá `name`, `definition` (JSON), `is_active`, `allow_advanced_edit`, `protected`.
- Admin UI: `AutomationFlow` je registrován v SQLAdmin pokud je dostupný, takže administrátoři mohou vytvářet/úpravovat flow přes admin UI.
- API (admin): `POST /admin/automations` (create), `PUT /admin/automations/{id}` (update), `GET /admin/automations`, `GET /admin/automations/{id}`, `POST /admin/automations/{id}/run`.
  - Endpoints jsou chráněny rolem `admin`.
- Bezpečný runner: `backend/app/automation.py` — validuje flow pomocí JSON schema a exekuji pouze whitelistované akce: `create_lead`, `send_webhook`, `delay`.
  - `send_webhook` používá stávající `integrations.enqueue_webhook` (async queue) — tím se neexekuji HTTP přímo v procesu.
  - `delay` má omezený maximální spánek 5s aby se zabránilo blokaci.
- Minimální shim pro fastapi-users testy (`backend/app/fastapi_users_shim.py`) — zajišťuje `/fu_auth/register` a `/fu_auth/jwt/login` pokud plná integrace není dostupná.

## Bezpečnostní opatření
- Flow definice jsou validovány proti schematu — pouze kroky s typem ze seznamu `ALLOWED_ACTIONS` jsou povoleny.
- `protected` flow nelze měnit přes API (pouze přes databázi nebo admin UI s vyššími oprávněními).
- `allow_advanced_edit` může být použit v budoucnu pro řízení, kdo může upravovat flow (aktuálně pouze `admin` API je povoleno).
- Exekutor nereflektuje žádné volání `eval` nebo spouštění kódu z JSONu.

## Příklad flow (JSON)
```
{
  "name": "Seed lead and notify",
  "steps": [
    {"id": "s1", "type": "create_lead", "params": {"lead": {"name": "New lead via automation", "lead_score": 10}}},
    {"id": "s2", "type": "send_webhook", "params": {"url": "https://example.com/hooks/notify", "payload": {"message": "New lead created"}}}
  ]
}
```

## Jak spustit (admin)
- V admin rozhraní (SQLAdmin) nebo přes API přidejte flow s definicí jako výše.
- Spustíte: `POST /admin/automations/{id}/run` s volitelným JSON tělem `{ "dry_run": true }` pro testovací běh.

## Doporučení
- Pokud chcete umožnit některým pokročilým uživatelům úpravy flow, zvažte:
  - přidat roli `automation_editor` a kontrolovat `allow_advanced_edit` při update API,
  - přidat revize/approval workflow (např. změny musí schválit `admin`),
  - logovat každé spuštění flow do audit logu (aktuálně je možné záznam vyčíst z `audit.log`).

---

Pokud chcete, přidám:
- UI v `web-frontend` pro správu a testování flow (drag&drop jednoduché editor),
- role-based editing (`automation_editor`) a approval flow,
- další bezpečné akce (např. `create_contact`, `update_company_field`).
