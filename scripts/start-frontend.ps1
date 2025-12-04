<#
Start a static server for `web-frontend/dist` on port 5173.
Prefers `npx serve -s web-frontend/dist -l 5173`; falls back to Python http.server (no SPA fallback).
#>
param(
    [int]$Port = 5173
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $repoRoot

$dist = Join-Path $repoRoot 'web-frontend\dist'
if (-not (Test-Path $dist)) { Write-Error "Distribution not found at $dist. Run npm run build in web-frontend first."; Pop-Location; exit 1 }

Write-Host "Serving $dist on http://127.0.0.1:$Port"

# Try npx serve -s
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host 'Using npx serve for SPA-capable static serving'
    # On Windows `npx` is typically a cmd shim; run via cmd /c to be robust
    Start-Process -FilePath 'cmd' -ArgumentList '/c','npx','serve','-s',$dist,'-l',$Port -NoNewWindow
    Pop-Location
    return
}

# Fallback: simple Python http.server (no SPA fallback)
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host 'npx not found, falling back to python -m http.server (no SPA fallback)'
    Start-Process -FilePath 'python' -ArgumentList '-m','http.server',$Port,'--directory',$dist -NoNewWindow
    Pop-Location
    return
}

Write-Error 'Neither npx nor python found. Cannot serve frontend.'
Pop-Location
