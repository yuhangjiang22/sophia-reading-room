#!/usr/bin/env python3
"""Fail deployment if public articles lack source-index and bundled full-text audit."""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
index = ROOT / 'content/published/2026-10-issue-01-source-index.csv'
publication = ROOT / 'publication.js'
bundle = ROOT / 'public-batch.js'
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
    elif 'pubmed.ncbi.nlm.nih.gov' in row['source_url']:
        errors.append(f'{article_id}: source index points to abstract record, not full text')
if not bundle.exists():
    errors.append('public-batch.js is missing; build it before running this check')
else:
    text = bundle.read_text(encoding='utf-8')
    assignments = {}
    for name in ['SOPHIA_BATCH_PAPERS','SOPHIA_BATCH_STORIES','SOPHIA_BATCH_EXPANSIONS','SOPHIA_BATCH_DEPTH','SOPHIA_BATCH_VIGNETTES']:
        found = re.search(rf'window\.{name}=(.*?);(?=\n|$)', text)
        if not found:
            errors.append(f'public bundle is missing {name}')
            continue
        try:
            assignments[name] = json.loads(found.group(1))
        except json.JSONDecodeError as exc:
            errors.append(f'{name}: invalid JSON payload ({exc})')
    if len(assignments) == 5:
        batch_ids = {paper['id'] for paper in assignments['SOPHIA_BATCH_PAPERS']}
        if len(batch_ids) != 8:
            errors.append(f'expected 8 reviewed batch articles, found {len(batch_ids)}')
        if batch_ids - published:
            errors.append('public bundle contains article IDs outside publication allowlist')
        if published - batch_ids != {'sleep','mbct','pramipexole','cosi','ketamine','dmt'}:
            errors.append('public allowlist and reviewed batch bundle do not match')
        for paper in assignments['SOPHIA_BATCH_PAPERS']:
            article_id = paper['id']
            if not paper.get('fullTextUrl'):
                errors.append(f'{article_id}: bundle record has no full-text URL')
            for name in ['SOPHIA_BATCH_STORIES','SOPHIA_BATCH_EXPANSIONS','SOPHIA_BATCH_DEPTH','SOPHIA_BATCH_VIGNETTES']:
                if article_id not in assignments[name]:
                    errors.append(f'{article_id}: bundle missing {name}')
            story = assignments['SOPHIA_BATCH_STORIES'].get(article_id, {})
            if not str(story.get('note','')).startswith('全文核对说明：'):
                errors.append(f'{article_id}: article page lacks a full-text audit note')
        draft_ids = set(rows) - published
        leaked = draft_ids.intersection(text)
        if leaked:
            errors.append('public bundle contains unpublished draft IDs: ' + ', '.join(sorted(leaked)))
if errors:
    raise SystemExit('Full-text publication check failed:\n- ' + '\n- '.join(errors))
print(f'Full-text publication check passed: {len(published)} published articles have direct sources; unpublished drafts are excluded.')
