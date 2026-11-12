/* ================= УЧЕНЬ ================= */
var CFG=null,PREV=false,T=[],ANS=[],IX=0,ST={sn:"",fn:""},TMR=null,T0=0,END=0,EXITS=0,AWAY=0,awayAt=0,away=false,DONE=false,SID="s"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);

function boot(){
  var p=new URLSearchParams(location.search),c=p.get("c");PREV=p.get("p")==="1";
  if(!c){if(MON)showConsM();else showCons();return;}
  try{CFG=b64dec(c);if(!CFG||!CFG.tp||!CFG.tp.length)throw 0;if(CFG.v===3){if(!CFG.kit||!KITS[CFG.kit])throw 0;}else if(CFG.v>=2){if(!CFG.tk||(!CFG.tk.length&&CFG.pt!==2))throw 0;}else if(!CFG.n||CFG.n.length!==6)throw 0;}
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
  ANS=T.map(function(){return {sel:null,txt:"",otext:"",skip:false,ms:[],ps:[],pf:{},photos:[]};});
  IX=0;DONE=false;EXITS=0;AWAY=0;away=false;T0=Date.now();END=T0+CFG.m*60000;
  document.addEventListener("visibilitychange",onVis);window.addEventListener("blur",onLeave);window.addEventListener("focus",onBack);
  window.onbeforeunload=function(){return DONE?undefined:"Робота ще не здана";};
  TMR=setInterval(tick,1000);showQ();
}
function onLeave(){if(DONE||away)return;away=true;awayAt=Date.now();EXITS++;}
function onBack(){if(!away)return;away=false;AWAY+=(Date.now()-awayAt)/1000;}
function onVis(){if(document.hidden)onLeave();else onBack();}
function answered(i){var a=ANS[i];return a.sel!=null||!!a.txt||!!a.otext.trim()||(a.photos&&a.photos.length>0)||(a.ms&&a.ms.some(Boolean))||(a.ps&&a.ps.some(function(x){return x!=null&&String(x).trim()!=="";}));}
function tick(){var left=Math.round((END-Date.now())/1000),el=$("tm");
  if(el){el.textContent=dur(left);el.className="tm"+(left<=300?" low":"");}
  if(left<=0)finish(true);}

