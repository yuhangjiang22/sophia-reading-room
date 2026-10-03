const edition = window.CONGER_EDITION;
const batchQuestions={
 'artemis-youth':'反污名宣传和基层照护能否一起缩短青少年的求助距离？','star-ptsd-psychosis':'同时治疗创伤和精神病症状，能否改善 PTSD 而不牺牲安全？','task-shared-components':'由非专科人员提供的心理支持中，哪些成分与改善最相关？','violence-nonspecialists':'受训非专科人员能否帮助暴力经历者缓解心理困扰？','prenatal-cbti-pumas':'孕期失眠的两种线上治疗，对睡眠和夜间担忧分别有什么影响？','prenatal-digital-mindfulness':'数字正念课程的失眠改善能否从孕期延续到产后？','perinatal-digital-meta':'数字心理支持对围产期情绪的帮助，是否因诊断状态而不同？','digital-behavioural-activation':'数字行为激活能否把短期抑郁改善维持到更久？','digital-eight-disorders':'不同诊断中的数字治疗证据，真的可以放在一张图上比较吗？','cbt-sleep-psychosis':'精神病相关失眠能否通过调整后的 CBT-I 获得帮助？','ketamine-sleep-circadian':'氯胺酮治疗时的睡眠变化，是疗效线索还是伴随现象？','rem-nightmares':'REM 睡眠和噩梦与情绪困扰之间，哪些联系已经被观察到？','bipolar2-lithium-lamotrigine':'双相 II 型障碍的锂盐和拉莫三嗪试验证据到底有多确定？','ipsrt-bipolar':'稳定生活节律的人际治疗是否能影响双相情绪波动？','ceta-ipv-hiv':'整合心理治疗能否帮助同时面对暴力经历与 HIV 照护压力的女性？','social-determinants-prevention':'把心理预防与改善社会处境结合，能否降低心理障碍发生？','youth-depression-course':'哪些群体线索与年轻人抑郁反复或持续有关？','psilocybin-anhedonia':'裸盖菇素辅助治疗的早期研究中，快感缺失发生了什么变化？','sud-nonpharm-network':'物质使用障碍的非药物干预能改善症状，也能改善生活质量吗？','chatbots-youth':'心理健康聊天机器人对抑郁和焦虑的证据是否一致？'
};
const articles = [
{id:'sleep',topic:'睡眠与情绪',type:'原始研究 · 随机交叉试验',title:'当抑郁症的夜晚变得更深：一项慢波睡眠研究告诉了我们什么',desc:'一项随机、双盲、交叉试验，把抑郁症中的睡眠问题拆成慢波睡眠、次日警觉性和工作记忆几个可测量的问题。',question:'改善睡眠结构，能否成为理解抑郁症的新入口？',time:14,paperTitle:'Gamma-hydroxybutyrate to promote slow-wave sleep in major depressive disorder: a randomized crossover trial',source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12170893/'},
{id:'credibility',topic:'心理治疗',type:'系统综述 · 研究可信度',title:'当“有效”还不够：一项系统综述重新检查了中国人群心理治疗试验的可信度',desc:'这篇 Lancet Psychiatry 系统综述纳入 857 项随机试验，关注随机化、分配隐藏、盲法、意向性分析和数据可信度。',question:'我们看到一个很大的治疗效应时，先应该问哪些方法学问题？',time:12,paperTitle:'Assessing the credibility of psychological intervention trials for common mental disorders in China: a systematic review',source:'https://pubmed.ncbi.nlm.nih.gov/42309104/'},
...Object.entries(window.SOPHIA_PAPERS||{}).map(([id,paper])=>({id,...paper}))
,...(window.SOPHIA_BATCH_PAPERS||[]).map(paper=>({
 id:paper.id,topic:paper.topic,type:`摘要基础解读 · ${paper.type}`,title:paper.title,desc:paper.desc,
 question:batchQuestions[paper.id],time:Number.parseInt(window.SOPHIA_BATCH_STORIES?.[paper.id]?.readTime?.match(/\d+/)?.[0]||'4',10),
 source:paper.url,sourceLabel:`PubMed 摘要 · PMID ${paper.pmid} · ${paper.journal} · ${paper.year}`,
 caveat:paper.caveat,story:window.SOPHIA_BATCH_STORIES?.[paper.id],batchPaper:paper
}))
];
const topics=['全部',...new Set(articles.map(a=>a.topic))];
let saved=new Set(),read=new Set(),filter='全部',query='';
try{saved=new Set(JSON.parse(localStorage.getItem('conger-saved')||'[]'));read=new Set(JSON.parse(localStorage.getItem('conger-read')||'[]'))}catch{}
const app=document.getElementById('app');
const notice=`<div class="notice"><span>✧</span><span>本期收录 ${articles.length} 篇研究文章；每篇都保留原文来源与证据边界。</span></div>`;
function persist(){try{localStorage.setItem('conger-saved',JSON.stringify([...saved]));localStorage.setItem('conger-read',JSON.stringify([...read]));return true}catch{toast('浏览器无法保存数据，本次会话仍可使用。');return false}}
function exportInterestSnapshot(){const snapshot={format:'sophia-reading-room-interest-v1',exported_at:new Date().toISOString(),items:articles.filter(a=>saved.has(a.id)).map(a=>({id:a.id,title:a.title,topic:a.topic,type:a.type||'',source_title:a.paperTitle||a.batchPaper?.paperTitle||window.SOPHIA_PAPERS?.[a.id]?.title||a.title,source_url:a.source||a.story?.source||window.SOPHIA_PAPERS?.[a.id]?.source||a.batchPaper?.url||''}))};const blob=new Blob([JSON.stringify(snapshot,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`sophia-reading-interests-${snapshot.exported_at.replace(/[:.]/g,'-')}.json`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);toast(`已导出 ${snapshot.items.length} 篇收藏偏好；下次本地更新会据此优先筛选相近主题。`)}
let timer;function toast(text){const el=document.getElementById('toast');el.textContent=text;el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),2400)}
function saveButton(a){return `<button class="save" data-save="${a.id}" aria-pressed="${saved.has(a.id)}" aria-label="${saved.has(a.id)?'取消收藏':'收藏'}：${a.title}">${saved.has(a.id)?'已收藏':'＋ 收藏'}</button>`}
function card(a,i){return `<article class="card" data-open="${a.id}" tabindex="0" role="link" aria-label="打开：${a.title}"><div class="card-top"><span class="tag">${a.topic}</span><span class="card-number">${String(i+1).padStart(2,'0')}</span></div><h3><a href="#article/${a.id}">${a.title}</a></h3><p>${a.desc}</p><div class="card-bottom"><span class="meta">约 ${a.time} 分钟 · ${read.has(a.id)?'已读':(a.type||'论文导读')}</span>${saveButton(a)}</div></article>`}
function filtered(list){return list.filter(a=>(filter==='全部'||a.topic===filter)&&(`${a.title}${a.desc}${a.topic}`.includes(query)))}
function toolbar(){return `<div class="toolbar"><div class="filters" aria-label="按专题筛选">${topics.map(t=>`<button class="filter ${filter===t?'active':''}" data-filter="${t}" aria-pressed="${filter===t}">${t}</button>`).join('')}</div><input class="search" id="search" type="search" placeholder="搜索感兴趣的问题…" aria-label="搜索论文导读"></div>`}
function cards(list){const items=filtered(list);return items.length?items.map(card).join(''):'<div class="empty"><h2>这里还没有文章</h2><p>试试其他关键词或专题，或先收藏一篇感兴趣的文章。</p></div>'}
function listSource(){return articles.filter(a=>location.hash!=='#shelf'||saved.has(a.id))}
function render(){let route=location.hash.slice(1)||'home';document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===route));if(document.getElementById('saved-count'))document.getElementById('saved-count').textContent=saved.size;document.title='聪儿的研究小屋';
setInterfaceLanguage(route.startsWith('english'));
if(route.startsWith('english')){renderEnglish();return}
if(route==='candidates'){location.replace('#home');return}
if(route.startsWith('article/')){const a=articles.find(x=>x.id===route.split('/')[1]);if(a){renderArticle(a);return}app.innerHTML='<div class="empty"><h1>没有找到这篇文章</h1><a href="#home">回到研究小报</a></div>';return}
if(route==='shelf'){app.innerHTML=`<section class="page-title"><div class="eyebrow">YOUR LITTLE LIBRARY</div><h1>我的书架</h1><p>留住好奇，也留住下一次阅读的起点。</p><small>收藏与已读记录仅保存在当前浏览器，不会公开或跨设备同步。</small></section><section class="interest-export"><div><strong>把收藏变成下一期选题线索</strong><p>导出一份本地 JSON 快照。半月更新会用收藏主题优先筛选论文；这只是偏好提示，不代表论文审核通过或自动发布。</p></div><button class="save" data-export-interests>导出兴趣快照</button></section>${toolbar()}<div class="cards" id="cards">${cards(listSource())}</div>`}
else if(route==='topics'){app.innerHTML=`<section class="page-title"><div class="eyebrow">FOLLOW YOUR CURIOSITY</div><h1>沿着兴趣，继续探索</h1><p>从一个临床问题出发，把零散的发现连成知识。</p></section>${notice}<div class="topic-grid">${topics.filter(t=>t!=='全部').map((t,i)=>`<button class="topic-card" data-topic="${t}"><span>专题 / ${String(i+1).padStart(2,'0')}</span><strong>${t}</strong><span>${articles.filter(a=>a.topic===t).length} 篇论文导读</span></button>`).join('')}</div>${toolbar()}<div class="cards" id="cards">${cards(articles)}</div>`}
else{const a=articles.find(item=>item.id===edition.featuredArticleId)||articles[0];app.innerHTML=`<section class="welcome"><div><div class="eyebrow">A LITTLE ROOM FOR BIG DISCOVERIES</div><h1>${edition.headline}</h1><p>${edition.lines.join("<br>")}</p></div><div class="dog-space"><div id="dog-art" class="dog-placeholder" aria-label="陪伴阅读的小狗">🐶</div><small>${edition.companion}</small></div></section>${notice}<div class="section-head"><h2>这一期，值得慢慢读</h2><span class="issue">${edition.label}</span></div><section class="featured"><div class="feature-copy"><span class="tag">论文导读 · ${a.topic}</span><h2><a href="#article/${a.id}">${a.title}</a></h2><p>${a.desc}</p><div class="meta"><span>约 ${a.time} 分钟</span><span>论文导读</span></div><div class="feature-bottom"><a class="primary" href="#article/${a.id}">打开这篇论文导读</a>${saveButton(a)}</div></div><aside class="feature-note"><span class="label">带着一个问题阅读</span><p>“${a.question}”</p><small>从问题出发，再回到证据。</small></aside></section><div class="section-head"><h2>在这里，遇见更多问题</h2><small>不赶进度，跟着好奇心走。</small></div>${toolbar()}<div class="cards" id="cards">${cards(articles)}</div><div class="bottom-note"><strong>关于这里的每一篇文章</strong><span>每篇文章都附原文链接、研究设计与证据边界；证据不足的推论会明确收住。</span></div>`;const im=new Image();im.alt='Sophia 穿着紫色衣服与小狗一起读书的卡通形象';im.onload=()=>document.getElementById('dog-art')?.replaceWith(im);im.src='assets/conger-character-v1.png'}
const input=document.getElementById('search');if(input){input.value=query;input.addEventListener('input',e=>{query=e.target.value;document.getElementById('cards').innerHTML=cards(listSource())})}}
function renderArticle(a){
 document.title=a.title+' · 聪儿的研究小屋';
 const credibility=a.id==='credibility';
 const additional=window.SOPHIA_PAPERS?.[a.id]||a;
 let glossary=additional?.glossary||(a.batchPaper?Object.entries(window.SOPHIA_BATCH_GLOSSARY||{}).map(([term,definition])=>[term,term,definition]):(credibility?[
  ['随机对照试验','randomized controlled trial','研究者把参与者分到不同组，再比较结果。随机分组是为了尽量让各组起点相近；它不能自动保证研究做得好。'],
  ['随机化','randomization','用随机方式决定谁进哪一组，减少研究者或参与者挑选分组造成的偏差。'],
  ['分配隐藏','allocation concealment','在患者正式入组前，不让负责招募的人提前知道下一个人会进哪组，避免无意中影响入组。'],
  ['盲法','blinding','让参与者、治疗人员或评估结果的人不知道分组。心理治疗很难让治疗师和患者都“盲”，但评估者仍可能不知道。'],
  ['意向性分析','intention-to-treat','尽量按最初分组来分析所有参与者，即使有人中途退出或没有完全照做，也不随意把他们从结果里删掉。'],
  ['效应量','effect size','把两组差异换成可比较的标准化数字。g=2 不代表“改善了两倍”，也不直接告诉我们患者实际好转了多少。'],
  ['数据真实性关注','data authenticity concern','审查者发现需要进一步核验的异常信号。它不是造假判决，也不等于已经证明数据有问题。'],
  ['预先注册','trial registration','在研究开始前公开写下计划研究什么、主要看什么结果，方便后来检查有没有临时改问题或挑结果。'],
  ['偏倚','bias','研究过程里某种稳定的倾斜，让结果更容易朝某个方向走。它不一定是故意造成的。'],
  ['Hedges’ g','Hedges’ g','一种标准化效应量，用标准差单位表示两组差异；它不是症状量表上的原始分数，也不能独自说明患者是否感到明显好转。'],
  ['系统综述','systematic review','按预先说明的方法系统搜寻、筛选并总结相关研究；结论仍取决于纳入研究的质量和差异。'],
  ['Cochrane 偏倚风险工具','Cochrane risk-of-bias tool','用于按多个研究环节评估结果可能受到何种偏倚影响的检查框架；它不是判断造假的工具。']
 ]:[
  ['交叉试验','crossover trial','同一个人先后经历不同实验条件，再比较自己在各条件下的表现；因此不只是拿甲组和乙组作比较。'],
  ['双盲','double-blind','尽量让参与者和研究团队不知道当晚拿到的是哪种药，减少期待影响。实际能否完全盲住，还要看药物效果是否容易被察觉。'],
  ['安慰剂','placebo','看起来像药、但不含研究药物成分的对照，用来分辨药物作用和期待或自然波动。'],
  ['慢波睡眠','slow-wave sleep','睡眠中较深的一段，也叫 N3。研究用脑电监测它，不等同于醒来后主观觉得“睡得香”。'],
  ['睡眠效率','sleep efficiency','躺在床上的时间里，真正睡着的比例。它高不一定就表示白天状态一定好。'],
  ['多导睡眠监测','polysomnography','睡觉时记录脑电、眼动、肌肉活动等信号的检查，帮助研究者分辨睡眠阶段。'],
  ['警觉性测试','psychomotor vigilance test','一项盯着屏幕及时按键的注意力任务，记录反应速度和漏掉的提示；它是实验测验，不等于日常工作能力。'],
  ['工作记忆','working memory','短时间把信息放在脑中并拿来处理的能力，比如记住刚看到的内容再完成下一步。'],
  ['BDNF','brain-derived neurotrophic factor','脑源性神经营养因子，是研究者测量的一种血液指标。它不是抑郁症的诊断指标，也不能单独代表情绪有没有改善。'],
  ['proof-of-concept','proof of concept','概念验证：先确认一个想法在实验条件下有迹象可行，还不是证明它已经能成为有效治疗。'],
  ['洗脱期','washout period','两次实验之间留出一段时间，让前一次药物的影响尽量退去，避免串到下一次比较里。'],
  ['单中心','single-centre study','研究只在一个医院或实验室完成。流程容易统一，但结果是否适用于别的地方，还需要更多研究。'],
  ['N-back','n-back task','屏幕上不断出现字母或图形，参与者要记住前面几个项目并判断当前项目是否重复。它是实验室任务，不等于全面的记忆能力。'],
  ['N3','N3 sleep stage','睡眠分期中的深睡眠阶段之一；研究通过脑电等信号判定，和主观“睡得沉”不是完全相同的测量。'],
  ['警觉性任务','psychomotor vigilance task','通过对提示作出快速反应来观察注意力波动的实验任务；它不等同于完整的日常工作能力。'],
  ['心理运动警觉任务','psychomotor vigilance task','通过对提示作出快速反应来观察注意力波动的实验任务；它不等同于完整的日常工作能力。'],
  ['脑源性神经营养因子','brain-derived neurotrophic factor','一种参与神经系统生长与可塑性过程的蛋白质；血液中的单次测量不是抑郁症诊断或治疗反应的直接指标。']
 ]));
 glossary=[...glossary,
  ['随机对照试验','randomized controlled trial','研究者用随机方式分配参与者，再比较不同组的结果；随机分组能降低某些偏差，但不能自动消除所有偏倚。'],
  ['置信区间','confidence interval','表达研究估计有多不确定的一段范围；范围越宽，结果通常越不精确。它不是“真实值有 95% 概率落在这里”的简单保证。'],
  ['随机分配','random allocation','用随机方式决定参与者进入哪组，尽量避免研究者或参与者挑选分组。'],
  ['安慰剂','placebo','看起来像研究治疗、但不含该有效成分的对照；帮助估计治疗本身带来的变化。'],
  ['不良事件','adverse event','研究期间发生的不利健康状况；记录到不代表一定由研究治疗造成。'],
  ['交叉设计','crossover design','同一参与者按不同顺序接受多个条件，并与自己比较；需要留意顺序效应和前一条件残留影响。'],
  ['多中心','multicentre study','研究在多个医院或机构进行，通常能纳入更广的人群；各中心执行差异也需要管理。'],
  ['亚组分析','subgroup analysis','把参与者按某个特征分开观察结果；若未预先计划或样本很少，偶然发现的差异容易被误读。'],
  ['统计学显著','statistical significance','表示数据与某个统计假设不太相符，不等于效果很大、很重要或对每个患者都有帮助。'],
  ['随机化','randomization','用随机方式决定分组，帮助让治疗组在已知和未知特征上更可比；还要结合分配隐藏等措施。'],
  ['基线','baseline','治疗或观察开始前测量的起点，用于描述参与者并比较后续变化。'],
  ['随访','follow-up','在最初评估之后继续追踪参与者，观察效果是否维持及是否出现较晚的结果。'],
  ['CNKI','China National Knowledge Infrastructure','中国知网，是收录中文学术文献的检索平台之一。'],
  ['万方','Wanfang Data','万方数据知识服务平台，收录中文学术期刊、学位论文等资料；不同数据库覆盖范围并不相同。']
 ];
 const annotatedTerms=new Set();
 const escapeRegExp=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const glossify=text=>{const terms=[...glossary].sort((x,y)=>y[0].length-x[0].length);const re=new RegExp('('+terms.map(x=>escapeRegExp(x[0])).join('|')+')','gi');return text.replace(re,match=>{const item=terms.find(x=>x[0].toLowerCase()===match.toLowerCase());if(annotatedTerms.has(item[1]))return match;annotatedTerms.add(item[1]);return `<button class="gloss-term" type="button" data-gloss="${item[1]}" aria-expanded="false">${match}</button>`})};
 const paragraphs=text=>text.trim().split(/\n\s*\n/).map(x=>`<p>${glossify(x)}</p>`).join('');
 const story=additional?.story||(credibility?{
  kicker:'一篇系统综述如何调查“疗效数字背后的研究现场”',
  opening:`假设你读到一篇心理治疗论文：干预组的症状降了很多，作者说效果显著。读到这里，故事好像已经结束了。可如果我们把页面往前翻，真正的调查才刚刚开始：这群患者是怎么分组的？研究者有没有提前写好计划？那些中途离开的人还算不算在结果里？\n\n这篇综述就像把一大摞论文摊在桌上，逐份追问这些看起来不起眼的小事。它不负责评选哪种心理治疗最好；它想弄清楚的是，我们眼前这些疗效数字，有多少留下了让别人核对的线索。` ,
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
  opening:`这篇论文有个让人一下记住的时间：凌晨三点半。苏黎世睡眠实验室里，参与者被提示声叫醒，喝下研究用的液体，再回到床上。研究者想看一件很具体的事：如果把后半夜的深睡眠往上推一点，天亮后的注意力会不会跟着变好？\n\n这个实验从一个真实又常见的困扰开始：有些人睡了很久，醒来还是觉得没恢复；有些人夜里断断续续，白天注意力也容易掉线。论文研究的不是某一个“典型病人”，而是在受控条件下，追踪一组门诊患者经历不同睡眠夜晚后的变化。` ,
  scene:`研究者盯上的，是睡眠里一段叫“慢波睡眠”的深睡眠。以前的研究发现，抑郁症患者的这段睡眠可能偏少，不过每个人差别很大。更麻烦的是，有些助眠药虽然让人睡着了，第二天却可能更困，并没有让睡眠变得更“恢复”。\n\n羟丁酸钠已经用于发作性睡病，研究者知道它能增加深睡眠。于是他们把它拿来和曲唑酮、安慰剂比较。但问题收得很窄：先不问能不能治好抑郁症，只看一晚之后，睡眠记录变没变，第二天注意力和记忆任务有没有变化。` ,
  method:`这是一项在苏黎世单中心睡眠实验室完成的随机、双盲、交叉试验。参与者不是被分成三个平行小组；每个人在不同实验夜分别经历羟丁酸钠、曲唑酮和安慰剂，顺序经过平衡，实验夜之间留出 7 天洗脱期。交叉设计让研究者能比较同一个人在不同条件下的变化，但也意味着结果仍来自严格控制的实验环境。\n\n方案包含筛查夜、适应夜和三次实验夜。每晚用多导睡眠监测记录脑电等信号；第二天再做 10 分钟警觉性任务和 N-back 工作记忆任务，并测量血浆 BDNF。随机入组 29 人，23 人至少接受一次干预并纳入分析，22 人完成全部方案。参与者为 20–65 岁门诊患者，均处于稳定抗抑郁治疗中。`,
  turn:`实验安排有一个不寻常的细节：羟丁酸钠在凌晨 3:30 才给，曲唑酮则在晚上 23:30 给。研究团队依据药物作用时间和半衰期安排给药，希望在后半夜观察慢波睡眠。这个时间表属于一次受控实验设计，不能被读成临床服药方案。\n\n睡眠监测给出了清楚的生理信号。与安慰剂相比，羟丁酸钠使慢波睡眠占总睡眠时间的比例平均增加 15.8 个百分点，也比曲唑酮高 12.2 个百分点；总睡眠时间约增加 24 分钟，睡眠效率提高约 5.5 个百分点，夜间醒着的时间减少约 19.5 分钟。曲唑酮没有显著增加慢波睡眠。\n\n第二天的结果没有完全照着研究者的期待走：警觉性任务中的短暂注意力失误减少，但反应时间中位数没有变化；工作记忆和 BDNF 也没有发现条件间差异。也就是说，信号不是“所有认知都变好”，而是特定睡眠指标和一项警觉性测量发生了变化。`,
  meaning:`这种“部分改善、部分不变”的结果，比一句“睡眠改善了”更值得读。它提示深睡眠的增加可能与某些白天注意力表现相连，但研究没有证明慢波睡眠的增加就是警觉改善的唯一原因；也没有证明患者的抑郁心境因此改善。实验只观察一次给药后的一夜和次日，不能回答连续使用数周后会怎样。\n\n安全性也需要放进同一幅图里看。没有出现严重不良事件；羟丁酸钠条件下 22 人中有 8 人报告轻度副作用，常见恶心和头晕。小样本、单夜实验里“未见严重事件”不能保证长期使用安全。`,
  clinic:`临床上，这篇论文提供的是一个机制线索：睡眠可以拆成结构、时长、连续性和白天功能，不必只用“睡得好不好”一个总分概括。它支持继续研究慢波睡眠是否能成为可操作的治疗靶点。\n\n它没有比较长期抑郁症状缓解，没有评估复发或功能恢复，也没有覆盖复杂共病、合并多种镇静药物或日常环境中的风险。因此不能从这项研究推出羟丁酸钠可用于抑郁症失眠，更不能把试验剂量变成用药建议。论文作者自己也把下一步放在临床场景和重复给药研究上。`,
  close:`这场实验真正带走的，不是一个现成处方，而是一条更精确的提问路径：患者说“睡不好”时，我们想改善的是入睡、夜间连续性、睡眠深度，还是醒来后的功能？这些结局彼此相关，却并不相同；研究也应该分别测量。\n\n下一步需要更大样本、重复给药和更长随访，直接看患者是否感到恢复、情绪与功能是否改变，同时仔细记录安全性。只有那时，研究者才能从“我们能够改变一个睡眠生理指标”继续走向“这种改变对患者有持续的临床价值吗？”这篇论文把故事推到了这个问题门口，还没有替我们回答。`,
  note:'重要边界：这是一次单中心、单夜给药的 proof-of-concept 实验，评估的是睡眠生理和次日任务表现，并非抑郁症治疗试验。',
  source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12170893/', sourceLabel:'开放获取全文 · Neuropsychopharmacology · DOI 10.1038/s41386-025-02104-4'
 });
 window.SOPHIA_GLOSSARY=Object.fromEntries(glossary.map(x=>[x[1],x[2]]));
 const headings=story.headings||['从一个困惑开始',credibility?'线索从哪里来':'线索出现：他们盯上了深睡眠',credibility?'调查是怎么做的':'实验室里，这几晚是这样过的',credibility?'一项项查下去，问题浮出来了':'天亮之后，结果没有全都朝同一个方向走','这到底说明了什么',credibility?'读到类似论文时，可以怎么用':'把这个发现带回日常看诊','最后，研究把一个问题留给了我们'];
 const paperSource=story.source||a.source, paperSourceLabel=story.sourceLabel||a.sourceLabel;
 const deeper=window.SOPHIA_BATCH_DEPTH?.[a.id];
 const vignette=window.SOPHIA_BATCH_VIGNETTES?.[a.id];
 const expansion=window.SOPHIA_BATCH_EXPANSIONS?.[a.id];
 const articleText=[story.kicker,story.opening,story.scene,story.method,story.turn,story.meaning,story.clinic,story.close,vignette,expansion?.context,expansion?.bridge,expansion?.journey,expansion?.turning,expansion?.afterthought,expansion?.reflection,expansion?.reflection2,expansion?.clinicalThread,expansion?.humanQuestion,expansion?.nextQuestion,deeper?.text,deeper?.next].filter(Boolean).join(' ');
 const hanCount=articleText.match(/\p{Script=Han}/gu)?.length||0;
 const readTime=a.batchPaper?`约 ${Math.max(7,Math.ceil(hanCount/400))} 分钟`:(story.readTime||(credibility?'约 12 分钟':'约 14 分钟'));
 app.innerHTML=`<article class="article blog-article"><a class="back" href="#home">返回研究小报</a><div class="blog-kicker">${glossify(story.kicker)}</div><div style="margin-top:20px"><span class="tag">${glossify(a.topic)} · ${glossify(a.type||'论文故事')}</span></div><h1>${glossify(a.title)}</h1><p class="lead">${glossify(a.desc)}</p><div class="meta"><span>${readTime}</span><span>${a.batchPaper?'基于 PubMed 摘要整理':'基于原始论文整理'}</span><span>含临床解读与证据边界</span></div><div class="article-actions">${saveButton(a)}<button class="save" data-read="${a.id}" aria-pressed="${read.has(a.id)}">${read.has(a.id)?'已读完 · 点击撤销':'标记为已读'}</button></div>${notice}<section class="summary"><div class="eyebrow">先带着这个问题读</div><h2>${glossify(a.question)}</h2><p>${glossify(story.note)}</p><p class="gloss-hint">标题、摘要和正文里带虚线的词可以点击查看白话解释。</p></section><h2>${glossify(headings[0])}</h2>${paragraphs(story.opening)}${vignette?`<section class="story-scene"><div class="story-scene-label">情境示意 · 非真实病例</div><h2>设想这样一个时刻</h2>${paragraphs(vignette)}<p class="story-scene-note">这是为帮助理解研究问题而构造的虚构场景，不是论文中的真实参与者、病例或引语。</p></section>`:''}${expansion?`<h2>${glossify(expansion.contextTitle)}</h2>${paragraphs(expansion.context)}${paragraphs(expansion.bridge)}`:''}<h2>${glossify(headings[1])}</h2>${paragraphs(story.scene)}<h2>${glossify(headings[2])}</h2>${paragraphs(story.method)}${expansion?`<h2>${glossify(expansion.journeyTitle)}</h2>${paragraphs(expansion.journey)}<h3>${glossify(expansion.turningTitle)}</h3>${paragraphs(expansion.turning)}${paragraphs(expansion.afterthought)}`:''}<h2>${glossify(headings[3])}</h2>${paragraphs(story.turn)}<h2>${glossify(headings[4])}</h2>${paragraphs(story.meaning)}${expansion?`<h2>${glossify(expansion.reflectionTitle)}</h2>${paragraphs(expansion.reflection)}${paragraphs(expansion.clinicalThread)}<h2>把论文放回人的问题里</h2>${paragraphs(expansion.humanQuestion)}<h2>这项研究之后，还值得追问什么</h2>${paragraphs(expansion.nextQuestion)}`:''}<h2>${glossify(headings[5])}</h2>${paragraphs(story.clinic)}<h2>${glossify(headings[6])}</h2>${paragraphs(story.close)}${deeper?`<h2>${glossify(deeper.heading)}</h2>${paragraphs(deeper.text)}<h2>${glossify(deeper.nextHeading)}</h2>${paragraphs(deeper.next)}`:''}<section class="review"><h2>论文来源与阅读说明</h2><p><a href="${paperSource}" target="_blank" rel="noopener">${paperSourceLabel}</a></p><p>${a.batchPaper?`本文依据 PubMed 题录与摘要撰写，尚未核对期刊全文及补充材料；摘要没有提供的细节不会补写。${glossify(a.caveat)}`:'本文是对单篇论文的故事化解读，不是系统综述，也不替代原文。研究数据与本文解释分开呈现；超出论文证据的临床推论会明确收住。'}</p></section><div class="bottom-note">每篇文章先问：这项研究改变了我们怎样理解一个临床问题？</div></article>`;
}

