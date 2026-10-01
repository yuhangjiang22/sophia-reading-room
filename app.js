const edition = window.CONGER_EDITION;
const articles = [
{id:'sleep',topic:'睡眠与情绪',type:'原始研究 · 随机交叉试验',title:'当抑郁症的夜晚变得更深：一项慢波睡眠研究告诉了我们什么',desc:'一项随机、双盲、交叉试验，把抑郁症中的睡眠问题拆成慢波睡眠、次日警觉性和工作记忆几个可测量的问题。',question:'改善睡眠结构，能否成为理解抑郁症的新入口？',time:7},
{id:'credibility',topic:'心理治疗',type:'系统综述 · 研究可信度',title:'当“有效”还不够：一项系统综述重新检查了中国人群心理治疗试验的可信度',desc:'这篇 Lancet Psychiatry 系统综述纳入 857 项随机试验，关注随机化、分配隐藏、盲法、意向性分析和数据可信度。',question:'我们看到一个很大的治疗效应时，先应该问哪些方法学问题？',time:8}
];
const topics=['全部','睡眠与情绪','心理治疗'];
let saved=new Set(),read=new Set(),filter='全部',query='';
try{saved=new Set(JSON.parse(localStorage.getItem('conger-saved')||'[]'));read=new Set(JSON.parse(localStorage.getItem('conger-read')||'[]'))}catch{}
const app=document.getElementById('app');
const notice='<div class="notice"><span>✧</span><span>本期已收录 2 篇论文导读，来源与主要结果已完成首轮核对。</span></div>';
function persist(){try{localStorage.setItem('conger-saved',JSON.stringify([...saved]));localStorage.setItem('conger-read',JSON.stringify([...read]));return true}catch{toast('浏览器无法保存数据，本次会话仍可使用。');return false}}
let timer;function toast(text){const el=document.getElementById('toast');el.textContent=text;el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),2400)}
function saveButton(a){return `<button class="save" data-save="${a.id}" aria-pressed="${saved.has(a.id)}" aria-label="${saved.has(a.id)?'取消收藏':'收藏'}：${a.title}">${saved.has(a.id)?'已收藏':'＋ 收藏'}</button>`}
function card(a,i){return `<article class="card"><div class="card-top"><span class="tag">${a.topic}</span><span class="card-number">0${i+1}</span></div><h3><a href="#article/${a.id}">${a.title}</a></h3><p>${a.desc}</p><div class="card-bottom"><span class="meta">约 ${a.time} 分钟 · ${read.has(a.id)?'已读':(a.type||'论文导读')}</span>${saveButton(a)}</div></article>`}
function filtered(list){return list.filter(a=>(filter==='全部'||a.topic===filter)&&(`${a.title}${a.desc}${a.topic}`.includes(query)))}
function toolbar(){return `<div class="toolbar"><div class="filters" aria-label="按专题筛选">${topics.map(t=>`<button class="filter ${filter===t?'active':''}" data-filter="${t}" aria-pressed="${filter===t}">${t}</button>`).join('')}</div><input class="search" id="search" type="search" placeholder="搜索感兴趣的问题…" aria-label="搜索论文导读"></div>`}
function cards(list){const items=filtered(list);return items.length?items.map(card).join(''):'<div class="empty"><h2>这里还没有文章</h2><p>试试其他关键词或专题，或先收藏一篇感兴趣的样稿。</p></div>'}
function listSource(){return location.hash==='#shelf'?articles.filter(a=>saved.has(a.id)):articles}
function render(){let route=location.hash.slice(1)||'home';document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===route));if(document.getElementById('saved-count'))document.getElementById('saved-count').textContent=saved.size;document.title='聪儿的研究小屋';
setInterfaceLanguage(route.startsWith('english'));
if(route.startsWith('english')){renderEnglish();return}
if(route.startsWith('article/')){const a=articles.find(x=>x.id===route.split('/')[1]);if(a){renderArticle(a);return}app.innerHTML='<div class="empty"><h1>没有找到这篇文章</h1><a href="#home">回到研究小报</a></div>';return}
if(route==='shelf'){app.innerHTML=`<section class="page-title"><div class="eyebrow">YOUR LITTLE LIBRARY</div><h1>我的书架</h1><p>留住好奇，也留住下一次阅读的起点。</p><small>收藏与已读记录仅保存在当前浏览器，不会公开或跨设备同步。</small></section>${toolbar()}<div class="cards" id="cards">${cards(listSource())}</div>`}
else if(route==='topics'){app.innerHTML=`<section class="page-title"><div class="eyebrow">FOLLOW YOUR CURIOSITY</div><h1>沿着兴趣，继续探索</h1><p>从一个临床问题出发，把零散的发现连成知识。</p></section>${notice}<div class="topic-grid">${['睡眠与情绪'].map((t,i)=>`<button class="topic-card" data-topic="${t}"><span>专题 / 0${i+1}</span><strong>${t}</strong><span>${articles.some(a=>a.topic===t)?'阅读主题样稿':'内容筹备中'}</span></button>`).join('')}</div>${toolbar()}<div class="cards" id="cards">${cards(articles)}</div>`}
else{const a=articles.find(item=>item.id===edition.featuredArticleId)||articles[0];app.innerHTML=`<section class="welcome"><div><div class="eyebrow">A LITTLE ROOM FOR BIG DISCOVERIES</div><h1>${edition.headline}</h1><p>${edition.lines.join("<br>")}</p></div><div class="dog-space"><div id="dog-art" class="dog-placeholder" aria-label="陪伴阅读的小狗">🐶</div><small>${edition.companion}</small></div></section>${notice}<div class="section-head"><h2>这一期，值得慢慢读</h2><span class="issue">${edition.label}</span></div><section class="featured"><div class="feature-copy"><span class="tag">论文导读 · ${a.topic}</span><h2><a href="#article/${a.id}">${a.title}</a></h2><p>${a.desc}</p><div class="meta"><span>约 ${a.time} 分钟</span><span>论文导读</span></div><div class="feature-bottom"><a class="primary" href="#article/${a.id}">打开这篇论文导读</a>${saveButton(a)}</div></div><aside class="feature-note"><span class="label">带着一个问题阅读</span><p>“${a.question}”</p><small>从问题出发，再回到证据。</small></aside></section><div class="section-head"><h2>在这里，遇见更多问题</h2><small>不赶进度，跟着好奇心走。</small></div>${toolbar()}<div class="cards" id="cards">${cards(articles)}</div><div class="bottom-note"><strong>关于这里的每一篇文章</strong><span>正式内容将标注检索截止日期、原文依据与审核记录。证据不足时保留疑问，有待核查时暂缓发布。</span></div>`;const im=new Image();im.alt='Sophia 穿着紫色衣服与小狗一起读书的卡通形象';im.onload=()=>document.getElementById('dog-art')?.replaceWith(im);im.src='assets/conger-character-v1.png'}
const input=document.getElementById('search');if(input){input.value=query;input.addEventListener('input',e=>{query=e.target.value;document.getElementById('cards').innerHTML=cards(listSource())})}}
function renderArticle(a){
 document.title=a.title+' · 聪儿的研究小屋';
 const credibility=a.id==='credibility';
 const details=credibility?{
  intro:'这篇系统综述把“中国人群心理治疗试验为什么看起来特别有效”拆成一组可检查的方法学问题。作者不仅看疗效，还核对研究是否注册、随机化是否充分、分配是否隐藏、评估者是否盲法，以及数据是否可信。',
  design:'作者检索 MEDLINE、Embase、PsycINFO、CNKI 和 Wanfang，检索截至 2025 年 9 月 1 日；最终纳入 857 项随机对照试验、共 75,143 名参与者。',
  result:'方法学报告并不理想：仅 34 项（4%）注册方案，398 项（46%）充分说明随机化，21 项（2%）报告有效的分配隐藏，78 项（9%）提到评估者盲法，32 项（4%）采用意向性分析，78 项（9%）引用治疗手册。另有 417 项（49%）存在数据真实性疑虑；这些研究报告的效应量中位数为 g=2.06，而其余研究为 0.96。',
  clinical:'这不是说所有中国心理治疗研究都不可靠，而是提醒读者：看到很大的疗效时，要先检查研究设计和数据可信度。作者也观察到近五年随机化报告有所改善，最近研究中 257 项有 179 项（70%）充分报告随机化。',
  limits:'综述依赖已发表报告，方法学质量与数据真实性的判断也可能受报告不完整影响；效应量差异不能单独证明某项研究造假或治疗无效。'
 }:{
  intro:'这篇研究从一个具体的临床问题出发：抑郁症患者的睡眠结构能否被改变，以及这种改变是否影响次日状态。作者将问题拆成慢波睡眠、警觉性、工作记忆和 BDNF 等可测量结局。',
  design:'研究采用随机、双盲、交叉设计；29 名患者随机分配，23 人进入分析，22 人完成全部方案。羟丁酸钠、曲唑酮和安慰剂条件之间间隔 7 天洗脱期。',
  result:'单次夜间羟丁酸钠延长慢波睡眠、总睡眠时间和睡眠效率，并减少次日警觉性测试中的 lapses；工作记忆和 BDNF 未见效应。它是机制层面的 proof-of-concept，不是长期抑郁疗效试验。',
  clinical:'临床上，这项研究提示睡眠结构可能是值得继续研究的治疗靶点，但样本小、单中心、单夜给药，且参与者处于稳定抗抑郁治疗中，不能直接外推为用药建议。',
  limits:'主要限制是样本量和随访时间有限，研究没有回答长期抑郁症状、功能恢复、复发风险或长期安全性。'
 };
 app.innerHTML=`<article class="article"><a class="back" href="#home">返回研究小报</a><div style="margin-top:25px"><span class="tag">${a.topic} · ${a.type||'论文导读'}</span></div><h1>${a.title}</h1><p class="lead">${a.desc}</p><div class="meta"><span>约 ${a.time} 分钟</span><span>论文导读 · 已完成首轮核对</span></div><div class="article-actions">${saveButton(a)}<button class="save" data-read="${a.id}" aria-pressed="${read.has(a.id)}">${read.has(a.id)?'已读完 · 点击撤销':'标记为已读'}</button></div>${notice}<section class="summary"><div class="eyebrow">一分钟，先读这里</div><h2>先把问题问清楚</h2><p>${a.question}</p><p>本文依据原文摘要与期刊页面整理，结论范围与研究设计保持一致。</p></section><h2>01 / 为什么值得关注这个问题</h2><p>${details.intro}</p><h2>02 / 把研究放在一起阅读</h2><p>${details.design}</p><p>${details.result}</p><h2>03 / 从研究结果回到临床问题</h2><p>${details.clinical}</p><h2>04 / 把不确定性也留下来</h2><p>${details.limits}</p><section class="review"><h2>文献与质量记录</h2><dl><dt>当前状态</dt><dd>${credibility?'第二期论文导读，已完成摘要与关键数字核对':'第一期论文导读，已完成来源与主要结果核对'}</dd><dt>检索截止日期</dt><dd>检索截止 2026-10-01</dd><dt>文献来源</dt><dd>${credibility?'基于 PubMed 记录、摘要与期刊页面，原文链接见下方':'基于期刊全文页面与摘要，原文链接见下方'}</dd><dt>正式发布门槛</dt><dd>来源核实、数据核对、结论审查、分歧与局限检查已完成首轮</dd></dl></section><div class="bottom-note">每一篇论文都先回到原文，再进入我们的理解。</div></article>`}

