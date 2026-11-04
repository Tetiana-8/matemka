/* ============ КОМПЛЕКТИ АДМІНІСТРАЦІЇ (вхідний зріз, листопад) ============
   Завдання дослівно з комплектів, наданих адміністрацією. Структура: 6 завдань, по одному на рівень Блума, 24 бали.
   Типи: checks — познач правильні твердження (авто, бали = правильні відповіді мінус кількість зайвих пунктів);
         nums — кілька числових відповідей (авто, по 1 балу); rub — вільна відповідь, перевіряє вчитель за рубрикою 0–4.
   c — компонент К1/К2; an — якірне завдання (повторюється дослівно в підсумковому зрізі). */
var KITS={};

KITS["M5"]={
  s:"M",g:5,
  title:"Комплект адміністрації: Математика, 5 клас",
  scope:"К2: натуральні числа, порівняння, округлення, шкали, порядок дій, задачі на рух, периметр (кінець 4 класу та вересень–жовтень 5 класу). К1: ситуація вибору тарифу мобільного інтернету. Калькулятор не використовується.",
  stim:'<table class="kt"><tr><th>Тариф</th><th>Абонплата за місяць</th><th>Що входить</th><th>Доплата</th></tr><tr><td>А</td><td>100 грн</td><td>10 ГБ</td><td>—</td></tr><tr><td>Б</td><td>150 грн</td><td>безліміт</td><td>—</td></tr><tr><td>В</td><td>60 грн</td><td>3 ГБ</td><td>15 грн за кожен додатковий ГБ</td></tr></table>',
  tasks:[
    {l:"Зн",c:2,k:"checks",pts:4,
     q:"Познач правильні твердження.",
     items:[["3 405 > 3 045",1],["0 — найменше натуральне число",0],["1 км = 1000 м",1],["7 586, округлене до сотень, = 7 500",0],["периметр квадрата зі стороною 5 см = 20 см",1],["1 год = 100 хв",0],["52, округлене до десятків, = 50",1]]},
    {l:"Ро",c:1,an:1,k:"rub",pts:4,
     fig:'<svg viewBox="0 0 330 70" class="kfig" role="img" aria-label="Координатний промінь із поділками"><line x1="10" y1="40" x2="320" y2="40" stroke="currentColor" stroke-width="2"/><polygon points="320,40 310,35 310,45" fill="currentColor"/>'+(function(){var s="";for(var i=0;i<=10;i++){var x=20+i*28;s+='<line x1="'+x+'" y1="33" x2="'+x+'" y2="47" stroke="currentColor" stroke-width="1.5"/>';}return s;})()+'<text x="20" y="64" text-anchor="middle" font-size="13" fill="currentColor">0</text><text x="300" y="64" text-anchor="middle" font-size="13" fill="currentColor">100</text><circle cx="216" cy="40" r="4.5" fill="#d9534f"/><text x="216" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">A</text></svg>',
     q:"На координатному промені позначено тільки 0 і 100. Між ними 10 однакових поділок. Точка А стоїть на 7-й поділці. (а) Яке число відповідає точці А? (б) Поясни, як ти визначив ціну поділки. (в) Познач точку B(45) і поясни, чому вона там.",
     open:"Запиши відповіді на (а), (б) і (в) (перевіряє вчитель).",
     rub:"Ключ: 70; 100 : 10 = 10; B — посередині між 4-ю і 5-ю поділками. 4 — усі три частини з поясненням. 3 — (а) і (в) правильно, пояснення ціни поділки неповне. 2 — одна точка + пояснення або обидві без пояснення. 1 — лише одна точка. 0 — А = 7 (поділки рахуються як одиниці): позначка «ЦП» (ціна поділки)."},
    {l:"Зс",c:2,k:"nums",pts:4,
     q:"Виконай обчислення.",
     parts:[["2 345 + 5 678 =",8023],["125 · 8 =",1000],["Велосипедист їде зі швидкістю 15 км/год. Яку відстань (км) він проїде за 3 год?",45],["1000 − 375 : 5 · 4 =",700]]},
    {l:"Ан",c:1,k:"rub",pts:4,stim:1,
     q:"Оля використовує 7 ГБ на місяць. (а) Скільки вона заплатить за кожним тарифом? (б) З якого обсягу тариф В стає дорожчим за тариф А? Покажи, як ти це з'ясував.",
     open:"Запиши розв'язання (перевіряє вчитель).",
     rub:"Ключ: (а) А — 100, Б — 150, В — 60 + 4 · 15 = 120 грн; (б) 5 ГБ → 90 грн, 6 ГБ → 105 грн, отже з 6 ГБ. 4 — усі три ціни + поріг 6 ГБ із перевіркою сусідніх значень (таблиця або підбір). 3 — усі ціни + поріг без перевірки або з відповіддю «після 5 ГБ». 2 — усі ціни або ціна В + поріг. 1 — одна-дві ціни (ціна В = 60 без доплати — типова помилка неуважного читання даних). 0 — не по суті."},
    {l:"Оц",c:1,an:1,k:"rub",pts:4,stim:1,
     q:"Дмитро використовує 2 ГБ на місяць і каже: «Тариф В — найвигідніший для всіх, бо в нього найнижча ціна». Чи погоджуєшся? Обґрунтуй обчисленням і поясни, від чого залежить вибір.",
     open:"Запиши відповідь і обґрунтування (перевіряє вчитель).",
     rub:"4 — часткова згода: для Дмитра В справді найдешевший (60 грн), але «для всіх» — ні: приклад з обчисленням (для 7 ГБ — 120 > 100) + висновок: вибір залежить від обсягу; «найнижча абонплата» ≠ «найменша сума до сплати». 3 — незгода + контрприклад із обчисленням + висновок, але без визнання, що для Дмитра він правий. 2 — незгода + один аргумент без обчислення. 1 — судження без обґрунтування. 0 — повна згода з Дмитром."},
    {l:"Ст",c:1,k:"rub",pts:4,stim:1,
     q:"Придумай тариф Г, який для Олі (7 ГБ) дешевший за А, а для Дмитра (2 ГБ) дорожчий за В. Опиши його та перевір обчисленням, що обидві умови виконані.",
     open:"Опиши тариф Г і запиши перевірку (перевіряє вчитель).",
     rub:"Приклад вірної відповіді: 80 грн за 8 ГБ (Оля: 80 < 100; Дмитро: 80 > 60). Вірних варіантів багато. 4 — опис тарифу за тією ж формою, що в таблиці + обидві умови виконані + перевірка обчисленням для обох людей. 3 — обидві умови виконані, перевірка лише для одного. 2 — виконана одна умова. 1 — тариф описано, але жодна умова не виконана або неповний опис (лише ціна). 0 — немає спроби."}
  ]
};

