/* ================= УЧЕНЬ ================= */
var CFG=null,PREV=false,T=[],ANS=[],IX=0,ST={sn:"",fn:""},TMR=null,T0=0,END=0,EXITS=0,AWAY=0,awayAt=0,away=false,DONE=false,SID="s"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);

function boot(){
  var p=new URLSearchParams(location.search),c=p.get("c");PREV=p.get("p")==="1";
  if(!c){if(MON)showConsM();else showCons();return;}
  try{CFG=b64dec(c);if(!CFG||!CFG.tp||!CFG.tp.length)throw 0;if(CFG.v>=3){if(!CFG.kit||!KITS[CFG.kit])throw 0;}else if(CFG.v>=2){if(!CFG.tk||(!CFG.tk.length&&CFG.pt!==2))throw 0;}else if(!CFG.n||CFG.n.length!==6)throw 0;}
  catch(e){$("app").innerHTML='<div class="screen"><div class="card center">Посилання пошкоджене. Попросіть учителя надіслати його ще раз.</div></div>';return;}
  CFG.o=CFG.o||{};showStart();
}
function showStart(){
  var tot=(MON&&CFG.v>=2)?monCount(CFG):effCounts(CFG).reduce(function(a,b){return a+b;},0);
  var h='<div class="screen"><div class="card fill">';
  if(FIREBASE_CONFIG||true)h+='<button class="key" id="keyBtn" title="Для вчителя">🔑</button>';
  h+='<h1>'+esc(CFG.t)+'</h1><div class="sub">'+esc(SUBJ[CFG.s])+', '+CFG.g+' клас · '+tot+' завдань · '+CFG.m+' хв'+(CFG.per?' · '+esc(CFG.per):'')+'</div>'+(MON?'<div class="note center" style="margin:0 0 6px">Це зріз знань: оцінки за нього не виставляють.</div>':'');
  if(PREV)h+='<div class="banner">Попередній перегляд: результат не зберігається</div>';
  h+='<div class="scroll"><div class="row2"><div><label>Прізвище</label><input type="text" id="sn" autocomplete="off" value="'+esc(ST.sn)+'"></div><div><label>Ім\'я</label><input type="text" id="fn" autocomplete="off" value="'+esc(ST.fn)+'"></div></div>';
  h+='<div class="err" id="err"></div><div class="center" style="margin-top:6px"><button class="btn" id="go">Почати</button></div>';
  h+='<div class="note">'+(MON?'Відповідай самостійно, як умієш. Можна повертатися до попередніх завдань. Якщо не знаєш — натисни «Не знаю».':'Завдання без підказок: відповідай самостійно. Можна повертатися до попередніх завдань. Якщо не знаєш — натисни «Не знаю». Не виходь з вікна під час роботи: учитель бачить, скільки разів ти виходив(ла).')+'</div></div></div></div>';
  $("app").innerHTML=h;$("sn").focus();
  $("keyBtn").onclick=teacherPanel;
  $("sn").oninput=function(){ST.sn=this.value;};$("fn").oninput=function(){ST.fn=this.value;};
  $("go").onclick=startTest;
}
function startTest(){
  ST.sn=ST.sn.trim();ST.fn=ST.fn.trim();
  if(!ST.sn||!ST.fn){$("err").textContent="Введи прізвище та ім'я.";return;}
  T=(MON?buildMon:buildTest)(CFG,(ST.sn+"|"+ST.fn).toLowerCase().replace(/\s+/g," "));
  ANS=T.map(function(){return {sel:null,txt:"",otext:"",skip:false,ms:[],ps:[]};});
  IX=0;DONE=false;EXITS=0;AWAY=0;away=false;T0=Date.now();END=T0+CFG.m*60000;
  document.addEventListener("visibilitychange",onVis);window.addEventListener("blur",onLeave);window.addEventListener("focus",onBack);
  window.onbeforeunload=function(){return DONE?undefined:"Робота ще не здана";};
  TMR=setInterval(tick,1000);showQ();
}
function onLeave(){if(DONE||away)return;away=true;awayAt=Date.now();EXITS++;}
function onBack(){if(!away)return;away=false;AWAY+=(Date.now()-awayAt)/1000;}
function onVis(){if(document.hidden)onLeave();else onBack();}
function answered(i){var a=ANS[i];return a.sel!=null||!!a.txt||!!a.otext.trim()||(a.ms&&a.ms.some(Boolean))||(a.ps&&a.ps.some(function(x){return x!=null&&String(x).trim()!=="";}));}
function tick(){var left=Math.round((END-Date.now())/1000),el=$("tm");
  if(el){el.textContent=dur(left);el.className="tm"+(left<=300?" low":"");}
  if(left<=0)finish(true);}

