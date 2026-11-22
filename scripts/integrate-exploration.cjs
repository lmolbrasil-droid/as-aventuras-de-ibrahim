const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');
const anchor = '<div class="game-title"><div><span class="game-kicker">MUNDO DE IBRAHIM</span><h2>🗺️ Aventura do dia</h2></div><span class="game-badge">FASE <b id="gameStage">1</b></span></div>';
if (!s.includes(anchor)) throw new Error('Ponto de inserção da aventura não encontrado.');
if (s.includes('id="ibrahimExploreCanvas"')) throw new Error('A exploração já parece estar integrada.');
const markup = String.raw`
<button class="explore-launch" id="openExploreMode" type="button" onclick="openIbrahimExploration()"><span>🌿 EXPLORAR O MUNDO<small>Ande pela floresta e encontre criaturas!</small></span><span>➜</span></button>
<div class="explore-screen" id="ibrahimExploreScreen" hidden>
 <div class="explore-top"><b>🌳 Floresta Encantada</b><button class="explore-exit" type="button" onclick="closeIbrahimExploration()">← Voltar</button></div>
 <canvas id="ibrahimExploreCanvas" width="540" height="360" aria-label="Mapa da floresta para explorar"></canvas>
 <p class="explore-help">Use as setas para caminhar. Entre na grama alta para encontrar criaturas!</p>
 <div class="explore-pad"><span class="empty"></span><button type="button" data-move="up">▲</button><span class="empty"></span><button type="button" data-move="left">◀</button><button type="button" data-move="down">▼</button><button type="button" data-move="right">▶</button></div>
 <div class="explore-status" id="exploreStatus">A floresta está tranquila... por enquanto.</div>
</div>
<style id="exploration-mode-style">
.explore-launch{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:12px 0;padding:14px;border:0;border-radius:16px;background:linear-gradient(110deg,#176b43,#0b392e);color:#fff;font-weight:900;font-size:16px;width:100%;cursor:pointer;box-shadow:0 5px 14px #103b2c33}
.explore-launch small{display:block;font-size:11px;font-weight:600;color:#d5f5df;margin-top:3px}
.explore-screen{margin:12px 0;padding:12px;border-radius:20px;background:linear-gradient(180deg,#153f31,#0b2a24);color:#fff}
.explore-screen[hidden]{display:none!important}
.explore-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px}
.explore-top button{border:0;border-radius:10px;padding:9px 12px;font-weight:800}
#ibrahimExploreCanvas{display:block;width:100%;max-width:560px;margin:auto;border:4px solid #b9e6a4;border-radius:14px;background:#4b9b51;image-rendering:pixelated;touch-action:none}
.explore-help{text-align:center;font-size:12px;color:#d7f5d9;margin:8px 0}
.explore-pad{display:grid;grid-template-columns:repeat(3,54px);grid-template-rows:repeat(2,48px);gap:5px;justify-content:center;margin:10px auto}
.explore-pad button{border:0;border-radius:12px;background:#f2f7e9;color:#17432e;font-size:23px;font-weight:900;touch-action:none}
.explore-pad .empty{visibility:hidden}
.explore-status{text-align:center;color:#ffe58b;font-weight:800;min-height:22px;font-size:13px}
.explore-exit{background:#dcefe4!important;color:#16412b!important}
</style>`;
s = s.replace(anchor, anchor + markup);
const integration = String.raw`
<script id="ibrahim-exploration-integration">
(function(){
 'use strict';
 const canvas=document.getElementById('ibrahimExploreCanvas');if(!canvas)return;
 const ctx=canvas.getContext('2d'),screen=document.getElementById('ibrahimExploreScreen'),status=document.getElementById('exploreStatus');
 const tile=30,cols=18,rows=12,player={x:2,y:2};let active=false,encounterLock=false;
 const grass=new Set();for(let y=5;y<=9;y++)for(let x=8;x<=15;x++)if((x+y)%5!==0)grass.add(x+','+y);
 const trees=new Set();[[0,0],[1,0],[4,0],[7,0],[11,0],[15,0],[17,0],[0,3],[4,3],[6,2],[16,3],[17,5],[1,10],[4,11],[7,10],[16,10],[17,11],[10,2],[12,3]].forEach(p=>trees.add(p[0]+','+p[1]));
 function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const k=x+','+y;ctx.fillStyle=(x+y)%2?'#69ad5c':'#75b967';ctx.fillRect(x*tile,y*tile,tile,tile);if(grass.has(k)){ctx.fillStyle='#3e914b';ctx.fillRect(x*tile,y*tile,tile,tile);ctx.fillStyle='#a4d66c';for(let n=0;n<4;n++)ctx.fillRect(x*tile+5+n*6,y*tile+8+(n%2)*7,3,12);}if(trees.has(k)){ctx.fillStyle='#65442e';ctx.fillRect(x*tile+12,y*tile+15,7,14);ctx.font='25px sans-serif';ctx.fillText('🌳',x*tile+1,y*tile+22);}}ctx.font='25px sans-serif';ctx.fillText('🧒',player.x*tile+1,player.y*tile+25);ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.fillText('FLORESTA ENCANTADA',10,17);}
 function blocked(x,y){return x<0||y<0||x>=cols||y>=rows||trees.has(x+','+y);}
 function move(dir){if(!active||encounterLock)return;const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];if(!d)return;const nx=player.x+d[0],ny=player.y+d[1];if(blocked(nx,ny))return;player.x=nx;player.y=ny;draw();if(grass.has(nx+','+ny)&&Math.random()<0.22)startWildEncounter();}
 window.openIbrahimExploration=function(){active=true;screen.hidden=false;draw();status.textContent='Explore com cuidado. Há criaturas escondidas na grama!';screen.scrollIntoView({behavior:'smooth',block:'center'});};
 window.closeIbrahimExploration=function(){active=false;screen.hidden=true;};
 document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();move(b.dataset.move);}));
 window.addEventListener('keydown',e=>{if(!active)return;const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};if(m[e.key]){e.preventDefault();move(m[e.key]);}});
 function startWildEncounter(){if(encounterLock)return;encounterLock=true;ensureGame();const g=data.game;if(!g.exploration)g.exploration={};g.exploration.savedBattle=Object.prototype.hasOwnProperty.call(g.dailyBattle,todayKey)?JSON.parse(JSON.stringify(g.dailyBattle[todayKey])):null;g.exploration.hadBattle=Object.prototype.hasOwnProperty.call(g.dailyBattle,todayKey);g.exploration.inEncounter=true;const enemy=gameEnemy();g.dailyBattle[todayKey]={hp:Math.max(24,Math.round(enemy[2]*0.72)),won:false,attacks:0,exploration:true};save();renderGame();screen.hidden=true;active=false;const story=document.getElementById('gameStory');if(story)story.textContent='🌿 Um '+enemy[0]+' selvagem apareceu na grama alta! Ibrahim, prepare-se!';document.getElementById('ibrahimGame').scrollIntoView({behavior:'smooth',block:'start'});}
 window.returnFromIbrahimEncounter=function(){const g=data.game;if(!g||!g.exploration||!g.exploration.inEncounter)return;if(g.exploration.hadBattle)g.dailyBattle[todayKey]=g.exploration.savedBattle;else delete g.dailyBattle[todayKey];g.exploration.inEncounter=false;g.exploration.savedBattle=null;g.exploration.hadBattle=false;save();renderGame();encounterLock=false;window.openIbrahimExploration();status.textContent='Vitória! A trilha continua. Explore mais um pouco!';};
 draw();
})();
</script>`;
if (!s.includes('</body></html>')) throw new Error('Final do HTML não encontrado.');
s = s.replace('</body></html>', integration + '</body></html>');
const old = 'onclick="closeBattleVictory();exploreNext()">CONTINUAR A AVENTURA ➜';
const replacement = 'onclick="data.game.exploration&&data.game.exploration.inEncounter?returnFromIbrahimEncounter():(closeBattleVictory(),exploreNext())">CONTINUAR A AVENTURA ➜';
if (!s.includes(old)) throw new Error('Botão de vitória não encontrado.');
s = s.replace(old, replacement);
fs.writeFileSync(path, s);
console.log('Exploração integrada:', s.length, 'caracteres');