document.addEventListener('click',e=>{if(e.target.closest('[data-export-interests]')){exportInterestSnapshot();return}const term=e.target.closest('[data-gloss]');if(term){const existing=term.nextElementSibling?.classList.contains('gloss-note')?term.nextElementSibling:null;document.querySelectorAll('.gloss-note').forEach(n=>n.remove());document.querySelectorAll('[data-gloss]').forEach(b=>b.setAttribute('aria-expanded','false'));if(!existing){const key=term.dataset.gloss;const definition=(window.SOPHIA_GLOSSARY||{})[key];if(definition){const note=document.createElement('span');note.className='gloss-note';note.setAttribute('role','note');note.textContent=definition;term.insertAdjacentElement('afterend',note);term.setAttribute('aria-expanded','true')}}return}const card=e.target.closest('[data-open]');if(card&&!e.target.closest('a,button')){location.hash='#article/'+card.dataset.open;return}const s=e.target.closest('[data-save]');if(s){const id=s.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);const ok=persist();render();if(ok)toast(saved.has(id)?'已放进你的书架':'已从书架移除');return}const r=e.target.closest('[data-read]');if(r){read.has(r.dataset.read)?read.delete(r.dataset.read):read.add(r.dataset.read);persist();render();return}const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;render();return}const t=e.target.closest('[data-topic]');if(t){filter=t.dataset.topic;query='';render();document.getElementById('cards').scrollIntoView({block:'start'});}});
window.renderSophiaApp=render;
window.addEventListener('hashchange',()=>{filter='全部';query='';render();window.scrollTo(0,0)});render();

