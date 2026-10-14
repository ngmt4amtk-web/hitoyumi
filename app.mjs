import {STRINGS,LESSONS,makeExercise,noteTitle,instructionFor} from './content.mjs';
import {AudioEngine,Microphone,StablePitchGate,centsFrom,MIC_LEVELS} from './engine.mjs';
import {escapeHTML,renderScore} from './score.mjs';
import {BRAVURA_LICENSE} from './glyphs.mjs';

const ICONS={home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',book:'<path d="M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3zM12 6v15"/>',chart:'<path d="M4 20V10m8 10V4m8 16v-7M2 22h20"/>',settings:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',back:'<path d="m14 5-7 7 7 7"/>',play:'<path d="m8 4 12 8-12 8z"/>',pause:'<path d="M8 4v16M16 4v16"/>',sound:'<path d="M3 9h4l5-5v16l-5-5H3zM16 8q5 4 0 8m3-11q8 7 0 14"/>',check:'<path d="m5 12 4 4L20 5"/>',spark:'<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8z"/>',mic:'<rect x="8" y="2" width="8" height="13" rx="4"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>'};
const icon=name=>`<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.book}</svg>`;
const $=sel=>document.querySelector(sel);
const KEY='hitoyumi-v1';
let storageAvailable=true;
function readStored(){try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');return value&&typeof value==='object'?value:{};}catch{storageAvailable=false;return {};}}
const stored=readStored();
let preferences={colors:stored.preferences?.colors!==false,fingers:stored.preferences?.fingers!==false,names:stored.preferences?.names!==false,reference:stored.preferences?.reference!==false,click:stored.preferences?.click!==false,sensitivity:stored.preferences?.sensitivity in MIC_LEVELS?stored.preferences.sensitivity:'high',bpm:Math.min(180,Math.max(40,Number(stored.preferences?.bpm)||60))};
let view='home',lesson=null,options={},notes=[],previewGroup=0,practice=null,raf=0,sessionToken=0,previewTimer=0,toastTimer=0,wakeLock=null;
const audio=new AudioEngine(),mic=new Microphone(audio),pitchGate=new StablePitchGate();
function save(){try{localStorage.setItem(KEY,JSON.stringify({preferences}));storageAvailable=true;}catch{storageAvailable=false;toast('このブラウザでは設定を保存できません。');}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function stringDots(){return Object.entries(STRINGS).map(([s,d])=>`<span class="string-dot" style="--string-color:${d.color};--string-soft:${d.soft}">${s}</span>`).join('');}
function brand(){return '<div class="brand-symbol" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div><div class="brand-name">ひと弓</div><div class="brand-sub">VIOLIN PRACTICE</div></div>';}
function nav(){return [['home','book','練習する'],['settings','settings','設定']].map(([id,i,label])=>`<button data-nav="${id}" class="${view===id||view==='setup'&&id==='home'?'active':''}" ${view===id?'aria-current="page"':''}>${icon(i)}<span>${label}</span></button>`).join('');}
function shell(body,practiceView=false){
 $('#app').innerHTML=`<div class="app-shell ${practiceView?'practice-mode':''}"><aside class="sidebar"><button class="brand" data-nav="home" aria-label="ひと弓 ホーム">${brand()}</button><nav class="nav" aria-label="メインメニュー">${nav()}</nav><div class="sidebar-foot"><div class="strings">${stringDots()}</div>ひと弓ずつ、音楽に近づく。<br>川越バイオリン教室<br><span>LEVEL 1 · WEB PREVIEW</span></div></aside><main class="main" id="main"><header class="topbar"><div class="breadcrumb">バイオリンの練習室 <span style="margin:0 9px">/</span> <strong>レベル 1</strong></div><button class="brand mobile-brand" data-nav="home" aria-label="ひと弓 ホーム"><div class="row">${brand()}</div></button><div class="row"><span class="pill"><span class="dot" style="color:#688763"></span>はじめの一歩</span><span class="avatar" aria-label="レベル1">1</span></div></header>${body}</main><nav class="bottom-nav" aria-label="メインメニュー">${nav()}</nav></div>`;
}
function navigate(next){cleanup();view=next;render();window.scrollTo(0,0);}
function render(){if(view==='home')renderHome();else if(view==='settings')renderSettings();else if(view==='setup')renderSetup();}
function renderHome(){
 const next=LESSONS[0];
 const unitNames=['開放弦と、弓の動き','左手の、はじめの形','音階へ、つなげよう'];
 shell(`<h1 class="home-heading">今日も、ひと弓から。</h1><p class="intro-line">楽器を構えたら、小さな練習をひとつ。</p><div class="home-grid"><div><section class="hero"><div class="hero-copy"><div class="eyebrow">LEVEL 1 · FIRST STEPS</div><h2>音を出す。<br>音楽が始まる。</h2><p>開放弦から、はじめての音階へ。<br>お手本と一緒に、自分のペースで。</p><button class="primary" data-lesson="${next.id}">最初の練習をはじめる${icon('arrow')}</button></div><div class="hero-art"><img src="./assets/violin.png" alt="" width="320" height="726"></div><span class="spark" aria-hidden="true">✧</span></section><div class="course-heading"><h2 class="section-title">レベル1の練習メニュー</h2><span>${LESSONS.length} のメニュー</span></div>${unitNames.map((title,unit)=>`<section class="unit"><div class="unit-heading"><span class="eyebrow">0${unit+1}</span><h3>${title}</h3></div><div class="lesson-list">${LESSONS.filter(l=>l.unit===unit).map(l=>`<button class="lesson ${l.id===next.id?'featured':''}" data-lesson="${l.id}"><span class="lesson-number">${String(LESSONS.indexOf(l)+1).padStart(2,'0')}</span><span class="lesson-body"><span class="lesson-tag">${l.tag}</span><span class="lesson-title" style="display:block">${l.title}</span><span class="lesson-sub" style="display:block">${l.sub}</span></span><span class="lesson-arrow">›</span></button>`).join('')}</div></section>`).join('')}</div><aside class="aside"><section class="panel"><h2 class="panel-title">4本の弦の色</h2><div class="string-legend">${Object.entries(STRINGS).map(([s,d])=>`<div><span class="string-dot" style="--string-color:${d.color};--string-soft:${d.soft}">${s}</span><span>${s}線 <span class="muted">${d.name}</span></span></div>`).join('')}</div><p style="margin-top:17px">色と指番号は、設定で<br>いつでも隠せます。</p></section><section class="panel tip-panel"><div class="eyebrow" style="font-size:9px">A LITTLE REMINDER</div><h2 class="panel-title" style="margin-top:12px">短く、ゆっくり、もう一度。</h2><p>一度に全部できなくても大丈夫。<br>今日の「確かめたいこと」を<br>ひとつ決めて弾いてみよう。</p></section></aside></div>`);
}
function enterLesson(id){cleanup();lesson=LESSONS.find(l=>l.id===id);if(!lesson)return;view='setup';options={string:'A',rhythm:'whole',mode:lesson.unit>0?'wait':'continuous',pair:'DA',height:'all',problem:1,scale:'GD',fourth:'4',bpm:preferences.bpm,mic:lesson.unit>0};previewGroup=0;renderSetup();window.scrollTo(0,0);}
function choices(field,values){return `<div class="segmented">${values.map(([v,label])=>`<button class="choice ${String(options[field])===String(v)?'selected':''}" data-option="${field}" data-value="${v}" aria-pressed="${String(options[field])===String(v)}">${label}</button>`).join('')}</div>`;}
function stringChoices(random=false){return `<div class="segmented">${Object.entries(STRINGS).map(([s,d])=>`<button class="choice string-choice ${options.string===s?'selected':''}" style="--string-color:${d.color};--string-soft:${d.soft}" data-option="string" data-value="${s}" aria-pressed="${options.string===s}">${s}<small>${d.name}</small></button>`).join('')}</div>${random?`<label class="toggle-row"><span>弦をランダムにする</span><input type="checkbox" data-random-string ${options.string==='random'?'checked':''}></label>`:''}`;}
function field(label,content){return `<div class="form-group"><div class="field-title">${label}</div>${content}</div>`;}
function renderSetup(){
 notes=makeExercise(lesson.type,options);previewGroup=Math.min(previewGroup,Math.floor(notes.at(-1).bar/4));
 const left=lesson.unit>0,canMic=left||lesson.type==='reading';let fields='';
 if(lesson.type==='open')fields+=field('練習する弦',stringChoices(true))+field('進め方',choices('mode',[['continuous','4小節で練習'],['step','1つずつ体験']]))+(options.mode==='step'?'<p class="helper" style="margin-bottom:18px">全音符 → 2分音符 → 4分音符 → 8分音符を、1つずつ試します。</p>':field('音符の長さ',choices('rhythm',[['whole','全音符'],['half','2分音符'],['quarter','4分音符'],['eighth','8分音符'],['random','ランダム']])));
 else if(lesson.type==='heights')fields+=field('練習する高さ',choices('height',[['all','7段階を往復'],['1','G'],['2','G＋D'],['3','D'],['4','D＋A'],['5','A'],['6','A＋E'],['7','E']]));
 else if(lesson.type==='cross')fields+=field('練習する2本',choices('pair',[['GD','G・D'],['DA','D・A'],['AE','A・E']]));
 else if(lesson.type==='reading')fields+=field('問題を選ぶ',choices('problem',Array.from({length:8},(_,i)=>[i+1,'その'+(i+1)])));
 else if(lesson.type==='scale')fields+=field('音階を選ぶ',choices('scale',[['GD','ト長調 G・D'],['DA','ニ長調 D・A'],['AE','イ長調 A・E']]))+field('2本の弦の境目の音',choices('fourth',[['4','低い弦の4の指'],['0','高い弦の開放弦']]));
 else fields+=field('練習する弦',stringChoices());
 if(left)fields+=field('進め方',choices('mode',[['wait','1音ずつ確かめる'],['continuous','テンポで通す']]));
 fields+=`<div class="form-group"><label class="field-title" for="tempo">テンポ <span><input aria-label="テンポの数値" id="tempoNumber" class="tempo-number" type="number" min="40" max="180" value="${options.bpm}"> <small class="muted">BPM</small></span></label><input id="tempo" class="tempo-range" type="range" min="40" max="180" step="1" value="${options.bpm}"><p class="helper">BPMは1分間の拍数。最初は60がおすすめです。</p></div>`;
 if(canMic)fields+=`<label class="toggle-row"><span class="toggle-copy"><strong>マイクで${left?'音を確かめる':'音の出入りを見る'}</strong><small>${left?'合った音が少し続くと、やさしく反応します。':'音程や、正しい弦の判定はしません。'}</small></span><input type="checkbox" data-mic ${options.mic?'checked':''}></label><p class="helper">${options.mic?'マイク中はお手本の自動再生と演奏中のクリックを止めます。録音・送信はしません。':left?'マイクなしでは「次の音へ」を押して進められます。':'お手本と一緒に、拍を数えて弾けます。'}</p>`;
 shell(`<div class="page-content"><button class="back" data-nav="home">${icon('back')}練習メニューに戻る</button><div class="eyebrow muted">LEVEL 1 · LESSON ${String(LESSONS.indexOf(lesson)+1).padStart(2,'0')}</div><h1 class="page-title">${lesson.title}</h1><p class="page-sub">${lesson.sub}</p><div class="lesson-meta"><span class="pill">${lesson.tag}</span><span class="pill">${lesson.page?'教本 p.'+lesson.page:'はじめのチュートリアル'}</span><span class="pill">${left?'2と3の形':'開放弦'}</span></div><div class="setup-grid"><section class="instruction-card"><h2>まず、やり方を見てみよう。</h2><ol class="steps">${lesson.steps.map(x=>`<li>${x}</li>`).join('')}</ol>${left?`<div class="finger-map" aria-label="1と2は全音、2と3は半音、3と4は全音"><div class="row"><b>1</b><span>全音</span><b class="touch">2</b><span class="half">·</span><b class="touch">3</b><span>全音</span><b>4</b></div><p>2と3だけ、近づける。図は間隔の関係を表します。</p></div>`:''}</section><section class="setup-card"><h2>今日の練習を選ぼう。</h2>${fields}</section></div><section class="score-preview"><div class="score-heading"><span>これから弾く楽譜 <span class="muted">${Math.ceil(notes.at(-1).end/4)}小節${lesson.type==='cross'?'（4小節 × 2回）':''}</span></span><div class="row">${notes.at(-1).bar>=4?`<button class="text-button" data-preview="-1" aria-label="前の4小節" ${previewGroup===0?'disabled':''}>‹</button><span class="muted">${previewGroup+1} / ${Math.ceil((notes.at(-1).bar+1)/4)}</span><button class="text-button" data-preview="1" aria-label="次の4小節" ${previewGroup===Math.floor(notes.at(-1).bar/4)?'disabled':''}>›</button>`:''}</div></div><div class="score-grid">${renderScore(notes,preferences,previewGroup)}</div></section>${lesson.type==='reading'?`<div class="notice"><div class="row between"><span id="previewClock">弾く前に、30秒ながめてみよう。</span><button class="text-button" data-action="previewTimer">30秒はかる</button></div></div>`:''}<div id="startError" role="alert"></div><div class="start-strip"><p>準備はいい？<br>4つ数えたら、はじめよう。</p><button class="primary" data-action="start">${icon('play')}練習をはじめる</button></div></div>`);
}
function renderSettings(){shell(`<div class="page-content"><div class="eyebrow muted">MAKE IT YOURS</div><h1 class="page-title">練習しやすい、かたちに。</h1><p class="page-sub">慣れてきたら、ヒントを少しずつ減らしてみよう。</p><div class="settings-stack"><section class="panel"><h2 class="panel-title">楽譜のヒント</h2>${settingToggle('colors','弦の色を表示','G＝青、D＝オレンジ、A＝赤、E＝緑')}${settingToggle('fingers','指番号を表示','0は開放弦、1〜4は左手の指')}${settingToggle('names','音名・弦名の補助を表示','五線の下の名前を隠して、譜読みの練習に')}</section><section class="panel"><h2 class="panel-title">音とマイク</h2>${settingToggle('reference','お手本音を一緒に鳴らす','マイクを使う練習では、自動再生を止めます。')}${settingToggle('click','拍のクリックを鳴らす','開始の4拍カウントは、いつでも鳴ります。')}<label class="field-title" for="sensitivity" style="margin-top:17px">マイクの感度</label><select id="sensitivity" class="choice" style="width:100%">${[['normal','ふつう'],['high','高め（初期設定）'],['ultra','とても高め']].map(([v,l])=>`<option value="${v}" ${preferences.sensitivity===v?'selected':''}>${l}</option>`).join('')}</select><p class="helper">小さな音が拾われないときに上げます。感度を上げても、音程の許容幅は変えません。</p></section><section class="panel"><h2 class="panel-title">プライバシー</h2><p class="about-copy" style="margin-top:12px">表示と音の設定だけを、このブラウザに保存します。練習履歴は保存しません。マイクの音は端末内だけで処理し、録音や外部への送信はしません。</p>${!storageAvailable?'<p class="error">この環境では設定を保存できません。</p>':''}</section><section class="panel about-copy"><h2 class="panel-title">この試作について</h2><p>「ひと弓」は仮の名前です。教本の指定ページをもとに、レベル1を練習できるWeb版を作りました。34・40ページの練習は、同じ指の間隔で全弦へ展開しています。41〜43ページは上2段の音階を収録しています。</p><p>お手本は合成音です。マイクで確認できるのは単音の高さの目安です。姿勢・弓の動き・音色・和音のバランスは判定しません。音声の解説、曲、App Store版は今後の追加対象です。</p><details><summary>参考にした学習アプリ</summary><p><a href="https://blog.duolingo.com/music-course/" target="_blank" rel="noreferrer">Duolingo Music</a>：ゲーム形式の短い練習を参考に、説明の後すぐ弾ける構成へ。公開日：ページ本文では確認できず。2026-10-14参照。</p><p><a href="https://support.khanacademy.org/hc/en-us/articles/360030753412-Why-Mastery-Learning-by-Sal-Khan" target="_blank" rel="noreferrer">Khan Academy</a>：身につくまで取り組む考え方を参考に、同じ課題を繰り返せる構成に。更新日：2023-08-09。</p><p><a href="https://yousician.com/" target="_blank" rel="noreferrer">Yousician</a>：演奏中の音に反応する体験を参考に、単音のフィードバックを用意。公開日不明。2026-10-14検索時の公式ページ掲載文を参照。</p><p>これらは構成の参考です。このアプリの学習効果や、実楽器での判定精度を検証した結果ではありません。</p></details><details><summary>楽譜の字形・ライセンス</summary><p>以前の「ふよみ」と同じBravura 1.204の輪郭を使っています。</p><pre class="license-copy">${escapeHTML(BRAVURA_LICENSE)}</pre></details><details><summary>イラストの出典</summary><p>Astra Drawで作成した既存原本を複製し、駒を上面表示に切り替えて縮小しました。基礎資料：<a href="https://commons.wikimedia.org/wiki/File:Violin_front.jpg" target="_blank" rel="noreferrer">Violin front.jpg</a> — A. Kniesel（2007-09-08、CC BY-SA 3.0）、<a href="https://commons.wikimedia.org/wiki/File:Violin_VL100.png" target="_blank" rel="noreferrer">Violin VL100.png</a> — Just plain Bill（CC0）、<a href="https://commons.wikimedia.org/wiki/File:Violin_bridge_2_views.jpg" target="_blank" rel="noreferrer">Violin bridge 2 views.jpg</a> — Just plain Bill（CC BY-SA 4.0）。改変したイラストは<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>で提供します。</p></details></section></div></div>`);}
function settingToggle(key,title,description){return `<label class="toggle-row"><span class="toggle-copy"><strong>${title}</strong><small>${description}</small></span><input type="checkbox" data-pref="${key}" ${preferences[key]?'checked':''}></label>`;}

async function requestWake(){try{wakeLock=await navigator.wakeLock?.request('screen');}catch{}}
function cleanup(){sessionToken++;cancelAnimationFrame(raf);clearInterval(previewTimer);audio.stop();mic.stop();wakeLock?.release().catch(()=>{});wakeLock=null;practice=null;}
function isWaiting(){return lesson.unit>0&&options.mode==='wait';}
function isOneByOne(){return lesson.type==='open'&&options.mode==='step';}
function renderPractice(){
 const p=practice;
 shell(`<div class="practice"><header class="practice-top row between"><div class="row"><button class="icon-button" data-action="exitPractice" aria-label="練習を終了">${icon('close')}</button><div class="practice-title">${lesson.title}<small>${options.bpm} BPM · ${isWaiting()?'1音ずつ確かめる':isOneByOne()?'1つずつ体験':'テンポで通す'}</small></div></div><span class="pill" id="sessionProgress">準備しています</span></header><div class="progress" style="margin-bottom:23px"><span id="sessionBar" style="width:0"></span></div><div class="practice-layout"><section class="playing-card"><div class="playing-head"><span id="phaseLabel">準備中</span><span id="barLabel">4拍のカウントではじまります</span></div><div class="current-note" id="currentNote"><div class="note-heading" id="noteHeading"></div><span class="string-label" id="stringLabel"></span><div id="noteScore"></div><div id="countdownArea" class="countdown-area" hidden><div class="countdown-label">準備はいい？</div><div class="countdown-number" id="countNumber">1</div></div><div id="durationCopy" class="duration-copy"></div><div class="beat-track" id="beatTrack">${[1,2,3,4].map(b=>`<span class="beat" data-beat="${b}">${b}</span>`).join('')}</div><div class="note-progress"><span id="noteProgress"></span></div></div><div class="coach-strip"><span class="coach-icon">${icon('spark')}</span><p id="coachText" aria-live="polite">楽器と弓を、用意しよう。</p></div></section><aside class="practice-side"><section class="panel"><div class="eyebrow muted" style="font-size:9px">UP NEXT</div><div id="nextNote" class="next-note"></div><p id="nextHint"></p></section><section class="panel"><h2 class="panel-title">${options.mic?'マイクのようす':'自分の音を聴こう'}</h2>${options.mic?'<div class="mic-bar" role="meter" aria-label="マイクの音量" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="micLevel"></span></div><p class="mic-feedback" id="micFeedback" role="status" aria-live="polite">音を待っています</p>':`<p style="margin-top:14px">${lesson.type==='heights'?'2本が一緒に鳴るところは、同じくらいの大きさを探そう。':'マイク採点はありません。お手本と、弾いた音を聴き比べてみよう。'}</p>`}</section></aside></div><div class="practice-controls"><button class="secondary" data-action="pause" id="pauseBtn">${icon('pause')}一時停止</button><button class="secondary" data-action="reference" id="referenceBtn">${icon('sound')}お手本を聴く</button><button class="primary" data-action="next" id="nextBtn" ${isWaiting()?'':'hidden'}>${options.mic?'この音を飛ばす':'次の音へ'}${icon('arrow')}</button><button class="primary" data-action="nextStep" id="nextStepBtn" hidden>次の長さを試す ${icon('arrow')}</button></div><p class="screen-status" id="practiceStatus">${options.mic?(lesson.unit>0?'単音の高さを確かめます。弓や指の動きは判定しません。':'音量だけを表示します。音程や正しい弦の判定はしません。'):'一緒に弾く練習です。演奏の正しさは採点していません。'}</p><section class="score-preview"><div class="score-heading"><span>楽譜を見ながら</span><span class="muted" id="scorePageLabel"></span></div><div class="score-grid" id="practiceScore"></div></section></div>`,true);
 updateNote(true);
 if(p.phase==='starting'){$('#pauseBtn').disabled=true;$('#referenceBtn').disabled=true;$('#nextBtn').disabled=true;}
}
async function startPractice(){
 clearInterval(previewTimer);const token=++sessionToken;audio.stop();mic.stop();view='practice';
 practice={phase:'starting',index:0,group:-1,baseTime:0,startIndex:0,queue:[],cue:0,acceptedAt:null,hold:null,lastMicAt:0,feedback:'',count:null};
 preferences.bpm=options.bpm;save();renderPractice();window.scrollTo(0,0);
 try{await audio.init();if(token!==sessionToken)return;if(options.mic){const active=await mic.start();if(!active||token!==sessionToken)return;}if(token!==sessionToken)return;await requestWake();if(token!==sessionToken)return;beginTransport(0);}catch(e){if(token!==sessionToken)return;cleanup();view='setup';renderSetup();$('#startError').innerHTML=`<p class="error">${escapeHTML(e.name==='NotAllowedError'?'マイクの許可が得られませんでした。ブラウザの設定で許可するか、マイクなしで進めてください。':e.message)}</p><button class="secondary" data-action="startNoMic">マイクなしで始める</button>`;$('#startError').scrollIntoView({block:'center'});}
}
function beginTransport(index){
 const p=practice;if(!p)return;p.phase='countdown';p.index=index;p.startIndex=index;p.baseTime=audio.time+.12;p.queue=[];p.cue=0;p.count=null;p.acceptedAt=null;p.hold=null;pitchGate.reset();
 const spb=60/options.bpm;for(let i=0;i<4;i++)p.queue.push({at:p.baseTime+i*spb,type:'click',accent:i===0});
 p.musicTime=p.baseTime+4*spb;
 if(!isWaiting()){
  const events=isOneByOne()?[notes[index]]:notes.slice(index),offset=notes[index].start;
  if(preferences.click&&!options.mic){const end=isOneByOne()?notes[index].beats:notes.at(-1).end-offset;for(let b=0;b<end;b++)p.queue.push({at:p.musicTime+b*spb,type:'click',accent:(offset+b)%4===0});}
  if(preferences.reference&&!options.mic)for(const n of events)if(!n.rest)p.queue.push({at:p.musicTime+(n.start-offset)*spb,type:'note',n});
 }
 p.queue.sort((a,b)=>a.at-b.at);$('#pauseBtn').disabled=false;$('#referenceBtn').disabled=false;$('#nextBtn').disabled=false;$('#pauseBtn').innerHTML=icon('pause')+'一時停止';$('#nextStepBtn').hidden=true;$('#nextBtn').hidden=!isWaiting();updateNote(true);cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
}
function tick(){
 const p=practice;if(!p||!['countdown','playing','stepDone'].includes(p.phase))return;
 const now=audio.time,spb=60/options.bpm;
 while(p.cue<p.queue.length&&p.queue[p.cue].at<now+.12){const cue=p.queue[p.cue++];if(cue.at<now-.15)continue;if(cue.type==='click')audio.click(Math.max(now,cue.at),cue.accent);else playNote(cue.n,Math.max(now,cue.at),cue.n.beats*spb*.94);}
 if(now<p.musicTime){
  const count=Math.min(4,Math.max(1,Math.floor((now-p.baseTime)/spb)+1));if(count!==p.count){p.count=count;$('#countNumber').textContent=count;$('#phaseLabel').textContent='4つ数えたら、はじめよう';$('#countdownArea').hidden=false;$('#noteScore').hidden=true;$('#durationCopy').hidden=true;$('#referenceBtn').disabled=true;$('#nextBtn').disabled=true;setBeat(count);}
 }else{
  if(p.phase==='countdown'){p.phase='playing';$('#countdownArea').hidden=true;$('#noteScore').hidden=false;$('#durationCopy').hidden=false;$('#referenceBtn').disabled=false;$('#nextBtn').disabled=false;pitchGate.reset();p.hold=now;updateNote(true);}
  if(p.phase==='playing'){
   let elapsed=isWaiting()?now-p.hold:(now-p.musicTime)/spb;
   if(!isWaiting()){
    const position=elapsed+notes[p.startIndex].start,end=isOneByOne()?notes[p.startIndex].end:notes.at(-1).end;
    if(position>=end){if(isOneByOne()&&p.index<notes.length-1){p.phase='stepDone';audio.stop();$('#phaseLabel').textContent='ひとつ、体験できた';$('#coachText').textContent='準備ができたら、次の音の長さへ。';$('#nextStepBtn').hidden=false;$('#pauseBtn').disabled=true;$('#noteProgress').style.width='100%';}else{finishPractice();return;}}
    else{const index=notes.findIndex(n=>position>=n.start&&position<n.end);if(index>=0&&index!==p.index){p.index=index;p.acceptedAt=null;pitchGate.reset();updateNote(true);}const n=notes[p.index],progress=Math.min(1,(position-n.start)/n.beats);$('#noteProgress').style.width=`${progress*100}%`;setBeat(Math.floor(position)%4+1);$('#durationCopy').innerHTML=`<strong>${Math.max(0,Math.ceil((n.end-position)*2)/2)}</strong>拍 ${n.rest?'休もう':'音を続けよう'}`;}
   }else{
    const n=notes[p.index];if(n.rest){$('#noteProgress').style.width=`${Math.min(1,elapsed/(n.beats*spb))*100}%`;if(elapsed>=n.beats*spb){advanceNote();return;}}
    else if(p.acceptedAt!==null&&now-p.acceptedAt>.5){advanceNote();return;}
   }
   if(options.mic&&now-p.lastMicAt>.06){p.lastMicAt=now;observeMic(now);}
  }
 }
 if(practice===p)raf=requestAnimationFrame(tick);
}
function setBeat(beat){document.querySelectorAll('[data-beat]').forEach(el=>el.classList.toggle('on',Number(el.dataset.beat)===beat));}
function playNote(n,at=audio.time,duration=.6){if(n.rest)return;const voices=n.chord||[n];voices.forEach(x=>audio.tone(x.midi,duration,at,.65/Math.sqrt(voices.length)));}
function updateNote(force=false){
 const p=practice;if(!p)return;const n=notes[p.index],next=notes[p.index+1],color=n.rest?'#7c8977':preferences.colors?STRINGS[n.string].color:'#263d38',soft=n.rest?'#edf0e5':preferences.colors?STRINGS[n.string].soft:'#edf0e5';
 $('#currentNote').style.setProperty('--note-color',color);$('#currentNote').style.setProperty('--note-soft',soft);
 $('#noteHeading').textContent=n.rest?'ひと休み':n.chord?.length>1?n.chord.map(x=>x.string).join(' ＋ ')+' 線':n.string+' 線';
 $('#stringLabel').textContent=n.rest?'休符':n.finger===0?(n.chord?.length>1?'2本の開放弦を一緒に':'開放弦'):(preferences.fingers?n.finger+' の指':'押さえて弾く');
 $('#noteScore').className='current-score';$('#noteScore').innerHTML=renderScore(notes.filter(z=>z.bar===n.bar),preferences,Math.floor(n.bar/4));$('#durationCopy').innerHTML=isWaiting()&&!n.rest?(options.mic?'音が合うまで、自分のペースで':'弾けたら「次の音へ」'):`<strong>${n.beats===.5?'½':n.beats}</strong>拍 ${n.rest?'休もう':'音を続けよう'}`;
 $('#coachText').textContent=instructionFor(n,notes[p.index-1],lesson.type);$('#nextNote').textContent=next?noteTitle(next):'おしまい';$('#nextHint').textContent=next?(next.rest?'弓を止めて、次の準備。':(preferences.fingers?next.finger+'の指 · ':'')+next.beats+'拍'):'最後の音を、ていねいに。';
 $('#sessionProgress').textContent=`${p.index+1} / ${notes.length}`;$('#sessionBar').style.width=`${p.index/notes.length*100}%`;$('#phaseLabel').textContent=n.rest?'音を止めよう':isWaiting()?'この音を、弾いてみよう':'いま弾く音';$('#barLabel').textContent=`${n.bar+1} 小節目`;$('#noteProgress').style.width='0%';
 const group=Math.floor(n.bar/4);if(group!==p.group||force){p.group=group;$('#practiceScore').innerHTML=renderScore(notes,preferences,group);$('#scorePageLabel').textContent=`${group*4+1}〜${Math.min(group*4+4,notes.at(-1).bar+1)}小節`;}
 document.querySelectorAll('[data-score-index]').forEach(el=>{el.classList.toggle('active',Number(el.dataset.scoreIndex)===p.index);el.classList.toggle('passed',Number(el.dataset.scoreIndex)<p.index);});
 if($('#micFeedback')){$('#micFeedback').textContent=n.rest?'休符では、音を止めよう。':'音を待っています';$('#micFeedback').classList.remove('ok');p.feedback='';}
 if(isWaiting())setBeat(0);
}
function observeMic(now){
 const p=practice,n=notes[p.index],r=mic.read(preferences.sensitivity),level=Math.min(100,r.rms*3000);
 $('#micLevel').style.width=`${level}%`;$('.mic-bar').setAttribute('aria-valuenow',Math.round(level));
 if(now<audio.silentUntil||now<p.musicTime+.15){pitchGate.reset();feedback('お手本のあと、あなたの音を待っています');return;}
 if(lesson.unit===0){feedback(r.rms>MIC_LEVELS[preferences.sensitivity].minRms?(n.rest?'音が入っています。休符で止めてみよう。':'音を受け取っています'):(n.rest?'休みの静けさを保とう。':'音を待っています'));return;}
 if(n.rest){pitchGate.reset();return;}if(p.acceptedAt!==null)return;
 if(!r.frequency){pitchGate.reset();feedback(r.rms>MIC_LEVELS[preferences.sensitivity].minRms?'音を受け取りました。少し長く弾いてみよう。':'音を待っています');return;}
 const cents=centsFrom(r.frequency,n.midi);
 if(pitchGate.observe(r,n.midi,now*1000)){feedback('いいね。この音に近づけた！',true);if(isWaiting()){p.acceptedAt=now;audio.success();$('#noteProgress').style.width='100%';}}
 else if(Math.abs(cents)<=45)feedback('そのまま、少し音を続けよう。');
 else feedback(n.finger===0?'開放弦の高さを、お手本で確かめよう。':cents>0?'少し低い音を探してみよう。':'少し高い音を探してみよう。');
}
function feedback(message,ok=false){if(practice?.feedback===message)return;practice.feedback=message;$('#micFeedback').textContent=message;$('#micFeedback').classList.toggle('ok',ok);}
function advanceNote(){
 const p=practice;if(!p||p.phase!=='playing'||!isWaiting())return;
 if(p.index>=notes.length-1){finishPractice();return;}p.index++;p.hold=audio.time;p.acceptedAt=null;pitchGate.reset();updateNote(true);cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
}
function pausePractice(){
 const p=practice;if(!p||p.phase==='paused'||p.phase==='starting')return;p.phase='paused';audio.stop();mic.stop();cancelAnimationFrame(raf);pitchGate.reset();wakeLock?.release().catch(()=>{});wakeLock=null;$('#phaseLabel').textContent='一時停止';$('#coachText').textContent='再開すると4つ数えて、今の音から始めます。';$('#pauseBtn').innerHTML=icon('play')+'再開する';$('#nextBtn').disabled=true;$('#referenceBtn').disabled=true;$('#nextStepBtn').disabled=true;
}
async function resumePractice(){const p=practice;if(!p||p.phase!=='paused')return;const token=++sessionToken;$('#pauseBtn').disabled=true;try{await audio.init();if(token!==sessionToken)return;if(options.mic){const ok=await mic.start();if(!ok||token!==sessionToken)return;}await requestWake();if(token!==sessionToken)return;$('#nextStepBtn').disabled=false;beginTransport(p.index);}catch(e){if(token!==sessionToken)return;$('#pauseBtn').disabled=false;toast('再開できませんでした。マイクの許可を確認してください。');}}
function finishPractice(){
 cleanup();view='finish';
 shell(`<div class="success-wrap"><div class="finish-icon">${icon('check')}</div><div class="eyebrow muted">PRACTICE COMPLETE</div><h1 style="margin-top:14px">ひとつ、練習できました。</h1><p class="page-sub" style="margin:12px 0 28px">${lesson.title}を最後まで弾きました。</p><div class="finish-buttons"><button class="primary" data-action="repeat">${icon('play')}同じ練習を、もう一度</button><button class="secondary" data-nav="home">練習メニューへ戻る</button></div></div>`);
}
function previewCount(){clearInterval(previewTimer);let seconds=30;const update=()=>{const el=$('#previewClock');if(!el){clearInterval(previewTimer);return;}el.textContent=seconds>0?`楽譜を見る時間：あと ${seconds} 秒`:'準備できたら「練習をはじめる」を押そう。';if(seconds<=0)clearInterval(previewTimer);seconds--;};update();previewTimer=setInterval(update,1000);}

document.addEventListener('click',async event=>{
 const el=event.target.closest('button');if(!el||el.disabled)return;
 if(el.dataset.nav){navigate(el.dataset.nav);return;}
 if(el.dataset.lesson){enterLesson(el.dataset.lesson);return;}
 if(el.dataset.option){clearInterval(previewTimer);options[el.dataset.option]=el.dataset.value;if(el.dataset.option==='mode'&&el.dataset.value==='continuous')options.mic=false;previewGroup=0;renderSetup();return;}
 if(el.dataset.preview){previewGroup+=Number(el.dataset.preview);renderSetup();return;}
 switch(el.dataset.action){
  case 'start':await startPractice();break;
  case 'startNoMic':options.mic=false;await startPractice();break;
  case 'pause':if(practice?.phase==='paused')await resumePractice();else pausePractice();break;
  case 'next':advanceNote();break;
  case 'nextStep':if(practice?.phase==='stepDone'){audio.stop();beginTransport(practice.index+1);}break;
  case 'reference':if(practice&&practice.phase==='playing'){pitchGate.reset();playNote(notes[practice.index],audio.time,.8);if($('#micFeedback'))feedback('お手本を聴いてから、弾いてみよう。');}break;
  case 'exitPractice':{const current=lesson.id;enterLesson(current);break;}
  case 'repeat':view='setup';renderSetup();window.scrollTo(0,0);break;
  case 'previewTimer':previewCount();break;
 }
});
document.addEventListener('input',event=>{if(event.target.id==='tempo'||event.target.id==='tempoNumber'){const value=Number(event.target.value);if(Number.isFinite(value)&&value>=40&&value<=180){options.bpm=value;$('#tempo').value=value;$('#tempoNumber').value=value;}}});
document.addEventListener('change',event=>{
 const el=event.target;
 if(el.id==='tempoNumber'){options.bpm=Math.round(Math.min(180,Math.max(40,Number(el.value)||60)));el.value=options.bpm;$('#tempo').value=options.bpm;}
 else if(el.dataset.pref){preferences[el.dataset.pref]=el.checked;save();}
 else if(el.id==='sensitivity'){preferences.sensitivity=el.value;save();}
 else if(el.hasAttribute('data-random-string')){options.string=el.checked?'random':'A';renderSetup();}
 else if(el.hasAttribute('data-mic')){options.mic=el.checked;renderSetup();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&practice&&['playing','countdown','stepDone'].includes(practice.phase))pausePractice();});
window.addEventListener('pagehide',()=>{cleanup();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&practice){pausePractice();}});
if(Object.prototype.hasOwnProperty.call(stored,'history')){try{localStorage.setItem(KEY,JSON.stringify({preferences}));}catch{storageAvailable=false;}}
renderHome();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
