import glob
import sys

import yaml

ok = True
for f in sorted(glob.glob(".github/workflows/*.yml")):
    try:
        with open(f, "r", encoding="utf-8") as fh:
            yaml.safe_load(fh)
        print(f + ": OK")
    except Exception as e:
        ok = False
        print(f + ": ERROR ->", e)
if not ok:
    sys.exit(2)
print("All workflow YAML files parsed OK")
