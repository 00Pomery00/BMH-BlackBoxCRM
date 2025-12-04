---
name: Request DevOps specialist
about: Use this template to request adding a DevOps specialist to the project/team and grant needed accesses
title: "[HR] Add DevOps specialist: <name / GitHub handle>"
labels: team:devops, onboarding
assignees: ''
---

## Short request

- Name / GitHub handle: @
- Preferred start date:
- Full-time / contractor:

## Required repository access

- Add to `00Pomery00` organization and grant `write`/`admin` on this repo as appropriate.
- Add to CI secrets access or create a vault entry for: `DOCKERHUB_TOKEN`, `GHCR_TOKEN`, `CLOUD_PROVIDER_CREDENTIALS` (specify provider).

## Responsibilities

- Finalize CI workflows and stable runner configurations
- Provision and maintain test/staging infrastructure (containers / k8s / cloud)
- Set up observability: logs, metrics, alerts for backend and e2e test runners
- Manage secrets and deployments

## Notes for the hiring/onboarding manager

- Provide developer machine access, VPN and organization membership
- Point to `docs/DEVOPS_ONBOARDING.md` for first-run tasks and checklist

## Optional: recommended GitHub teams

- `@00Pomery00/devops` (if exists)
- `@00Pomery00/platform`


Please fill required fields and @mention the people responsible for approving access.
