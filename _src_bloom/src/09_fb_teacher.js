/* ================= Firebase і панель вчителя ================= */
var CFG_FB=null;
function fbReady(){
  if(CFG_FB)return CFG_FB;
  var base="https://www.gstatic.com/firebasejs/"+FBV+"/";
  CFG_FB=Promise.all([import(base+"firebase-app.js"),import(base+"firebase-auth.js"),import(base+"firebase-firestore.js")]).then(function(m){
    var app=m[0].initializeApp(FIREBASE_CONFIG),au=m[1].getAuth(app);
    return m[1].signInAnonymously(au).then(function(){return {fs:m[2],db:m[2].getFirestore(app)};});
  });
  CFG_FB.catch(function(){CFG_FB=null;});
  return CFG_FB;
}
function fbCol(F){var fs=F.fs,db=F.db;
  return {
    doc:function(id){var ref=fs.doc(db,"artifacts",FB_APP,"public","data",FB_COL,id);return {set:function(d){return fs.setDoc(ref,d);},update:function(d){return fs.updateDoc(ref,d);}};},
    get:function(){return fs.getDocs(fs.collection(db,"artifacts",FB_APP,"public","data",FB_COL));},
    del:function(ref){return fs.deleteDoc(ref);}
  };}
function pack(res){
  var S=res.S;
  return {surname:ST.sn,first:ST.fn,name:ST.sn+" "+ST.fn,code:CFG.id,title:CFG.t,subject:SUBJ[CFG.s],grade:CFG.g,
    id:SID,test:CFG.t,ts:res.end,date:new Date(res.end).toISOString(),leaves:res.exits,durationSec:Math.round(res.dur),start:new Date(res.start).toISOString(),end:new Date(res.end).toISOString(),durSec:Math.round(res.dur),exits:res.exits,awaySec:res.away,
    score:S.score,grade12:res.g,pending:S.pending,lv:S.lv,tasks:res.recs,pt:CFG.pt||0,yr:CFG.yr||"",per:CFG.per||"",mon:MON?1:0};
}
function saveResult(res){
  if(PREV||!FIREBASE_CONFIG)return;
  fbReady().then(function(db){return fbCol(db).doc(SID).set(pack(res));}).catch(function(){});
}

