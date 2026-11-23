const fs = require("fs");
const file = "index.html";
let s = fs.readFileSync(file, "utf8");
function replaceOnce(oldText, newText, label) {
  if (s.includes(newText)) return;
  const count = s.split(oldText).length - 1;
  if (count === 0) return;
  if (count !== 1) throw new Error(label + ": esperado 1 trecho, encontrado " + count);
  s = s.replace(oldText, newText);
}
replaceOnce(
  '<button class="explore-launch" id="openExploreMode"',
  '<div class="phase-cover" aria-label="Ibrahim, seu cachorro e o Guardião da Floresta na Floresta Encantada"><img class="phase-cover-ibrahim" src="assets/ibrahim_idle.png" alt="Ibrahim"><img class="phase-cover-dog" src="assets/companion_dog.png" alt="Cachorro companheiro"><img class="phase-cover-boss" src="assets/enemy_guardian.webp" alt="Guardião da Floresta"><span>FLORESTA ENCANTADA · FASE 1</span></div>\n<button class="explore-launch" id="openExploreMode"',
  "imagem estática da fase"
);
replaceOnce(
  '<button id="attackBtn" onclick="attackGuardian()" type="button">⚔️ Corte Relâmpago</button><button class="secondary" id="doubleBtn" onclick="doubleStrike()" type="button">🐶⚔️ Ataque em Dupla <small>1 uso por batalha</small></button><button class="secondary" id="defendBtn" onclick="defendGuardian()" type="button">🛡️ Defesa Guardiã</button><button class="secondary" id="skillBtn" onclick="useHeroSkill()" type="button">✨ Habilidade Especial</button><button class="secondary" id="bagBtn" onclick="openBattleBag()" type="button">🎒 Mochila</button>',
  '<button id="attackBtn" onclick="attackGuardian()" type="button">⚔️ Ataque</button><button class="secondary" id="defendBtn" onclick="defendGuardian()" type="button">🛡️ Defesa</button><button class="secondary" id="doubleBtn" onclick="doubleStrike()" type="button">⚔️ Ataque Duplo <small>1 uso por batalha</small></button><button class="secondary" id="bagBtn" onclick="openBattleBag()" type="button">🎒 Mochila</button>',
  "quatro botões principais"
);
replaceOnce(
  'if(!data.game)data.game={owned:[],equipped:{pet:null,weapon:null,armor:null,outfit:null},stage:1,wonStages:[],dailyBattle:{}};',
  'if(!data.game)data.game={owned:[],equipped:{pet:null,weapon:null,armor:null,outfit:null},stage:1,wonStages:[],dailyBattle:{}};\n data.game.stage=1;',
  "fixar somente fase 1"
);
replaceOnce(
  'return enemies[(stage-1)%enemies.length];',
  'return enemies[0];',
  "chefão fixo da fase 1"
);
replaceOnce(
  'const db=document.getElementById("doubleBtn");if(db){db.disabled=!!battle.won||hp<=0||!!battle.doubleUsed;db.innerHTML=battle.doubleUsed?"🐶⚔️ Ataque em Dupla <small>usado</small>":"🐶⚔️ Ataque em Dupla <small>1 uso por batalha</small>";}\n document.getElementById("skillBtn").disabled=!!battle.won||hp<=0||(data.game.skillCooldown||0)>0;\n document.getElementById("skillBtn").textContent=(data.game.skillCooldown||0)>0?"⏳ Habilidade (recarga)":"✨ Habilidade";',
  'const db=document.getElementById("doubleBtn");if(db){db.disabled=!!battle.won||hp<=0||!!battle.doubleUsed;db.innerHTML=battle.doubleUsed?"⚔️ Ataque Duplo <small>usado</small>":"⚔️ Ataque Duplo <small>1 uso por batalha</small>";}\n const skillButton=document.getElementById("skillBtn");if(skillButton){skillButton.disabled=!!battle.won||hp<=0||(data.game.skillCooldown||0)>0;skillButton.textContent=(data.game.skillCooldown||0)>0?"⏳ Habilidade (recarga)":"✨ Habilidade";}',
  "remover dependência do botão habilidade"
);
replaceOnce(
  'function exploreNext(){\n ensureGame();const battle=data.game.dailyBattle[todayKey];if(!battle||!battle.won)return;\n closeBattleVictory();data.game.stage++;\n document.getElementById("gameMonster")?.classList.remove("enemy-pose-attack","enemy-pose-hurt","enemy-pose-defeated");\n const enemy=gameEnemy();data.game.dailyBattle[todayKey]={hp:enemy[2],won:false,attacks:0};\n data.game.combat.hp=data.game.combat.maxHp;data.game.combat.guard=0;\n save();renderGame();\n document.getElementById("battleScene").classList.add("region-unlock");\n setTimeout(()=>document.getElementById("battleScene")?.classList.remove("region-unlock"),1100);\n}',
  'function exploreNext(){\n ensureGame();const battle=data.game.dailyBattle[todayKey];if(!battle||!battle.won)return;\n closeBattleVictory();data.game.stage=1;\n document.getElementById("gameMonster")?.classList.remove("enemy-pose-attack","enemy-pose-hurt","enemy-pose-defeated");\n const enemy=gameEnemy();data.game.dailyBattle[todayKey]={hp:enemy[2],won:false,attacks:0};\n data.game.combat.hp=data.game.combat.maxHp;data.game.combat.guard=0;\n save();renderGame();\n document.getElementById("battleScene").classList.add("region-unlock");\n setTimeout(()=>document.getElementById("battleScene")?.classList.remove("region-unlock"),1100);\n}',
  "impedir avanço de fase"
);
replaceOnce(
  'const gameStore=[];\n/* Loja temporariamente vazia conforme solicitado. */',
  'const gameStore=[\n {id:"medicine",name:"Remedinho",emoji:"🧪",price:18,currency:"coins",type:"consumable",effect:"heal",desc:"Recupera 35 pontos de vida."},\n {id:"rope",name:"Corda de Captura",emoji:"🪢",price:4,currency:"diamonds",type:"consumable",effect:"capture",desc:"Usada para tentar capturar o chefão."},\n {id:"injection",name:"Injeção Vital",emoji:"💉",price:7,currency:"diamonds",type:"consumable",effect:"fullheal",desc:"Restaura toda a vida de Ibrahim."},\n {id:"smoke",name:"Bomba de Fumaça",emoji:"💨",price:25,currency:"coins",type:"consumable",effect:"escape",desc:"Permite fugir do combate."}\n];',
  "reativar os quatro itens da loja"
);
replaceOnce(
  'window.openIbrahimExploration=function(){active=true;screen.hidden=false;draw();status.textContent=',
  'window.openIbrahimExploration=function(){active=true;document.getElementById("ibrahimGame").classList.add("exploring");screen.hidden=false;draw();status.textContent=',
  "abrir mapa em modo exploração"
);
replaceOnce(
  'window.closeIbrahimExploration=function(){active=false;screen.hidden=true;};',
  'window.closeIbrahimExploration=function(){active=false;document.getElementById("ibrahimGame").classList.remove("exploring");screen.hidden=true;};',
  "fechar mapa"
);
replaceOnce(
  'g.exploration.inEncounter=true;const enemy=gameEnemy();',
  'g.exploration.inEncounter=true;document.getElementById("ibrahimGame").classList.remove("exploring");document.getElementById("ibrahimGame").classList.add("in-encounter");const enemy=gameEnemy();',
  "alternar para tela de combate"
);
replaceOnce(
  'g.exploration.inEncounter=false;g.exploration.savedBattle=null;g.exploration.hadBattle=false;save();renderGame();encounterLock=false;window.openIbrahimExploration();',
  'g.exploration.inEncounter=false;g.exploration.savedBattle=null;g.exploration.hadBattle=false;save();renderGame();document.getElementById("ibrahimGame").classList.remove("in-encounter");encounterLock=false;window.openIbrahimExploration();',
  "retornar ao mapa após o combate"
);
replaceOnce(
  '.explore-launch{display:flex;align-items:center;',
  '.phase-cover{position:relative;height:210px;margin:12px 0 4px;border:4px solid #fff;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,#8bd7ff,#6aa94d);box-shadow:0 5px 16px #143c2b30}\n.phase-cover:before{content:"";position:absolute;inset:0;background:url("assets/forest_bg.jpg") center/cover;filter:saturate(1.08)}\n.phase-cover img{position:absolute;z-index:1;object-fit:contain;bottom:4px;max-height:84%;width:30%;height:82%}\n.phase-cover-ibrahim{left:4%}.phase-cover-dog{left:25%;width:25%!important}.phase-cover-boss{right:4%;width:36%!important;max-height:94%!important}\n.phase-cover span{position:absolute;z-index:2;left:12px;top:12px;background:#123a60df;color:#fff;border-radius:20px;padding:7px 12px;font-size:12px;font-weight:900;letter-spacing:.5px}\n.game-panel:not(.in-encounter) .battle-scene,.game-panel:not(.in-encounter) .battle-hud,.game-panel:not(.in-encounter) .game-status,.game-panel:not(.in-encounter) .game-health,.game-panel:not(.in-encounter) #gameStory,.game-panel:not(.in-encounter) .battle-menu,.game-panel:not(.in-encounter) .next-region,.game-panel:not(.in-encounter) #gameInventorySummary,.game-panel:not(.in-encounter) #evolutionStrip,.game-panel:not(.in-encounter) .tiny{display:none!important}\n.game-panel.exploring .phase-cover,.game-panel.exploring #openExploreMode{display:none!important}\n.game-panel.in-encounter .phase-cover,.game-panel.in-encounter #openExploreMode,.game-panel.in-encounter #ibrahimExploreScreen{display:none!important}\n.next-region{display:none!important}\n.explore-launch{display:flex;align-items:center;',
  "estilo da tela da fase e estados do jogo"
);
fs.writeFileSync(file,s);
console.log("Refatoração da Fase 1 preparada.");


