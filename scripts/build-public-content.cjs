#!/usr/bin/env node
// Assemble only reviewed article records and long-form content for the public Pages bundle.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
const sources = [
  'batch-papers.js', 'batch-stories.js', 'batch-expansions.js',
  'batch-longform.js', 'batch-blog-arc.js', 'batch-blog-continuation.js',
  'batch-depth.js', 'batch-vignettes.js', 'publication.js'
];
for (const file of sources) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const { window } = context;
const ids = window.SOPHIA_PUBLICATION?.articleIds;
if (!Array.isArray(ids) || !ids.length) throw new Error('Missing public article allowlist');
const publicIds = new Set(ids);
const publishedBatch = window.SOPHIA_BATCH_PAPERS.filter(paper => publicIds.has(paper.id));
const batchIds = publishedBatch.map(paper => paper.id);
for (const paper of publishedBatch) {
  if (!paper.fullTextUrl) throw new Error(`${paper.id}: no full-text URL`);
  for (const mapName of ['SOPHIA_BATCH_STORIES', 'SOPHIA_BATCH_EXPANSIONS', 'SOPHIA_BATCH_DEPTH', 'SOPHIA_BATCH_VIGNETTES']) {
    if (!window[mapName]?.[paper.id]) throw new Error(`${paper.id}: missing ${mapName} content`);
  }
}
if (publishedBatch.length !== ids.length - 6) {
  throw new Error(`Expected 8 reviewed batch records, got ${publishedBatch.length}`);
}
function pickMap(name) {
  const source = window[name] || {};
  return Object.fromEntries(batchIds.filter(id => source[id]).map(id => [id, source[id]]));
}
const payload = {
  SOPHIA_BATCH_PAPERS: publishedBatch,
  SOPHIA_BATCH_STORIES: pickMap('SOPHIA_BATCH_STORIES'),
  SOPHIA_BATCH_EXPANSIONS: pickMap('SOPHIA_BATCH_EXPANSIONS'),
  SOPHIA_BATCH_DEPTH: pickMap('SOPHIA_BATCH_DEPTH'),
  SOPHIA_BATCH_VIGNETTES: pickMap('SOPHIA_BATCH_VIGNETTES')
};
const out = Object.entries(payload).map(([name, value]) => `window.${name}=${JSON.stringify(value)};`).join('\n') + '\n';
const outPath = path.join(root, 'public-batch.js');
fs.writeFileSync(outPath, out);
const leaked = [...window.SOPHIA_BATCH_PAPERS.filter(paper => !publicIds.has(paper.id)).map(paper => paper.id)];
if (leaked.some(id => out.includes(id))) throw new Error('Unpublished batch content leaked into public bundle');
console.log(`Built public bundle with ${ids.length} reviewed articles (${batchIds.length} batch articles); unpublished drafts excluded.`);
