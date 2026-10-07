#!/usr/bin/env python3
"""Fail deployment if a published article lacks a recorded full-text audit."""
import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
index = ROOT / 'content/published/2026-10-issue-01-source-index.csv'
publication = ROOT / 'publication.js'
with index.open(encoding='utf-8-sig', newline='') as handle:
    rows = {row['article_id']: row for row in csv.DictReader(handle)}
source = publication.read_text(encoding='utf-8')
match = re.search(r"articleIds:\s*\[([^\]]*)\]", source)
if not match:
    raise SystemExit('publication.js has no explicit articleIds allowlist')
published = set(re.findall(r"['\"]([^'\"]+)['\"]", match.group(1)))
if not published:
    raise SystemExit('The published article allowlist must not be empty')
errors = []
for article_id in sorted(published):
    row = rows.get(article_id)
    if row is None:
        errors.append(f'{article_id}: missing from source index')
    elif row['evidence_basis'] != 'full_text_checked':
        errors.append(f"{article_id}: evidence_basis is {row['evidence_basis']!r}")
if errors:
    raise SystemExit('Full-text publication check failed:\n- ' + '\n- '.join(errors))
print(f'Full-text publication check passed: {len(published)} published articles have full_text_checked records.')
