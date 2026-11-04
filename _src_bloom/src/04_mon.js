/* ============ МОНІТОРИНГ ЗА БЛУМОМ: вхідний, проміжний і підсумковий зрізи ============
   Окремий інструмент. Побудований за документом «Моніторинг якості знань за таксономією Блума» (ТЗ):
   - шість рівнів Блума, на кожному максимум 4 бали, разом 24 бали, 10 завдань;
   - компонент К1 (наскрізний, ~60 %) і К2 (предметний, ~40 %);
   - якірні завдання (Ро К1 та Оц) однакові в усіх точках для одного учня;
   - Оц і Ст перевіряє вчитель за універсальною рубрикою 0–4;
   - вхідний (К1+К2), проміжний (лише К1, за рішенням) і підсумковий зрізи;
   - учні не отримують оцінок за зріз. */

var MK={mode:"gen",s:"M",g:5,ta:[],tb:[],m:40,yr:"",pa:"листопад",pc:"грудень",pb:"травень",init:false};
function defYear(){var d=new Date(),y=d.getFullYear(),m=d.getMonth()+1;var a=m>=8?y:y-1;return a+"/"+String(a+1).slice(2);}
function monId(s,g,tp){return xmur(s+g+tp.slice().sort().join(","))().toString(36).slice(0,5);}
function monTitle(){return "Моніторинг: "+SUBJ[MK.s]+", "+MK.g+" клас";}
function monTime(g){return g<=6?40:45;}
var PTN=["вхідний зріз","підсумковий зріз","проміжний зріз"];

/* Схема зрізу (розділ 5.1 ТЗ). c: 1 — К1, 2 — К2; p — бали; rb — перевіряє вчитель за рубрикою; an — якірне */
var MSLOT=[
  {L:"Зн",c:2,p:2},{L:"Зн",c:2,p:2},
  {L:"Ро",c:2,p:2},{L:"Ро",c:1,p:2,an:1},
  {L:"Зс",c:2,p:2},{L:"Зс",c:2,p:2},
  {L:"Ан",c:1,p:2},{L:"Ан",c:1,p:2},
  {L:"Оц",c:1,p:4,rb:1,an:1},
  {L:"Ст",c:1,p:4,rb:1}
];
function monSlots(pt){return MSLOT.filter(function(s){return pt!==2||s.c===1;});}
function monCount(cfg){if(cfg.kit)return KITS[cfg.kit].tasks.length;return monSlots(cfg.pt|0).length;}
function monMax(pt){return monSlots(pt).reduce(function(a,s){return a+s.p;},0);}

/* Попередній клас того самого предмета (опорний зміст для К2 вхідного зрізу) */
function prevTopics(s,g){
  if(s==="A"&&g===7)return topicsOf("M",6);
  if(s==="G"&&g===7)return [];
  if(GR[s].indexOf(g-1)>=0)return topicsOf(s,g-1);
  return [];
}
function monReady(){return topicsOf(MK.s,MK.g).filter(function(t){return readyTopic(t[0]);});}
function monReadyPrev(){return prevTopics(MK.s,MK.g).filter(function(t){return readyTopic(t[0]);});}

function monDefaults(){
  var cur=monReady().map(function(t){return t[0];}),prev=monReadyPrev().map(function(t){return t[0];});
  MK.ta=prev.length?prev:cur.slice(0,Math.min(3,cur.length));
  MK.tb=cur.slice();
  MK.m=monTime(MK.g);
}

