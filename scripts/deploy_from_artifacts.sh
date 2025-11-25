#!/usr/bin/env bash
set -euo pipefail

# deploy_from_artifacts.sh
# Usage:
#  ./deploy_from_artifacts.sh --host user@host --private-key ~/.ssh/id_rsa --backend backend-image.tar --frontend frontend-image.tar --remote-dir /opt/blackboxcrm
#
# Script uploads backend/frontend image tarballs to remote host, loads them into Docker,
# updates a docker-compose file and restarts the stack.

print_usage(){
  echo "Usage: $0 --host user@host --private-key /path/to/key --backend backend-image.tar --frontend frontend-image.tar --remote-dir /opt/blackboxcrm"
}

HOST=""
KEY=""
BACKEND_TAR=""
FRONTEND_TAR=""
REMOTE_DIR="/opt/blackboxcrm"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host) HOST="$2"; shift 2;;
    --private-key) KEY="$2"; shift 2;;
    --backend) BACKEND_TAR="$2"; shift 2;;
    --frontend) FRONTEND_TAR="$2"; shift 2;;
    --remote-dir) REMOTE_DIR="$2"; shift 2;;
    -h|--help) print_usage; exit 0;;
    *) echo "Unknown arg: $1"; print_usage; exit 1;;
  esac
done

if [[ -z "$HOST" || -z "$KEY" || -z "$BACKEND_TAR" || -z "$FRONTEND_TAR" ]]; then
  echo "Missing arguments" >&2
  print_usage
  exit 2
fi

echo "Deploying to $HOST (remote dir: $REMOTE_DIR)"

scp -i "$KEY" "$BACKEND_TAR" "$FRONTEND_TAR" "$HOST":"$REMOTE_DIR/"

ssh -i "$KEY" "$HOST" bash -s <<'EOF'
set -euo pipefail
REMOTE_DIR="$REMOTE_DIR"
cd "$REMOTE_DIR"

echo "Loading backend image..."
docker load -i "$(basename "$BACKEND_TAR")" || true
echo "Loading frontend image..."
docker load -i "$(basename "$FRONTEND_TAR")" || true

echo "Pulling updated docker-compose if present..."
if [[ -f docker-compose.yml ]]; then
  docker compose pull || true
fi

echo "Restarting stack..."
docker compose up -d --remove-orphans

echo "Deployment finished on remote host."
EOF

echo "Done."
