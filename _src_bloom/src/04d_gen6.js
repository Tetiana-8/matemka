/* ===== Моніторинг v:4: структура комплекту, наповнення — з банку за темами, що обрала вчителька =====
   6 завдань, по одному на рівень, по 4 бали (як у комплектах адміністрації):
   Зн — 4 запитання з вибором (по 1 б); Ро — 2 запитання (2 б) + пояснення вчителю (2 б); Зс — 4 числові відповіді (по 1 б);
   Ан — 2 запитання (2 б) + пояснення вчителю (2 б); Оц і Ст — письмові, оцінює вчитель 0–4.
   Структура залежить лише від кодів тем; числа — від учня. Якірні (Ро, Оц) однакові в усіх зрізах для одного учня. */
var SL4=[
 {L:"Зн",c:2,n:4,ap:4,q:"Оберіть правильну відповідь у кожному пункті."},
 {L:"Ро",c:2,n:2,ap:2,an:1,q:"Дайте відповіді на запитання й поясніть свої міркування.",
  open:"Поясни своїми словами, чому ти обрав(ла) саме такі відповіді: що означають ці поняття чи правила, як ти це розумієш."},
 {L:"Зс",c:2,n:4,ap:4,q:"Виконайте завдання (відповідь запишіть числом)."},
 {L:"Ан",c:1,n:2,ap:2,q:"Дайте відповіді на запитання й поясніть, як ви міркували.",
  open:"Поясни, як ти знаходив(ла) відповіді: які кроки виконав(ла), що з чого випливає і чому."},
 {L:"Оц",c:1,rb:1,an:1},
 {L:"Ст",c:1,rb:1}
];
function monSlots4(pt){return SL4.filter(function(s){return pt!==2||s.c===1;});}
function monMax4(pt){return monSlots4(pt).length*4;}
function allTopicIds(){return topicsOf(MK.s,MK.g).map(function(t){return t[0];});}
/* структурний прогон: які саме (шаблон, варіант) увійдуть у завдання — залежить лише від коду зрізу */
function pick4(pool,spec,n,id){
  var by={};pool.forEach(function(g){(by[g.t]=by[g.t]||[]).push(g);});
  var tops=spec.sh(Object.keys(by).sort());tops.forEach(function(t){by[t]=spec.sh(by[t].sort(function(a,b){return a.id<b.id?-1:1;}));});
  var order=[],i=0;while(true){var moved=false;tops.forEach(function(t){if(by[t][i]){order.push(by[t][i]);moved=true;}});if(!moved)break;i++;}
  var out=[],seen={};
  for(var v=0;v<4&&out.length<n;v++){
    for(var j=0;j<order.length&&out.length<n;j++){
      var g=order[j],o=g.f(mkR("struct|"+id+"|"+g.id+"|"+v)),q=String(o.q);
      if(seen[q])continue;seen[q]=1;out.push({g:g,v:v});}}
  return out;}
function realPart(g,v,key,letter){
  var R=mkR(key+"|"+g.id+"|"+v),o=g.f(R),q=letter+" "+o.q;
  if(o.k==="mc"){var ord=R.sh(o.o.map(function(_,i){return i;}));return {k:"s",q:q,o:ord.map(function(i){return o.o[i];}),a:ord.indexOf(o.a||0),why:o.why,tp:g.t};}
  return {k:"n",q:q,a:o.a,tol:0.0005,sol:o.sol,tp:g.t};}
function topName(id){var f=TOP.filter(function(t){return t[0]===id;})[0];return f?f[3]:"";}
function plain(h){return String(h).replace(/<sup>(.*?)<\/sup>/g,"^$1").replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim();}
/* зразок для вчителя: що має написати учень на 2 б / 1 б / 0 б — саме для цього завдання */
function rubFor(sl,parts,LET){
  if(sl.L==="Ро"){
    var p=parts[0],R=p.o?p.o[p.a]:fm(p.a),W=p.o?p.o.filter(function(x,i){return i!==p.a;})[0]:null,T=topName(p.tp);
    var open="Поясни своїми словами, чому в запитанні (а) правильна відповідь саме «"+plain(R)+"»"+(W?", а не «"+plain(W)+"»":"")+".";
    var why=p.why?p.why.replace(/\s+$/,""):"";
    var mod="Правильна відповідь у (а): «"+plain(R)+"». "+(why?"Зразок пояснення: "+why+(/[.!?]$/.test(why)?"":".")+(W?" Бажано також сказати, чому «"+plain(W)+"» не підходить.":""):"Очікується пояснення за означенням, правилом чи властивістю з теми «"+T+"», що стосується саме цього запитання.");
    return {open:open,m:{qa:p.q,mod:mod,key:mod,
      l2:"Названо головну думку зразка й показано, як вона діє саме в цьому запитанні"+(W?"; є причина, чому «"+plain(W)+"» не підходить, а не просто «бо неправильно»":"")+".",
      l1:"Назвав(ла) правильну відповідь «"+plain(R)+"» і щось по темі, але ідея зразка передана лише частково: правило названо загалом, без зв’язку з цим запитанням"+(W?", або не пояснено, чому «"+plain(W)+"» хибна":"")+".",
      l0:"Немає спроби, «не знаю», лише повторено відповідь без пояснення, або пояснення по суті хибне."}};}
  var pi=0;parts.forEach(function(x,i){if(!pi&&x.k==="n")pi=i;});var p2=parts[pi],A=p2.k==="s"?p2.o[p2.a]:fm(p2.a);
  var how=p2.sol||p2.why||"",L0=LET[pi];
  var mod="Розв’язання пункту "+L0+(how?": "+how.replace(/\s+$/,"")+(/[.!?]$/.test(how)?"":"."):": кроки мають привести до відповіді "+plain(A)+".")+" Відповідь: "+plain(A)+".";
  return {open:"Запиши розв’язання пункту "+L0+" по кроках і поясни, чому ти обрав(ла) саме такий спосіб; за потреби виконай рисунок (можна сфотографувати й додати фото).",
    m:{qa:p2.q,mod:mod,key:mod,
      l2:"Є повний хід розв’язання"+(how?" (ключові кроки збігаються зі зразком)":"")+", названо властивість чи формулу, на яку спирався(лася), і дійшов(ла) відповіді "+plain(A)+".",
      l1:"Є правильна ідея й частина кроків зі зразка, але пропущено ключовий крок, є помилка в обчисленнях або не дійшов(ла) відповіді "+plain(A)+".",
      l0:"Немає спроби, «не знаю», записано лише відповідь без ходу розв’язання, або розв’язання по суті хибне."}};}
