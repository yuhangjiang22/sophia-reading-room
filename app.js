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
 const paragraphs=text=>text.trim().split(/\n\s*\n/).map(x=>`<p>${x}</p>`).join('');
 const story=credibility?{
  kicker:'一篇系统综述如何调查“疗效数字背后的研究现场”',
  opening:`门诊或学术会议上，一个醒目的疗效数字很容易让人停下来：干预组改善很多，对照组变化很小，作者于是写下“效果显著”。但在这个结论之前，有一整段看不见的过程：患者怎样进入试验、谁决定分组、治疗有没有按计划执行、结果有没有按原方案分析。\n\n这篇论文追问的正是这段过程。它没有评选哪一种心理治疗最好，而是回头查看一批针对常见精神障碍的心理干预随机试验，问这些试验留下了多少足够让别人相信、复核和重复的证据。`,
  scene:`作者把范围限定在成年人常见精神障碍的心理干预试验，参与者至少 80% 为汉族。研究团队从 MEDLINE、Embase、PsycINFO、CNKI 和万方寻找中英文论文，检索到 2025 年 9 月 1 日。筛选和资料提取由 12 位评审者独立、重复完成。\n\n搜索先找到 37,787 条记录，最终留下 857 项随机对照试验，共 75,143 名参与者。这个规模很重要：它让我们看到的不是某个研究团队的偶然失误，而是一个领域在注册、设计、报告和发表上的整体图景。`,
  method:`研究者像检查一份试验档案那样逐项核对。随机分组，是否真的用合适方法产生？分配隐藏，能不能避免研究人员预先知道下一个患者进哪组？结局评估者盲法，评估结果的人是否不知道患者接受了什么？意向性分析，是否尽量按最初分组保留所有参与者？治疗手册，别人能否知道心理干预具体做了什么？\n\n这些环节各自处理不同的偏倚。它们不是为了让论文显得“更规范”的手续，而是决定研究结果能否被独立检查。`,
  turn:`检查表带来的第一层发现不太轻松：只有 34 项（4%）报告了注册方案；398 项（46%）充分报告随机化方法；21 项（2%）使用有效的分配隐藏；78 项（9%）报告结局评估者盲法；32 项（4%）采用意向性分析；78 项（9%）引用了所用干预的治疗手册。\n\n第二层发现更值得停下来想一想：417 项（49%）被评审者标记为存在数据真实性方面的关注。这些研究报告的效应量中位数为 Hedges’ g=2.06；没有被标记相关关注的 440 项研究，中位数为 g=0.96。两组数字差别很大，但它们是综述中的关联，不足以单独证明某篇研究造假，也不能推出所有大效应都是假的。`,
  meaning:`为什么这组数字会让人警觉？心理治疗研究很难像药物试验那样让治疗师和患者都不知道自己接受了哪种治疗，但仍可以通过规范随机化、隐藏分配、盲法评估和透明分析来减少偏倚。如果这些信息没有报告，读者就很难判断“疗效很大”究竟反映真实改善，还是部分来自期待、选择、测量或分析方式。\n\n综述还看到一条向好的变化：检索范围最后五年发表的 257 项研究里，179 项（70%）充分报告了随机化方法；而 2006 年以前的 18 项研究中，没有一项充分报告这一点。进步是真实的，但“报告清楚”只是能够接受检查的起点，不等同于每项研究已经可靠。`,
  clinic:`对临床读者来说，这篇综述更像一副阅读眼镜，而不是治疗指南。遇到一篇声称疗效特别大的心理治疗试验，可以依次追问：患者如何分组？对照组接受了什么？评估者知不知道分组？失访者如何处理？干预内容是否写到足以复现？研究有没有预先注册？\n\n如果论文没有提供这些答案，合适的做法是降低对精确效应量的信心，并寻找其他设计、其他团队或不同场景下的重复证据。不能因此把某一种治疗一笔勾销，也不能把群体层面的可信度检查直接变成对具体患者治疗选择的判断。`,
  close:`这篇研究的故事最后落在“谁来修补证据链”上。作者指出，改善需要多方一起做：研究团队接受方法学训练、提前注册并透明报告；期刊要求执行成熟的报告规范；监管和研究机构建立能持续运行的质量基础设施。综述统计的 278 种期刊中，188 种（68%）没有可查到的试验报告指南，只有 41 种（15%）提及成熟的报告标准。\n\n所以，它留下的问题不只是“这些试验值不值得信”，还包括：发表系统有没有要求研究把过程交代清楚？如果研究设计和报告质量持续改善，这一大批试验能不能逐步变成可累积、可复核的临床证据？这篇综述没有替每项研究作最终裁决，却让这两个问题无法再被跳过。`,
  note:'重要边界：数据真实性关注是结构化评估中需要进一步核验的信号，不等于对作者或单项试验作出造假认定。本文解读的是这篇系统综述的范围和发现。',
  source:'https://pubmed.ncbi.nlm.nih.gov/42309104/', sourceLabel:'PubMed 论文记录与摘要 · PMID 42309104 · DOI 10.1016/S2215-0366(26)00133-1'
 }:{
  kicker:'一夜实验追问：睡得更深，第二天会不会更清醒？',
  opening:`有些睡眠问题，用“睡了几小时”说不清。一个人可能在床上待了很久，醒来仍觉得没有恢复；也有人入睡不难，却发现第二天注意力很容易断掉。对抑郁症患者来说，失眠、夜间觉醒和白天困倦都很常见，研究者想知道的于是更具体：夜里的睡眠结构能否被改变？这种改变会不会带到第二天？\n\n先说明，这里没有一个被论文追踪的“典型患者”。下面从常见临床困惑进入研究，是为了讲清楚问题，不是把虚构病例当成试验参与者。`,
  scene:`慢波睡眠，也叫 N3 或深睡眠，是研究者选中的入口。以往研究提示，重性抑郁障碍中慢波睡眠可能减少，但个体差异很大；而一些常用助眠药可能让人更困，却未必增加这种恢复性睡眠。羟丁酸钠（GHB，临床制剂为 sodium oxybate）已用于发作性睡病，能促进慢波睡眠，因此研究团队把它带进了抑郁症睡眠实验。\n\n他们没有直接问“它能不能治疗抑郁症”，而是先做一个更窄、更容易测量的检验：与安慰剂和曲唑酮相比，单次给药能否改变整夜的睡眠结构，以及第二天的警觉、工作记忆和情绪指标？`,
  method:`这是一项在苏黎世单中心睡眠实验室完成的随机、双盲、交叉试验。参与者不是被分成三个平行小组；每个人在不同实验夜分别经历羟丁酸钠、曲唑酮和安慰剂，顺序经过平衡，实验夜之间留出 7 天洗脱期。交叉设计让研究者能比较同一个人在不同条件下的变化，但也意味着结果仍来自严格控制的实验环境。\n\n方案包含筛查夜、适应夜和三次实验夜。每晚用多导睡眠监测记录脑电等信号；第二天再做 10 分钟警觉性任务和 N-back 工作记忆任务，并测量血浆 BDNF。随机入组 29 人，23 人至少接受一次干预并纳入分析，22 人完成全部方案。参与者为 20–65 岁门诊患者，均处于稳定抗抑郁治疗中。`,
  turn:`实验安排有一个不寻常的细节：羟丁酸钠在凌晨 3:30 才给，曲唑酮则在晚上 23:30 给。研究团队依据药物作用时间和半衰期安排给药，希望在后半夜观察慢波睡眠。这个时间表属于一次受控实验设计，不能被读成临床服药方案。\n\n睡眠监测给出了清楚的生理信号。与安慰剂相比，羟丁酸钠使慢波睡眠占总睡眠时间的比例平均增加 15.8 个百分点，也比曲唑酮高 12.2 个百分点；总睡眠时间约增加 24 分钟，睡眠效率提高约 5.5 个百分点，夜间醒着的时间减少约 19.5 分钟。曲唑酮没有显著增加慢波睡眠。\n\n第二天的结果没有完全照着研究者的期待走：警觉性任务中的短暂注意力失误减少，但反应时间中位数没有变化；工作记忆和 BDNF 也没有发现条件间差异。也就是说，信号不是“所有认知都变好”，而是特定睡眠指标和一项警觉性测量发生了变化。`,
  meaning:`这种“部分改善、部分不变”的结果，比一句“睡眠改善了”更值得读。它提示深睡眠的增加可能与某些白天注意力表现相连，但研究没有证明慢波睡眠的增加就是警觉改善的唯一原因；也没有证明患者的抑郁心境因此改善。实验只观察一次给药后的一夜和次日，不能回答连续使用数周后会怎样。\n\n安全性也需要放进同一幅图里看。没有出现严重不良事件；羟丁酸钠条件下 22 人中有 8 人报告轻度副作用，常见恶心和头晕。小样本、单夜实验里“未见严重事件”不能保证长期使用安全。`,
  clinic:`临床上，这篇论文提供的是一个机制线索：睡眠可以拆成结构、时长、连续性和白天功能，不必只用“睡得好不好”一个总分概括。它支持继续研究慢波睡眠是否能成为可操作的治疗靶点。\n\n它没有比较长期抑郁症状缓解，没有评估复发或功能恢复，也没有覆盖复杂共病、合并多种镇静药物或日常环境中的风险。因此不能从这项研究推出羟丁酸钠可用于抑郁症失眠，更不能把试验剂量变成用药建议。论文作者自己也把下一步放在临床场景和重复给药研究上。`,
  close:`这场实验真正带走的，不是一个现成处方，而是一条更精确的提问路径：患者说“睡不好”时，我们想改善的是入睡、夜间连续性、睡眠深度，还是醒来后的功能？这些结局彼此相关，却并不相同；研究也应该分别测量。\n\n下一步需要更大样本、重复给药和更长随访，直接看患者是否感到恢复、情绪与功能是否改变，同时仔细记录安全性。只有那时，研究者才能从“我们能够改变一个睡眠生理指标”继续走向“这种改变对患者有持续的临床价值吗？”这篇论文把故事推到了这个问题门口，还没有替我们回答。`,
  note:'重要边界：这是一次单中心、单夜给药的 proof-of-concept 实验，评估的是睡眠生理和次日任务表现，并非抑郁症治疗试验。',
  source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12170893/', sourceLabel:'开放获取全文 · Neuropsychopharmacology · DOI 10.1038/s41386-025-02104-4'
 };
 const readTime=credibility?'约 12 分钟':'约 14 分钟';
 app.innerHTML=`<article class="article blog-article"><a class="back" href="#home">返回研究小报</a><div class="blog-kicker">${story.kicker}</div><div style="margin-top:20px"><span class="tag">${a.topic} · ${a.type||'论文故事'}</span></div><h1>${a.title}</h1><p class="lead">${a.desc}</p><div class="meta"><span>${readTime}</span><span>基于原始论文整理</span><span>含临床解读与证据边界</span></div><div class="article-actions">${saveButton(a)}<button class="save" data-read="${a.id}" aria-pressed="${read.has(a.id)}">${read.has(a.id)?'已读完 · 点击撤销':'标记为已读'}</button></div>${notice}<section class="summary"><div class="eyebrow">先带着这个问题读</div><h2>${a.question}</h2><p>${story.note}</p></section><h2>从一个困惑开始</h2>${paragraphs(story.opening)}<h2>研究者把镜头移到哪里</h2>${paragraphs(story.scene)}<h2>这场研究是怎么进行的</h2>${paragraphs(story.method)}<h2>故事的转折：结果并没有整齐地站在一起</h2>${paragraphs(story.turn)}<h2>这些发现真正说明什么</h2>${paragraphs(story.meaning)}<h2>把论文带回临床</h2>${paragraphs(story.clinic)}<h2>故事停在一个仍然开放的问题上</h2>${paragraphs(story.close)}<section class="review"><h2>论文来源与阅读说明</h2><p><a href="${story.source}" target="_blank" rel="noopener">${story.sourceLabel}</a></p><p>本文是对单篇论文的故事化解读，不是系统综述，也不替代原文。研究数据与本文解释分开呈现；超出论文证据的临床推论会明确收住。</p></section><div class="bottom-note">每篇文章先问：这项研究改变了我们怎样理解一个临床问题？</div></article>`;
}

document.addEventListener('click',e=>{const card=e.target.closest('[data-open]');if(card&&!e.target.closest('a,button')){location.hash='#article/'+card.dataset.open;return}const s=e.target.closest('[data-save]');if(s){const id=s.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);const ok=persist();render();if(ok)toast(saved.has(id)?'已放进你的书架':'已从书架移除');return}const r=e.target.closest('[data-read]');if(r){read.has(r.dataset.read)?read.delete(r.dataset.read):read.add(r.dataset.read);persist();render();return}const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;render();return}const t=e.target.closest('[data-topic]');if(t){filter=t.dataset.topic;query='';render();document.getElementById('cards').scrollIntoView({block:'start'});}});
window.renderSophiaApp=render;
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
