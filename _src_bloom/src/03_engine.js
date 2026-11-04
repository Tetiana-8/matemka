/* ===== Рушій: випадковість, структура роботи, бали, оцінка ===== */
var LV=["Зн","Ро","Зс","Ан","Оц","Ст"];
var LVN={"Зн":"Знання","Ро":"Розуміння","Зс":"Застосування","Ан":"Аналіз","Оц":"Оцінювання","Ст":"Створення"};
var LMAX={"Зн":36,"Ро":37,"Зс":8,"Ан":8,"Оц":5,"Ст":6};            // разом 100
var BLK=[["А",["Зн","Ро"],73],["Б",["Зс","Ан"],16],["В",["Оц","Ст"],11]];
var BLKN={"А":"Блок А · знання й розуміння","Б":"Блок Б · застосування й аналіз","В":"Блок В · оцінювання й створення"};
var TOPN={};TOP.forEach(function(t){TOPN[t[0]]=t[3];});
function readyTopic(id){return LV.every(function(L){return GEN.some(function(g){return g.t===id&&g.l===L;});});}
function bankSize(id,L){return GEN.filter(function(g){return g.t===id&&(!L||g.l===L);}).length;}

function xmur(str){var h=1779033703^str.length;for(var i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=(h<<13)|(h>>>19);}
  return function(){h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return h>>>0;};}
function mkR(seed){var a=xmur(String(seed))();
  var r=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^(a>>>15),1|a);t=t+Math.imul(t^(t>>>7),61|t)^t;return((t^(t>>>14))>>>0)/4294967296;};
  return {r:r,
    i:function(x,y){return x+Math.floor(r()*(y-x+1));},
    p:function(arr){return arr[Math.floor(r()*arr.length)];},
    sh:function(arr){var c=arr.slice();for(var i=c.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var t=c[i];c[i]=c[j];c[j]=t;}return c;}};}

function split(total,k){var base=Math.floor(total/k),r=total%k,o=[];for(var i=0;i<k;i++)o.push(base+(i<r?1:0));return o;}
function poolOf(cfg,L){return GEN.filter(function(g){return g.l===L&&cfg.tp.indexOf(g.t)>=0;});}
function effCounts(cfg){return LV.map(function(L,i){return Math.min(cfg.n[i],poolOf(cfg,L).length);});}

function mkTask(g,L,pts,key){
  var R=mkR(key+"|"+g.id),o=g.f(R),t={l:L,t:g.t,k:o.k,q:o.q,pts:pts,open:o.open||"",rub:o.rub||""};
  if(t.open){t.aut=Math.ceil(pts/2);t.opn=pts-t.aut;}else{t.aut=pts;t.opn=0;}
  if(o.k==="mc"){var ord=R.sh(o.o.map(function(_,i){return i;}));t.o=ord.map(function(i){return o.o[i];});t.a=ord.indexOf(o.a||0);t.right=o.o[o.a||0];}
  else{t.a=o.a;t.right=fm(o.a);}
  return t;}

function buildTest(cfg,name){
  var key=name+"|"+cfg.id,R=mkR(key+"|order"),chosen=[];
  LV.forEach(function(L,li){
    var by={};poolOf(cfg,L).forEach(function(g){(by[g.t]=by[g.t]||[]).push(g);});
    var tops=R.sh(Object.keys(by));tops.forEach(function(t){by[t]=R.sh(by[t]);});
    var total=tops.reduce(function(s,t){return s+by[t].length;},0),k=Math.min(cfg.n[li],total),picked=[];
    while(picked.length<k){tops.forEach(function(t){if(picked.length<k&&by[t].length)picked.push(by[t].shift());});}
    var pts=split(LMAX[L],k);
    picked.forEach(function(g,i){var t=mkTask(g,L,pts[i],key);chosen.push(t);});
  });
  var out=[];
  BLK.forEach(function(b){var part=R.sh(chosen.filter(function(t){return b[1].indexOf(t.l)>=0;}));part.forEach(function(t){t.blk=b[0];out.push(t);});});
  return out;}

/* ===== Підрахунок ===== */
function gotOf(r){if(r.part!=null)return r.part;if(r.rb)return r.ograde==null?0:Math.max(0,Math.min(r.pts,r.ograde));var g=r.ok?r.aut:0;if(r.opn&&r.otext&&r.otext.trim()&&r.ograde!=null)g+=Math.max(0,Math.min(r.opn,r.ograde));return g;}
function isPending(r){if(r.rb)return r.ograde==null&&!!((r.otext&&r.otext.trim())||r.given);return !!(r.opn&&r.otext&&r.otext.trim()&&r.ograde==null);}
function summarize(recs){
  var lv={},bl={},tp={},score=0,max=0,pending=false;
  LV.forEach(function(L){lv[L]={e:0,m:0};});BLK.forEach(function(b){bl[b[0]]={e:0,m:0};});
  recs.forEach(function(r){var g=gotOf(r);lv[r.l].e+=g;lv[r.l].m+=r.pts;
    var b=BLK.filter(function(x){return x[1].indexOf(r.l)>=0;})[0][0];bl[b].e+=g;bl[b].m+=r.pts;
    (tp[r.t]=tp[r.t]||{e:0,m:0});tp[r.t].e+=g;tp[r.t].m+=r.pts;score+=g;max+=r.pts;if(isPending(r))pending=true;});
  return {score:score,max:max,lv:lv,bl:bl,tp:tp,pending:pending};}

function grade12(s){return s<35?1:s<50?2:s<60?3:s<64?4:s<69?5:s<74?6:s<79?7:s<85?8:s<90?9:s<94?10:s<98?11:12;}
function ectsOf(s){var g=grade12(s);return s<35?"F":s<60?"FX":s<64?"E":s<74?"D":s<82?"C":s<90?"B":g===12?"A+":"A";}
function compLevel(s){return s<60?"Початковий":s<74?"Середній (репродуктивний)":s<90?"Достатній (конструктивно-варіативний)":"Високий (творчий)";}
function bloomByScore(s){return s<60?"Знання":s<74?"Розуміння":s<85?"Застосування":s<90?"Аналіз":s<94?"Оцінювання":"Створення";}

function b64enc(o){return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
function b64dec(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return JSON.parse(decodeURIComponent(escape(atob(s))));}