function modeSeg(){return '<label>Джерело завдань</label><div class="seg" id="sMode"><button data-md="gen" class="'+(MK.mode==='kit'?'':'on')+'">Генератор (числа різні в учнів)</button><button data-md="kit" class="'+(MK.mode==='kit'?'on':'')+'">Комплекти адміністрації</button></div>';}
function bindMode(){$("sMode").onclick=function(e){var b=e.target.closest("button");if(!b)return;MK.mode=b.dataset.md;MK.init=false;showConsM();};}
function showConsM(){
  if(MK.mode==="kit"){showKitCons();return;}
  if(!MK.yr)MK.yr=defYear();
  if(!MK.init){monDefaults();MK.init=true;}
  var cur=topicsOf(MK.s,MK.g),prev=prevTopics(MK.s,MK.g);
  var h='<div class="screen"><div class="card fill"><button class="key" id="keyBtn" title="Для вчителя">🔑</button>';
  h+='<h1>Моніторинг за Блумом</h1><div class="sub">Динаміка шести рівнів мислення за рік: вхідний, проміжний і підсумковий зріз</div><div class="scroll">';
  h+=modeSeg();
  h+='<label>Предмет</label><div class="seg" id="sSubj">';
  ["M","A","G"].forEach(function(s){h+='<button data-s="'+s+'" class="'+(MK.s===s?"on":"")+'">'+SUBJ[s]+'</button>';});
  h+='</div><label>Клас</label><div class="seg" id="sGr">';
  GR[MK.s].forEach(function(g){h+='<button data-g="'+g+'" class="'+(MK.g===g?"on":"")+'">'+g+'</button>';});
  h+='</div><div class="row2"><div><label>Навчальний рік</label><input type="text" id="yr" value="'+esc(MK.yr)+'"></div><div><label>Час, хвилин</label><input type="number" id="mn" min="15" max="60" value="'+MK.m+'"></div></div>';
  h+='<div class="row2"><div><label>Коли вхідний зріз</label><input type="text" id="pa" value="'+esc(MK.pa)+'"></div><div><label>Коли підсумковий</label><input type="text" id="pb" value="'+esc(MK.pb)+'"></div></div>';
  h+='<label>Змістові теми (компонент К2)</label><div class="note" style="margin:0 0 6px">У кожного зрізу змістова частина своя: вхідний перевіряє опорний зміст попереднього класу, підсумковий — зміст цього класу. Наскрізні завдання (К1: розуміння, аналіз, оцінювання, створення) беруться з тем вхідного зрізу, щоб змістового бар’єру не було в обох точках однаково. Відмітьте теми для кожного зрізу.</div>';
  h+='<div class="qb"><button class="btn sm soft" data-q="pa">Вхідний: попередній клас</button><button class="btn sm soft" data-q="pb">Підсумковий: цей клас</button><button class="btn sm soft" data-q="none">Зняти все</button></div>';
  function rows(list,title){
    if(!list.length)return "";
    var o='<div class="note" style="margin:10px 0 4px"><b>'+title+'</b></div>';
    o+='<div class="note" style="display:flex;gap:6px;margin:0 0 4px;justify-content:flex-end"><span style="width:62px;text-align:center">вхідний</span><span style="width:62px;text-align:center">підсумк.</span></div>';
    list.forEach(function(t){var ok=readyTopic(t[0]),a=MK.ta.indexOf(t[0])>=0,b=MK.tb.indexOf(t[0])>=0;
      o+='<div class="trow'+(ok?"":" off")+'" style="margin:0 0 6px;font-weight:400;cursor:default"><span style="flex:1"><span class="tn">'+esc(t[3])+'</span><br><span class="tr">'+esc(t[4])+'</span></span>'+
        '<span style="width:62px;text-align:center"><input type="checkbox" data-ta="'+t[0]+'"'+(a?" checked":"")+(ok?"":" disabled")+'></span>'+
        '<span style="width:62px;text-align:center"><input type="checkbox" data-tb="'+t[0]+'"'+(b?" checked":"")+(ok?"":" disabled")+'></span></div>';});
    return o;}
  h+=rows(prev,"Попередній клас (опорний зміст)")+rows(cur,"Цей клас ("+MK.g+")");
  h+='<div class="note" id="eff"></div>';
  h+='<div class="err" id="err"></div><div class="center"><button class="btn" id="mk">Створити посилання на зрізи</button></div><div id="lk"></div>';
  h+='<div class="note">Принципи: один рівень — один показник, на кожному рівні по 4 бали; завдання «оцінювання» і «створення» перевіряє вчитель за рубрикою 0–4 у панелі 🔑; два якірні завдання повторюються в усіх зрізах; проміжний зріз у грудні — лише наскрізні завдання К1 для учнів групи підтримки. Учні не отримують оцінок за зріз, а ви бачите профіль класу, приріст (Δ та індекс g), рівні сформованості й аналітичну довідку.</div>';
  h+='</div></div></div>';
  $("app").innerHTML=h;
  $("keyBtn").onclick=teacherPanelM;bindMode();
  $("sSubj").onclick=function(e){var b=e.target.closest("button");if(!b)return;MK.s=b.dataset.s;if(GR[MK.s].indexOf(MK.g)<0)MK.g=GR[MK.s][0];MK.init=false;showConsM();};
  $("sGr").onclick=function(e){var b=e.target.closest("button");if(!b)return;MK.g=+b.dataset.g;MK.init=false;showConsM();};
  $("yr").oninput=function(){MK.yr=this.value;};
  $("pa").oninput=function(){MK.pa=this.value;};
  $("pb").oninput=function(){MK.pb=this.value;};
  $("mn").oninput=function(){MK.m=Math.max(15,Math.min(60,+this.value||monTime(MK.g)));};
  Array.prototype.forEach.call(document.querySelectorAll("[data-q]"),function(b){b.onclick=function(){
    var q=b.dataset.q,pv=monReadyPrev().map(function(t){return t[0];}),cu=monReady().map(function(t){return t[0];});
    if(q==="pa")MK.ta=pv.length?pv:cu.slice(0,Math.min(3,cu.length));
    else if(q==="pb")MK.tb=cu;
    else{MK.ta=[];MK.tb=[];}
    showConsM();};});
  function bindBox(attr,key){Array.prototype.forEach.call(document.querySelectorAll("input["+attr+"]"),function(c){c.onchange=function(){var id=c.getAttribute(attr),a=MK[key],i=a.indexOf(id);if(c.checked&&i<0)a.push(id);if(!c.checked&&i>=0)a.splice(i,1);$("lk").innerHTML="";effM();};});}
  bindBox("data-ta","ta");bindBox("data-tb","tb");
  $("mk").onclick=function(){
    if(!MK.ta.length){$("err").textContent="Оберіть теми вхідного зрізу.";return;}
    if(!MK.tb.length){$("err").textContent="Оберіть теми підсумкового зрізу.";return;}
    $("err").textContent="";
    var order=TOP.map(function(t){return t[0];}),srt=function(a){return a.slice().sort(function(x,y){return order.indexOf(x)-order.indexOf(y);});};
    var ta=srt(MK.ta),tb=srt(MK.tb),id=monId(MK.s,MK.g,ta),yr=MK.yr.trim()||defYear();
    var base=location.href.split("#")[0].split("?")[0];
    var per=[MK.pa.trim(),MK.pb.trim(),MK.pc.trim()];
    function lnk(pt){return base+"?c="+b64enc({v:2,md:1,t:monTitle()+" ("+PTN[pt]+")",s:MK.s,g:MK.g,tp:ta,tk:pt===1?tb:pt===2?[]:ta,m:pt===2?Math.min(MK.m,25):MK.m,id:id,yr:yr,pt:pt,per:per[pt],o:{}});}
    var L=[lnk(0),lnk(2),lnk(1)],names=[["Вхідний зріз","повний, "+monMax(0)+" балів"],["Проміжний зріз (за рішенням, грудень)","лише К1, "+monMax(2)+" балів; для учнів групи підтримки"],["Підсумковий зріз","повний, "+monMax(1)+" балів"]];
    $("lk").innerHTML=L.map(function(u,i){return '<div class="linkbox"><b>'+names[i][0]+'</b> <span class="note">· '+names[i][1]+'</span><input type="text" readonly value="'+esc(u)+'" onclick="this.select()"><div class="act"><button class="btn sm" data-cp="'+i+'">Копіювати</button><a class="btn sm soft" style="text-decoration:none" href="'+esc(u)+'&p=1" target="_blank">Переглянути як учень</a></div></div>';}).join("")+'<div class="note">Підсумкове посилання відкладіть до кінця року. Якщо його загубите — створіть знову з тими самими класом, предметом, темами вхідного зрізу та навчальним роком: результати зіставляться автоматично.</div>';
    Array.prototype.forEach.call(document.querySelectorAll("[data-cp]"),function(b){b.onclick=function(){var inp=b.closest(".linkbox").querySelector("input");inp.select();try{document.execCommand("copy");}catch(e){}if(navigator.clipboard)navigator.clipboard.writeText(inp.value);b.textContent="Скопійовано";};});
  };
  effM();
}
function effM(){
  var e=$("eff");if(!e)return;
  var bad=[];
  if(!MK.ta.length)bad.push("вхідного");if(!MK.tb.length)bad.push("підсумкового");
  if(bad.length){e.textContent="Оберіть теми "+bad.join(" і ")+" зрізу.";return;}
  var need=function(tp,L){return poolOf({tp:tp},L).length;};
  var warn=[];
  [["вхідного",MK.ta],["підсумкового",MK.tb]].forEach(function(p){["Зн","Ро","Зс"].forEach(function(L){if(need(p[1],L)<2)warn.push(p[0]+" зрізу: рівень «"+LVN[L]+"» — замало завдань у банку для вибраних тем");});});
  ["Ро","Ан","Оц","Ст"].forEach(function(L){if(need(MK.ta,L)<(L==="Ан"?2:1))warn.push("наскрізний рівень «"+LVN[L]+"» — замало завдань у темах вхідного зрізу");});
  e.textContent="У повному зрізі 10 завдань і 24 бали: по 4 бали на кожен рівень; К1 — 14 балів (58 %), К2 — 10 балів (42 %); якірні — «розуміння» (К1) та «оцінювання»."+(warn.length?" Увага: "+warn.join("; ")+".":"");
}

