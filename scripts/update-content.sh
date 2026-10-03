#!/bin/sh
set -eu
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"
python3 scripts/sync-interests.py
STAMP="$(date +%Y-%m-%d)"
printf '%s\n' "Content cycle $STAMP: read the private interest queue, then discover and screen research locally."
printf '%s\n' "Use saved topics only as soft priorities for full-text checks; they do not approve, draft, or publish papers."
printf '%s\n' "Keep discovery records private; source, data, and editorial review remain required before a user-reviewed release."
