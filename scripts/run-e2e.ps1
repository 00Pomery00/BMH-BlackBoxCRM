<#
Run full local e2e: start backend, start frontend, wait for health, run Playwright tests.
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $repoRoot

Write-Host 'Starting backend (background)...'
Start-Process -FilePath 'powershell' -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','.\scripts\start-backend.ps1' -WindowStyle Hidden

Write-Host 'Starting frontend (background)...'
Start-Process -FilePath 'powershell' -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','.\scripts\start-frontend.ps1' -WindowStyle Hidden

Write-Host 'Waiting for backend /health (up to 60s)'
$max = 60
$i = 0
while ($i -lt $max) {
    try {
        $r = Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8002/health -TimeoutSec 5 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { Write-Host 'Backend healthy'; break }
    } catch {}
    Start-Sleep -Seconds 1
    $i++
}
if ($i -ge $max) { Write-Error 'Backend did not become healthy in time'; Pop-Location; exit 1 }

Write-Host 'Running Playwright e2e tests (web-frontend) with single worker for stability...'
Start-Sleep -Seconds 2
# Use npx to run Playwright with a single worker to reduce flakiness.
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Push-Location web-frontend
    $env:BACKEND_URL='http://127.0.0.1:8002'
    $env:FRONTEND_URL='http://127.0.0.1:5173'
    npx playwright test --workers=1
    Pop-Location
} else {
    Write-Error 'npx not found to run Playwright tests.'
    Pop-Location
    exit 1
}

Pop-Location