/* Вибір завдань: структура залежить лише від коду зрізу (клас, предмет, теми) і точки, а числа — від учня.
   К1 однаковий за структурою в усіх точках; К2 — свій для кожної точки. Якірні однакові в усіх точках для одного учня. */
function pickGens(pool,spec,k,used){
  var by={};pool.forEach(function(g){if(used.indexOf(g.id)<0)(by[g.t]=by[g.t]||[]).push(g);});
  var tops=spec.sh(Object.keys(by).sort());tops.forEach(function(t){by[t]=spec.sh(by[t].sort(function(a,b){return a.id<b.id?-1:1;}));});
  var out=[];
  while(out.length<k){var moved=false;tops.forEach(function(t){if(out.length<k&&by[t].length){out.push(by[t].shift());moved=true;}});if(!moved)break;}
  return out;
}
function mkTaskM(g,slot,key){
  var t=mkTask(g,slot.L,slot.p,key);
  t.c=slot.c;if(slot.an)t.an=1;
  if(slot.rb&&t.open){t.rb=1;t.aut=0;t.opn=slot.p;}
  return t;
}
function buildMon2(cfg,name){
  var pt=cfg.pt|0,slots=monSlots(pt),used=[],chosen=[];
  var key="mon|"+name+"|"+cfg.id+"|"+pt,keyA="mon|"+name+"|"+cfg.id+"|anchor";
  LV.forEach(function(L){
    [1,2].forEach(function(c){
      var sl=slots.filter(function(s){return s.L===L&&s.c===c;});if(!sl.length)return;
      var spec=mkR(c===1?"mon1|"+cfg.id+"|"+L:"mon2|"+cfg.id+"|"+pt+"|"+L);
      var gens=pickGens(poolOf({tp:c===1?cfg.tp:cfg.tk},L),spec,sl.length,used);
      gens.forEach(function(g,i){used.push(g.id);chosen.push(mkTaskM(g,sl[i],sl[i].an?keyA:key));});
    });
  });
  var R=mkR(key+"|order"),out=[];
  BLK.forEach(function(b){R.sh(chosen.filter(function(t){return b[1].indexOf(t.l)>=0;})).forEach(function(t){t.blk=b[0];out.push(t);});});
  return out;
}

