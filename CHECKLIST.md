# BlackBox CRM — Feature & Parameter Checklist

Tento checklist sumarizuje vlastnosti, funkce a konfigurovatelné parametry, které vycházejí z kompletní specifikace a z provedeného auditu. Použijte tento seznam pro plánování MVP, sprintů a testovacích scénářů.
## 1. Core (User & Auth)
- **User auth:** Email+password, OAuth2 (Google, Microsoft), SSO hooks
- **MFA:** TOTP + recovery codes

## 2. Data models
- **Core objects:** Company, Contact, Lead, Opportunity, Activity, Task
- **Dynamic schema:** `dynamic_schemas` JSONB with versions, validation rules

## 3. UI & Dynamic UI Engine
- **UI Schema:** JSON-based component descriptions, widgets, tabs, fields
- **Component IDs:** every UI component must include a stable id and object class, for example `id="bbx-[type]-[module]-[name]"` and `class="bbx-ui bbx-oc-[objectClass]"`.

## 4. Sales & Pipelines
- **Pipelines:** configurable stages, per-pipeline custom fields, weighted probabilities
- **Opportunities:** CRUD, stage transitions, history/timeline

## 5. Activities & Communication
- **Activity types:** call, email, meeting, note
- **Integrations:** IMAP/SMTP, M365, Google (calendar + mail), webhook connectors

## 6. IKY (AI) Engine
- **Features:** lead scoring, anomaly detection, insight cards, fuzzy dedupe, relationship maps
- **Architecture:** pluggable predictors, scorers, insight pipelines under `/iky/` service

## 7. Admin & Resource Management
- **Resource quotas:** CPU/RAM/IO quotas per tenant, job concurrency limits
- **Cost control:** SaaS tiers, feature gates, throttling & suspension rules

## 8. Security & Compliance
- **RBAC/ABAC:** role-based and attribute-based rules, policy editor
- **RLS:** Postgres row-level security per tenant (where available)

## 9. Import / Export
- **Import:** CSV/JSON/NDJSON, AI-assisted mapping, validation, partial-recovery and rollback
- **Export:** scheduled exports, formats CSV/XLSX/JSON/PDF, RLS-respecting

## 10. Gamification
- **Core:** XP, levels, salescoins, badges, missions, streaks
- **Leaderboards:** filters by team, region, tenant

## 11. Mobile Addon
- **Lead Scavenger:** radius scanning, GPS enrichment, offline queue, background sync
- **Config params:** scan interval, battery-saver thresholds, sync retry policy

## 12. API & Integrations
- **API:** REST + webhooks; GraphQL planned
- **Versioning:** `/api/v1/` and `/api/v2/` strategy

## 13. Observability & Ops
- **Logs:** structured logs, per-tenant log segregation options
- **Metrics:** Prometheus-compatible metrics, per-tenant dashboards

## 14. Admin Tools & Maintenance
- **Maintenance windows:** scheduled tasks, off-peak jobs
- **Data ops:** reindexing, consistency checks, backup/restore playbooks

## 15. Configurable Parameters (central list)
- `BBH_SECRET_KEY` — JWT secret
- `BBH_ACCESS_TOKEN_EXPIRE_MINUTES` — access token TTL

## 16. Acceptance Criteria (MVP suggestions)
- Auth: register/login, JWT tokens, session tracking, basic RBAC
- Core models: Company, Contact, Lead, DynamicSchema, record CRUD

## 17. Notes & Next Steps
- Split SPECIFICATION into smaller spec docs: MVP, Admin, IKY, UI Engine.
- Create GitHub Issues from high-priority checklist items and wire them to milestones.

---

Tento checklist lze rozšířit o detailní acceptance test cases pro každý bod; napište, které části chcete rozpracovat do konkrétních úkolů nebo issues a můžu je vygenerovat automaticky.
# BlackBox CRM — Feature & Parameter Checklist

Tento checklist sumarizuje vlastnosti, funkce a konfigurovatelné parametry, které vycházejí z kompletní specifikace a z provedeného auditu. Použijte tento seznam pro plánování MVP, sprintů a testovacích scénářů.

## 1. Core (User & Auth)
- **User auth:** Email+password, OAuth2 (Google, Microsoft), SSO hooks
- **MFA:** TOTP + recovery codes
- **Token:** JWT access token, refresh token plan
- **Sessions:** `user_sessions` table, session_id returned at login, session heartbeat endpoint
- **RBAC:** Roles, dynamic permissions, policy enforcement middleware
- **Auditing:** AuditLog for register/login/config changes
- **Telemetry:** page events, heartbeats, action tracing
- **Config params:** `BBH_SECRET_KEY`, `BBH_ACCESS_TOKEN_EXPIRE_MINUTES`, `MAX_SESSIONS_PER_USER`

## 2. Data models
- **Core objects:** Company, Contact, Lead, Opportunity, Activity, Task
- **Dynamic schema:** `dynamic_schemas` JSONB with versions, validation rules
- **Record store:** `ds_records` for schema-driven objects
- **Attachments:** file metadata + storage backend (S3/local)
- **Audit & versioning:** `audit_log` covering config + data changes
- **Config params:** default tenant id, per-tenant storage quota, JSONB size limits

## 3. UI & Dynamic UI Engine
- **UI Schema:** JSON-based component descriptions, widgets, tabs, fields
- **Component IDs:** `id=
