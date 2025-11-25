param(
  [string]$Version
)

if (-not $Version) {
  Write-Error "Usage: .\prepare_release.ps1 <version>   e.g. .\prepare_release.ps1 v1.2.0"
  exit 1
}

Write-Host "Preparing release $Version"

# Validate semver-ish tag
if ($Version -notmatch '^[vV]?\d+\.\d+\.\d+$') {
  Write-Warning "Version does not look like semantic version (vMAJOR.MINOR.PATCH). Continuing anyway."
}

Write-Host "Create annotated tag locally:"
Write-Host "  git tag -a $Version -m 'Release $Version'"
Write-Host "Push tag to origin when ready:"
Write-Host "  git push origin $Version"

Write-Host "Build images locally (optional):"
Write-Host "  docker build -t blackboxcrm-backend:$Version -f backend/Dockerfile ."
Write-Host "  docker build -t blackboxcrm-frontend:$Version -f web-frontend/Dockerfile ."

Write-Host "Save images to tar (for artifact-based deploy):"
Write-Host "  docker save blackboxcrm-backend:$Version -o backend-image-$Version.tar"
Write-Host "  docker save blackboxcrm-frontend:$Version -o frontend-image-$Version.tar"

Write-Host "If you want me to push the tag and/or images, run the git push and/or provide repo credentials and tell me 'pushuj <repo-url>'."
