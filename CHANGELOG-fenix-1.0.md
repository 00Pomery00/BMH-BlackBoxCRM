# Changelog — fenix-1.0 (since tag `fenix-1.0`)

This file summarises notable commits made on branch `feat/ui-i18n-ux` after the
archive/tag `fenix-1.0` snapshot.

## 2025-11-29
- chore(pydantic): migrate class Config to model_config ConfigDict (Pydantic v2)
- fix(security): use timezone-aware datetimes (replace utcnow) and add `CODEOWNERS` for ws-architect
- chore: add validation helpers, login component and archives
- ci: add ws-architect validator, fix workflows and docs
- ci: fix workflows - remove markdown fences and add placeholders for consolidated workflows

## Notes
- Backend: 28 tests passing locally; Pydantic v2 migration applied for top-level schemas.
- CI: added `architect-validate` workflow to run a local YAML/secret sanity check on PRs.
- CODEOWNERS now assigns workflow changes to `@00Pomery00` (repo owner) as default.
