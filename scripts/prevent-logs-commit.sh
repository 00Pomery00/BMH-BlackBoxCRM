#!/usr/bin/env bash
# Prevent committing runtime logs, DBs or backups. Exits non-zero if any staged file matches.
set -euo pipefail

if [ "$#" -eq 0 ]; then
  # pre-commit may call without files; check staged files
  files=$(git diff --cached --name-only)
else
  files="$@"
fi

for f in $files; do
  case "$f" in
    *.log|*.db|*.bak|*.sqlite)
      echo "ERROR: Attempt to commit runtime or backup file: $f"
      echo "Remove it or add to .gitignore before committing."
      exit 1
      ;;
  esac
done

exit 0
