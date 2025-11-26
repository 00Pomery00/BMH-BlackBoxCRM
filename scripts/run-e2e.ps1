#!/usr/bin/env pwsh
<#
Simple helper to run local E2E tests:
- Activate Python venv
- Start backend (uvicorn) on 127.0.0.1:8002
- Start static server for `web-frontend/dist` on 5173
- Run `npx playwright test`

This script launches background processes; stop them by closing the shell or killing ports 8002/5173.
#>

param()

Write-Output 'Activating venv'
& .\.venv\Scripts\Activate.ps1

Write-Output 'Starting backend (uvicorn) on 127.0.0.1:8002'
Push-Location .\backend
Start-Process -FilePath .\.venv\Scripts\python.exe -ArgumentList '-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8002' -NoNewWindow -PassThru | Out-Null
Pop-Location

Write-Output 'Serving frontend dist on port 5173'
Start-Process -FilePath 'python' -ArgumentList '-m','http.server','5173' -WorkingDirectory '.\web-frontend\dist' -NoNewWindow -PassThru | Out-Null

Start-Sleep -Seconds 1

Write-Output 'Running Playwright tests (use CTRL+C to stop)'
Push-Location .\web-frontend
$env:BACKEND_URL='http://127.0.0.1:8002'
$env:FRONTEND_URL='http://127.0.0.1:5173'
npx playwright test
Pop-Location

Write-Output 'Done'
