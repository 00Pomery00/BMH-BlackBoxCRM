**Role: WS-Architect**

- **Purpose**: Zachovat integritu repozitáře tím, že validuje CI/workflow konfigurace, kontroluje expozici tajemství a blokuje nebezpečné změny.
- **Kdo**: Tento role může být reálná osoba (senior architekt) nebo automatizovaný gate v CI (`.github/workflows/architect-validate.yml`).

**Proces**
- Před commitem: spusť lokálně validátor:
  - `python -m pip install pyyaml`
  - `python .scripts/architect_validate.py`
- Na Pull Request: CI spustí `.github/workflows/architect-validate.yml`. Pokud validátor selže, PR požaduje opravy.

**Co validátor kontroluje (základ)**
- YAML syntax a parsovatelnost pro soubory v `.github/workflows/`.
- Přítomnost tabulátorů v YAML (jsou zakázány pro indentaci).
- Jednoduché heuristiky pro možná tajemství (řetězce s "secret", "aws_secret", "password", "api_key").

**Kroky při chybě**
- Opravit YAML chyby a odstranit taby.
- Pokud najdeš skutečné tajemství, odstraň je a ulož do GitHub Secrets nebo jiného bezpečného vaultu.

**Poznámky**
- Tento validátor dává základní ochranu. WS-Architect musí vynucovat přezkum důležitých změn (např. odstranění CI, změny deploy skriptů) ručně.
