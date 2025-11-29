#!/usr/bin/env python3
"""Validate YAML files under .github/workflows using PyYAML.

Prints a short report and exits with code 0 if all files parse, non-zero otherwise.
"""
import glob
import os
import sys

import yaml

root = os.path.join(os.getcwd(), ".github", "workflows")
if not os.path.isdir(root):
    print("No .github/workflows directory found")
    sys.exit(1)

files = sorted(
    glob.glob(os.path.join(root, "*.yml")) + glob.glob(os.path.join(root, "*.yaml"))
)
results = []
for path in files:
    name = os.path.basename(path)
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        # allow multiple documents
        list(yaml.safe_load_all(content))
        results.append((name, "OK", None))
    except Exception as e:
        results.append((name, "ERROR", str(e)))

ok = [r for r in results if r[1] == "OK"]
err = [r for r in results if r[1] == "ERROR"]

print(f"Checked {len(results)} workflow files: {len(ok)} OK, {len(err)} errors")
for name, status, msg in results:
    if status == "OK":
        print(f"  {name}: OK")
    else:
        print(f"  {name}: PARSE ERROR:\n    {msg}")

sys.exit(0 if not err else 2)
