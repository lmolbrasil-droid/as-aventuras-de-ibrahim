const fs = require("fs");
const file = "index.html";
let s = fs.readFileSync(file, "utf8");
function replaceOnce(oldText, newText, label) {
  if (s.includes(newText)) return;
  const count = s.split(oldText).length - 1;
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