function showQ(){
  var t=T[IX],A=ANS[IX],last=IX===T.length-1;
  var h='<div class="screen"><div class="card fill"><div class="top"><div>Завдання '+(IX+1)+' з '+T.length+'</div><div class="tm" id="tm">'+dur((END-Date.now())/1000)+'</div></div>';
  h+='<div class="dots" id="dots">'+T.map(function(_,i){var a=ANS[i];return '<span data-i="'+i+'" class="'+(answered(i)?"a ":"")+(i===IX?"c":"")+'"></span>';}).join("")+'</div>';
  h+='<div class="qbox">'+(t.stim?'<div class="stim">'+fmt(t.stim)+'</div>':'')+(t.fig?'<div class="stim">'+t.fig+'</div>':'')+'<div class="q">'+fmt(t.q)+'</div>';
  if(t.k==="mc"){h+='<div class="opts" id="opts">'+t.o.map(function(o,i){return '<button class="opt'+(A.sel===i?" on":"")+'" data-p="'+i+'">'+fmt(o)+'</button>';}).join("")+'</div>';}
  else if(t.k==="checks"){h+='<div class="opts" id="chk" style="grid-template-columns:1fr">'+t.items.map(function(it,j){return '<button class="opt'+(A.ms[j]?' on':'')+'" data-j="'+j+'">'+(A.ms[j]?'✓ ':'')+fmt(it[0])+'</button>';}).join('')+'</div>';}
  else if(t.k==="nums"){h+='<div id="nms">'+t.parts.map(function(p,j){var sp=wSpec(p[1],p[2],p[3]);return '<div class="nrow'+(sp?' nw':'')+'" data-j="'+j+'"><span>'+fmt(p[0])+'</span>'+(sp?wHtml(sp,A,j):'<input type="text" inputmode="'+(symsOf(p[1])?'text':'decimal')+'" autocomplete="off" data-j="'+j+'" value="'+esc(A.ps[j]||'')+'">'+symBar(symsOf(p[1])))+'</div>';}).join('')+'</div>';}
  else if(t.k==="mix"){h+='<div id="mx">'+t.parts.map(function(p,j){return mixRow(p,j,A);}).join('')+'</div>';}
  else if(t.k==="mcs"){h+='<div id="mcs">'+t.parts.map(function(p,j){return '<div class="mrow"><div class="ml">'+(j+1)+') '+fmt(p[0])+'</div><div class="mo">'+p[1].map(function(o,i){return '<button class="opt'+(A.ps[j]===i?' on':'')+'" data-j="'+j+'" data-p="'+i+'">'+fmt(o)+'</button>';}).join('')+'</div></div>';}).join('')+'</div>';}
  else if(t.k==="rub"){}
  else{h+='<div class="disp"><span id="val">'+esc(A.txt)+'</span><span class="ph" id="ph" style="'+(A.txt?"display:none":"")+'">введи відповідь</span></div>';
    h+='<div class="pad" id="pad">'+["7","8","9","⌫","4","5","6","−","1","2","3",",","0"].map(function(k){return '<button data-k="'+k+'"'+(k==="0"?' style="grid-column:span 4"':"")+'>'+k+'</button>';}).join("")+'</div>';}
  if(t.open)h+='<div class="open"><div class="lb">'+esc(t.openLb||t.open||"Запиши розв\'язання й обґрунтування (цю частину перевіряє вчитель)")+'</div><div class="hint">✍️ Напиши максимально все, що можеш, щоб обґрунтувати свою думку. Поки це поле порожнє, далі перейти не можна (якщо не знаєш — так і напиши).</div><textarea id="ot">'+esc(A.otext)+'</textarea><div class="phs"'+(needPh(t)?'':' style="display:none"')+'><label class="phb">📷 Додати фото з зошита<input type="file" accept="image/*" id="pf" multiple style="display:none"></label><span class="phn" id="phn"></span><div id="pth"></div></div></div>';
  h+='</div><div class="act"><div>'+(IX?'<button class="link" id="bk">← Назад</button> ':'')+'<button class="link" id="dk">Не знаю</button></div><button class="btn" id="nx">'+(last?"Здати роботу":"Далі →")+'</button></div></div></div>';
  $("app").innerHTML=h;
  $("dots").onclick=function(e){var s=e.target.closest("span");if(s){IX=+s.dataset.i;showQ();}};
  if(t.k==="mc")$("opts").onclick=function(e){var b=e.target.closest(".opt");if(!b)return;A.sel=+b.dataset.p;A.skip=false;Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(x){x.classList.remove("on");});b.classList.add("on");};
  else if(t.k==="checks")$("chk").onclick=function(e){var b=e.target.closest(".opt");if(!b)return;var j=+b.dataset.j;A.ms[j]=!A.ms[j];A.skip=false;showQ();};
  else if(t.k==="nums"){var nm=$("nms");var hn=function(e){wChange(e.target,t,A,"nums");};nm.addEventListener("input",hn);nm.addEventListener("change",hn);}
  else if(t.k==="mcs")$("mcs").onclick=function(e){var b=e.target.closest(".opt");if(!b)return;A.ps[+b.dataset.j]=+b.dataset.p;A.skip=false;showQ();};
  else if(t.k==="mix"){var mx=$("mx");var hm=function(e){wChange(e.target,t,A,"mix");};mx.addEventListener("input",hm);mx.addEventListener("change",hm);}
  else if(t.k==="rub"){}
  else $("pad").onclick=function(e){var b=e.target.closest("button");if(b)typeKey(b.dataset.k);};
  if(t.open){$("ot").oninput=function(){A.otext=this.value;};phInit(A);}
  $("nx").onclick=function(){go(1);};$("dk").onclick=function(){if(needOpen(IX)){gateMsg();return;}A.sel=null;A.txt="";A.ms=[];A.ps=[];A.pf={};A.skip=true;go(1);};
  if($("bk"))$("bk").onclick=function(){go(-1);};
}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".sy button");if(!b)return;var row=b.closest("[data-j]");if(!row)return;var inp=(LASTIN&&row.contains(LASTIN)&&LASTIN.type==="text")?LASTIN:row.querySelector("input[type=text]");if(!inp)return;
  var s=inp.selectionStart==null?inp.value.length:inp.selectionStart,en=inp.selectionEnd==null?s:inp.selectionEnd,c=b.dataset.s;
  inp.value=inp.value.slice(0,s)+c+inp.value.slice(en);try{inp.setSelectionRange(s+c.length,s+c.length);}catch(x){}
  inp.dispatchEvent(new Event("input",{bubbles:true}));inp.focus();});
