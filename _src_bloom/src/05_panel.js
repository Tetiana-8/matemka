/* ================= Панель вчителя (моніторинг) =================
   Показники за розділом 4 ТЗ: P = бали за рівень ÷ максимум рівня × 100 %;
   Δ = P2 − P1; g = (P2 − P1) ÷ (100 − P1); рівні сформованості 90 / 74 / 60 %;
   S(TGI) = 0,73·(Зн+Ро)/2 + 0,16·(Зс+Ан)/2 + 0,11·(Оц+Ст)/2. */
function normName(x){return String(x.name||"").toLowerCase().replace(/\s+/g," ").trim();}
var PTL=["Вхід","Підсумок","Проміжний"];
function aggT(tasks,pred){var e=0,m=0;tasks.forEach(function(r){if(pred(r)){e+=gotOf(r);m+=r.pts;}});return m?Math.round(e*100/m):null;}
function lvPct(x){var S=summarize(x.tasks),o={};
  LV.forEach(function(L){o[L]=S.lv[L].m?Math.round(S.lv[L].e*100/S.lv[L].m):null;});
  o.all=pct(S.score,S.max);o.pending=S.pending;
  o.k1=aggT(x.tasks,function(r){return r.c===1;});
  o.an=aggT(x.tasks,function(r){return r.an;});
  o.k1r=aggT(x.tasks,function(r){return r.c===1&&!r.an;});
  o.raw={};LV.forEach(function(L){o.raw[L]=S.lv[L].m?S.lv[L].e:"";});
  o.anRaw=0;x.tasks.forEach(function(r){if(r.an)o.anRaw+=gotOf(r);});
  return o;}
function mean(a){a=a.filter(function(v){return v!=null;});return a.length?Math.round(a.reduce(function(s,v){return s+v;},0)/a.length):null;}
function median(a){a=a.filter(function(v){return v!=null;}).sort(function(x,y){return x-y;});if(!a.length)return null;var m=a.length>>1;return a.length%2?a[m]:Math.round((a[m-1]+a[m])/2);}
function dlt(a,b){return a==null||b==null?null:b-a;}
function dtxt(d){return d==null?"—":(d>0?"+":"")+d;}
function dcls(d){return d==null?"":d>=10?"ok":d<=-10?"a":"";}
function nf(x){return String(Math.round(x*100)/100).replace(".",",").replace("-","−");}
/* індекс Хейка; для P1 ≥ 90 % дивимося на утримання рівня */
function gx(a,b){if(a==null||b==null)return null;if(a>=90)return {hold:true,ok:b>=90};return {g:(b-a)/(100-a)};}
function gtxt(o){return o==null?"—":o.hold?(o.ok?"утр.":"↓"):nf(o.g);}
function glab(g){return g>=0.5?"високий приріст":g>=0.3?"стійкий приріст":g>=0.1?"слабкий приріст":"без зрушень або регрес";}
function gcls(o){return o==null||o.hold?"":o.g>=0.3?"ok":o.g<0.1?"a":"";}
function stgi(p){if(!p)return null;for(var i=0;i<LV.length;i++)if(p[LV[i]]==null)return null;return Math.round(0.73*(p["Зн"]+p["Ро"])/2+0.16*(p["Зс"]+p["Ан"])/2+0.11*(p["Оц"]+p["Ст"])/2);}
var REC={"Зн":"повернутися до термінів, означень і формул у вигляді коротких щоденних перевірок та карток","Ро":"пояснення «своїми словами», приклади й контрприклади, зіставлення понять","Зс":"практичні вправи на застосування правила в нових умовах, розв'язування за зразком і без нього","Ан":"завдання на порівняння, пошук закономірностей і причин, аналіз помилок у готових розв'язаннях","Оц":"перевірку чужих розв'язків за критеріями, пошук помилок, вибір раціонального способу з обґрунтуванням","Ст":"складання власних задач, проєктні завдання та задачі з кількома способами розв'язання"};
/* Універсальна рубрика 0–4 (розділ 5.4 ТЗ) */
var RUBU={
 "Ан":["Виділено всі суттєві елементи / ознаки, зв'язок названо і пояснено","Більшість елементів виділено, зв'язок названо без пояснення","Виділено частину елементів, зв'язок не встановлено","Один елемент або переказ замість аналізу","Немає відповіді або відповідь не стосується завдання"],
 "Оц":["Помилку знайдено й названо, записано правильний результат і правило, запропоновано спосіб перевірки (інший спосіб, оцінка, підстановка); де треба — є рисунок","Помилку знайдено, виправлено й пояснено, але немає способу перевірки","Помилку знайдено й виправлено, але пояснення неповне або не пов’язане з правилом","Помилку лише названо загально («неправильно») без виправлення, або виправлення містить помилку","Немає спроби або помилку не знайдено («помилки немає»)"],
 "Ст":["Задача коректна (умова повна, є питання, дані реалістичні), нова, з повним правильним розв’язанням і перевіркою відповіді","Задача коректна й правильно розв’язана, але немає перевірки або рисунка (де він потрібний), або дрібна помилка","Задача коректна, але розв’язання неповне чи з суттєвою помилкою; або розв’язано правильно, проте задача майже копія зразка","Є спроба скласти задачу, але вона некоректна: бракує даних чи питання, умова суперечлива, або це не задача","Немає спроби або відповідь не за темою"]};