function showQ(){
  var t=T[IX],A=ANS[IX],last=IX===T.length-1;
  var h='<div class="screen"><div class="card fill"><div class="top"><div>Завдання '+(IX+1)+' з '+T.length+'</div><div class="tm" id="tm">'+dur((END-Date.now())/1000)+'</div></div>';
  h+='<div class="dots" id="dots">'+T.map(function(_,i){var a=ANS[i];return '<span data-i="'+i+'" class="'+(answered(i)?"a ":"")+(i===IX?"c":"")+'"></span>';}).join("")+'</div>';
  h+='<div class="qbox">'+(t.stim?'<div class="stim">'+t.stim+'</div>':'')+(t.fig?'<div class="stim">'+t.fig+'</div>':'')+'<div class="q">'+fmt(t.q)+'</div>';
  if(t.k==="mc"){h+='<div class="opts" id="opts">'+t.o.map(function(o,i){return '<button class="opt'+(A.sel===i?" on":"")+'" data-p="'+i+'">'+fmt(o)+'</button>';}).join("")+'</div>';}
  else if(t.k==="checks"){h+='<div class="opts" id="chk" style="grid-template-columns:1fr">'+t.items.map(function(it,j){return '<button class="opt'+(A.ms[j]?' on':'')+'" data-j="'+j+'">'+(A.ms[j]?'✓ ':'')+fmt(it[0])+'</button>';}).join('')+'</div>';}
  else if(t.k==="nums"){h+='<div id="nms">'+t.parts.map(function(p,j){return '<div class="nrow"><span>'+fmt(p[0])+'</span><input type="text" inputmode="decimal" autocomplete="off" data-j="'+j+'" value="'+esc(A.ps[j]||'')+'"></div>';}).join('')+'</div>';}
  else if(t.k==="mcs"){h+='<div id="mcs">'+t.parts.map(function(p,j){return '<div class="mrow"><div class="ml">'+(j+1)+') '+fmt(p[0])+'</div><div class="mo">'+p[1].map(function(o,i){return '<button class="opt'+(A.ps[j]===i?' on':'')+'" data-j="'+j+'" data-p="'+i+'">'+fmt(o)+'</button>';}).join('')+'</div></div>';}).join('')+'</div>';}
  else if(t.k==="rub"){}
  else{h+='<div class="disp"><span id="val">'+esc(A.txt)+'</span><span class="ph" id="ph" style="'+(A.txt?"display:none":"")+'">введи відповідь</span></div>';
    h+='<div class="pad" id="pad">'+["7","8","9","⌫","4","5","6","−","1","2","3",",","0"].map(function(k){return '<button data-k="'+k+'"'+(k==="0"?' style="grid-column:span 4"':"")+'>'+k+'</button>';}).join("")+'</div>';}
  if(t.open)h+='<div class="open"><div class="lb">Запиши розв\'язання й обґрунтування (цю частину перевіряє вчитель)</div><textarea id="ot">'+esc(A.otext)+'</textarea></div>';
  h+='</div><div class="act"><div>'+(IX?'<button class="link" id="bk">← Назад</button> ':'')+'<button class="link" id="dk">Не знаю</button></div><button class="btn" id="nx">'+(last?"Здати роботу":"Далі →")+'</button></div></div></div>';
  $("app").innerHTML=h;
  $("dots").onclick=function(e){var s=e.target.closest("span");if(s){IX=+s.dataset.i;showQ();}};
  if(t.k==="mc")$("opts").onclick=function(e){var b=e.target.closest(".opt");if(!b)return;A.sel=+b.dataset.p;A.skip=false;Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(x){x.classList.remove("on");});b.classList.add("on");};
  else if(t.k==="checks")$("chk").onclick=function(e){var b=e.target.closest(".opt");if(!b)return;var j=+b.dataset.j;A.ms[j]=!A.ms[j];A.skip=false;showQ();};
  else if(t.k==="nums")Array.prototype.forEach.call(document.querySelectorAll("#nms input"),function(inp){inp.oninput=function(){A.ps[+inp.dataset.j]=this.value;A.skip=false;};});
  else if(t.k==="mcs")$("mcs").onclick=function(e){var b=e.target.closest(".opt");if(!b)return;A.ps[+b.dataset.j]=+b.dataset.p;A.skip=false;showQ();};
  else if(t.k==="rub"){}
  else $("pad").onclick=function(e){var b=e.target.closest("button");if(b)typeKey(b.dataset.k);};
  if(t.open)$("ot").oninput=function(){A.otext=this.value;};
  $("nx").onclick=function(){go(1);};$("dk").onclick=function(){A.sel=null;A.txt="";A.ms=[];A.ps=[];A.skip=true;go(1);};
  if($("bk"))$("bk").onclick=function(){go(-1);};
}
function go(d){if(d>0&&IX===T.length-1){finish(false);return;}IX=Math.max(0,Math.min(T.length-1,IX+d));showQ();}
function typeKey(k){
  var A=ANS[IX],tx=A.txt;
  if(k==="⌫")tx=tx.slice(0,-1);
  else if(k==="−"){if(!tx.length)tx="−";}
  else if(k===","){if(tx.indexOf(",")<0&&tx.replace("−","").length>0)tx+=",";}
  else if(tx.replace(/[−,]/g,"").length<9)tx+=k;
  A.txt=tx;A.skip=false;$("val").textContent=tx;$("ph").style.display=tx?"none":"";
}
document.addEventListener("keydown",function(e){
  if(!T.length||DONE||!$("pad")||!CFG||document.activeElement&&document.activeElement.tagName==="TEXTAREA")return;
  if(/^[0-9]$/.test(e.key))typeKey(e.key);else if(e.key===","||e.key===".")typeKey(",");else if(e.key==="-")typeKey("−");
  else if(e.key==="Backspace"){typeKey("⌫");e.preventDefault();}else if(e.key==="Enter")go(1);
});
function nrm(s,k){s=String(s).toLowerCase().replace(/\s+/g,"").replace(/[−–—]/g,"-").replace(/[×*х]/g,"·").replace(/\./g,",").replace(/;/g,",").replace(/°/g,"").replace(/[₀-₉]/g,function(c){return String(c.charCodeAt(0)-8320);}).replace(/а/g,"a").replace(/в/g,"b").replace(/с/g,"c");
  var sup={"⁰":0,"¹":1,"²":2,"³":3,"⁴":4,"⁵":5,"⁶":6,"⁷":7,"⁸":8,"⁹":9};s=s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,function(c){return "^"+sup[c];});
  if(k==="fac"){var f=[];s.split("·").forEach(function(x){var m=/^(\d+)\^(\d+)$/.exec(x);if(m){for(var i=0;i<+m[2];i++)f.push(+m[1]);}else if(/^\d+$/.test(x))f.push(+x);else f.push(NaN);});return f.sort(function(a,b){return a-b;}).join("·");}
  return s.replace(/·/g,"");}