function symsOf(a){a=Array.isArray(a)?a[0]:a;var s=String(a==null?"":a),o="";
  if(typeof a==="number"&&a<0||/^-/.test(s)||/^−/.test(s))o+="−";
  "√π°²³⁴⁵⁶⁷⁸⁹₁₂₃₄₅₆₇₈₉()[];/∞∪≤≥".split("").forEach(function(c){if(s.indexOf(c)>=0&&o.indexOf(c)<0)o+=c;});
  return o;}
function symBar(s){return s?'<div class="sy">'+s.split("").map(function(c){return '<button type="button" data-s="'+c+'">'+c+'</button>';}).join("")+'</div>':'';}
function mixRow(p,j,A){var v=A.ps[j],h='<div class="xrow" data-j="'+j+'"><div class="xl">'+fmt(p.q)+'</div>';
  if(p.k==="s"){h+='<select class="xsel" data-j="'+j+'"><option value="">— обери —</option>'+p.o.map(function(o,i){return '<option value="'+i+'"'+(v===i?' selected':'')+'>'+esc(o)+'</option>';}).join('')+'</select>';}
  else{var sp=p.k==="t"?wSpec(p.a,"txt",p.w):null;
    if(sp)h+=wHtml(sp,A,j);
    else{var sy=p.sym!=null?p.sym:symsOf(p.k==="n"?p.a:p.a[0]);h+='<input type="text" autocomplete="off" inputmode="'+(p.k==="n"&&!sy?'decimal':'text')+'" data-j="'+j+'" value="'+esc(v||'')+'">'+symBar(sy);}}
  return h+'</div>';}
