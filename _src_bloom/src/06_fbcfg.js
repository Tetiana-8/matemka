/* ============ Налаштування збору результатів (проєкт math-5-892a5) ============ */
var FIREBASE_CONFIG = {
  apiKey:"AIzaSyCEykTXlA8Um3MdHbA3dZEZGxuWzFreohU",
  authDomain:"math-5-892a5.firebaseapp.com",
  projectId:"math-5-892a5",
  storageBucket:"math-5-892a5.firebasestorage.app",
  messagingSenderId:"163114803328",
  appId:"1:163114803328:web:caf86c4e8b8c4b3b630665",
  measurementId:"G-E06VKZ2GP5"
};
var FB_APP = "default-app-id";
var FB_COL = "results_bloom_control";
var FBV = "10.12.2";
var TEACHER_PASSWORD = "8019";
var MON = (typeof APP_MON!=="undefined"&&APP_MON===true);
if(MON)FB_COL = "results_bloom_monitoring";

function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function fmt(s){return String(s).replace(/\[\[(.+?)\|(.+?)\]\]/g,'<span class="fr"><i>$1</i><i>$2</i></span>');}
function pct(a,b){return b?Math.round(a*100/b):0;}
function lcls(p){return p>=75?"g":p>=50?"y":"r";}
function dur(sec){sec=Math.max(0,Math.round(sec));var m=Math.floor(sec/60),s=sec%60;return m+":"+(s<10?"0":"")+s;}
function bars(lv){
  return LV.map(function(L){var e=lv[L].e,m=lv[L].m,p=pct(e,m);
    return '<div class="lvl"><span>'+LVN[L]+'</span><div class="bar"><i class="'+(m?lcls(p):"n")+'" style="width:'+(m?p:0)+'%"></i></div><span>'+e+' з '+m+'</span></div>';}).join("");}

