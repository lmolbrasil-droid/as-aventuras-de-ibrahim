const fs=require("fs");const s=fs.readFileSync("index.html","utf8");
for(const term of ["phase-cover","FASE 1","Fase 1","EXPLORAR O MUNDO","As Aventuras de Ibrahim","MUNDO DE IBRAHIM","Floresta Encantada","gameStage"]){
 let p=-1,n=0;while((p=s.indexOf(term,p+1))>=0&&n<8){console.log("\\nTERM "+term+" @"+p+"\\n"+s.slice(Math.max(0,p-350),Math.min(s.length,p+650)).replace(/\\s+/g," "));n++;}
}