/* ---- віджети введення: дріб, знак/вибір, інтервал, стандартний вигляд, нерівність, пара ---- */
var WSEL={">":[">","<","="],"<":[">","<","="],"=":[">","<","="],"≥":["<",">","=","≤","≥"],"≤":["<",">","=","≤","≥"],"парна":["парна","непарна","загального вигляду"],"непарна":["парна","непарна","загального вигляду"],"загального вигляду":["парна","непарна","загального вигляду"]};
function needPh(t){return t.l==="Ст"||/розв.язан|обчислен|таблиц|доведи|по кроках|рисун|накрес|побудуй|складіть|склади|на папері/i.test((t.open||"")+" "+(t.openLb||"")+" "+(t.q||""));}
function wSpec(ans,kind,w){if(kind==="fac"||kind==="l")return null;var a=Array.isArray(ans)?ans[0]:ans;if(typeof a!=="string")return null;
  if(w==="none")return null;
  if(w&&w.indexOf("sym:")===0)return {t:"txt",sym:w.slice(4)};
  var m;
  if(WSEL[a.toLowerCase()])return {t:"sel",o:WSEL[a.toLowerCase()]};
  if(/^[\d,.]+·10\^\d+$/.test(a))return {t:"sci"};
  if(/^[\d,.\-]+<[A-Za-z]<[\d,.\-]+$/.test(a)){return {t:"dbl",v:a.match(/<([A-Za-z])</)[1].toUpperCase()};}
  if(/^[\(\[][^;]+;[^;]+[\)\]]$/.test(a)&&a.indexOf("∪")<0&&!/U/.test(a))return {t:"iv"};
  if(/^-?[\d,.]+;-?[\d,.]+$/.test(a))return {t:"pair"};
  if((a.match(/\//g)||[]).length===1&&!/\s/.test(a)){return {t:"frac",sym:symsOf(a).replace(/[\/()\[\];]/g,"")};}
  return null;}
function wInp(sp,f,A,j,ph){var v=(A.pf[j]||[])[f];return '<input type="text" class="wi" autocomplete="off" inputmode="'+(sp.sym?'text':'decimal')+'" data-j="'+j+'" data-f="'+f+'" value="'+esc(v==null?'':v)+'"'+(ph?' placeholder="'+ph+'"':'')+'>';}
function wHtml(sp,A,j){var v=(A.pf[j]||[]),h='<span class="wg">';
  if(sp.t==="sel")return '<select class="xsel" data-j="'+j+'" data-f="0"><option value="">— обери —</option>'+sp.o.map(function(o){return '<option value="'+esc(o)+'"'+(v[0]===o?' selected':'')+'>'+esc(o)+'</option>';}).join('')+'</select>';
  if(sp.t==="frac")h+='<span class="wfr">'+wInp(sp,0,A,j,"чисельник")+'<span class="wfb"></span>'+wInp(sp,1,A,j,"знаменник")+'</span>'+symBar(sp.sym);
  else if(sp.t==="sci")h+=wInp({sym:""},0,A,j)+' · 10<sup>'+wInp({sym:""},1,A,j)+'</sup>';
  else if(sp.t==="dbl")h+=wInp({sym:""},0,A,j)+' &lt; <b>'+sp.v+'</b> &lt; '+wInp({sym:""},1,A,j);
  else if(sp.t==="pair")h+=wInp({sym:""},0,A,j)+' ; '+wInp({sym:""},1,A,j)+symBar("−");
  else if(sp.t==="iv"){var b0=v[0]||"(",b1=v[3]||")";h+='<select class="bsel" data-j="'+j+'" data-f="0"><option'+(b0==="("?" selected":"")+'>(</option><option'+(b0==="["?" selected":"")+'>[</option></select>'+wInp({sym:"1"},1,A,j)+' ; '+wInp({sym:"1"},2,A,j)+'<select class="bsel" data-j="'+j+'" data-f="3"><option'+(b1===")"?" selected":"")+'>)</option><option'+(b1==="]"?" selected":"")+'>]</option></select>'+symBar("−∞+");}
  else h+='<input type="text" autocomplete="off" data-j="'+j+'" value="'+esc(A.ps[j]||'')+'">'+symBar(sp.sym);
  return h+'</span>';}
function wSer(sp,f){f=f.map(function(x){return x==null?"":String(x).trim();});
  if(sp.t==="sel")return f[0];
  if(sp.t==="frac")return f[0]||f[1]?f[0]+"/"+f[1]:"";
  if(sp.t==="sci")return f[0]||f[1]?f[0]+"·10^"+f[1]:"";
  if(sp.t==="dbl")return f[0]||f[1]?f[0]+"<"+sp.v+"<"+f[1]:"";
  if(sp.t==="pair")return f[0]||f[1]?f[0]+";"+f[1]:"";
  if(sp.t==="iv")return f[1]||f[2]?(f[0]||"(")+f[1]+";"+f[2]+(f[3]||")"):"";
  return f[0];}
function wChange(el,t,A,mode){if(!el||el.dataset.j==null)return;var j=+el.dataset.j,p=t.parts[j];
  if(el.dataset.f!=null){var sp=mode==="nums"?wSpec(p[1],p[2],p[3]):wSpec(p.a,"txt",p.w);if(!sp)return;
    var row=el.closest(".xrow,.nrow"),fs=[];Array.prototype.forEach.call(row.querySelectorAll("[data-f]"),function(x){fs[+x.dataset.f]=x.value;});
    A.pf[j]=fs;A.ps[j]=wSer(sp,fs);A.skip=false;return;}
  if(mode==="mix"&&el.tagName==="SELECT"){A.ps[j]=el.value===""?null:+el.value;A.skip=false;return;}
  A.ps[j]=el.value;A.skip=false;}
var LASTIN=null;document.addEventListener("focusin",function(e){if(e.target&&e.target.tagName==="INPUT")LASTIN=e.target;});
/* ---- фото розв'язання ---- */
var PH_MAX=3,PH_TOT=620000;
function phTotal(){var n=0;ANS.forEach(function(a){(a.photos||[]).forEach(function(d){n+=d.length;});});return n;}
function phShow(A){var b=$("pth");if(!b)return;b.innerHTML=(A.photos||[]).map(function(d,i){return '<span class="pt"><img src="'+d+'" alt="фото"><button type="button" data-d="'+i+'" title="Прибрати">✕</button></span>';}).join('');
  var n=$("phn");if(n)n.textContent=(A.photos||[]).length?("Додано фото: "+A.photos.length+" (можна до "+PH_MAX+")"):"";
  Array.prototype.forEach.call(b.querySelectorAll("button"),function(x){x.onclick=function(){A.photos.splice(+x.dataset.d,1);phShow(A);var dots=$("dots");if(dots){var sp=dots.children[IX];if(sp)sp.className=(answered(IX)?"a ":"")+"c";}};});}
function phComp(file,cb){var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var mx=1100,w=im.width,h=im.height,k=Math.min(1,mx/Math.max(w,h)),q=0.65,out="";
    for(var tr=0;tr<6;tr++){var c=document.createElement("canvas");c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));var cx=c.getContext("2d");cx.fillStyle="#fff";cx.fillRect(0,0,c.width,c.height);cx.drawImage(im,0,0,c.width,c.height);out=c.toDataURL("image/jpeg",q);if(out.length<=150000)break;q=Math.max(0.35,q-0.1);k*=0.85;}
    cb(out);};im.onerror=function(){cb(null);};im.src=fr.result;};fr.onerror=function(){cb(null);};fr.readAsDataURL(file);}
