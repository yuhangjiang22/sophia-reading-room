const jsonHeaders={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
const encoder=new TextEncoder();

function corsHeaders(request,env){
  const origin=request.headers.get('Origin');
  const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean);
  if(!origin||!allowed.includes(origin))return {};
  return {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type, X-Workflow-Key','Access-Control-Max-Age':'600','Vary':'Origin'};
}
function response(request,env,body,status=200,extra={}){
  return new Response(body===null?null:JSON.stringify(body),{status,headers:{...jsonHeaders,...corsHeaders(request,env),...extra}});
}
async function sha256(value){const bytes=await crypto.subtle.digest('SHA-256',encoder.encode(value));return [...new Uint8Array(bytes)].map(byte=>byte.toString(16).padStart(2,'0')).join('');}
async function sameSecret(left,right){if(typeof left!=='string'||typeof right!=='string')return false;const a=await crypto.subtle.digest('SHA-256',encoder.encode(left));const b=await crypto.subtle.digest('SHA-256',encoder.encode(right));const av=new Uint8Array(a),bv=new Uint8Array(b);let difference=0;for(let i=0;i<av.length;i++)difference|=av[i]^bv[i];return difference===0;}
function randomToken(){const bytes=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function bodyJson(request){const size=Number(request.headers.get('Content-Length')||0);if(size>8192)return null;try{return await request.json()}catch{return null}}
async function requireSession(request,env){const auth=request.headers.get('Authorization')||'';const match=auth.match(/^Bearer ([A-Za-z0-9_-]{30,100})$/);if(!match)return false;return Boolean(await env.SOPHIA_INTERESTS.get(`session:${await sha256(match[1])}`));}
async function storedItems(env){const list=await env.SOPHIA_INTERESTS.list({prefix:'feedback:'});const items=[];for(const key of list.keys){const value=await env.SOPHIA_INTERESTS.get(key.name,'json');if(value&&['interested','skip'].includes(value.feedback))items.push({id:key.name.slice('feedback:'.length),feedback:value.feedback,updatedAt:value.updatedAt});}return items.sort((a,b)=>b.updatedAt-a.updatedAt);}

export default {
  async fetch(request,env){
    const url=new URL(request.url),path=url.pathname,method=request.method;
    if(method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders(request,env)});
    if(path==='/health'&&method==='GET')return response(request,env,{status:'ok'});
    if(path==='/api/auth'&&method==='POST'){
      const body=await bodyJson(request);
      if(!body||typeof body.token!=='string'||body.token.length<8||body.token.length>256)return response(request,env,{error:'invalid_credentials'},401);
      const supplied=await sha256(body.token);
      if(!await sameSecret(supplied,env.SOPHIA_TOKEN_SHA256||''))return response(request,env,{error:'invalid_credentials'},401);
      const session=randomToken(),ttl=Math.max(300,Math.min(86400,Number(env.SESSION_TTL_SECONDS)||43200));
      await env.SOPHIA_INTERESTS.put(`session:${await sha256(session)}`,'1',{expirationTtl:ttl});
      return response(request,env,{session,expiresIn:ttl});
    }
    if(path==='/api/session'&&method==='GET')return await requireSession(request,env)?response(request,env,{valid:true}):response(request,env,{error:'unauthorized'},401);
    if(path==='/api/logout'&&method==='POST'){
      const match=(request.headers.get('Authorization')||'').match(/^Bearer ([A-Za-z0-9_-]{30,100})$/);
      if(match)await env.SOPHIA_INTERESTS.delete(`session:${await sha256(match[1])}`);
      return response(request,env,null,204);
    }
    if(path==='/api/interests'&&(method==='GET'||method==='POST')){
      if(!await requireSession(request,env))return response(request,env,{error:'unauthorized'},401);
      if(method==='GET')return response(request,env,{items:await storedItems(env)});
      const body=await bodyJson(request);
      if(!body||typeof body.id!=='string'||!/^[a-z0-9][a-z0-9-]{1,79}$/.test(body.id)||!['interested','skip'].includes(body.feedback))return response(request,env,{error:'invalid_feedback'},400);
      const updatedAt=Number.isSafeInteger(body.updatedAt)&&body.updatedAt>0?Math.min(body.updatedAt,Date.now()):Date.now();
      const key=`feedback:${body.id}`,previous=await env.SOPHIA_INTERESTS.get(key,'json');
      if(!previous||updatedAt>=previous.updatedAt)await env.SOPHIA_INTERESTS.put(key,JSON.stringify({feedback:body.feedback,updatedAt}));
      return response(request,env,{saved:true});
    }
    if(path==='/workflow/interests'&&method==='GET'){
      if(!env.WORKFLOW_SYNC_SECRET||!await sameSecret(request.headers.get('X-Workflow-Key')||'',env.WORKFLOW_SYNC_SECRET))return response(request,env,{error:'unauthorized'},401);
      return response(request,env,{items:await storedItems(env),retrievedAt:new Date().toISOString()});
    }
    return response(request,env,{error:'not_found'},404);
  }
};
