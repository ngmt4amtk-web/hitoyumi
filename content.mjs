// 教材データ。原譜を視認して転記。追加課題はここへ登録する。
export const STRINGS = {
 G:{name:'ソ',midi:55,color:'#347ab4',soft:'#e7f0f9',notes:['ソ','ラ','シ','ド','レ'],steps:[-5,-4,-3,-2,-1]},
 D:{name:'レ',midi:62,color:'#c57624',soft:'#fff0dd',notes:['レ','ミ','ファ♯','ソ','ラ'],steps:[-1,0,1,2,3]},
 A:{name:'ラ',midi:69,color:'#c45454',soft:'#fcebea',notes:['ラ','シ','ド♯','レ','ミ'],steps:[3,4,5,6,7]},
 E:{name:'ミ',midi:76,color:'#318260',soft:'#e6f3eb',notes:['ミ','ファ♯','ソ♯','ラ','シ'],steps:[7,8,9,10,11]}
};
export const INTERVALS=[0,2,4,5,7];
export function makeNote(string='A',finger=0,beats=1,extra={}) {
 const s=STRINGS[string]; if(!s||finger<0||finger>4)throw new Error('Invalid note');
 return {string,finger,beats,midi:s.midi+INTERVALS[finger],name:s.notes[finger],step:s.steps[finger],...extra};
}
export const makeRest=beats=>({rest:true,beats,name:'休み'});
export const LESSONS=[
 {id:'open',unit:0,title:'はじめての開放弦',sub:'1本の弦で、音の長さを感じよう',tag:'まずはここから',page:null,type:'open',minutes:'1分',steps:['左手の指は押さえず、選んだ弦に弓を置きます。','全音符は4拍、2分音符は2拍、4分音符は1拍、8分音符は半拍です。','4つのカウントが鳴ったら、お手本と一緒に弾きます。音が変わるごとに弓を返しましょう。'],check:'音の終わりまで、弓を止めずに使えた？'},
 {id:'heights',unit:0,title:'7つの弓の高さ',sub:'1本と2本。その間の高さを探そう',tag:'移弦',page:9,type:'heights',minutes:'1分',steps:['G、G＋D、D、D＋A、A、A＋E、Eの順にたどり、戻ります。','2本のところは同時に鳴らします。2本が同じくらいの大きさになる高さを探します。','弦を移るときは、弓を止めて高さを替えてから次へ。慣れたら止まる時間を短くします。'],check:'2本が同じくらいの大きさで鳴った？'},
 {id:'cross',unit:0,title:'休みの間に、次の弦へ',sub:'音を止めて、弓の高さを用意する',tag:'休符と移弦',page:14,type:'cross',minutes:'40秒',steps:['1つ弾いたら、1拍休みます。休みの間に次の弦へ弓を用意します。','G・D、D・A、A・Eから選べます。各段を2回弾きます。','休符では音を止め、次の音を拍に合わせて始めます。'],check:'休符は静かで、次の音を拍に合わせて始められた？'},
 {id:'reading',unit:0,title:'読んで弾く・8つの問題',sub:'長さと弦を、楽譜から読んでみよう',tag:'まとめ',page:'25–26',type:'reading',minutes:'1分',steps:['まず譜面を30秒ながめ、弦の移動と音の長さ、休符を確かめます。','4拍のカウントのあと、4小節を通して弾きます。','マイクは音が出たかを見る補助です。弦の正しさや音程の採点はしません。'],check:'休符も数えながら、4小節を止まらず弾けた？'},
 {id:'fingers',unit:1,title:'2と3を、くっつける',sub:'音名より先に、指の関係をつかもう',tag:'左手の入口',page:30,type:'fingers',minutes:'2分',steps:['1は人差し指、2は中指、3は薬指、4は小指。0は何も押さえない開放弦です。','隣り合う指の音程には、半音と全音があります。全音は半音2つ分です。今回は2と3だけを近づけます。','1と2、3と4の間はあけます。どの弦でも、この指の間隔の並びは同じです。','マイクを使うと、表示された音に近い音が続いたところで次へ進みます。'],check:'上りも下りも、2と3を近づけたまま戻れた？'},
 {id:'add2',unit:1,title:'2の指を足す',sub:'1から全音あけて、2を置く',tag:'指を一つずつ',page:34,type:'add2',minutes:'1分',steps:['まず0、1、2と置いてみます。1と2の間は全音あけます。','2と1を行き来し、1へ戻ったとき同じ高さになるか聴きます。','教本のA線の練習を、4本の弦から選べるようにしています。'],check:'戻るたびに、1の音を同じ場所で出せた？'},
 {id:'add3',unit:1,title:'3の指を足す',sub:'2のすぐ隣に、3を置く',tag:'半音',page:34,type:'add3',minutes:'1分',steps:['1、2、3と弾きます。2と3の間は半音です。','3を上げるときも、2の場所を保ちます。','2と3を行き来して、近い間隔を確かめます。'],check:'3を上げたとき、2の場所を保てた？'},
 {id:'add4',unit:1,title:'4の指を足す',sub:'2と3を保ったまま、小指へ',tag:'小指',page:34,type:'add4',minutes:'1分',steps:['2、3、4と弾きます。3と4の間は全音です。','G・D・A線では、4の音は隣の高い弦の開放弦と同じ高さです。','4を置いても、2と3の間が広がらないようにします。'],check:'4を使ったあとも、2と3が近いままだった？'},
 {id:'place',unit:1,title:'まとめて置いて、下る',sub:'休符で準備。4・3・2・1と離そう',tag:'指の準備',page:36,type:'place',minutes:'1分',steps:['最初に1・2・3・4を一つずつ弾き、音を確かめておきます。','練習では1を弾き、休符で弓を止めます。1を軽く残し、2・3・4をまとめて置きます。置くときは音を出しません。','4を鳴らし、次の小節で4・3・2・1と下ります。まとめて置くことを、強く握ることにしません。'],check:'最後の1が、最初の1と同じ高さに戻った？'},
 {id:'order',unit:1,title:'指の順番を変えてみる',sub:'同じ形のまま、違う順番で弾く',tag:'組み合わせ',page:40,type:'order',minutes:'1分',steps:['0・1・2・3、1・2・3・4、0・1・2・1、1・2・3・2と弾きます。','音符ごとに弓を返します。2と3の半音を保ちましょう。','教本の上段の補助練習を、全弦へ広げています。'],check:'4を使ったあとも、1や2の音に戻れた？'},
 {id:'scale',unit:2,title:'2本の弦で、はじめての音階',sub:'ト長調・ニ長調・イ長調を選ぼう',tag:'音階',page:'41–43',type:'scale',minutes:'1分',steps:['低い弦の開放弦から、隣の高い弦の3の指まで上り、同じ道を下ります。','ト長調はG・D、ニ長調はD・A、イ長調はA・Eを使います。','どちらの弦でも2と3を近づけます。今回は各ページ上2段の音階を練習します。','最初は1音ずつ弓を返しても大丈夫。慣れたらスラー（弓を返さずつなげる印）の2音を一弓で弾きます。'],check:'弦が変わっても、2と3の間隔を保てた？'}
];
// p25–26。 [弦,拍数]。nullは休符。
export const READING=[
 [['A',1],['A',1],['A',1],['A',1],['A',2],['A',2],['A',1],['A',1],['A',2],['A',4]],
 [['D',2],['D',2],['D',1],['D',1],['D',1],[null,1],['D',2],['D',1],['D',1],['D',4]],
 [['A',1],['A',1],['D',1],['D',1],['A',2],['D',2],['D',1],['D',1],['A',1],['A',1],['D',4]],
 [['A',2],['E',2],['E',1],['E',1],['A',1],['A',1],['A',1],[null,1],['E',1],[null,1],['A',4]],
 [['D',1],['D',.5],['D',.5],['D',1],['D',1],['G',1],['G',1],['G',1],['G',1],['D',2],['G',2],['G',4]],
 [['G',2],['D',1],['D',1],['A',2],['D',2],['G',1],['G',1],['D',1],['D',1],['A',4]],
 [['D',1],['A',1],['E',2],['E',1],['A',1],['D',2],['D',1],['D',1],['A',1],['A',1],['E',4]],
 [['G',1],['D',1],['A',1],['E',1],['E',2],[null,2],['E',1],['A',1],['D',1],['G',1],['G',4]]
];
export function makeExercise(type,opts={},random=Math.random){
 const string=opts.string in STRINGS?opts.string:'A';
 const n=(f,b=1,extra={})=>makeNote(string,f,b,extra);
 let notes=[];
 if(type==='open'){
   const duration={whole:4,half:2,quarter:1,eighth:.5}[opts.rhythm]||4;
   const strings=Object.keys(STRINGS);const pick=()=>opts.string==='random'?strings[Math.floor(random()*4)]:string;
   if(opts.mode==='step') notes=[4,2,1,.5].map(b=>makeNote(pick(),0,b));
   else {let beat=0;while(beat<16){let b=opts.rhythm==='random'?[4,2,1,.5][Math.floor(random()*4)]:duration; b=Math.min(b,4-beat%4);notes.push(makeNote(pick(),0,b));beat+=b;}}
 } else if(type==='heights'){
   const positions=[['G'],['G','D'],['D'],['D','A'],['A'],['A','E'],['E']];
   const order=opts.height&&opts.height!=='all'?[Number(opts.height)-1]:[0,1,2,3,4,5,6,6,5,4,3,2,1,0];
   notes=order.map(i=>({...makeNote(positions[i][0],0,4),chord:positions[i].map(s=>makeNote(s,0,4)),height:i+1}));
 } else if(type==='cross'){
   const pair=opts.pair||'DA',seq=[pair[0],pair[1],pair[1],pair[0],pair[0],pair[1],pair[1],pair[0]];
   notes=[...seq,...seq].flatMap(s=>[makeNote(s,0,1),makeRest(1)]);
 } else if(type==='reading') notes=READING[Math.min(7,Math.max(0,Number(opts.problem||1)-1))].map(([s,b])=>s?makeNote(s,0,b):makeRest(b));
 else if(type==='fingers')notes=[0,1,2,3,4,3,2,1,0].map(f=>n(f,4));
 else if(type==='add2')notes=[0,1,2,1,2,1,2,1,2,1,0].map((f,i)=>n(f,i===10?2:1));
 else if(type==='add3')notes=[1,2,3,2,3,2,3,2,3,2,1].map((f,i)=>n(f,i===10?2:1));
 else if(type==='add4')notes=[2,3,4,3,4,3,2,1,4,3,2,1].map(f=>n(f));
 else if(type==='place')notes=[n(1),makeRest(1),n(4,2),n(4),n(3),n(2),n(1)];
 else if(type==='order')notes=[0,1,2,3,1,2,3,4,0,1,2,1,1,2,3,2].map(f=>n(f));
 else if(type==='scale'){
   const pair=opts.scale||'DA',low=pair[0],high=pair[1];
   const bridge=opts.fourth==='4'?makeNote(low,4,2):makeNote(high,0,2);
   const ascending=[...Array.from({length:4},(_,f)=>makeNote(low,f,2)),bridge,...[1,2,3].map(f=>makeNote(high,f,2))];
   notes=[...ascending,...ascending.slice().reverse()].map((x,i)=>({...x,slurStart:i%2===0,slurEnd:i%2===1}));
 }
 if(!notes.length)throw new Error('Unknown exercise: '+type);
 return withTimeline(notes);
}
export function withTimeline(notes){let at=0;return notes.map((n,i)=>{const value={...n,index:i,start:at,end:at+n.beats,bar:Math.floor(at/4)};at+=n.beats;return value;});}
export function noteTitle(n){return n.rest?'休み':n.chord&&n.chord.length>1?n.chord.map(x=>x.string).join('＋')+'線':n.string+'線・'+n.name;}
export function instructionFor(n,previous,type){
 if(n.rest)return type==='place'?'弓を止めて、2・3・4をまとめて置こう。':'音を止めて、次の弦を用意しよう。';
 if(n.chord?.length===2)return '2本を一緒に。同じくらいの大きさで。';
 if(type==='open')return `${n.beats===.5?'半':n.beats}拍ぶん、弓を動かそう。`;
 if(n.finger===0)return '指を離して、開放弦を弾こう。';
 if(n.finger===3)return '3の指を、2のすぐ隣に。';
 if(n.finger===2)return previous?.finger===3?'3を離して、2の場所を保とう。':'1から全音あけて、2の指を置こう。';
 if(n.finger===4)return '3から全音あけて、4の指を置こう。';
 return '1の指。同じ場所へ、戻ろう。';
}