function slotPool(sl,cfg){
  var tp=(sl.an||sl.c===1)?cfg.tp:cfg.tk;
  var p=poolOf({tp:tp},sl.L);
  if(!p.length)p=poolOf({tp:allTopicIds()},sl.L);
  return p;}
function buildMon4(cfg,name){
  var pt=cfg.pt|0,out=[],key="mon|"+name+"|"+cfg.id+"|"+pt,keyA="mon|"+name+"|"+cfg.id+"|anchor",LET=["(а)","(б)","(в)","(г)"];
  monSlots4(pt).forEach(function(sl){
    var pool=slotPool(sl,cfg),sk=sl.an?keyA:key;
    var spec=mkR(sl.an?"mon4a|"+cfg.id+"|"+sl.L:(sl.c===1?"mon41|"+cfg.id+"|"+sl.L:"mon42|"+cfg.id+"|"+pt+"|"+sl.L));
    var blk=BLK.filter(function(b){return b[1].indexOf(sl.L)>=0;})[0][0],t;
    if(sl.rb){
      var g=pickGens(pool,spec,1,[])[0];
      t=mkTaskM(g,{L:sl.L,c:sl.c,p:4,rb:1,an:sl.an},sk);
      var base=(t.rub||"").replace(/\s+$/,""),ansS=t.a;
      if(sl.L==="Ст"){
        t.k="rub";t.a=undefined;t.o=undefined;t.right="";
        t.q="<b>Зразок задачі:</b> "+t.q+"<br><br><b>Завдання.</b> Тепер створи свою.";
        if(!/перевір/.test(t.open||""))t.open=(t.open||"Створіть власну задачу.").replace(/\s+$/,"")+" Запишіть повне розв'язання та перевірку відповіді; рисунок чи розв'язання можна сфотографувати й додати фото з зошита.";
        t.rubm={key:"Що має бути в роботі: "+base+(/перевір/.test(base)?"":" Є перевірка відповіді; умова оригінальна (не копія зразка).")+(ansS!==undefined&&ansS!==null&&ansS!==""?" Орієнтир: у зразку правильна відповідь — "+plain(fm(ansS))+"; учень має скласти схожу задачу з іншими даними й розв’язати її тим самим способом.":"")};
      }else{
        t.open=(t.open||"Поясніть свою відповідь").replace(/[.\s]+$/,"")+(/рисун/.test(t.open||"")?"":". За потреби виконайте рисунок (можна сфотографувати й додати фото з зошита)")+" і запропонуйте, як перевірити відповідь іншим способом.";
        t.rubm={key:"Що очікується: "+base+" Додатково: запропоновано спосіб перевірки (інший спосіб, оцінка, підстановка)."+(t.right?" Помилка, яку має назвати учень: «"+plain(t.right)+"».":"")};
      }
    }else{
      var pk=pick4(pool,spec,sl.n,cfg.id);
      var parts=pk.map(function(x,i){return realPart(x.g,x.v,sk,LET[i]);});
      var sh=pk[0]?pk[0].g.t:"";
      t={l:sl.L,t:sh,k:"mix",q:sl.q,pts:4,c:sl.c,aut:sl.ap,ap:sl.ap,opn:4-sl.ap,parts:parts,open:"",openLb:"",rub:"",right:""};
      if(sl.an)t.an=1;
      if(sl.open){var rf=rubFor(sl,parts,LET);
        t.open=rf.open;t.openLb=rf.open;t.rubm=rf.m;
        t.rub=rf.m.mod+" Ви ставите 0–"+(4-sl.ap)+" б за письмове пояснення: 2 — "+rf.m.l2+" 1 — "+rf.m.l1+" 0 — "+rf.m.l0;}
    }
    t.blk=blk;out.push(t);});
  return out;}
function struct4(tpA,tpB,pt){var cfg={tp:tpA,tk:tpB},res=[];
  monSlots4(pt).forEach(function(sl){if(sl.rb)return;var pool=slotPool(sl,cfg),got=pick4(pool,mkR("w|"+sl.L),sl.n,"w").length;res.push([sl.L,got,sl.n]);});return res;}
