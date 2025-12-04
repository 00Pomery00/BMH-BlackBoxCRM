# DevOps Onboarding Checklist

This document lists the minimal set of accesses, tasks and runbook items to onboard a DevOps/platform engineer to the BlackBox CRM project.

## Access & Accounts
- GitHub organization membership and repo access (write/admin) for `00Pomery00/BMH-BlackBoxCRM`.
- Access to CI runner logs and ability to re-run jobs.
- Credentials for container registry(s): Docker Hub and GHCR (secrets: `DOCKERHUB_TOKEN`, `GHCR_TOKEN`).
- Cloud provider credentials (if used) or access to staging environment.
- Vault/secrets manager access (if used).

## First-run tasks
1. Review `/.github/workflows/ci.yml` and `e2e.yml` — ensure runner shells and paths are platform-appropriate.
2. Verify `backend/requirements-minimal.txt` is sufficient for CI and create a cached wheel strategy if needed.
3. Ensure `web-frontend/package.json` has `serve` in devDependencies and that `npm ci` succeeds in CI.
4. Confirm health-check endpoints: `/health`, `/companies` and seed endpoints used by tests.
5. Ensure `backend` logs are captured to artifacts in CI for failed runs.

## Operational runbook (start/stop)
- Start local backend (dev): `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-backend.ps1`
- Start local frontend (dev): `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-frontend.ps1`
- Run e2e locally: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-e2e.ps1`

## CI Stabilization checklist
- Add cache for Python packages and node modules where applicable.
- Consider using `npm ci --prefer-offline` on runners with caches to speed builds.
- Add a job to validate Storybook (if added) and publish to GH pages or an artifact.
- Make sure Playwright step uploads `trace.zip`, screenshots and test-results on failure.

## Monitoring & Alerts (recommended)
- Configure log shipping for `backend` (e.g., to a central ELK / Grafana Loki) for test runs.
- Add basic Prometheus metrics export (or simple health endpoints) and configure alerts for failing e2e or failed migration jobs.

## Security & Secrets
- Use GitHub Actions secrets for tokens and restrict access to the devops team.
- Document where to rotate tokens and how to update secrets in CI.

## First three improvement tasks (priority)
1. Harden CI by running e2e only after backend and frontend health-checks; add retries and increased timeouts.
2. Containerize test runners or run Playwright in a container to make test runs reproducible.
3. Add staging deployment pipeline (optional) with infrastructure-as-code (Terraform or CloudFormation) for reproducible environments.

---

If you want, I can create PRs that implement steps 1–3 automatically (CI tweaks, containerize runners, add GH Actions steps).