function phInit(A){phShow(A);var f=$("pf");if(!f)return;f.onchange=function(){var fl=Array.prototype.slice.call(f.files||[]),i=0,msg=$("phn");
  (function nx(){if(i>=fl.length){f.value="";phShow(A);var dots=$("dots");if(dots&&dots.children[IX])dots.children[IX].className=(answered(IX)?"a ":"")+"c";return;}
    var file=fl[i++];if((A.photos||[]).length>=PH_MAX){if(msg)msg.textContent="Максимум "+PH_MAX+" фото до одного завдання.";return nx();}
    phComp(file,function(d){if(!d){if(msg)msg.textContent="Не вдалося відкрити фото.";}else if(phTotal()+d.length>PH_TOT){if(msg)msg.textContent="Забагато фото в роботі: стисни або прибери зайве.";}else A.photos.push(d);nx();});})();};}
function nrmEx(s){var m={"а":"a","с":"c","е":"e","х":"x","у":"y","о":"o","р":"p","к":"k","м":"m","т":"t","і":"i"},sup={"⁰":0,"¹":1,"²":2,"³":3,"⁴":4,"⁵":5,"⁶":6,"⁷":7,"⁸":8,"⁹":9};
  return String(s).toLowerCase().replace(/\s+/g,"").replace(/[−–—]/g,"-").replace(/[×*·]/g,"").replace(/,/g,".").replace(/[а-яіє]/g,function(c){return m[c]||c;}).replace(/[₀-₉]/g,function(c){return String(c.charCodeAt(0)-8320);}).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,function(c){return "^"+sup[c];});}
function mixOk(p,v){if(p.k==="s")return v!=null&&v===p.a;if(v==null||!String(v).trim())return false;
  if(p.k==="n"){var x=parseNum(v);return isFinite(x)&&Math.abs(x-p.a)<=(p.tol||0.0005);}
  if(p.k==="l"){var arr=String(v).split(/[,;\s]+/).filter(Boolean).map(parseNum);if(arr.some(function(x){return !isFinite(x);}))return false;arr.sort(function(a,b){return a-b;});var ref=p.a.slice().sort(function(a,b){return a-b;});return arr.length===ref.length&&arr.every(function(x,i){return x===ref[i];});}
  var n=nrmEx(v);return p.a.some(function(a){var x=nrmEx(a);return x===n||(x.indexOf("/")>=0&&x.replace(/[()]/g,"")===n.replace(/[()]/g,""));});}
