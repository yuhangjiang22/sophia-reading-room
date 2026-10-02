#!/bin/sh
set -eu
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
STAMP="$(date +%Y-%m-%d)"
printf '%s\n' "Content cycle $STAMP: discover research locally, prepare full story articles in content/published, then run the audit checklist in content/README.md."
printf '%s\n' "Keep discovery records private to the editorial workflow; the site publishes reviewed articles only."
printf '%s\n' "This script is a local checkpoint; it does not publish unreviewed content or call an online LLM."
