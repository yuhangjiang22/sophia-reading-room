(function(){
  const TOKEN_HASH='af7c99973047a421b606881106bf63748b87a5f3106e7b6daf0a9390f389dbd2';
  const app=document.getElementById('app'), nav=document.querySelector('header'), footer=document.querySelector('footer');
  const encoder=new TextEncoder();
  async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',encoder.encode(value));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
  function unlock(){sessionStorage.setItem('sophia-auth','ok');location.reload();}
  function addLogout(){if(document.getElementById('logout'))return;const b=document.createElement('button');b.id='logout';b.className='save';b.textContent='退出';b.addEventListener('click',window.sophiaLogout);nav.appendChild(b);}
  function showLogin(message=''){app.hidden=false;nav.hidden=true;footer.hidden=true;app.innerHTML=`<section class="login-shell"><div class="login-card"><div class="brand-mark">✿</div><div class="eyebrow">SOPHIA’S PRIVATE READING ROOM</div><h1>欢迎回来，聪儿。</h1><p>这是你的私人研究小屋。输入访问 token 后继续。</p><form id="token-form"><label for="access-token">Access token</label><input id="access-token" type="password" autocomplete="current-password" placeholder="输入 token" required><button class="primary" type="submit">进入研究小屋</button><span class="login-error" role="alert">${message}</span></form></div></section>`;document.getElementById('access-token').focus();document.getElementById('token-form').addEventListener('submit',async e=>{e.preventDefault();const input=document.getElementById('access-token');if(await digest(input.value)===TOKEN_HASH){unlock();location.hash=location.hash||'#home';window.dispatchEvent(new HashChangeEvent('hashchange'));}else{input.value='';document.querySelector('.login-error').textContent='Token 不正确，请再试一次。';}});}
  window.sophiaLogout=()=>{sessionStorage.removeItem('sophia-auth');location.hash='#home';showLogin();};
  if(sessionStorage.getItem('sophia-auth')==='ok'){app.hidden=false;nav.hidden=false;footer.hidden=false;addLogout();}else showLogin();
})();