function mixText(p,v){return p.k==="s"?(v==null?"—":p.o[v]):(String(v||"").trim()||"—");}
function mixRight(p){return p.k==="s"?p.o[p.a]:(p.k==="n"?fm(p.a):(p.k==="l"?p.a.join(", "):p.a[0]));}
function needOpen(i){var t=T[i],a=ANS[i];return !!t.open&&!(a.otext&&a.otext.trim())&&!(a.photos&&a.photos.length);}
function gateMsg(){var ot=$("ot");if(ot){ot.style.borderColor="#c0392b";ot.focus();}var e=$("gerr");if(!e){e=document.createElement("div");e.id="gerr";e.className="gerr";var ac=document.querySelector(".act");if(ac&&ac.parentNode)ac.parentNode.insertBefore(e,ac);}
  e.textContent="Заповни відкриту частину: напиши хоча б кілька слів (або додай фото). Тоді можна рухатися далі.";if(e.scrollIntoView)e.scrollIntoView({block:"center"});}
function go(d){if(d>0&&needOpen(IX)){gateMsg();return;}if(d>0&&IX===T.length-1){finish(false);return;}IX=Math.max(0,Math.min(T.length-1,IX+d));showQ();}
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
  if(k==="fac"){var f=[];s.replace(/,/g,"·").split("·").forEach(function(x){var m=/^(\d+)\^(\d+)$/.exec(x);if(m){for(var i=0;i<+m[2];i++)f.push(+m[1]);}else if(/^\d+$/.test(x))f.push(+x);else f.push(NaN);});return f.sort(function(a,b){return a-b;}).join("·");}
  return s.replace(/·/g,"");}
function numOk(p,s){if(s==null||!String(s).trim())return false;var k=p[2];if(!k)return /\d/.test(s)&&Math.abs(parseNum(s)-p[1])<0.0005;var n=nrm(s,k);return [].concat(p[1]).some(function(a){var x=nrm(a,k);return x===n||(x.indexOf("/")>=0&&x.replace(/[()]/g,"")===n.replace(/[()]/g,""));});}
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
    else if(t.k==="mix"){var c=0,n=t.parts.length;t.parts.forEach(function(p,j){if(mixOk(p,a.ps[j]))c++;});
      part=a.ps.some(function(x){return x!=null&&String(x).trim()!=="";})?Math.max(0,Math.ceil(t.ap*c/n-0.5)):0;ok=part===t.ap;
      given=t.parts.map(function(p,j){return (j+1)+") "+mixText(p,a.ps[j])+(mixOk(p,a.ps[j])?" ✓":" ✗");}).join("; ");right=t.parts.map(function(p,j){return (j+1)+") "+mixRight(p);}).join("; ");}
    else if(t.k==="rub"){given="";}
    else if(/\d/.test(a.txt)){given=a.txt;ok=Math.abs(parseNum(a.txt)-t.a)<0.0005;}
    return {l:t.l,t:t.t,blk:t.blk,pts:t.pts,aut:t.aut,opn:t.opn,q:t.q,k:t.k,given:given,right:right,ok:ok,otext:a.otext,photos:(a.photos||[]).slice(),rub:t.rub,rubm:t.rubm,open:t.open,ograde:null,c:t.c||0,an:t.an||0,rb:t.rb||0,part:part,mix:t.k==="mix"?1:0};});
  var S=summarize(recs),g=grade12(S.score);
  var res={recs:recs,S:S,g:g,start:T0,end:end,dur:(end-T0)/1000,exits:EXITS,away:Math.round(AWAY)};
  showResult(res);saveResult(res);
}
function showResult(r){
  if(MON){showResultM(r);return;}
  var S=r.S,o=CFG.o,h='<div class="screen"><div class="card fill"><div class="scroll"><div class="center"><h1>Роботу здано</h1><div class="sub">'+esc(ST.sn+" "+ST.fn)+' · '+esc(CFG.t)+'</div>';
  if(PREV)h+='<div class="banner">Попередній перегляд: результат не збережено</div>';
  else h+='<div id="svst" class="note" style="margin:8px 0;font-weight:600"></div>';
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