function numOk(p,s){if(s==null||!String(s).trim())return false;var k=p[2];if(!k)return /\d/.test(s)&&Math.abs(parseNum(s)-p[1])<0.0005;var n=nrm(s,k);return [].concat(p[1]).some(function(a){return nrm(a,k)===n;});}
function parseNum(s){return Number(String(s).replace(/\s/g,"").replace("−","-").replace(",","."));}

function finish(auto){
  if(DONE)return;
  var blank=T.filter(function(t,i){return !answered(i);}).length;
  if(!auto&&blank>0&&!confirm("Є завдання без відповіді: "+blank+". Здати роботу?"))return;
  DONE=true;clearInterval(TMR);if(away)onBack();
  document.removeEventListener("visibilitychange",onVis);window.removeEventListener("blur",onLeave);window.removeEventListener("focus",onBack);window.onbeforeunload=null;
  var end=Date.now(),recs=T.map(function(t,i){var a=ANS[i],ok=false,given="",right=t.right,part=null;
    if(t.k==="mc"){if(a.sel!=null){given=t.o[a.sel];ok=a.sel===t.a;}}
    else if(t.k==="checks"){var c=0;t.items.forEach(function(it,j){if(!!a.ms[j]===!!it[1])c++;});
      part=a.ms.some(Boolean)?Math.max(0,c-(t.items.length-t.pts)):0;ok=part===t.pts;
      given=t.items.map(function(it,j){return (a.ms[j]?"✓":"–");}).join(" ");right=t.items.map(function(it){return it[1]?"✓":"–";}).join(" ");}
    else if(t.k==="nums"){part=0;t.parts.forEach(function(p,j){if(numOk(p,a.ps[j]))part++;});ok=part===t.pts;
      given=t.parts.map(function(p,j){return a.ps[j]||"—";}).join("; ");right=t.parts.map(function(p){return fm(Array.isArray(p[1])?p[1][0]:p[1]);}).join("; ");}
    else if(t.k==="mcs"){part=0;t.parts.forEach(function(p,j){if(a.ps[j]===p[2])part++;});ok=part===t.pts;
      given=t.parts.map(function(p,j){return a.ps[j]==null?"—":p[1][a.ps[j]];}).join("; ");right=t.parts.map(function(p){return p[1][p[2]];}).join("; ");}
    else if(t.k==="rub"){given="";}
    else if(/\d/.test(a.txt)){given=a.txt;ok=Math.abs(parseNum(a.txt)-t.a)<0.0005;}
    return {l:t.l,t:t.t,blk:t.blk,pts:t.pts,aut:t.aut,opn:t.opn,q:t.q,k:t.k,given:given,right:right,ok:ok,otext:a.otext,rub:t.rub,open:t.open,ograde:null,c:t.c||0,an:t.an||0,rb:t.rb||0,part:part};});
  var S=summarize(recs),g=grade12(S.score);
  var res={recs:recs,S:S,g:g,start:T0,end:end,dur:(end-T0)/1000,exits:EXITS,away:Math.round(AWAY)};
  showResult(res);saveResult(res);
}
function showResult(r){
  if(MON){showResultM(r);return;}
  var S=r.S,o=CFG.o,h='<div class="screen"><div class="card fill"><div class="scroll"><div class="center"><h1>Роботу здано</h1><div class="sub">'+esc(ST.sn+" "+ST.fn)+' · '+esc(CFG.t)+'</div>';
  if(PREV)h+='<div class="banner">Попередній перегляд: результат не збережено</div>';
  if(o.grade)h+='<span class="badge">Орієнтовна оцінка: '+(S.pending?"≈ ":"")+r.g+' з 12</span>'+(S.pending?'<div class="note">Частину відповідей ще перевірить учитель, тому оцінка може змінитися.</div>':"");
  else h+='<div class="note">Результат побачить учитель.</div>';
  h+='<div class="stats"><div class="stat"><b>'+dur(r.dur)+'</b><span>час виконання</span></div><div class="stat"><b>'+r.exits+'</b><span>виходів із вікна</span></div></div>';
  h+='<div class="note">Учитель бачить кількість виходів із вікна.</div></div>';
  if(o.prof){
    h+='<h2>Рівні мислення</h2>'+bars(S.lv);
    var rep=Object.keys(S.tp).filter(function(t){return S.tp[t].m&&S.tp[t].e/S.tp[t].m<0.6;});
    if(rep.length)h+='<h2>Що повторити</h2>'+rep.map(function(t){return '<div class="mis">'+esc(TOPN[t])+'</div>';}).join("");
    else h+='<h2>Висновок</h2><div class="mis">Усі перевірені теми засвоєно на доброму рівні.</div>';
  }
  if(o.err){var w=r.recs.filter(function(x){return !x.ok&&x.aut>0;});
    if(w.length){h+='<h2>Розбір помилок ('+w.length+')</h2>'+w.map(function(x){return '<div class="mis">'+fmt(x.q)+'<br><span class="a">Твоя відповідь: '+(x.given?fmt(esc(x.given)):"— (не знаю)")+'</span><br><span class="ok">Правильна відповідь: '+fmt(x.right)+'</span></div>';}).join("");}}
  h+='</div></div></div>';
  $("app").innerHTML=h;
}