function kitId(s,g){return "kit"+s+g;}
function kitOf(s,g){return KITS[s+g]||null;}
function buildKit(cfg){
  var K=KITS[cfg.kit],out=[];
  K.tasks.forEach(function(d){
    var t={l:d.l,t:"Комплект: "+K.g+" клас",k:d.k,q:d.q,pts:d.pts,c:d.c,aut:d.pts,opn:0,open:"",rub:"",right:""};
    if(d.an)t.an=1;
    if(d.stim)t.stim=K.stim;
    if(d.fig)t.fig=d.fig;
    if(d.k==="checks")t.items=d.items;
    if(d.k==="nums")t.parts=d.parts;
    if(d.k==="rub"){t.rb=1;t.aut=0;t.opn=d.pts;t.open=d.open;t.rub=d.rub;}
    out.push(t);
  });
  var B=[["А",["Зн","Ро"]],["Б",["Зс","Ан"]],["В",["Оц","Ст"]]];
  out.forEach(function(t){t.blk=B.filter(function(b){return b[1].indexOf(t.l)>=0;})[0][0];});
  return out;
}

function showKitCons(){
  if(!MK.yr)MK.yr=defYear();
  var K=kitOf(MK.s,MK.g);
  var h='<div class="screen"><div class="card fill"><button class="key" id="keyBtn" title="Для вчителя">🔑</button>';
  h+='<h1>Моніторинг за Блумом</h1><div class="sub">Комплекти завдань, наданих адміністрацією</div><div class="scroll">';
  h+=modeSeg();
  h+='<label>Предмет</label><div class="seg" id="sSubj">';
  ["M","A","G"].forEach(function(s){h+='<button data-s="'+s+'" class="'+(MK.s===s?"on":"")+'">'+SUBJ[s]+'</button>';});
  h+='</div><label>Клас</label><div class="seg" id="sGr">';
  GR[MK.s].forEach(function(g){h+='<button data-g="'+g+'" class="'+(MK.g===g?"on":"")+'">'+g+'</button>';});
  h+='</div><div class="row2"><div><label>Навчальний рік</label><input type="text" id="yr" value="'+esc(MK.yr)+'"></div><div><label>Час, хвилин</label><input type="number" id="mn" min="15" max="60" value="'+MK.m+'"></div></div>';
  h+='<div class="row2"><div><label>Коли вхідний зріз</label><input type="text" id="pa" value="'+esc(MK.pa)+'"></div><div></div></div>';
  if(K){
    h+='<div class="note" style="margin:10px 0"><b>'+esc(K.title)+'</b><br>'+esc(K.scope)+'<br>6 завдань, 24 бали. Завдання однакові для всіх учнів (як у комплекті). Завдання 1 і 3 перевіряються автоматично, завдання 2, 4, 5 і 6 ви оцінюєте за рубрикою 0–4 у панелі 🔑. Якірні завдання: 2 і 5.</div>';
    h+='<div class="err" id="err"></div><div class="center"><button class="btn" id="mk">Створити посилання на вхідний зріз</button></div><div id="lk"></div>';
  }else h+='<div class="note" style="margin:10px 0">Комплекту для цього класу й предмета ще немає в інструменті. Поки що доступні: '+Object.keys(KITS).map(function(k){return esc(KITS[k].title);}).join("; ")+'. Решту додамо, а поки скористайтеся генератором.</div>';
  h+='<div class="note">Підсумковий зріз і комплекти інших класів додаються окремо. Учні не отримують оцінок за зріз.</div></div></div></div>';
  $("app").innerHTML=h;
  $("keyBtn").onclick=teacherPanelM;bindMode();
  $("sSubj").onclick=function(e){var b=e.target.closest("button");if(!b)return;MK.s=b.dataset.s;if(GR[MK.s].indexOf(MK.g)<0)MK.g=GR[MK.s][0];showKitCons();};
  $("sGr").onclick=function(e){var b=e.target.closest("button");if(!b)return;MK.g=+b.dataset.g;showKitCons();};
  $("yr").oninput=function(){MK.yr=this.value;};$("pa").oninput=function(){MK.pa=this.value;};
  $("mn").oninput=function(){MK.m=Math.max(15,Math.min(60,+this.value||40));};
  if(K)$("mk").onclick=function(){
    var base=location.href.split("#")[0].split("?")[0],id=kitId(MK.s,MK.g);
    var u=base+"?c="+b64enc({v:3,md:1,t:"Комплект адміністрації: "+SUBJ[MK.s]+", "+MK.g+" клас ("+PTN[0]+")",s:MK.s,g:MK.g,tp:[id],kit:MK.s+MK.g,m:MK.m,id:id,yr:MK.yr.trim()||defYear(),pt:0,per:MK.pa.trim(),o:{}});
    $("lk").innerHTML='<div class="linkbox"><b>Вхідний зріз (комплект адміністрації)</b><input type="text" readonly value="'+esc(u)+'" onclick="this.select()"><div class="act"><button class="btn sm" id="cp">Копіювати</button><a class="btn sm soft" style="text-decoration:none" href="'+esc(u)+'&p=1" target="_blank">Переглянути як учень</a></div></div>';
    $("cp").onclick=function(){var inp=document.querySelector(".linkbox input");inp.select();try{document.execCommand("copy");}catch(e){}if(navigator.clipboard)navigator.clipboard.writeText(inp.value);this.textContent="Скопійовано";};
  };
}