function teacherPanel(){
  if(MON){teacherPanelM();return;}
  var p=prompt("Пароль вчителя:");if(p!==TEACHER_PASSWORD)return;
  var m=document.createElement("div");m.className="modal";
  m.innerHTML='<div class="box"><div class="act" style="margin-top:0"><b style="color:#5a4b8a">Результати учнів</b><span><select id="wk" style="width:auto;display:inline-block"></select> <button class="btn sm soft" id="csv">CSV</button> <button class="btn sm soft" id="clr">Очистити</button> <button class="btn sm" id="cls">Закрити</button></span></div><div id="tb">Завантаження…</div></div>';
  document.body.appendChild(m);
  $("cls").onclick=function(){document.body.removeChild(m);};
  var ROWS=[];
  function load(){
    $("tb").textContent="Завантаження…";
    fbReady().then(function(db){return fbCol(db).get();}).then(function(snap){
      ROWS=[];snap.forEach(function(d){var x=d.data();x._id=d.id;ROWS.push(x);});
      ROWS.sort(function(a,b){return String(b.end).localeCompare(String(a.end));});
      var works={};ROWS.forEach(function(x){works[x.code]=x.title;});
      $("wk").innerHTML='<option value="">Усі роботи</option>'+Object.keys(works).map(function(c){return '<option value="'+esc(c)+'">'+esc(works[c])+' ['+esc(c)+']</option>';}).join("");
      $("wk").onchange=render;render();
    }).catch(function(){$("tb").textContent=FIREBASE_CONFIG?"Не вдалося завантажити результати.":"Збір результатів не підключено: вставте firebaseConfig у файл (змінна FIREBASE_CONFIG на початку скрипта).";});
  }
  function view(){var c=$("wk").value;return ROWS.filter(function(x){return !c||x.code===c;});}
  function render(){
    var rows=view(),h='<table><tr><th>Учень</th><th>Робота</th><th>Здано</th><th>Бал /100</th><th>12 б</th><th>ECTS</th><th>Рівень</th>'+LV.map(function(L){return '<th>'+L+'</th>';}).join("")+'<th>Час</th><th>Виходи</th><th></th></tr>';
    rows.forEach(function(x,i){var S=summarize(x.tasks),g=grade12(S.score);
      h+='<tr class="cl" data-i="'+i+'"><td>'+esc(x.name)+'</td><td>'+esc(x.title)+'</td><td>'+esc(String(x.end).slice(0,16).replace("T"," "))+'</td><td><b>'+S.score+'</b>'+(S.pending?" ⏳":"")+'</td><td>'+g+'</td><td>'+ectsOf(S.score)+'</td><td>'+esc(compLevel(S.score))+'</td>'+LV.map(function(L){return '<td>'+pct(S.lv[L].e,S.lv[L].m)+'%</td>';}).join("")+'<td>'+dur(x.durSec)+'</td><td>'+x.exits+(x.awaySec?" ("+x.awaySec+" с)":"")+'</td><td>'+(S.pending?'<span class="chip">перевірити</span>':"")+'</td></tr>';});
    h+='</table>';if(!rows.length)h="Результатів поки немає.";
    $("tb").innerHTML=h;
    Array.prototype.forEach.call(document.querySelectorAll("tr.cl"),function(tr){tr.onclick=function(){detail(rows[+tr.dataset.i]);};});
  }
  function detail(x){
    var d=document.createElement("div");d.className="modal";
    var S=summarize(x.tasks);
    var h='<div class="box"><div class="act" style="margin-top:0"><b style="color:#5a4b8a">'+esc(x.name)+' · '+esc(x.title)+'</b><button class="btn sm" id="dc">Закрити</button></div>';
    h+='<div class="note">Бал: <b>'+S.score+' з 100</b> · 12-бальна: '+grade12(S.score)+' · ECTS '+ectsOf(S.score)+' · рівень компетентності: '+esc(compLevel(S.score))+' · за шкалою TGI відповідає рівню: '+bloomByScore(S.score)+'</div>';
    h+='<h2>Профіль за рівнями Блума</h2>'+bars(S.lv);
    h+='<h2>Блоки</h2><div class="note">'+BLK.map(function(b){return BLKN[b[0]]+': <b>'+S.bl[b[0]].e+' з '+S.bl[b[0]].m+'</b>';}).join(" · ")+'</div><h2>Завдання</h2>';
    x.tasks.forEach(function(r,i){
      h+='<div class="gtask"><b>'+(i+1)+'. '+LVN[r.l]+'</b> · '+esc(TOPN[r.t]||r.t)+' · '+r.pts+' б<br>'+fmt(r.q)+'<br>Відповідь учня: '+(r.given?fmt(esc(r.given)):"—")+' · правильно: '+fmt(r.right)+' · '+(r.ok?"✓ "+r.aut+" б":"✗ 0 б");
      if(r.opn)h+='<br><i>Завдання відкритої частини:</i> '+esc(r.open)+'<br><i>Рубрика:</i> '+esc(r.rub)+'<br><i>Відповідь учня:</i> '+(r.otext&&r.otext.trim()?'<span style="white-space:pre-wrap">'+esc(r.otext)+'</span>':"— (порожньо)")+'<br>'+photosHtml(r)+((r.otext&&r.otext.trim())||(r.photos&&r.photos.length)?'Бали за відкриту частину (0–'+r.opn+'): <input type="number" min="0" max="'+r.opn+'" data-r="'+i+'" value="'+(r.ograde==null?"":r.ograde)+'">':"");
      h+='</div>';});
    h+='<div class="center"><button class="btn" id="sv">Зберегти бали</button></div></div>';
    d.innerHTML=h;document.body.appendChild(d);
    $("dc").onclick=function(){document.body.removeChild(d);};
    $("sv").onclick=function(){
      Array.prototype.forEach.call(d.querySelectorAll("input[data-r]"),function(inp){var r=x.tasks[+inp.dataset.r];r.ograde=inp.value===""?null:Math.max(0,Math.min(r.opn,+inp.value));});
      var S2=summarize(x.tasks);x.score=S2.score;x.grade12=grade12(S2.score);x.pending=S2.pending;x.lv=S2.lv;
      fbReady().then(function(db){return fbCol(db).doc(x._id).update({tasks:x.tasks,score:x.score,grade12:x.grade12,pending:x.pending,lv:x.lv});}).then(function(){document.body.removeChild(d);render();});
    };
  }
  $("csv").onclick=function(){
    var rows=view(),L=[["Прізвище","Ім'я","Робота","Здано","Бал","12 б","ECTS"].concat(LV).concat(["Час, с","Виходи"]).join(";")];
    rows.forEach(function(x){var S=summarize(x.tasks);L.push([x.surname,x.first,x.title,x.end,S.score,grade12(S.score),ectsOf(S.score)].concat(LV.map(function(l){return pct(S.lv[l].e,S.lv[l].m)+"%";})).concat([x.durSec,x.exits]).join(";"));});
    var a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+L.join("\n")],{type:"text/csv"}));a.download="rezultaty.csv";a.click();};
  $("clr").onclick=function(){if(!confirm("Видалити всі результати?"))return;
    fbReady().then(function(db){return fbCol(db).get().then(function(snap){var ps=[];snap.forEach(function(d){ps.push(fbCol(db).del(d.ref));});return Promise.all(ps);});}).then(load);};
  load();
}

boot();

</script>
</body>
</html>
