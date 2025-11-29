#!/usr/bin/env python3
"""Architect validator: basic repo integrity checks run by 'ws-architect'.

Checks performed:
- YAML parse for each file in `.github/workflows/*.yml`
- Tab characters in YAML files (tabs are invalid for YAML indentation)
- Simple secrets/token heuristics (common patterns)

Exit code 0 = OK, 1 = problems found.
"""
import re
import sys
from pathlib import Path

try:
    import yaml
except Exception:
    print("Missing dependency 'pyyaml'. Install with: python -m pip install pyyaml")
    sys.exit(2)

ROOT = Path(".").resolve()
WORKFLOWS = ROOT.joinpath(".github", "workflows")


def check_file(p: Path):
    txt = p.read_text(encoding="utf8")
    problems = []
    if "\t" in txt:
        problems.append("Contains tab characters (YAML forbids tabs for indentation)")
    try:
        # safe_load_all to allow multiple documents though Actions workflows normally single doc
        list(yaml.safe_load_all(txt))
    except Exception as e:
        problems.append(f"YAML parse error: {e}")
    # Simple secrets heuristics: look for suspicious keywords but ignore values that use GitHub secrets interpolation (e.g. ${{ secrets.X }})
    secrets = []
    suspicious_patterns = [
        r"(?i)aws[_-]?secret",
        r"(?i)secret[_-]?key",
        r"(?i)password",
        r"(?i)api[_-]?key",
    ]
    for pattern in suspicious_patterns:
        for m in re.finditer(pattern, txt):
            # capture the full line where the match occurs to see if it's using secrets interpolation
            line = (
                txt[: m.start()].splitlines()[-1]
                if "\n" in txt[: m.start()]
                else txt[: m.start()]
            )
            # get the remainder of the line after the match
            # simple safety: if the line contains '${{' then assume it's using GitHub secrets and ignore
            if "${{" in line or "${{" in txt[m.start() : m.start() + 200]:
                continue
            secrets.append(pattern)
    if secrets:
        problems.append(
            "Potential secrets/keys found: " + ", ".join(sorted(set(secrets)))
        )
    return problems


def main():
    if not WORKFLOWS.exists():
        print("No workflows directory found; nothing to validate.")
        return 0
    any_problems = False
    for p in sorted(WORKFLOWS.glob("*.yml")):
        rel = p.relative_to(ROOT)
        problems = check_file(p)
        if problems:
            any_problems = True
            print(f"-- {rel} problems:")
            for pr in problems:
                print("   -", pr)
        else:
            print(f"-- {rel}: ok")
    if any_problems:
        print("\nArchitect validation FAILED. Fix the reported issues before merging.")
        return 1
    print("\nArchitect validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
