#!/usr/bin/env python3
"""Build a dated local PubMed discovery list for editorial screening."""
import csv, datetime, json, urllib.parse, urllib.request
ROOT = __import__('pathlib').Path(__file__).resolve().parents[1]
today = datetime.date.today().isoformat()
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
        seen.add(key); rows.append({'found_date':today,'title':x.get('title','').rstrip('.'),'year':x.get('pubdate','')[:4],'journal':x.get('fulljournalname',''),'doi':doi,'topic':'to classify','study_type':'to classify','source_url':f'https://pubmed.ncbi.nlm.nih.gov/{pmid}/','full_text':'verify','screening_status':'to_review','reason':'Needs title/abstract/full-text screening'})
out=ROOT/'content'/'private'/'research-discovery.csv'; exists=out.exists()
out.parent.mkdir(parents=True, exist_ok=True)
with out.open('a',newline='',encoding='utf-8') as f:
    w=csv.DictWriter(f,fieldnames=['found_date','title','year','journal','doi','topic','study_type','source_url','full_text','screening_status','reason'])
    if not exists: w.writeheader()
    w.writerows(rows)
print(f'Added {len(rows)} unique PubMed records for review to {out}')