document.addEventListener('click',e=>{const s=e.target.closest('[data-save]');if(s){const id=s.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);const ok=persist();render();if(ok)toast(saved.has(id)?'已放进你的书架':'已从书架移除');return}const r=e.target.closest('[data-read]');if(r){read.has(r.dataset.read)?read.delete(r.dataset.read):read.add(r.dataset.read);persist();render();return}const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;render();return}const t=e.target.closest('[data-topic]');if(t){filter=t.dataset.topic;query='';render();document.getElementById('cards').scrollIntoView({block:'start'});}});
window.addEventListener('hashchange',()=>{filter='全部';query='';render();window.scrollTo(0,0)});render();

function setInterfaceLanguage(english){
 document.documentElement.lang=english?'en':'zh-CN';
 document.querySelector('.brand').href=english?'#english':'#home';
 document.querySelector('.brand>span:last-child').innerHTML=(english?'Sophia’s English Studio':'聪儿的研究小屋')+'<small>'+(english?'READ · DISCOVER · PRACTISE':'SOPHIA’S READING ROOM')+'</small>';
 document.querySelector('nav').innerHTML=english?'<a href="#english" data-nav="english">Read</a><a href="#english/words" data-nav="english/words">Word bank</a><a href="#english/practice" data-nav="english/practice">Practice</a>':'<a href="#home" data-nav="home">研究小报</a><a href="#topics" data-nav="topics">探索专题</a><a href="#shelf" data-nav="shelf">我的书架 <span id="saved-count">'+saved.size+'</span></a>';
 document.querySelector('nav').setAttribute('aria-label',english?'English studio navigation':'主导航');
 const note=document.querySelector('.header-note');note.classList.add('area-switch');note.innerHTML=english?'<a href="#home" lang="zh-CN">返回中文研究区</a>':'<a href="#english">英语学习室 · English Studio</a>';
 document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===(location.hash.slice(1)||'home')));
 document.querySelector('footer>div').innerHTML='<span class="brand-icon">✿</span> '+(english?'A little English. A new way to understand.':'为聪儿，也为每一个保持好奇的人。');
 document.querySelector('footer>span').textContent=english?'Independent lessons · Psychology in everyday English':'精神医学与心理学 · 中文研究札记';
}