/* Попередня версія (посилання v:1): по 2 завдання на рівень, однакові теми в обох точках */
function buildMon(cfg,name){
  if(cfg.v>=3)return buildKit(cfg);
  if(cfg.v>=2)return buildMon2(cfg,name);
  var spec=mkR("mon|"+cfg.id),chosen=[],key="mon|"+name+"|"+cfg.id+"|"+cfg.pt;
  LV.forEach(function(L,li){
    var by={};poolOf(cfg,L).forEach(function(g){(by[g.t]=by[g.t]||[]).push(g);});
    var tops=spec.sh(Object.keys(by).sort());tops.forEach(function(t){by[t]=spec.sh(by[t].sort(function(a,b){return a.id<b.id?-1:1;}));});
    var total=tops.reduce(function(s,t){return s+by[t].length;},0),k=Math.min(cfg.n[li],total),picked=[];
    while(picked.length<k){tops.forEach(function(t){if(picked.length<k&&by[t].length)picked.push(by[t].shift());});}
    var pts=(L==="Оц"||L==="Ст")?4:2;
    picked.forEach(function(g){chosen.push(mkTask(g,L,pts,key));});
  });
  var R=mkR(key+"|order"),out=[];
  BLK.forEach(function(b){R.sh(chosen.filter(function(t){return b[1].indexOf(t.l)>=0;})).forEach(function(t){t.blk=b[0];out.push(t);});});
  return out;
}

function showResultM(r){
  var h='<div class="screen"><div class="card fill"><div class="scroll"><div class="center"><h1>Дякуємо, зріз виконано!</h1><div class="sub">'+esc(ST.sn+" "+ST.fn)+' · '+esc(CFG.t)+'</div>';
  if(PREV)h+='<div class="banner">Попередній перегляд: результат не збережено</div>';
  h+='<div class="mis" style="border:none">Оцінок за цей зріз не виставляють. Твої відповіді допоможуть учителеві зрозуміти, що в тебе виходить найкраще, а над чим варто попрацювати.</div>';
  h+='<div class="stats"><div class="stat"><b>'+dur(r.dur)+'</b><span>час виконання</span></div></div></div></div></div></div>';
  $("app").innerHTML=h;
}
