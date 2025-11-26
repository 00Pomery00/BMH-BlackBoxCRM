# Running E2E locally

This project contains Playwright E2E tests for the demo CRM. The helper scripts here make it easy to run tests locally.

Quick steps (PowerShell):

1. Activate the Python venv (from repo root):

```powershell
& .\.venv\Scripts\Activate.ps1
```

2. Build frontend if you changed it (optional):

```powershell
Set-Location .\web-frontend
npm install
npm run build
```

3. Run the bundled helper (starts backend, serves `dist`, runs Playwright):

```powershell
.\scripts\run-e2e.ps1
```

Or run via `npm` (assuming you have frontend deps installed):

```powershell
Set-Location .\web-frontend
npm run e2e:local
```

Stopping the servers: kill processes listening on ports `8002` and `5173` or close the shell.