function setInterfaceLanguage(english){
 document.documentElement.lang=english?'en':'zh-CN';
 document.querySelector('.brand').href=english?'#english':'#home';
 document.querySelector('.brand>span:last-child').innerHTML=(english?'Sophia’s English Studio':'聪儿的研究小屋')+'<small>'+(english?'READ · QUESTION · UNDERSTAND':'SOPHIA’S READING ROOM')+'</small>';
 document.querySelector('nav').innerHTML=english?'<a href="#english" data-nav="english">Research stories</a><a href="#english/words" data-nav="english/words">Vocabulary</a><a href="#english/practice" data-nav="english/practice">Reading check</a>':'<a href="#home" data-nav="home">研究小报</a><a href="#topics" data-nav="topics">探索专题</a><a href="#shelf" data-nav="shelf">我的书架 <span id="saved-count">'+saved.size+'</span></a>';
 document.querySelector('nav').setAttribute('aria-label',english?'English studio navigation':'主导航');
 const note=document.querySelector('.header-note');note.classList.add('area-switch');note.innerHTML=english?'<a href="#home" lang="zh-CN">返回中文研究区</a>':'<a href="#english">英语学习室 · English Studio</a>';
 const currentRoute=location.hash.slice(1)||'home';const activeRoute=currentRoute.startsWith('english/article/')?'english':currentRoute;
 document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===activeRoute));
 document.querySelector('footer>div').innerHTML='<span class="brand-icon">✿</span> '+(english?'A little English. A new way to understand.':'为聪儿，也为每一个保持好奇的人。');
 document.querySelector('footer>span').textContent=english?'Research stories · Read at your own pace':'精神医学与心理学 · 中文研究札记';
}

document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('a,button')&&e.target.closest('[data-open]')){e.preventDefault();location.hash='#article/'+e.target.closest('[data-open]').dataset.open}});

document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.gloss-note').forEach(n=>n.remove());document.querySelectorAll('[data-gloss]').forEach(b=>b.setAttribute('aria-expanded','false'))}});
