Pre-commit hooks and repository hygiene
=====================================

We use `pre-commit` to keep the repository clean and to prevent accidental commits of runtime logs or database files.

Install and enable locally (recommended):

```powershell
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

What the hooks do:
- `end-of-file-fixer`: ensures files end with a newline
- `trailing-whitespace`: removes trailing whitespace
- `check-added-large-files`: blocks very large files from being added
- `prevent-logs` (local): blocks committing `*.log`, `*.db`, `*.bak`, `*.sqlite` files. The script is `scripts/prevent-logs-commit.sh`.

If you prefer not to use pre-commit, at minimum ensure these files are in `.gitignore` and avoid committing runtime artifacts.
