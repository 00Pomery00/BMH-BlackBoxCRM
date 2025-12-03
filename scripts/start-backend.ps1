<#
Start backend reliably from repository .venv.

Behavior:
- Prefer existing `.venv`; fallback to `backend/.venv`.
- If no venv exists, try to create `.venv` using system `python`.
- Ensure `uvicorn[standard]` and `-r backend/requirements-minimal.txt` are installed.
- Start uvicorn in background and write logs to `logs/uvicorn.log`.
#>
param(
    [int]$Port = 8002
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Find-PythonInVenv($path) {
    $exe = Join-Path $path 'Scripts\python.exe'
    if (Test-Path $exe) { return (Resolve-Path $exe).Path }
    return $null
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $repoRoot

$venvCandidates = @('.venv','backend\.venv')
$python = $null
foreach ($v in $venvCandidates) {
    $p = Find-PythonInVenv($v)
    if ($p) { $python = $p; break }
}

if (-not $python) {
    Write-Host 'No repo venv found. Looking for system python to create .venv...'
    $sysPy = (Get-Command python -ErrorAction SilentlyContinue).Path
    if (-not $sysPy) { Write-Error 'No python found on PATH; please install Python or create .venv manually.'; Pop-Location; exit 1 }
    Write-Host "Creating .venv using $sysPy"
    & $sysPy -m venv .venv
    $python = Find-PythonInVenv('.venv')
    if (-not $python) { Write-Error 'Failed to create .venv'; Pop-Location; exit 1 }
}

Write-Host "Using python: $python"

# Ensure pip tooling
& $python -m pip install --upgrade pip setuptools wheel --disable-pip-version-check

# Install minimal requirements if present, otherwise ensure uvicorn
if (Test-Path 'backend/requirements-minimal.txt') {
    Write-Host 'Installing backend minimal requirements...'
    & $python -m pip install -r backend/requirements-minimal.txt --disable-pip-version-check
} else {
    Write-Host 'Installing uvicorn[standard] (requirements-minimal.txt not found)'
    & $python -m pip install "uvicorn[standard]" --disable-pip-version-check
}

# Prepare logs dir
New-Item -ItemType Directory -Force -Path logs | Out-Null

# Kill existing uvicorn processes started from this repo (best-effort)
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'uvicorn' -and $_.CommandLine -match 'backend.app.main' } | ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } catch {} }

$logPath = Join-Path $repoRoot 'logs\uvicorn.log'

Write-Host "Starting uvicorn on port $Port; logs -> $logPath"

# Start uvicorn in background and redirect output to log file so we can inspect errors.
# Use cmd /c to allow shell redirection on Windows.
$pwshCmd = "& `"$python`" -m uvicorn backend.app.main:app --host 127.0.0.1 --port $Port *> `"$logPath`""
Start-Process -FilePath 'powershell' -ArgumentList '-NoProfile','-WindowStyle','Hidden','-Command',$pwshCmd -WorkingDirectory $repoRoot

Start-Sleep -Seconds 1
try {
    $h = Invoke-WebRequest "http://127.0.0.1:$Port/health" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "BACKEND HEALTH: $($h.StatusCode)"
} catch {
    Write-Warning "Backend health failed: $($_.Exception.Message)"
    Write-Host 'Check logs in logs/uvicorn.log (if present) or run Start-Backend in foreground for diagnosis.'
}

Pop-Location
