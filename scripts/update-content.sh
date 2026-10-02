#!/bin/sh
set -eu
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
STAMP="$(date +%Y-%m-%d)"
printf '%s\n' "Content cycle $STAMP: review candidate papers, update content/published, then run the audit checklist in content/README.md."
python3 "$ROOT/scripts/sync-interests.py"
printf '%s\n' "This script is intentionally a local checkpoint; it does not publish unreviewed content or call an online LLM."
