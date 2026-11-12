import sys
parts=["00_head.html","01_helpers_topics.js","02_bank.js","03_engine.js","03b_levels.js","04_mon.js","04b_kits.js","04c_mix.js","04d_gen6.js","05_panel.js","06_fbcfg.js","07_constructor.js","08_student.js","09_fb_teacher.js"]
out="".join(open("src/"+p,encoding="utf-8").read() for p in parts)
open(sys.argv[1] if len(sys.argv)>1 else "monitoring.html","w",encoding="utf-8").write(out)
print(len(out))
