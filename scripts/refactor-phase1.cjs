const fs=require("fs");
const file="index.html";
let s=fs.readFileSync(file,"utf8");
const catalog=[
'const gameStore=[',
' {id:"medicine",name:"Remédio",emoji:"",art:"assets/item-medicine.svg",price:18,currency:"coins",type:"consumable",effect:"heal",desc:"Recupera até 35 pontos de vida."},',
' {id:"injection",name:"Cura",emoji:"",art:"assets/item-cure.svg",price:7,currency:"diamonds",type:"consumable",effect:"fullheal",desc:"Restaura toda a vida de Ibrahim."},',
' {id:"rope",name:"Rede de captura",emoji:"",art:"assets/item-net.svg",price:4,currency:"diamonds",type:"consumable",effect:"capture",desc:"Permite capturar um companheiro em encontros especiais."},',
' {id:"smoke",name:"Bomba de fumaça",emoji:"",art:"assets/item-smoke.svg",price:25,currency:"coins",type:"consumable",effect:"escape",desc:"Permite fugir da batalha sem perder a aventura."}',
];
const start=s.indexOf("const gameStore=[");
const end=s.indexOf("\n];",start);
if(start<0||end<0)throw new Error("Catálogo RPG não localizado.");
s=s.slice(0,start)+catalog.join("\n")+s.slice(end+3);
function patch(oldText,newText,label){
 if(s.includes(newText))return;
 const count=s.split(oldText).length-1;
 if(count!==1)throw new Error(label+": esperado 1 trecho, encontrado "+count);
 s=s.replace(oldText,newText);
}
patch('const roots={pet:"quickRewards",weapon:"consumableRewards",armor:"consumableRewards",consumable:"consumableRewards"};','const roots={pet:"consumableRewards",weapon:"consumableRewards",armor:"consumableRewards",consumable:"consumableRewards"};',"categorias da loja");
patch('const art=document.createElement("div");art.className="game-item-art";art.textContent=item.emoji;card.append(art);','const art=document.createElement("div");art.className="game-item-art";const artImg=document.createElement("img");artImg.src=item.art;artImg.alt=item.name;art.append(artImg);card.append(art);',"imagem dos itens");
patch('const list=[{id:"medicine",name:"Remédio",emoji:"🧪",desc:"Recupera 35 de vida."},{id:"injection",name:"Injeção Vital",emoji:"💉",desc:"Recupera toda a vida."},{id:"rope",name:"Corda",emoji:"🪢",desc:"Captura personagem amigável."},{id:"smoke",name:"Fumaça",emoji:"💨",desc:"Foge da batalha."}];','const list=[{id:"medicine",name:"Remédio",emoji:"🧪",desc:"Recupera 35 de vida."},{id:"injection",name:"Cura",emoji:"✨",desc:"Recupera toda a vida."},{id:"rope",name:"Rede de captura",emoji:"🕸️",desc:"Captura personagem amigável."},{id:"smoke",name:"Bomba de fumaça",emoji:"💨",desc:"Foge da batalha."}];',"nomes da mochila");
patch('<div class="phase-cover" aria-label="Ibrahim, seu cachorro e o Guardião da Floresta na Floresta Encantada"><img class="phase-cover-ibrahim" src="assets/ibrahim_idle.png" alt="Ibrahim"><img class="phase-cover-dog" src="assets/companion_dog.png" alt="Cachorro companheiro"><img class="phase-cover-boss" src="assets/enemy_guardian.webp" alt="Guardião da Floresta"><span>FLORESTA ENCANTADA · FASE 1</span></div>','<div class="phase-cover phase-cover-faceoff" data-phase-art="faceoff" aria-label="Ibrahim e seu cachorro enfrentam o Guardião da Floresta"><img src="assets/phase1-faceoff.svg" alt="Ibrahim e seu cachorro frente a frente com o chefão da Floresta Encantada"></div>',"capa da fase");
patch('<div class="battle-wallet battle-wallet-top"><div>🪙 MOEDAS<strong id="battleCoins">0</strong><small>Use na loja</small></div><div>⭐ XP DAS ATIVIDADES<strong id="battleXP">0</strong><small>Conquistado nas missões</small></div><div>💎 DIAMANTES<strong id="battleDiamonds">0</strong><small>Moeda do RPG</small></div></div>','',"painel azul de moedas");
const css='<style id="rpg-art-update">.phase-cover{height:230px!important;overflow:hidden!important;background:#183e31!important}.phase-cover-faceoff img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}.game-item-art{height:112px!important;border-radius:12px;display:grid;place-items:center;background:radial-gradient(circle at 50% 25%,#385a6a,#101f31 78%)!important;border:2px solid #b89a5b!important;overflow:hidden;box-shadow:inset 0 0 14px #050e1a}.game-item-art img{width:100%;height:100%;object-fit:contain}.game-item{background:linear-gradient(145deg,#fdf8e9,#e9e0ca)!important;border:1px solid #b89a5b!important}</style>';
if(!s.includes('id="rpg-art-update"'))s=s.replace("</head>",css+"</head>");
const scripts=[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(x=>x.trim());
for(let i=0;i<scripts.length;i++){try{new Function(scripts[i]);}catch(e){throw new Error("JavaScript inválido no script inline "+i+": "+e.message);}}
fs.writeFileSync(file,s);
console.log("Loja RPG, capa da fase e painel azul atualizados; scripts validados: "+scripts.length);
