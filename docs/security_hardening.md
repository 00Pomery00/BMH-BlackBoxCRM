**Security Hardening Guide (Demo → Production)**

- **Secrets & Configuration**: Use a secrets manager (Vault, Azure Key Vault, AWS Secrets Manager). Never store production secrets in `.env` files in repos. For local dev keep `.env.example` and load with `python-dotenv`.

- **JWT & Keys**: Rotate JWT signing keys regularly. Use long random secret or asymmetric keys (RS256) for production. Store private keys in Vault and limit access.

- **Passwords & Hashing**: Use `bcrypt` or `argon2`. `passlib` with bcrypt is acceptable for demo; prefer `argon2` for new systems.

- **MFA**: Use time-based TOTP (RFC 6238) + backup codes. For SMS/Email one-time codes use a delivery provider with rate-limiting and retry logic.

- **Transport Security**: Terminate TLS at load balancer or use managed certificates. Enforce HSTS and disable insecure ciphers.

- **Audit & Logs**: Centralize audit logs (structured JSON) to ELK / Loki / Splunk. Protect logs, rotate, and set retention. Keep audit logs immutable where possible.

- **RBAC**: Implement role-based checks server-side. Keep `admin` privileges minimal and require MFA for admin actions.

- **Database**: Run migrations (Alembic). Do not rely on runtime ALTERs for production. Back up DB and test restore procedures.

- **Background Jobs**: Use robust queue (Celery/RQ) with retries, dead-letter queue, and metrics.

- **Rate Limiting & Abuse Protection**: Add rate limits per IP and per user for sensitive endpoints (auth, MFA, webhooks). Use token buckets or API gateways.

- **Dependency Management**: Pin dependencies in lockfiles; scan with Snyk/Dependabot. Use CI to run security checks.

- **CI/CD**: Run tests, lint, static analysis, and security scans on PRs. Require code review before merging to `main`.

- **Monitoring & Alerting**: Emit metrics for queue length, failed webhook rate, auth failures. Alert on anomalies.

- **Secrets in CI**: Use GitHub Actions secrets or typed secrets in CI provider. Do not echo secrets to logs.

- **Penetration Testing**: Do periodic security scans and penetration tests before production launch.

- **Checklist before production:**
- Move secrets to Vault and configure access.
- Replace demo JWT secret with secure key pair.
- Replace runtime schema ALTERs with Alembic migrations and run tests.
- Configure TLS and HSTS.
- Configure centralized logging and retention policy.
- Configure monitoring (Prometheus/Grafana) and alerts for errors, queue sizes and auth anomalies.

This document is a starting point — adapt to your cloud provider and compliance needs.
