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
function card(a,i){return `<article class="card" data-open="${a.id}" tabindex="0" role="link" aria-label="打开：${a.title}"><div class="card-top"><span class="tag">${a.topic}</span><span class="card-number">0${i+1}</span></div><h3><a href="#article/${a.id}">${a.title}</a></h3><p>${a.desc}</p><div class="card-bottom"><span class="meta">约 ${a.time} 分钟 · ${read.has(a.id)?'已读':(a.type||'论文导读')}</span>${saveButton(a)}</div></article>`}
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
  intro:'想象你在门诊里看到一项研究：心理治疗的效应量很大，结论也写得很确定。真正需要追问的，是这份确定感从哪里来。这篇系统综述把“中国人群心理治疗试验为什么看起来特别有效”拆成一组可检查的方法学问题。作者不仅看疗效，还核对研究是否注册、随机分组是否充分、分配过程是否被隐藏、结果评估者是否不知道分组，以及数据是否可信。',
  context:'这项工作的价值不在于再宣布一次“心理治疗有效”，而在于检查疗效数字是否值得信任。对于精神科医生来说，研究报告的透明度会影响我们如何判断效应大小、如何向患者解释预期，也会影响后续研究能否复现。',
  design:'作者检索 MEDLINE、Embase、PsycINFO、CNKI 和 Wanfang，检索截至 2025 年 9 月 1 日；最终纳入 857 项随机对照试验、共 75,143 名参与者。换句话说，这不是对某一项治疗的单点判断，而是把一整批试验放到同一张方法学检查表上。',
  result:'结果首先揭示了报告层面的缺口。方法学报告并不理想：仅 34 项（4%）注册方案，398 项（46%）充分说明随机分组，21 项（2%）报告了有效的分配隐藏，78 项（9%）提到评估者不知道分组，32 项（4%）采用了“按最初分组分析”的意向性分析，78 项（9%）引用了治疗手册。',
  resultExtra:'更值得注意的是，417 项（49%）存在数据真实性疑虑。存在疑虑的研究报告效应量中位数为 g=2.06，而其余研究为 0.96。这个差异提示我们：方法学透明度不足，可能和异常偏大的疗效同时出现。',
  meaning:'这些数字放在一起看，说明问题不是某一个统计步骤偶尔缺失，而是许多试验同时缺少让读者复核结论所需的信息。随机化、分配隐藏和盲法分别控制不同的偏倚；它们缺失时，疗效可能被高估，但不能仅凭一项缺失就判定结果无效。',
  clinical:'这不是说所有中国心理治疗研究都不可靠，而是提醒读者：看到很大的疗效时，要先检查研究设计和数据可信度。作者也观察到近五年随机化报告有所改善，最近研究中 257 项有 179 项（70%）充分报告随机化。',
  takeaway:'读这类研究时，可以先问三句话：患者是怎样被分组的？结果有没有被完整地记录和分析？这么大的效应，是否与研究设计和数据质量相称？',
  limits:'综述依赖已发表报告，方法学质量与数据真实性的判断也可能受报告不完整影响；效应量差异不能单独证明某项研究造假或治疗无效。它更像一盏质量检查灯：帮助读者知道哪些结果值得进一步核验，而不是替临床做出“可信/不可信”的二元裁决。'
 }:{
  intro:'夜里，抑郁症患者可能睡了很久，却仍然没有恢复感。于是研究者没有先问“睡了几小时”，而是追问睡眠结构本身：抑郁症患者的睡眠结构能否被改变，以及这种改变是否影响次日状态。作者将问题拆成慢波睡眠、警觉性、工作记忆和 BDNF 等可测量结局。',
  context:'抑郁症中的睡眠问题并不只是“睡得少”。睡眠的深度、连续性和第二天的警觉状态，可能与症状维持和功能恢复有关。这项研究选择慢波睡眠作为切入口，是因为它可以被多导睡眠监测直接测量。',
  design:'研究采用随机、双盲、交叉设计；29 名患者随机分配，23 人进入分析，22 人完成全部方案。每位参与者在不同夜晚接受羟丁酸钠、曲唑酮或安慰剂，条件之间间隔 7 天洗脱期，因此研究者可以更多地比较同一个人在不同条件下的变化。',
  result:'关键结果是：单次夜间羟丁酸钠延长慢波睡眠、总睡眠时间和睡眠效率，并减少次日警觉性测试中的 lapses。也就是说，药物确实改变了睡眠结构，并在第二天的警觉性任务上留下了可测量的变化。',
  resultExtra:'但工作记忆和脑源性神经营养因子（BDNF）未见明显变化。研究因此更接近机制层面的 proof-of-concept：它说明一个生理环节可以被改变，还没有证明长期抑郁症状会因此改善。',
  meaning:'这里最重要的分界是“改变了睡眠指标”和“改善了抑郁症”并不是同一件事。研究支持前者：睡眠结构和部分次日警觉性指标发生了变化；它没有提供足够的时间跨度和样本量来证明后者。',
  clinical:'临床上，这项研究提示睡眠结构可能是值得继续研究的治疗靶点，但样本小、单中心、单夜给药，且参与者处于稳定抗抑郁治疗中，不能直接外推为用药建议。',
  takeaway:'读完这项研究，可以把问题带回临床：患者的睡眠主诉究竟是时长问题、结构问题，还是白天功能问题？不同答案可能需要不同的评估和干预，而不是只追求一个“睡够几小时”的数字。',
  limits:'主要限制是样本量和随访时间有限，研究没有回答长期抑郁症状、功能恢复、复发风险或长期安全性。也就是说，它提供的是“睡眠结构可以被实验性改变”的线索，不是“这种做法已经能够治疗抑郁症”的结论。'
 };
 app.innerHTML=`<article class="article"><a class="back" href="#home">返回研究小报</a><div style="margin-top:25px"><span class="tag">${a.topic} · ${a.type||'论文导读'}</span></div><h1>${a.title}</h1><p class="lead">${a.desc}</p><div class="meta"><span>约 ${a.time} 分钟</span><span>论文导读 · 已完成首轮核对</span></div><div class="article-actions">${saveButton(a)}<button class="save" data-read="${a.id}" aria-pressed="${read.has(a.id)}">${read.has(a.id)?'已读完 · 点击撤销':'标记为已读'}</button></div>${notice}<section class="summary"><div class="eyebrow">一分钟，先读这里</div><h2>先把问题问清楚</h2><p>${a.question}</p><p>本文依据原文摘要与期刊页面整理，结论范围与研究设计保持一致。</p></section><h2>01 / 先从一个临床场景开始</h2><p>${details.intro}</p><p>${details.context}</p><h2>02 / 研究者是怎样回答的</h2><p>${details.design}</p><h2>03 / 结果到底改变了什么</h2><p>${details.result}</p><p>${details.resultExtra}</p><h2>04 / 这些结果意味着什么</h2><p>${details.meaning}</p><h2>05 / 把结果放回临床现场</h2><p>${details.clinical}</p><h2>06 / 读者可以带走什么</h2><p>${details.takeaway}</p><h2>07 / 读完之后，哪些话不能说得太满</h2><p>${details.limits}</p><section class="review"><h2>文献与质量记录</h2><dl><dt>当前状态</dt><dd>${credibility?'第二期论文导读，已完成摘要与关键数字核对':'第一期论文导读，已完成来源与主要结果核对'}</dd><dt>检索截止日期</dt><dd>检索截止 2026-10-01</dd><dt>文献来源</dt><dd>${credibility?'基于 PubMed 记录、摘要与期刊页面，原文链接见下方':'基于期刊全文页面与摘要，原文链接见下方'}</dd><dt>正式发布门槛</dt><dd>来源核实、数据核对、结论审查、分歧与局限检查已完成首轮</dd></dl></section><div class="bottom-note">每一篇论文都先回到原文，再进入我们的理解。</div></article>`}

document.addEventListener('click',e=>{const card=e.target.closest('[data-open]');if(card&&!e.target.closest('a,button')){location.hash='#article/'+card.dataset.open;return}const s=e.target.closest('[data-save]');if(s){const id=s.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);const ok=persist();render();if(ok)toast(saved.has(id)?'已放进你的书架':'已从书架移除');return}const r=e.target.closest('[data-read]');if(r){read.has(r.dataset.read)?read.delete(r.dataset.read):read.add(r.dataset.read);persist();render();return}const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;render();return}const t=e.target.closest('[data-topic]');if(t){filter=t.dataset.topic;query='';render();document.getElementById('cards').scrollIntoView({block:'start'});}});
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

document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('a,button')&&e.target.closest('[data-open]')){e.preventDefault();location.hash='#article/'+e.target.closest('[data-open]').dataset.open}});