function teacherPanelM(){
  if(!window.__pwOk){askPw(function(){window.__pwOk=1;try{teacherPanelM();}finally{window.__pwOk=0;}});return;}
  var m=document.createElement("div");m.className="modal";
  m.innerHTML='<div class="box"><div class="act" style="margin-top:0"><b style="color:#5a4b8a">Моніторинг: результати та динаміка</b><span><select id="wk" style="width:auto;display:inline-block;max-width:60vw"></select> <button class="btn sm soft" id="csv">CSV: таблиця балів</button> <button class="btn sm soft" id="csv2">CSV: динаміка</button> <button class="btn sm soft" id="clr">Очистити</button> <button class="btn sm" id="cls">Закрити</button></span></div><div id="tb">Завантаження…</div></div>';
  document.body.appendChild(m);
  $("cls").onclick=function(){document.body.removeChild(m);};
  var ROWS=[];
  function key(x){return x.code+"|"+x.yr;}
  function load(){
    $("tb").textContent="Завантаження…";
    fbReady().then(function(db){return fbCol(db).get();}).then(function(snap){
      ROWS=[];snap.forEach(function(d){var x=d.data();x._id=d.id;ROWS.push(x);});
      var ks={};ROWS.forEach(function(x){ks[key(x)]=String(x.title||"").replace(/\s*\([^()]*\)\s*$/,"")+" · "+x.yr;});
      var keys=Object.keys(ks);
      $("wk").innerHTML=keys.length?keys.map(function(k){return '<option value="'+esc(k)+'">'+esc(ks[k])+'</option>';}).join(""):'<option value="">Немає даних</option>';
      $("wk").onchange=render;render();
    }).catch(function(e){if(window.console)console.error(e);$("tb").textContent="Не вдалося завантажити результати.";});
  }
  function sel(){var k=$("wk").value;return ROWS.filter(function(x){return key(x)===k;});}
  function students(rows){
    var by={};
    rows.slice().sort(function(a,b){return String(a.end).localeCompare(String(b.end));}).forEach(function(x){
      var k=normName(x),e=by[k]=by[k]||{name:x.name,p:[null,null,null]};e.p[Math.min(2,x.pt|0)]=x;});
    return Object.keys(by).map(function(k){return by[k];}).sort(function(a,b){return a.name.localeCompare(b.name,"uk");});
  }
  function dist(pc,pt,L){var c=[0,0,0,0];pc.forEach(function(v){var q=v[pt];if(q&&q[L]!=null)c[fl(q[L])]++;});return c;}
  function render(){
    var rows=sel();if(!rows.length){$("tb").textContent="Результатів поки немає.";return;}
    var st=students(rows),pc=st.map(function(s){return [s.p[0]?lvPct(s.p[0]):null,s.p[1]?lvPct(s.p[1]):null,s.p[2]?lvPct(s.p[2]):null];});
    var cls=[0,1].map(function(pt){var o={n:0};LV.concat("all").forEach(function(L){o[L]=median(pc.map(function(v){return v[pt]?v[pt][L]:null;}));});o.n=pc.filter(function(v){return v[pt];}).length;return o;});
    var both=pc.filter(function(v){return v[0]&&v[1];}).length,nI=pc.filter(function(v){return v[2];}).length;
    var h='',hn='<div class="note">Учнів із вхідним зрізом: <b>'+cls[0].n+'</b> · з підсумковим: <b>'+cls[1].n+'</b> · з обома: <b>'+both+'</b>'+(nI?' · з проміжним: <b>'+nI+'</b>':'')+'. P — відсоток набраних балів на рівні; у профілі класу — <b>медіана</b>. Колір клітинки — рівень сформованості: <span class="chip" style="background:'+FLC[0]+'">початковий &lt; 60</span> <span class="chip" style="background:'+FLC[1]+'">середній 60–73</span> <span class="chip" style="background:'+FLC[2]+'">достатній 74–89</span> <span class="chip" style="background:'+FLC[3]+'">високий ≥ 90</span></div>';
    h+=tblBlock(st);h+=listBlock(st);
    h+='<details style="margin-top:18px"><summary style="cursor:pointer;color:#5a4b8a;font-weight:700">Додаткова аналітика (динаміка, приріст, рішення) — за потреби</summary>'+hn;
    h+='<h2>Профіль класу</h2><table><tr><th>Рівень</th><th>Вхідний P, %</th><th>Підсумковий P, %</th><th>Δ, в.п.</th><th>Середній g</th><th style="width:30%"></th></tr>';
    LV.forEach(function(L){var a=cls[0][L],b=cls[1][L],d=dlt(a,b);
      var gs=[];pc.forEach(function(v){if(v[0]&&v[1]){var o=gx(v[0][L],v[1][L]);if(o&&!o.hold)gs.push(o.g);}});
      var gm=gs.length?gs.reduce(function(x,y){return x+y;},0)/gs.length:null;
      h+='<tr><td>'+LVN[L]+'</td><td'+flS(a)+'>'+(a==null?"—":a)+'</td><td'+flS(b)+'>'+(b==null?"—":b)+'</td><td class="'+dcls(d)+'"><b>'+dtxt(d)+'</b></td><td class="'+(gm==null?"":gm>=0.3?"ok":gm<0.1?"a":"")+'">'+(gm==null?"—":'<b>'+nf(gm)+'</b> <span class="note">'+glab(gm)+'</span>')+'</td><td><div class="bar" style="margin-bottom:3px"><i class="n" style="width:'+(a||0)+'%;background:#c9bfe6"></i></div><div class="bar"><i class="g" style="width:'+(b||0)+'%"></i></div></td></tr>';});
    var da=dlt(cls[0].all,cls[1].all);
    h+='<tr><td><b>Загалом</b></td><td'+flS(cls[0].all)+'><b>'+(cls[0].all==null?"—":cls[0].all)+'</b></td><td'+flS(cls[1].all)+'><b>'+(cls[1].all==null?"—":cls[1].all)+'</b></td><td class="'+dcls(da)+'"><b>'+dtxt(da)+'</b></td><td></td><td><span class="note">фіолетова смуга — вхід, зелена — підсумок</span></td></tr></table>';
    h+='<h2>Розподіл учнів за рівнями сформованості</h2><div style="overflow-x:auto"><table><tr><th rowspan="2">Рівень Блума</th>'+[0,1].map(function(pt){return '<th colspan="4" style="text-align:center">'+PTL[pt]+' (учнів: '+cls[pt].n+')</th>';}).join("")+'</tr><tr>'+[0,1].map(function(){return ["Поч.","Сер.","Дост.","Вис."].map(function(n,i){return '<th style="background:'+FLC[i]+'" title="'+FLN[i]+'">'+n+'</th>';}).join("");}).join("")+'</tr>';
    LV.forEach(function(L){h+='<tr><td>'+LVN[L]+'</td>'+[0,1].map(function(pt){var c=dist(pc,pt,L);return c.map(function(n){return '<td>'+(n||"·")+'</td>';}).join("");}).join("")+'</tr>';});
    h+='</table></div>';
    if(both){
      var M=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
      pc.forEach(function(v){if(v[0]&&v[1])M[fl(v[0].all)][fl(v[1].all)]++;});
      h+='<h2>Матриця переходів (загальний показник: вхід → підсумок)</h2><table style="width:auto"><tr><th>було \\ стало</th>'+FLN.map(function(n,i){return '<th style="background:'+FLC[i]+'">'+n+'</th>';}).join("")+'</tr>';
      for(var i=0;i<4;i++)h+='<tr><td style="background:'+FLC[i]+'"><b>'+FLN[i]+'</b></td>'+M[i].map(function(n,j){return '<td style="text-align:center'+(j>i&&n?";font-weight:700;color:#2f6b45":j<i&&n?";font-weight:700;color:#a33b4a":"")+'">'+(n||"·")+'</td>';}).join("")+'</tr>';
      h+='</table>';
      var an0=mean(pc.filter(function(v){return v[0]&&v[1];}).map(function(v){return v[0].an;})),an1=mean(pc.filter(function(v){return v[0]&&v[1];}).map(function(v){return v[1].an;})),
          r0=mean(pc.filter(function(v){return v[0]&&v[1];}).map(function(v){return v[0].k1r;})),r1=mean(pc.filter(function(v){return v[0]&&v[1];}).map(function(v){return v[1].k1r;}));
      if(an0!=null&&an1!=null&&r0!=null&&r1!=null){
        var da1=an1-an0,dr1=r1-r0;
        h+='<h2>Перевірка якірних завдань</h2><div class="mis">Якірні завдання («розуміння» К1 та «оцінювання»): <b>'+an0+'% → '+an1+'%</b> ('+dtxt(da1)+' в.п.). Решта завдань К1: <b>'+r0+'% → '+r1+'%</b> ('+dtxt(dr1)+' в.п.). '+(dr1-da1>15?'<span class="a"><b>Увага:</b> на решті К1 приріст значно більший, ніж на якірних, — підсумковий варіант, імовірно, вийшов легшим; врахуйте це в довідці.</span>':'Приріст на якірних і на решті К1 співмірний — варіанти зрізів рівноскладні.')+'</div>';
      }
    }
    h+='<h2>Аналітична довідка та рішення</h2>'+brief(cls,st,pc);
    h+='<h2>Учні</h2><div style="overflow-x:auto"><table><tr><th rowspan="2">Учень</th>'+['Вхід, P %','Підсумок, P %','g (приріст)'].map(function(t){return '<th colspan="6" style="text-align:center">'+t+'</th>';}).join("")+'<th rowspan="2">S(TGI) вх → підс.</th><th rowspan="2"></th></tr><tr>'+[0,1,2].map(function(){return LV.map(function(L){return '<th>'+L+'</th>';}).join("");}).join("")+'</tr>';
    st.forEach(function(s,i){var a=pc[i][0],b=pc[i][1],c=pc[i][2],pend=(a&&a.pending)||(b&&b.pending)||(c&&c.pending);
      h+='<tr><td>'+esc(s.name)+'</td>'+LV.map(function(L){return '<td'+flS(a?a[L]:null)+'>'+(a&&a[L]!=null?a[L]:"—")+'</td>';}).join("")+LV.map(function(L){return '<td'+flS(b?b[L]:null)+'>'+(b&&b[L]!=null?b[L]:"—")+'</td>';}).join("")+LV.map(function(L){var o=a&&b?gx(a[L],b[L]):null,d=a&&b?dlt(a[L],b[L]):null;return '<td class="'+gcls(o)+'" title="Δ = '+dtxt(d)+' в.п.'+(o&&!o.hold?', '+glab(o.g):'')+'">'+gtxt(o)+'</td>';}).join("")+'<td>'+(stgi(a)==null?"—":stgi(a))+' → '+(stgi(b)==null?"—":stgi(b))+'</td><td>'+(s.p[0]?'<button class="btn sm soft" data-w="'+i+'|0">вхід'+phMark(s.p[0])+'</button> ':"")+(s.p[2]?'<button class="btn sm soft" data-w="'+i+'|2">проміжний'+phMark(s.p[2])+'</button> ':"")+(s.p[1]?'<button class="btn sm soft" data-w="'+i+'|1">підсумок'+phMark(s.p[1])+'</button>':"")+(pend?' <span class="chip">перевірити</span>':"")+'</td></tr>';});
    h+='</table></div><div class="note">g ≥ 0,5 — високий приріст; 0,3–0,49 — стійкий; 0,1–0,29 — слабкий; &lt; 0,1 — без зрушень або регрес (пороги робочі, після першого повного циклу їх варто уточнити). Для P на вході ≥ 90 % замість g — «утр.» (рівень утримано) або «↓». Підказка Δ — у спливаючому вікні клітинки.</div>';
    h+='</details>';
    $("tb").innerHTML=h;
    Array.prototype.forEach.call(document.querySelectorAll("[data-w]"),function(b){b.onclick=function(){var q=b.dataset.w.split("|");detail(st[+q[0]].p[+q[1]]);};});
    Array.prototype.forEach.call(document.querySelectorAll("[data-cut]"),function(b){b.onclick=function(){CUT=+b.dataset.cut;render();};});
    if($("cpT")){$("cpT").onclick=function(){tblCopy(false);};$("cpN").onclick=function(){tblCopy(true);};}
    render.st=st;render.pc=pc;
  }

  /* Таблиця для переносу в журнал: бали (не відсотки) за кожним рівнем, разом 0–24 і групи A, B, C по 0–8 */
  var CUT=null;
  var GRP=[["A",["Зн","Ро"]],["B",["Зс","Ан"]],["C",["Оц","Ст"]]];
  function tblData(st,cut){return st.filter(function(s){return s.p[cut];}).map(function(s){var x=s.p[cut],S=summarize(x.tasks),pend={},v={};
    LV.forEach(function(L){v[L]=S.lv[L].e;pend[L]=false;});x.tasks.forEach(function(r){if(isPending(r))pend[r.l]=true;});
    var g=GRP.map(function(q){return q[1].reduce(function(a,L){return a+v[L];},0);});
    return {name:s.name,v:v,pend:pend,tot:S.score,g:g,anyP:S.pending,max:S.max};});}
  function tblBlock(st){
    var has=[0,1,2].filter(function(c){return st.some(function(s){return s.p[c];});});
    if(!has.length)return "";
    if(CUT==null||has.indexOf(CUT)<0)CUT=has[0];
    var D=tblData(st,CUT),th='style="background:#d9e2f3;text-align:center"',yl='background:#fff2cc;text-align:center',gr='background:#e2efda;text-align:center';
    var o='<h2>Таблиця для переносу в журнал</h2><div class="qb" id="cutb">'+has.map(function(c){return '<button class="btn sm '+(c===CUT?'':'soft')+'" data-cut="'+c+'">'+["Вхідний зріз","Підсумковий зріз","Проміжний зріз"][c]+'</button>';}).join(" ")+'</div>';
    o+='<div style="overflow-x:auto"><table style="width:auto"><tr><th rowspan="2" '+th+'>Учень</th><th colspan="6" '+th+'>Критерії</th><th '+th+'>Разом<br>(0–24)</th>'+GRP.map(function(q){return '<th '+th+'>'+q[0]+'<br>(0–8)</th>';}).join("")+'</tr><tr>'+LV.map(function(L){return '<th '+th+'>'+L+'</th>';}).join("")+'<th '+th+'></th><th '+th+'></th><th '+th+'></th><th '+th+'></th></tr>';
    D.forEach(function(d){o+='<tr><td>'+esc(d.name)+'</td>'+LV.map(function(L){return '<td style="'+yl+'">'+d.v[L]+(d.pend[L]?'<span class="a" title="є відповідь, яку ще не оцінено вчителем">?</span>':'')+'</td>';}).join("")+'<td style="text-align:center;font-weight:700">'+d.tot+'</td>'+d.g.map(function(x){return '<td style="'+gr+'">'+x+'</td>';}).join("")+'</tr>';});
    o+='</table></div><div class="act" style="justify-content:flex-start;gap:8px"><button class="btn sm" id="cpT">Копіювати цифри (без імен)</button><button class="btn sm soft" id="cpN">Копіювати з іменами</button><span class="note" id="cpM"></span></div>';
    o+='<div class="note">Кожен рівень Блума — 0–4 бали, разом 6 × 4 = 24. Рівні об’єднано в три блоки по два рівні (по 8 балів): <b>A — знання й розуміння</b> (Зн + Ро), <b>B — застосування й аналіз</b> (Зс + Ан), <b>C — оцінювання й створення</b> (Оц + Ст). Позначка <span class="a"><b>?</b></span> — є відповідь, яку ще не оцінено вручну (кнопка «відкрити» у списку робіт; після збереження оцінок таблиця оновиться). Вставляйте в таблицю як є: порядок стовпців — Зн, Ро, Зс, Ан, Оц, Ст, Разом, A, B, C.'+(CUT===2?' Проміжний зріз містить лише наскрізні (К1) завдання, тому бали менші.':'')+'</div>';
    tblBlock.D=D;return o;}
  function tblCopy(withNames){var D=tblBlock.D||[],L=D.map(function(d){return (withNames?[d.name]:[]).concat(LV.map(function(l){return d.v[l];}),[d.tot],d.g).join("\t");}).join("\n");
    var m=$("cpM");function ok(){if(m)m.textContent="Скопійовано — вставте в таблицю (Ctrl+V).";}
    function fb(){var t=document.createElement("textarea");t.value=L;document.body.appendChild(t);t.select();try{document.execCommand("copy");ok();}catch(e){if(m)m.textContent="Не вдалося скопіювати.";}document.body.removeChild(t);}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(L).then(ok,fb);else fb();}

  function listBlock(st){
    var o='<h2>Роботи учнів: перевірити й оцінити</h2><div class="note">Відкрийте роботу, щоб побачити відповіді (і фото), та поставте бали за письмові частини — таблиця вище оновиться.</div><div style="overflow-x:auto"><table style="width:auto"><tr><th>Учень</th><th>Вхідний</th><th>Проміжний</th><th>Підсумковий</th></tr>';
    st.forEach(function(s,i){o+='<tr><td>'+esc(s.name)+'</td>'+[0,2,1].map(function(c){var x=s.p[c];return '<td>'+(x?'<button class="btn sm soft" data-w="'+i+'|'+c+'">відкрити'+phMark(x)+(summarize(x.tasks).pending?' <span class="a" title="є неоцінені відповіді">●</span>':'')+'</button>':'<span class="note">—</span>')+'</td>';}).join("")+'</tr>';});
    return o+'</table></div><div class="note"><span class="a">●</span> — є письмова відповідь, якої ще не оцінено.</div>';}
  /* Правила «дані → рішення» (розділ 9.2 ТЗ) */
  function brief(cls,st,pc){
    var t=[],hasA=cls[0].n>0,hasB=cls[1].n>0;
    if(!hasA&&!hasB&&!pc.some(function(v){return v[2];}))return '<div class="note">Недостатньо даних.</div>';
    var P=hasB?1:0;
    if(hasA||hasB){
      var sorted=LV.filter(function(L){return cls[P][L]!=null;}).sort(function(a,b){return cls[P][b]-cls[P][a];}),best=sorted[0],worst=sorted[sorted.length-1];
      t.push('<div class="mis">У '+(hasB?"підсумковому":"вхідному")+' зрізі найвищий показник (медіана) — на рівні «'+LVN[best]+'» ('+cls[P][best]+'%), найнижчий — на рівні «'+LVN[worst]+'» ('+cls[P][worst]+'%).</div>');
      var weak=["Ан","Оц","Ст"].filter(function(L){return cls[P][L]!=null&&cls[P][L]<60;});
      if(weak.length)t.push('<div class="mis"><b>Рішення 1.</b> Медіана класу на рівнях «'+weak.map(function(L){return LVN[L];}).join("», «")+'» нижча за 60 %: у календарному плані ставте завдання цих рівнів щонайменше раз на тиждень. Доречні: '+weak.map(function(L){return REC[L];}).join("; ")+'.</div>');
      else t.push('<div class="mis"><b>Рішення 1.</b> Медіана на рівнях Ан, Оц, Ст не нижча за 60 %. Для рівня «'+LVN[worst]+'» (найнижчий показник) додайте: '+REC[worst]+'.</div>');
    }
    if(hasA&&hasB){
      var ds=LV.filter(function(L){return cls[0][L]!=null&&cls[1][L]!=null;}).map(function(L){return {L:L,d:cls[1][L]-cls[0][L]};}).sort(function(a,b){return b.d-a.d;});
      if(ds.length)t.push('<div class="mis">Найбільше зростання медіани: «'+LVN[ds[0].L]+'» ('+dtxt(ds[0].d)+' в.п.); '+(ds[ds.length-1].d<=0?'немає зростання або є спад на рівні «'+LVN[ds[ds.length-1].L]+'» ('+dtxt(ds[ds.length-1].d)+' в.п.) — проаналізуйте причини.':'найменше — «'+LVN[ds[ds.length-1].L]+'» ('+dtxt(ds[ds.length-1].d)+' в.п.).')+'</div>');
    }
    /* група підтримки: P < 60 % на 3+ рівнях у вхідному зрізі */
    var sup=[],adv=[],iot=[],nosup=0;
    st.forEach(function(s,i){var a=pc[i][0];if(!a)return;
      var low=LV.filter(function(L){return a[L]!=null&&a[L]<60;}).length,high=LV.filter(function(L){return a[L]!=null&&a[L]>=90;}).length,lev=LV.filter(function(L){return a[L]!=null;}).length;
      if(low>=3){sup.push(s.name);var c=pc[i][2];
        if(c&&a.k1!=null&&c.k1!=null){var o=gx(a.k1,c.k1);if(o&&!o.hold&&o.g<0.1)iot.push(s.name+" (g = "+nf(o.g)+")");}else nosup++;}
      if(lev&&high*2>lev)adv.push(s.name);});
    if(hasA)t.push('<div class="mis"><b>Рішення 2. Група підтримки</b> (у вхідному зрізі P &lt; 60 % на трьох і більше рівнях): '+(sup.length?sup.map(esc).join(", ")+'. Проведіть для них проміжний зріз К1 (грудень).':"таких учнів немає.")+'</div>');
    if(sup.length)t.push('<div class="mis"><b>Рішення 3. Проміжний зріз (К1):</b> '+(iot.length?'приріст g &lt; 0,1 у '+iot.map(esc).join(", ")+' — розгляньте питання про індивідуальну освітню траєкторію (ІОТ), розмову з батьками.':(nosup===sup.length?'проміжного зрізу ще немає ні в кого з групи підтримки.':'в учнів групи підтримки, що пройшли проміжний зріз, приросту нижче 0,1 немає.'))+'</div>');
    if(hasA)t.push('<div class="mis"><b>Рішення 4. Підвищена складність</b> (P ≥ 90 % на більшості рівнів у вхідному зрізі): '+(adv.length?adv.map(esc).join(", ")+' — завдання підвищеної складності, олімпіадна або проєктна траєкторія.':"таких учнів немає.")+'</div>');
    t.push('<div class="note">Пороги правил — вихідні для першого року, їх затверджує педагогічна рада і переглядає після першого повного циклу. Результати — персональні дані: у звітах для педради й батьків лише агреговані дані без рейтингів; батьки отримують профіль лише своєї дитини. Моніторинг не використовується для атестації вчителів. Кілька учнів у вибірці — це орієнтир, а не вирок.</div>');
    return t.join("");
  }
  function detail(x){
    var d=document.createElement("div");d.className="modal";
    var S=summarize(x.tasks);
    var h='<div class="box"><div class="act" style="margin-top:0"><b style="color:#5a4b8a">'+esc(x.name)+' · '+PTN[Math.min(2,x.pt|0)]+(x.per?' ('+esc(x.per)+')':'')+'</b><button class="btn sm" id="dc">Закрити</button></div>';
    h+=phTop(x);h+='<h2>Завдання</h2>';
    x.tasks.forEach(function(r,i){
      if(!r.opn)return;
      var M=r.rubm;
      h+='<div class="gtask"><b>'+(i+1)+'. '+LVN[r.l]+'</b> · '+esc(TOPN[r.t]||r.t)+' · письмова частина: '+(r.rb?'0–4 б':'0–'+r.opn+' б')+'<br>';
      if(r.rb)h+='<div class="gq"><b>Завдання учня:</b><br>'+fmt(r.q)+'</div>';
      else if(M&&M.qa)h+='<div class="gq"><b>Запитання, яке пояснював учень:</b><br>'+fmt(M.qa)+'</div>';
      {
        var has=(r.otext&&r.otext.trim())||(r.photos&&r.photos.length);
        h+='<div class="gq"><b>Що мав написати учень:</b> '+esc(r.open)+'</div>';
        h+='<div class="gans"><div class="gh">✍️ Відповідь учня</div>'+(r.otext&&r.otext.trim()?'<div style="white-space:pre-wrap">'+esc(r.otext)+'</div>':'<i>— текст не написано'+(r.photos&&r.photos.length?', є фото нижче':'')+'</i>')+photosHtml(r)+'</div>';
        h+='<div class="gkey"><div class="gh">✅ '+(r.rb?'Що має бути в роботі':'Зразок відповіді — з ним порівнюйте')+'</div>'+fmt(esc(M?(M.mod||M.key):(r.rub||"")))+'</div>';
        if(r.rb){
          var U=RUBU[r.l]||RUBU["Оц"];
          h+='<div style="margin-top:8px"><b>Ваша оцінка (0–4):</b></div>';
          for(var k=4;k>=0;k--)h+='<label class="gopt"><input type="radio" name="rg'+i+'" value="'+k+'"'+(r.ograde===k?" checked":"")+'><span><b>'+k+'</b> — '+esc(U[4-k])+'</span></label>';
        }else if(has){
          var D=M&&r.opn===2?[M.l2,M.l1,M.l0]:(r.opn===1?["Відповідь по суті","Немає або хибно"]:null);
          h+='<div style="margin-top:8px"><b>Ваша оцінка (0–'+r.opn+'):</b></div>';
          for(var k2=r.opn;k2>=0;k2--)h+='<label class="gopt"><input type="radio" name="og'+i+'" value="'+k2+'"'+(r.ograde===k2?" checked":"")+'><span><b>'+k2+' б</b> — '+fmt(esc(D?D[r.opn-k2]:(k2===r.opn?"повна відповідь":k2===0?"немає або хибно":"частково")))+'</span></label>';
        }else h+='<div class="note" style="margin-top:6px">Відповіді немає — 0 балів.</div>';
      }
      h+='</div>';});
    h+='<div class="center"><button class="btn" id="sv">Зберегти бали</button></div></div>';
    d.innerHTML=h;document.body.appendChild(d);
    $("dc").onclick=function(){document.body.removeChild(d);};
    $("sv").onclick=function(){
      Array.prototype.forEach.call(d.querySelectorAll("input[data-r]"),function(inp){var r=x.tasks[+inp.dataset.r];r.ograde=inp.value===""?null:Math.max(0,Math.min(r.opn,+inp.value));});
      x.tasks.forEach(function(r,i){if(!r.rb)return;var c=d.querySelector('input[name="rg'+i+'"]:checked');if(c)r.ograde=+c.value;});
      x.tasks.forEach(function(r,i){if(r.rb||!r.opn)return;var c=d.querySelector('input[name="og'+i+'"]:checked');if(c)r.ograde=+c.value;});
      var S2=summarize(x.tasks);x.score=S2.score;x.pending=S2.pending;x.lv=S2.lv;
      fbReady().then(function(db){return fbCol(db).doc(x._id).update({tasks:x.tasks,score:x.score,pending:x.pending,lv:x.lv});}).then(function(){document.body.removeChild(d);render();});
    };
  }
  function download(name,L){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+L.join("\n")],{type:"text/csv"}));a.download=name;a.click();}
  /* Додаток Б ТЗ: один рядок — один учень в одній точці, сирі бали (0–4) і відсотки */
  $("csv").onclick=function(){
    var rows=sel(),L=[["Прізвище","Ім'я","Клас","Предмет","Рік","Точка"].concat(LV.map(function(l){return l+", б";})).concat(["Якірні, б"]).concat(LV.map(function(l){return l+", %";})).concat(["Загалом, %","S(TGI)"]).join(";")];
    rows.slice().sort(function(a,b){return String(a.name).localeCompare(String(b.name),"uk")||((a.pt|0)-(b.pt|0));}).forEach(function(x){var q=lvPct(x);
      L.push([x.surname||"",x.first||"",x.grade,x.subject,x.yr,PTL[Math.min(2,x.pt|0)]].concat(LV.map(function(l){return q.raw[l];})).concat([q.anRaw]).concat(LV.map(function(l){return q[l]==null?"":q[l];})).concat([q.all,stgi(q)==null?"":stgi(q)]).join(";"));});
    download("monitoring_bally.csv",L);};
  $("csv2").onclick=function(){
    var rows=sel(),st=students(rows),L=[["Учень"].concat(LV.map(function(l){return "P1 "+l;})).concat(LV.map(function(l){return "P2 "+l;})).concat(LV.map(function(l){return "Δ "+l;})).concat(LV.map(function(l){return "g "+l;})).concat(["Рівень вхід","Рівень підсумок"]).join(";")];
    st.forEach(function(s){var a=s.p[0]?lvPct(s.p[0]):null,b=s.p[1]?lvPct(s.p[1]):null;
      L.push([s.name].concat(LV.map(function(l){return a&&a[l]!=null?a[l]:"";})).concat(LV.map(function(l){return b&&b[l]!=null?b[l]:"";})).concat(LV.map(function(l){return a&&b&&a[l]!=null&&b[l]!=null?b[l]-a[l]:"";})).concat(LV.map(function(l){var o=a&&b?gx(a[l],b[l]):null;return o==null?"":o.hold?(o.ok?"утримано":"спад"):nf(o.g);})).concat([a?FLN[fl(a.all)]:"",b?FLN[fl(b.all)]:""]).join(";"));});
    download("monitoring_dynamika.csv",L);};
  $("clr").onclick=function(){if(!confirm("Видалити всі результати моніторингу?"))return;
    fbReady().then(function(db){return fbCol(db).get().then(function(snap){var ps=[];snap.forEach(function(d){ps.push(fbCol(db).del(d.ref));});return Promise.all(ps);});}).then(load);};
  load();
}
