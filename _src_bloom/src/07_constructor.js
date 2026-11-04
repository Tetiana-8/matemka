/* ================= КОНСТРУКТОР ================= */
var K={s:"G",g:8,tp:[],n:[3,3,3,2,1,1],m:40,title:"",o:{grade:1,prof:1,err:0},link:""};
function topicsOf(s,g){return TOP.filter(function(t){return t[1]===s&&t[2]===g;});}
function readyList(){return topicsOf(K.s,K.g).filter(function(t){return readyTopic(t[0]);});}
function autoTitle(){return SUBJ[K.s]+", "+K.g+" клас: контрольна робота";}
function randId(){return Math.random().toString(36).slice(2,6);}

function showCons(){
  var tl=topicsOf(K.s,K.g),rl=readyList();
  K.tp=K.tp.filter(function(id){return rl.some(function(t){return t[0]===id;});});
  var h='<div class="screen"><div class="card fill"><button class="key" id="keyBtn" title="Для вчителя">🔑</button>';
  h+='<h1>Контрольна за Блумом</h1><div class="sub">Конструктор для вчителя: оберіть клас, предмет і теми, отримайте посилання для учнів</div><div class="scroll">';
  h+='<label>Назва роботи (необов\'язково)</label><input type="text" id="ttl" value="'+esc(K.title)+'" placeholder="'+esc(autoTitle())+'">';
  h+='<label>Предмет</label><div class="seg" id="sSubj">';
  ["M","A","G"].forEach(function(s){h+='<button data-s="'+s+'" class="'+(K.s===s?"on":"")+'">'+SUBJ[s]+'</button>';});
  h+='</div><label>Клас</label><div class="seg" id="sGr">';
  GR[K.s].forEach(function(g){h+='<button data-g="'+g+'" class="'+(K.g===g?"on":"")+'">'+g+'</button>';});
  h+='</div><label>Теми (за підручником Мерзляка)</label><div class="note" style="margin:0 0 6px">Готово до використання: '+rl.length+' з '+tl.length+' тем цього класу.'+(rl.length<tl.length?' Сірі теми ще наповнюються завданнями.':'')+'</div>';
  h+='<div class="qb"><button class="btn sm soft" data-q="all">Весь клас</button><button class="btn sm soft" data-q="h1">1-ше півріччя</button><button class="btn sm soft" data-q="h2">2-ге півріччя</button><button class="btn sm soft" data-q="none">Зняти вибір</button></div>';
  if(rl.length>1){h+='<div class="row2" style="margin:6px 0"><select id="rf">'+rl.map(function(t,i){return '<option value="'+i+'">від: '+esc(t[3].slice(0,40))+'</option>';}).join("")+'</select><select id="rt">'+rl.map(function(t,i){return '<option value="'+i+'"'+(i===rl.length-1?" selected":"")+'>до: '+esc(t[3].slice(0,40))+'</option>';}).join("")+'</select></div><button class="btn sm soft" data-q="range">Позначити від–до</button>';}
  h+='<div style="margin-top:8px">';
  tl.forEach(function(t){var ok=readyTopic(t[0]),on=K.tp.indexOf(t[0])>=0;
    h+='<label class="trow'+(ok?"":" off")+'" style="margin:0 0 6px;font-weight:400"><input type="checkbox" data-t="'+t[0]+'"'+(on?" checked":"")+(ok?"":" disabled")+'><span><span class="tn">'+esc(t[3])+'</span><br><span class="tr">'+esc(t[4])+(ok?"":" · завдання для цієї теми ще готуються")+'</span></span></label>';});
  h+='</div>';
  if(!rl.length)h+='<div class="note">Для цього класу й предмета банк завдань ще наповнюється. Поки готові: '+readyAll()+'.</div>';
  h+='<label>Кількість завдань на кожному рівні Блума</label><div class="row6">';
  LV.forEach(function(L){h+='<div>'+LVN[L]+'</div>';});
  h+='</div><div class="row6" id="cnt">';
  LV.forEach(function(L,i){h+='<select data-i="'+i+'">'+[1,2,3,4,5].map(function(v){return '<option'+(K.n[i]===v?" selected":"")+'>'+v+'</option>';}).join("")+'</select>';});
  h+='</div><div class="note" id="eff"></div>';
  h+='<div class="row2"><div><label>Час, хвилин</label><input type="number" id="mn" min="10" max="120" value="'+K.m+'"></div><div></div></div>';
  h+='<label>Що показати учневі після здачі</label>';
  h+='<label class="trow" style="font-weight:400"><input type="checkbox" id="o1"'+(K.o.grade?" checked":"")+'><span>Приблизну оцінку за 12-бальною шкалою</span></label>';
  h+='<label class="trow" style="font-weight:400"><input type="checkbox" id="o2"'+(K.o.prof?" checked":"")+'><span>Профіль за рівнями мислення та теми для повторення</span></label>';
  h+='<label class="trow" style="font-weight:400"><input type="checkbox" id="o3"'+(K.o.err?" checked":"")+'><span>Розбір помилок</span></label>';
  h+='<div class="err" id="err"></div><div class="center"><button class="btn" id="mk">Створити посилання</button></div>';
  h+='<div id="lk">'+(K.link?linkHtml():"")+'</div>';
  h+='<div class="note">Усі учні отримують роботу однакової структури й складності, але з різними числами й порядком завдань. Перші відкриті відповіді (блок В) перевіряєте ви в панелі 🔑.</div>';
  h+='</div></div></div>';
  $("app").innerHTML=h;
  bindCons();effLine();
}
function readyAll(){return TOP.filter(function(t){return readyTopic(t[0]);}).map(function(t){return SUBJ[t[1]]+" "+t[2]+" кл. — "+t[3].split(":")[0].split(",")[0];}).join("; ");}
function effLine(){
  if(!K.tp.length){$("eff").textContent="Оберіть хоча б одну тему.";return;}
  var e=effCounts({tp:K.tp,n:K.n}),tot=e.reduce(function(a,b){return a+b;},0);
  $("eff").textContent="У роботі буде "+tot+" завдань: "+LV.map(function(L,i){return LVN[L].toLowerCase()+" "+e[i];}).join(", ")+(e.some(function(v,i){return v<K.n[i];})?". Деяких рівнів у банку цих тем менше, ніж ви просили.":".");
}
function bindCons(){
  $("keyBtn").onclick=teacherPanel;
  $("ttl").oninput=function(){K.title=this.value;};
  $("sSubj").onclick=function(e){var b=e.target.closest("button");if(!b)return;K.s=b.dataset.s;if(GR[K.s].indexOf(K.g)<0)K.g=GR[K.s][0];K.tp=[];K.link="";showCons();};
  $("sGr").onclick=function(e){var b=e.target.closest("button");if(!b)return;K.g=+b.dataset.g;K.tp=[];K.link="";showCons();};
  Array.prototype.forEach.call(document.querySelectorAll("[data-q]"),function(b){b.onclick=function(){
    var rl=readyList().map(function(t){return t[0];}),q=b.dataset.q;
    if(q==="all")K.tp=rl;else if(q==="none")K.tp=[];else if(q==="h1")K.tp=rl.slice(0,Math.ceil(rl.length/2));else if(q==="h2")K.tp=rl.slice(Math.ceil(rl.length/2));
    else if(q==="range"){var a=+$("rf").value,z=+$("rt").value;if(a>z){var t=a;a=z;z=t;}K.tp=rl.slice(a,z+1);}
    K.link="";showCons();};});
  Array.prototype.forEach.call(document.querySelectorAll("input[data-t]"),function(c){c.onchange=function(){
    var id=c.dataset.t,i=K.tp.indexOf(id);if(c.checked&&i<0)K.tp.push(id);if(!c.checked&&i>=0)K.tp.splice(i,1);K.link="";$("lk").innerHTML="";effLine();};});
  Array.prototype.forEach.call(document.querySelectorAll("#cnt select"),function(s){s.onchange=function(){K.n[+s.dataset.i]=+s.value;K.link="";$("lk").innerHTML="";effLine();};});
  $("mn").oninput=function(){K.m=Math.max(10,Math.min(120,+this.value||40));};
  $("o1").onchange=function(){K.o.grade=this.checked?1:0;};$("o2").onchange=function(){K.o.prof=this.checked?1:0;};$("o3").onchange=function(){K.o.err=this.checked?1:0;};
  $("mk").onclick=function(){
    if(!K.tp.length){$("err").textContent="Оберіть хоча б одну тему.";return;}
    $("err").textContent="";
    var order=TOP.map(function(t){return t[0];}),cfg={v:1,t:K.title.trim()||autoTitle(),s:K.s,g:K.g,tp:K.tp.slice().sort(function(a,b){return order.indexOf(a)-order.indexOf(b);}),n:K.n.slice(),m:K.m,id:randId(),o:K.o};
    K.link=location.href.split("#")[0].split("?")[0]+"?c="+b64enc(cfg);
    $("lk").innerHTML=linkHtml();bindLink();};
  bindLink();
}
function linkHtml(){return '<div class="linkbox"><b>Посилання для учнів</b><input type="text" id="lkv" readonly value="'+esc(K.link)+'" onclick="this.select()"><div class="act"><button class="btn sm" id="cpl">Копіювати</button><a class="btn sm soft" style="text-decoration:none" href="'+esc(K.link)+'&p=1" target="_blank">Переглянути як учень</a></div><div class="note" id="cpm">Надішліть це посилання учням. Воно працює, коли файл розміщено на сайті (наприклад, на GitHub Pages).</div></div>';}
function bindLink(){var c=$("cpl");if(!c)return;c.onclick=function(){var v=$("lkv");v.select();try{document.execCommand("copy");$("cpm").textContent="Скопійовано.";}catch(e){}if(navigator.clipboard)navigator.clipboard.writeText(v.value);};}

