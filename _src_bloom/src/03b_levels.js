/* ===== Рівні сформованості (розділ 3.3 ТЗ): 90 / 74 / 60 % ===== */
var FLN=["Початковий","Середній","Достатній","Високий"];
var FLC=["#f6d3d8","#fdeab9","#d9eedc","#bfe3c8"];
function fl(p){return p==null?-1:p>=90?3:p>=74?2:p>=60?1:0;}
function flS(p){var f=fl(p);return f<0?"":' style="background:'+FLC[f]+'" title="'+FLN[f]+'"';}
