import re
import sys

PATTERN = re.compile(r"\.(log|db|bak|sqlite)$", re.IGNORECASE)


def main(paths):
    blocked = [p for p in paths if PATTERN.search(p)]
    if blocked:
        print("Error: Prevented committing runtime/log or DB files:")
        for p in blocked:
            print("  -", p)
        print(
            "Please remove these files from the commit (git rm --cached <file>) or adjust .gitignore."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
