<#
Run a single Playwright test in headed mode with trace enabled.
Usage: .\scripts\run-playwright-seed.ps1 [test-path]
#>
param(
    [string]$TestPath = 'e2e/tests/seed_and_run.spec.ts'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $repoRoot

Write-Host "Running Playwright test: $TestPath"
$env:BACKEND_URL = 'http://127.0.0.1:8002'
$env:FRONTEND_URL = 'http://127.0.0.1:5173'

Push-Location web-frontend
try {
    npx playwright test $TestPath --workers=1 --trace=on --headed
} finally {
    Pop-Location
    Pop-Location
}
