import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

class MemoryKV {
  data=new Map();
  async put(key,value){this.data.set(key,value)}
  async get(key,type){const value=this.data.get(key);if(value===undefined)return null;return type==='json'?JSON.parse(value):value}
  async delete(key){this.data.delete(key)}
  async list({prefix}){return {keys:[...this.data.keys()].filter(name=>name.startsWith(prefix)).map(name=>({name}))}}
}
const secret='test-only-secret-for-unit-tests';
async function hash(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function env(){return {SOPHIA_INTERESTS:new MemoryKV(),SOPHIA_TOKEN_SHA256:'',WORKFLOW_SYNC_SECRET:'private-workflow-secret',ALLOWED_ORIGINS:'https://yuhangjiang22.github.io',SESSION_TTL_SECONDS:'43200'}}
function req(url,method='GET',headers={},body){return new Request('https://sync.example'+url,{method,headers,body:body===undefined?undefined:JSON.stringify(body)})}
async function login(e){e.SOPHIA_TOKEN_SHA256=await hash(secret);const result=await worker.fetch(req('/api/auth','POST',{'Content-Type':'application/json','Origin':'https://yuhangjiang22.github.io'},{token:secret}),e);assert.equal(result.status,200);return (await result.json()).session}

test('wrong token cannot create a session; valid token returns an opaque session',async()=>{
  const e=env();e.SOPHIA_TOKEN_SHA256=await hash(secret);
  const denied=await worker.fetch(req('/api/auth','POST',{'Content-Type':'application/json'},{token:'wrong-secret-token'}),e);
  assert.equal(denied.status,401);
  const token=await login(e);assert.match(token,/^[A-Za-z0-9_-]{40,}$/);
  const valid=await worker.fetch(req('/api/session','GET',{Authorization:`Bearer ${token}`}),e);
  assert.equal(valid.status,200);
});

test('feedback is available to the authenticated user and private workflow key only',async()=>{
  const e=env(),token=await login(e),origin='https://yuhangjiang22.github.io';
  const saved=await worker.fetch(req('/api/interests','POST',{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Origin:origin},{id:'paper-one',feedback:'interested',updatedAt:1700000000000}),e);
  assert.equal(saved.status,200);
  const publicDenied=await worker.fetch(req('/workflow/interests'),e);assert.equal(publicDenied.status,401);
  const privateResult=await worker.fetch(req('/workflow/interests','GET',{'X-Workflow-Key':e.WORKFLOW_SYNC_SECRET}),e);
  assert.equal(privateResult.status,200);assert.deepEqual((await privateResult.json()).items.map(i=>[i.id,i.feedback]),[['paper-one','interested']]);
  const userResult=await worker.fetch(req('/api/interests','GET',{Authorization:`Bearer ${token}`,Origin:origin}),e);
  assert.equal((await userResult.json()).items.length,1);
});

test('rejects malformed feedback and disallowed browser origins',async()=>{
  const e=env(),token=await login(e);
  const invalid=await worker.fetch(req('/api/interests','POST',{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},{id:'../../private',feedback:'interested'}),e);
  assert.equal(invalid.status,400);
  const wrongOrigin=await worker.fetch(req('/api/interests','GET',{Authorization:`Bearer ${token}`,Origin:'https://attacker.example'}),e);
  assert.equal(wrongOrigin.headers.get('Access-Control-Allow-Origin'),null);
});
