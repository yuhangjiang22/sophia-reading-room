#!/usr/bin/env python3
"""Build a dated local PubMed discovery list for editorial screening."""
import csv, datetime, json, urllib.parse, urllib.request
from interest_utils import matching_preferences
ROOT = __import__('pathlib').Path(__file__).resolve().parents[1]
today = datetime.date.today().isoformat()
QUEUE = ROOT/'content'/'private'/'interest-queue.json'
try:
    interest_queue=json.loads(QUEUE.read_text(encoding='utf-8'))
    preferred_topics=sorted({str(x.get('topic','')).strip() for x in interest_queue.get('items',[]) if x.get('topic')})
    print(f'Loaded {len(interest_queue.get("items",[]))} saved-paper preference signals across {len(preferred_topics)} topics.')
except FileNotFoundError:
    preferred_topics=[]
    print('本轮无法读取 Sophia 的偏好；仍会独立整理发现集，不会把空队列当作无兴趣。')
except (ValueError, TypeError, json.JSONDecodeError) as exc:
    raise SystemExit(f'Interest queue is invalid; refusing to claim preference-prioritized discovery: {exc}')

queries = [
 '((psychiatry OR "mental health" OR psychology) AND (randomized OR systematic review OR meta-analysis OR guideline))',
 '((depression OR bipolar OR psychosis OR anxiety OR PTSD OR addiction OR sleep) AND (trial OR cohort OR meta-analysis))'
]
rows=[]; seen=set()
for q in queries:
    params=urllib.parse.urlencode({'db':'pubmed','term':f'{q} AND 2025:2026[dp]','retmax':'100','retmode':'json','sort':'relevance'})
    with urllib.request.urlopen('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?'+params, timeout=30) as r:
        ids=json.load(r)['esearchresult']['idlist']
    if not ids: continue
    params=urllib.parse.urlencode({'db':'pubmed','id':','.join(ids),'retmode':'json'})
    with urllib.request.urlopen('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?'+params, timeout=30) as r:
        data=json.load(r)['result']
    for pmid in ids:
        x=data.get(pmid,{}); doi=''
        for aid in x.get('articleids',[]):
            if aid.get('idtype')=='doi': doi=aid.get('value','')
        key=doi or pmid
        if key in seen: continue
        seen.add(key); title=x.get('title','').rstrip('.'); matched=matching_preferences(title,preferred_topics); rows.append({'found_date':today,'title':title,'year':x.get('pubdate','')[:4],'journal':x.get('fulljournalname',''),'doi':doi,'topic':'to classify','study_type':'to classify','source_url':f'https://pubmed.ncbi.nlm.nih.gov/{pmid}/','full_text':'verify','interest_priority':'prioritize_full_text' if matched else 'standard_review','matched_preference_topics':'; '.join(matched),'screening_status':'to_review','reason':'Needs title/abstract/full-text screening; preference matches are a soft priority only'})
out=ROOT/'content'/'private'/'research-discovery.csv'; exists=out.exists()
out.parent.mkdir(parents=True, exist_ok=True)
with out.open('a',newline='',encoding='utf-8') as f:
    w=csv.DictWriter(f,fieldnames=['found_date','title','year','journal','doi','topic','study_type','source_url','full_text','interest_priority','matched_preference_topics','screening_status','reason'])
    if not exists: w.writeheader()
    w.writerows(rows)
print(f'Added {len(rows)} unique PubMed records for review to {out}; {sum(bool(r["matched_preference_topics"]) for r in rows)} title-level matches were flagged for priority full-text review.')