// v1.38: stabilize exploration encounters, persistence, capture and the complete shop.
let app = fs.readFileSync(file, "utf8");
function patchOne(oldText, newText, label) {
  if (app.includes(newText)) return;
  const count = app.split(oldText).length - 1;
  if (count !== 1) throw new Error(label + ": esperado 1 trecho, encontrado " + count);
  app = app.replace(oldText, newText);
}
function patchLast(oldText, newText, label) {
  if (app.includes(newText)) return;
  const at = app.lastIndexOf(oldText);
  if (at < 0) throw new Error(label + ": trecho não encontrado");
  app = app.slice(0, at) + newText + app.slice(at + oldText.length);
}
const disabledStore = app.match(/const gameStore_DISABLED=\[([\s\S]*?)\];/);
if (!disabledStore) throw new Error("Catálogo antigo de equipamentos não encontrado.");
app = app.replace(/const gameStore=\[[\s\S]*?\];/, "const gameStore=[" + disabledStore[1] + "];");
patchOne(
  " const stage=Math.max(1,Number(data.game.stage)||1);\n return enemies[0];",
  " const stage=Math.max(1,Number(data.game.stage)||1);\n const exploration=data.game.exploration;\n return exploration&&exploration.inEncounter&&exploration.activeEnemy?exploration.activeEnemy:enemies[0];",
  "seleção de inimigo selvagem"
);
patchOne(
  " return 12+[\"weapon\",\"pet\",\"armor\"].reduce((v,k)=>{let it=gameStore.find(x=>x.id===data.game.equipped[k]);return v+(it?it.power:0)},0);",
  " const captured=(data.game.capturedCompanions||[]).find(x=>x.id===data.game.equipped.pet);\n return 12+[\"weapon\",\"pet\",\"armor\"].reduce((v,k)=>{let it=gameStore.find(x=>x.id===data.game.equipped[k]);return v+(it?it.power:0)},0)+(captured?3:0);",
  "força do companheiro capturado"
);
patchOne(
  "story('🪢 Você conquistou a amizade da Raposa Guardiã! Ela acompanhará Ibrahim.');busy=true;setTimeout(enemyTurn,550);return;",
  "story('🪢 Você conquistou a amizade da Raposa Guardiã! Ela acompanhará Ibrahim.');busy=false;setTimeout(enemyTurn,550);return;",
  "liberar o turno após capturar companheiro"
);
patchOne(
  "story('🪢 Você conquistou a amizade da Raposa Guardiã! Ela acompanhará Ibrahim.');busy=false;setTimeout(enemyTurn,550);return;",
  "story('🪢 Você conquistou a amizade da Raposa Guardiã! Ela acompanhará Ibrahim.');setTimeout(()=>window.enemyTurn(),550);return;",
  "usar o controlador atual no turno após captura"
);
patchLast(
  " window.ensureGame=ensure;\n window.enemyTurn=enemyTurn;",
  " const renderBeforeCapture=window.renderGame;\n window.renderGame=function(){\n   renderBeforeCapture();\n   const petStage=$('gameCompanion'),petId=data.game&&data.game.equipped&&data.game.equipped.pet;\n   const captured=(data.game&&data.game.capturedCompanions||[]).find(x=>x.id===petId);\n   if(petStage&&captured){petStage.innerHTML='<span aria-label=\"'+String(captured.name||'Companheiro capturado').replace(/[\"<>]/g,'')+'\" style=\"display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-size:clamp(58px,16vw,112px);filter:drop-shadow(0 5px 4px #153b3b66)\">'+(captured.emoji||'🦊')+'</span>';}\n };\n const previousUseBagItem=window.useBagItem;\n window.useBagItem=function(id){\n   const wild=!!(data.game&&data.game.exploration&&data.game.exploration.inEncounter);\n   previousUseBagItem(id);\n   if(id==='smoke'&&wild&&data.game.exploration&&data.game.exploration.inEncounter){\n     window.returnFromIbrahimEncounter();\n     story('💨 Ibrahim usou a Bomba de Fumaça, escapou do encontro e voltou à trilha.');\n   }\n };\n window.ensureGame=ensure;\n window.enemyTurn=enemyTurn;",
  "renderização de captura e bomba de fumaça"
);
patchLast(
  " window.exploreNext=()=>{\n   const b=currentBattle();if(advancing||(!b.won&&!b.escaped))return;",
  " window.exploreNext=()=>{\n   if(data.game&&data.game.exploration&&data.game.exploration.inEncounter){window.returnFromIbrahimEncounter();return;}\n   const b=currentBattle();if(advancing||(!b.won&&!b.escaped))return;",
  "retorno ao mapa após encontro"
);
const explorationAt = app.indexOf('<script id="ibrahim-exploration-integration">');
const controllerStart = app.indexOf(" function startWildEncounter(){", explorationAt);
const controllerEnd = app.indexOf("\n draw();", controllerStart);
if (explorationAt < 0 || controllerStart < 0 || controllerEnd < 0) throw new Error("Controlador da exploração não localizado.");
app = app.slice(0, controllerStart) + " function startWildEncounter(){\n  if(encounterLock)return;\n  encounterLock=true;ensureGame();\n  const g=data.game;if(!g.exploration)g.exploration={};\n  g.exploration.savedBattle=Object.prototype.hasOwnProperty.call(g.dailyBattle,todayKey)?JSON.parse(JSON.stringify(g.dailyBattle[todayKey])):null;\n  g.exploration.hadBattle=Object.prototype.hasOwnProperty.call(g.dailyBattle,todayKey);\n  const wildEnemies=[\n   [\"Troll da Mata\",\"👹\",32,\"troll\",\"FLORESTA ENCANTADA\"],\n   [\"Dragãozinho Selvagem\",\"🐉\",38,\"dragon\",\"FLORESTA ENCANTADA\"],\n   [\"Sombra da Floresta\",\"🌑\",44,\"shadow\",\"FLORESTA ENCANTADA\"]\n  ];\n  const enemy=wildEnemies[Math.floor(Math.random()*wildEnemies.length)];\n  g.exploration.activeEnemy=enemy;g.exploration.inEncounter=true;\n  g.exploration.player={x:player.x,y:player.y};\n  const stage=Math.max(1,Number(g.stage)||1);\n  g.dailyBattle[todayKey]={stage,hp:enemy[2],won:false,escaped:false,attacks:0,doubleUsed:false,rewardClaimed:false,chestOpened:false,captureAvailable:true,guardActive:false,exploration:true};\n  const root=document.getElementById(\"ibrahimGame\");\n  root.classList.remove(\"exploring\");root.classList.add(\"in-encounter\");\n  save();renderGame();screen.hidden=true;active=false;\n  const story=document.getElementById('gameStory');\n  if(story)story.textContent='🌿 Um '+enemy[0]+' selvagem apareceu na grama alta! Ibrahim, prepare-se!';\n  root.scrollIntoView({behavior:'smooth',block:'start'});\n }\n window.returnFromIbrahimEncounter=function(){\n  const g=data.game;if(!g||!g.exploration||!g.exploration.inEncounter)return;\n  if(g.exploration.hadBattle)g.dailyBattle[todayKey]=g.exploration.savedBattle;\n  else delete g.dailyBattle[todayKey];\n  g.exploration.inEncounter=false;g.exploration.activeEnemy=null;\n  g.exploration.savedBattle=null;g.exploration.hadBattle=false;\n  g.exploration.player={x:player.x,y:player.y};\n  save();renderGame();\n  const root=document.getElementById(\"ibrahimGame\");\n  root.classList.remove(\"in-encounter\");encounterLock=false;\n  window.openIbrahimExploration();\n  status.textContent='A trilha continua! Explore mais um pouco.';\n };\n function restoreExplorationState(){\n  ensureGame();\n  const g=data.game.exploration,root=document.getElementById(\"ibrahimGame\");\n  if(g&&g.player){player.x=Math.max(0,Math.min(cols-1,Number(g.player.x)||0));player.y=Math.max(0,Math.min(rows-1,Number(g.player.y)||0));}\n  if(g&&g.inEncounter){\n   active=false;encounterLock=true;screen.hidden=true;\n   root.classList.remove(\"exploring\");root.classList.add(\"in-encounter\");\n  }else{\n   active=false;encounterLock=false;screen.hidden=true;\n   root.classList.remove(\"in-encounter\",\"exploring\");\n  }\n  draw();try{renderGame();}catch(e){}\n }\n window.addEventListener(\"pageshow\",restoreExplorationState);\n restoreExplorationState();" + app.slice(controllerEnd);
patchOne(
  "function move(dir){if(!active||encounterLock)return;const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];if(!d)return;const nx=player.x+d[0],ny=player.y+d[1];if(blocked(nx,ny))return;player.x=nx;player.y=ny;draw();if(grass.has(nx+','+ny)&&Math.random()<0.22)startWildEncounter();}",
  "function move(dir){if(!active||encounterLock)return;const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];if(!d)return;const nx=player.x+d[0],ny=player.y+d[1];if(blocked(nx,ny))return;player.x=nx;player.y=ny;ensureGame();if(!data.game.exploration)data.game.exploration={};data.game.exploration.player={x:player.x,y:player.y};save();draw();if(grass.has(nx+','+ny)&&Math.random()<0.22)startWildEncounter();}",
  "salvar posição no mapa"
);
patchOne(
  "window.openIbrahimExploration=function(){active=true;document.getElementById(\"ibrahimGame\").classList.add(\"exploring\");screen.hidden=false;draw();status.textContent='Explore com cuidado. Há criaturas escondidas na grama!';screen.scrollIntoView({behavior:'smooth',block:'center'});};",
  "window.openIbrahimExploration=function(){ensureGame();const g=data.game.exploration;if(g&&g.player){player.x=Math.max(0,Math.min(cols-1,Number(g.player.x)||0));player.y=Math.max(0,Math.min(rows-1,Number(g.player.y)||0));}active=true;document.getElementById(\"ibrahimGame\").classList.remove(\"in-encounter\");document.getElementById(\"ibrahimGame\").classList.add(\"exploring\");screen.hidden=false;draw();status.textContent='Explore com cuidado. Há criaturas escondidas na grama!';screen.scrollIntoView({behavior:'smooth',block:'center'});};",
  "reabrir mapa salvo"
);
const inline = [...app.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(x=>x.trim());
for (let i=0;i<inline.length;i++) { try { new Function(inline[i]); } catch(e) { throw new Error("JavaScript inválido no script inline "+i+": "+e.message); } }
fs.writeFileSync(file, app);
console.log("v1.38 aplicada; scripts inline validados: "+inline.length);


/* v1.39: loja enxuta, arte RPG e capa de confronto da Fase 1. */
let finalApp=fs.readFileSync(file,"utf8");
const catalog=String.raw`const gameStore=[
 {id:"medicine",name:"Remédio",emoji:"",art:"assets/item-medicine.svg",price:18,currency:"coins",type:"consumable",effect:"heal",desc:"Recupera até 35 pontos de vida."},
 {id:"injection",name:"Cura",emoji:"",art:"assets/item-cure.svg",price:7,currency:"diamonds",type:"consumable",effect:"fullheal",desc:"Restaura toda a vida de Ibrahim."},
 {id:"rope",name:"Rede de captura",emoji:"",art:"assets/item-net.svg",price:4,currency:"diamonds",type:"consumable",effect:"capture",desc:"Permite capturar um companheiro em encontros especiais."},
 {id:"smoke",name:"Bomba de fumaça",emoji:"",art:"assets/item-smoke.svg",price:25,currency:"coins",type:"consumable",effect:"escape",desc:"Permite fugir da batalha sem perder a aventura."}
];`;
const catalogMatch=finalApp.match(/const gameStore=\[[\s\S]*?\n\];/);
if(!catalogMatch)throw new Error("Catálogo RPG não localizado.");
finalApp=finalApp.replace(catalogMatch[0],catalog);
function patchFinal(oldText,newText,label){
 const n=finalApp.split(oldText).length-1;
 if(n===0&&finalApp.includes(newText))return;
 if(n!==1)throw new Error(label+": esperado 1 trecho, encontrado "+n);
 finalApp=finalApp.replace(oldText,newText);
}
patchFinal('const roots={pet:"quickRewards",weapon:"consumableRewards",armor:"consumableRewards",consumable:"consumableRewards"};','const roots={pet:"consumableRewards",weapon:"consumableRewards",armor:"consumableRewards",consumable:"consumableRewards"};',"categorias da loja");
patchFinal('const art=document.createElement("div");art.className="game-item-art";art.textContent=item.emoji;card.append(art);','const art=document.createElement("div");art.className="game-item-art";const artImg=document.createElement("img");artImg.src=item.art;artImg.alt=item.name;art.append(artImg);card.append(art);',"imagem dos itens");
patchFinal('const list=[{id:"medicine",name:"Remédio",emoji:"🧪",desc:"Recupera 35 de vida."},{id:"injection",name:"Injeção Vital",emoji:"💉",desc:"Recupera toda a vida."},{id:"rope",name:"Corda",emoji:"🪢",desc:"Captura personagem amigável."},{id:"smoke",name:"Fumaça",emoji:"💨",desc:"Foge da batalha."}];','const list=[{id:"medicine",name:"Remédio",emoji:"🧪",desc:"Recupera 35 de vida."},{id:"injection",name:"Cura",emoji:"✨",desc:"Recupera toda a vida."},{id:"rope",name:"Rede de captura",emoji:"🕸️",desc:"Captura personagem amigável."},{id:"smoke",name:"Bomba de fumaça",emoji:"💨",desc:"Foge da batalha."}];',"nomes da mochila");
patchFinal('<div class="phase-cover" aria-label="Ibrahim, seu cachorro e o Guardião da Floresta na Floresta Encantada"><img class="phase-cover-ibrahim" src="assets/ibrahim_idle.png" alt="Ibrahim"><img class="phase-cover-dog" src="assets/companion_dog.png" alt="Cachorro companheiro"><img class="phase-cover-boss" src="assets/enemy_guardian.webp" alt="Guardião da Floresta"><span>FLORESTA ENCANTADA · FASE 1</span></div>','<div class="phase-cover phase-cover-faceoff" data-phase-art="faceoff" aria-label="Ibrahim e seu cachorro enfrentam o Guardião da Floresta"><img src="assets/phase1-faceoff.svg" alt="Ibrahim e seu cachorro frente a frente com o chefão da Floresta Encantada"></div>',"capa da fase");
patchFinal('<div class="battle-wallet battle-wallet-top"><div>🪙 MOEDAS<strong id="battleCoins">0</strong><small>Use na loja</small></div><div>⭐ XP DAS ATIVIDADES<strong id="battleXP">0</strong><small>Conquistado nas missões</small></div><div>💎 DIAMANTES<strong id="battleDiamonds">0</strong><small>Moeda do RPG</small></div></div>','',"painel azul de moedas");
finalApp=finalApp.replace("</head>",`<style id="rpg-art-update">.phase-cover{height:230px!important;overflow:hidden!important;background:#183e31!important}.phase-cover-faceoff img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}.game-item-art{height:112px!important;border-radius:12px;display:grid;place-items:center;background:radial-gradient(circle at 50% 25%,#385a6a,#101f31 78%)!important;border:2px solid #b89a5b!important;overflow:hidden;box-shadow:inset 0 0 14px #050e1a}.game-item-art img{width:100%;height:100%;object-fit:contain}.game-item{background:linear-gradient(145deg,#fdf8e9,#e9e0ca)!important;border:1px solid #b89a5b!important}</style></head>`);
const inlineScripts=[...finalApp.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(x=>x.trim());
for(let i=0;i<inlineScripts.length;i++){try{new Function(inlineScripts[i]);}catch(e){throw new Error("JavaScript inválido no script inline "+i+": "+e.message);}}
fs.writeFileSync(file,finalApp);
console.log("v1.39 aplicada; scripts inline validados: "+inlineScripts.length);
