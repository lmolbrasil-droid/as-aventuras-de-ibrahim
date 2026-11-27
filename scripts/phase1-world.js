(() => {
  const root=document.getElementById('ibrahimGame');
  const screen=document.getElementById('ibrahimExploreScreen');
  const toolbar=document.getElementById('worldToolbar');
  const canvas=document.getElementById('ibrahimExploreCanvas');
  const ctx=canvas.getContext('2d',{alpha:false});
  const status=document.getElementById('exploreStatus');
  const intro=document.getElementById('encounterIntro');
  const fullscreen=document.getElementById('worldFullscreen');
  const bag=document.getElementById('battleBagModal');
  const treasure=document.getElementById('forestTreasure');
  const treasureContinue=document.getElementById('treasureContinue');
  const terrain=forestTerrain;
  const directions={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  const keys={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
  const stepLength=278;
  let player,dog,step,held,queuedDirection,frameId,lastFrame=0,camera;
  let mode='',presentationTimer,resultTimer,treasureTimer,positionTimer;
  let viewWidth=0,viewHeight=0,ratio=1,pixelRatio=0,viewportDirty=true;
  const compactDisplay=matchMedia("(pointer: coarse) and (max-width: 850px)");
  compactDisplay.addEventListener("change",()=>{viewportDirty=true;});
  new ResizeObserver(()=>{viewportDirty=true;}).observe(canvas);
  const paused=()=>!bag.hidden||!treasure.hidden;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const pickDirection=(x,y)=>x<0?'left':x>0?'right':y<0?'up':'down';
  const state=()=>data.game.exploration ||= {};
  const currentBattle=()=>data.game.dailyBattle[todayKey];

  function setMode(next){
    mode=next;
    document.body.classList.toggle('world-open',!!mode);
    root.classList.toggle('world-active',!!mode);
    root.classList.toggle('exploring',mode==='map'||mode==='intro');
    root.classList.toggle('in-encounter',mode==='battle');
    root.classList.toggle('boss-encounter',mode==='battle'&&!!state().boss);
    toolbar.hidden=!mode;
    screen.hidden=mode!=='map'&&mode!=='intro';
    intro.hidden=mode!=='intro';
    root.scrollTop=0;
    viewportDirty=true;
    if(mode==='map'||mode==='intro'){
      if(!frameId){lastFrame=performance.now();frameId=requestAnimationFrame(draw);}
    }else{
      cancelAnimationFrame(frameId);frameId=0;
    }
    window.forestMusic.setMode(mode==='map'?'map':mode==='battle'?(state().boss?'boss':'wild'):'');
  }

  function valid(point){
    return point&&Number.isInteger(point.x)&&Number.isInteger(point.y)&&!terrain.blocked(point.x,point.y);
  }
  function restoreActors(){
    const saved=state();
    const point=saved.player;
    // A changed terrain may place an older save inside a tree or stream.
    const origin=Number.isFinite(point?.x)&&Number.isFinite(point?.y)
      ? {x:clamp(Math.round(point.x),0,terrain.cols-1),y:clamp(Math.round(point.y),0,terrain.rows-1)}
      : {x:2,y:2};
    let safe=origin;
    for(let radius=1;!valid(safe)&&radius<terrain.cols;radius++){
      for(const [dx,dy] of Object.values(directions)){
        const candidate={x:origin.x+dx*radius,y:origin.y+dy*radius};
        if(valid(candidate)){safe=candidate;break;}
      }
    }
    player={...(valid(safe)?safe:{x:2,y:2}),dir:directions[saved.facing]?saved.facing:'down'};
    const previous=saved.companion;
    const adjacent=valid(previous)&&Math.abs(previous.x-player.x)+Math.abs(previous.y-player.y)===1;
    const neighbor=[directions.left,directions.down,directions.right,directions.up]
      .map(([dx,dy])=>({x:player.x+dx,y:player.y+dy})).find(valid);
    dog={...(adjacent?previous:neighbor||player),dir:'down'};
    player.travel=dog.travel=0;
    step=null;
    camera=null;
  }

  function flushPosition(){
    clearTimeout(positionTimer);
    positionTimer=undefined;
    localStorage.setItem(KEY,JSON.stringify(data));
  }
  function persistPosition(immediate=true){
    const saved=state();
    saved.player={x:player.x,y:player.y};
    saved.companion={x:dog.x,y:dog.y};
    saved.facing=player.dir;
    if(immediate)flushPosition();
    else positionTimer ||= setTimeout(flushPosition,450);
  }
  window.addEventListener('pagehide',()=>{if(positionTimer)flushPosition();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&positionTimer)flushPosition();});

  function dismissTreasure(){
    if(treasure.hidden)return;
    clearTimeout(treasureTimer);
    treasure.hidden=true;
    screen.inert=toolbar.inert=false;
  }
  function presentTreasure(reward){
    held=null;queuedDirection=null;
    screen.inert=toolbar.inert=true;
    document.getElementById('treasureTitle').textContent=reward.title;
    document.getElementById('treasureArt').src=reward.art;
    document.getElementById('treasureName').textContent=reward.name;
    document.getElementById('treasureDetail').textContent=reward.detail;
    treasure.hidden=false;
    treasureContinue.focus({preventScroll:true});
    forestMusic.effect(reward.sound);
    treasureTimer=setTimeout(dismissTreasure,3000);
  }
  treasureContinue.addEventListener('click',dismissTreasure);
  treasure.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();dismissTreasure();}
    if(e.key==='Tab'){e.preventDefault();treasureContinue.focus();}
  });

  function startStep(dir,time){
    if(mode!=='map'||step||paused())return;
    const [dx,dy]=directions[dir], x=player.x+dx,y=player.y+dy;
    const from={...player};
    if(terrain.blocked(x,y)){player.dir=dir;return;}
    const dogFrom={...dog};
    step={start:time,from,dogFrom};
    dog={x:player.x,y:player.y,dir:pickDirection(player.x-dog.x,player.y-dog.y),travel:dog.travel+Math.hypot(player.x-dog.x,player.y-dog.y)*terrain.tile};
    player={x,y,dir,travel:player.travel+terrain.tile};
  }

  function arrive(){
    step=null;
    const saved=state();
    if(saved.cooldown>0)saved.cooldown--;
    const {x,y}=player;
    const reward=forestLoot.collect(x,y);
    persistPosition(!!reward);
    if(reward){
      presentTreasure(reward);
      renderShop();
      document.getElementById('coinBalance').textContent=data.coins.toLocaleString('pt-BR')+' 🪙';
      document.getElementById('diamondBalance').textContent=data.game.diamonds.toLocaleString('pt-BR')+' 💎';
      return;
    }
    const boss=terrain.arena;
    if(x===boss.x&&y===boss.y&&!saved.arborianDefeated){
      encounter(true);
    }else if(!saved.cooldown&&terrain.grass(x,y)&&Math.random()<.22){
      encounter(false);
    }else if(x===boss.x&&y===boss.y){
      status.textContent='Arborian já foi vencido. A clareira está em paz.';
    }else if(Math.abs(x-boss.x)+Math.abs(y-boss.y)<5){
      status.textContent='Clareira de Arborian';
    }
  }

  function draw(time){
    if(mode!=='map'&&mode!=='intro'){frameId=0;return;}
    const dt=Math.min(40,time-lastFrame);
    lastFrame=time;
    if(step&&time-step.start>=stepLength)arrive();
    if(!step&&queuedDirection&&!paused()){
      const next=queuedDirection;
      queuedDirection=null;
      startStep(next,time);
    }else if(!step&&held&&time>=held.next&&!paused()){
      startStep(held.dir,time);
      held.next=time+stepLength;
    }
    if(viewportDirty||pixelRatio!==devicePixelRatio){
      viewWidth=canvas.clientWidth;
      viewHeight=canvas.clientHeight;
      pixelRatio=devicePixelRatio;
      // Bound raster work on touch phones while keeping the CSS size and camera fixed.
      const surfaceBudget=compactDisplay.matches?825000:2000000;
      ratio=Math.min(pixelRatio||1,2,Math.sqrt(surfaceBudget/Math.max(1,viewWidth*viewHeight)));
      const width=Math.max(1,Math.round(viewWidth*ratio)),height=Math.max(1,Math.round(viewHeight*ratio));
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      viewportDirty=false;
    }
    const vw=viewWidth,vh=viewHeight;
    if(!vw||!vh){frameId=requestAnimationFrame(draw);return;}
    const zoom=Math.max(vw/850,vh/625, .8);
    const progress=step?clamp((time-step.start)/stepLength,0,1):1;
    const stops=!(held||queuedDirection);
    const tween=stops&&progress>.76?1-(1-progress)**2/.24:progress;
    const position=(now,from)=>({
      x:(now.x+.5+(from?(from.x-now.x)*(1-tween):0))*terrain.tile,
      y:(now.y+.5+(from?(from.y-now.y)*(1-tween):0))*terrain.tile
    });
    const p=position(player,step?.from),d=position(dog,step?.dogFrom);
    const maxX=terrain.width-vw/zoom,maxY=terrain.height-vh/zoom;
    const target={x:clamp(p.x-vw/zoom/2,0,maxX),y:clamp(p.y-vh/zoom/2,0,maxY)};
    camera ||= target;
    camera.x=clamp(camera.x+(target.x-camera.x)*(1-Math.exp(-dt/115)),0,maxX);
    camera.y=clamp(camera.y+(target.y-camera.y)*(1-Math.exp(-dt/115)),0,maxY);
    const view={...camera,right:camera.x+vw/zoom,bottom:camera.y+vh/zoom};
    function pose(actor,from){
      if(!from)return {dir:actor.dir,distance:actor.travel,weight:0};
      const turn=from.dir!==actor.dir;
      const fade=stops?Math.min(1,(1-progress)/.24):1;
      const turnWeight=turn?clamp(Math.abs(progress-.11)/.17,0,1):1;
      return {
        dir:turn&&progress<.11?from.dir:actor.dir,
        distance:from.travel+(actor.travel-from.travel)*tween,
        weight:actor.travel===from.travel?0:fade*turnWeight
      };
    }
    const heroPose=pose(player,step?.from),dogPose=pose(dog,step?.dogFrom);
    ctx.setTransform(zoom*ratio,0,0,zoom*ratio,-camera.x*zoom*ratio,-camera.y*zoom*ratio);
    terrain.draw(ctx,view,[
      ...forestLoot.actors(ctx,time,view),
      {...d,draw:()=>forestSprites.draw(ctx,'dog',d.x,d.y,dogPose.dir,dogPose)},
      {...p,draw:()=>forestSprites.draw(ctx,'hero',p.x,p.y,heroPose.dir,heroPose)}
    ],time);
    frameId=requestAnimationFrame(draw);
  }

  function open(){
    ensureGame();
    if(state().inEncounter)return;
    restoreActors();
    status.textContent='Siga as pontes até a clareira de Arborian.';
    window.forestMusic.unlock();
    setMode('map');
  }
  function close(){
    if(mode!=='map')return;
    if(!treasure.hidden)return;
    if(!bag.hidden){closeBattleBag();return;}
    if(step){player=step.from;dog=step.dogFrom;step=null;}
    held=null;
    queuedDirection=null;
    if(positionTimer)flushPosition();
    if(document.fullscreenElement===root)document.exitFullscreen().catch(()=>{});
    setMode('');
  }

  function encounter(boss){
    const saved=state(), enemy=forestEnemies[boss?'guardian':'ogre'];
    const battles=data.game.dailyBattle;
    saved.boss=boss;
    saved.inEncounter=true;
    saved.activeEnemy=enemy;
    saved.battleDate=todayKey;
    saved.hadBattle=Object.hasOwn(battles,todayKey);
    saved.savedBattle=battles[todayKey]||null;
    battles[todayKey]={stage:data.game.stage,hp:enemy[2],won:false,escaped:false,attacks:0,
      doubleUsed:false,rewardClaimed:false,chestOpened:false,captureAvailable:!boss,guardActive:false,exploration:true};
    if(data.game.combat.hp<=0)data.game.combat.hp=data.game.combat.maxHp;
    persistPosition();
    held=null;
    queuedDirection=null;
    intro.querySelector('img').src=enemyArt(enemy);
    intro.querySelector('strong').textContent=enemy[0];
    setMode('intro');
    refreshForestBattle();
    window.forestMusic.encounter(boss);
    presentationTimer=setTimeout(showBattle,2450);
  }
  function showBattle(){
    setMode('battle');
    setHeroPose(currentBattle().won?'victory':'idle',0);
    setEnemyPose(currentBattle().won?'defeated':'idle',0);
    document.getElementById('gameStory').textContent='Escolha seu próximo movimento.';
    refreshForestBattle();
    const battle=currentBattle();
    if(battle.won||data.game.combat.hp<=0)resolveBattle(battle);
    else if(battle.escaped)returnFromIbrahimEncounter();
    else window.resumeForestTurn();
  }
  function resolveBattle(battle){
    clearTimeout(resultTimer);
    const firstCelebration=battle.won&&!Number.isFinite(battle.celebrateUntil);
    const ogreWon=battle.won&&!state().boss;
    if(firstCelebration){
      const delay=ogreWon?3600:700;
      battle.celebrateUntil=Date.now()+delay+5000;
      if(ogreWon)battle.ogreFallUntil=Date.now()+delay;
      if(state().boss)state().arborianDefeated=true;
      save();
    }
    const fallRemaining=Math.max(0,(battle.ogreFallUntil||0)-Date.now());
    if(fallRemaining)root.classList.add('ogre-fallen');
    const delay=battle.won?(ogreWon?fallRemaining:firstCelebration?700:0):520;
    resultTimer=setTimeout(()=>{
      if(mode!=='battle'||currentBattle()!==battle)return;
      if(battle.won)showBattleVictory(gameEnemy());
      else showDefeatScreen();
    },delay);
  }
  function returnToMap(){
    const saved=state();
    if(!saved.inEncounter)return;
    clearTimeout(presentationTimer);
    clearTimeout(resultTimer);
    root.classList.remove("ogre-fallen");
    closeBattleVictory();
    closeBattleBag();
    document.getElementById('battleDefeat')?.remove();
    if(saved.hadBattle&&saved.savedBattle)data.game.dailyBattle[todayKey]=saved.savedBattle;
    else delete data.game.dailyBattle[todayKey];
    Object.assign(saved,{inEncounter:false,activeEnemy:null,boss:false,savedBattle:null,hadBattle:false,cooldown:7});
    const combat=data.game.combat;
    combat.guard=0;
    if(combat.hp<=0)combat.hp=combat.maxHp;
    persistPosition();
    open();
    status.textContent='A trilha continua. Explore um pouco antes do próximo encontro.';
  }

  function press(dir,token){
    if(mode!=='map'||paused())return;
    const now=performance.now();
    held={dir,token,next:now+250};
    if(step)queuedDirection=dir;
    else startStep(dir,now);
  }
  function release(token){if(held?.token===token)held=null;}
  for(const button of screen.querySelectorAll('[data-move]')){
    button.addEventListener('pointerdown',e=>{
      e.preventDefault();
      button.setPointerCapture(e.pointerId);
      press(button.dataset.move,e.pointerId);
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture']){
      button.addEventListener(type,e=>release(e.pointerId));
    }
    button.addEventListener('click',e=>{
      if(e.detail===0)startStep(button.dataset.move,performance.now());
    });
  }
  window.addEventListener('keydown',e=>{
    if(mode!=='map'||paused()||!keys[e.key]||e.altKey||e.ctrlKey||e.metaKey)return;
    e.preventDefault();
    if(!e.repeat)press(keys[e.key],e.key);
  });
  window.addEventListener('keyup',e=>release(e.key));
  window.addEventListener('blur',()=>{held=null;queuedDirection=null;});

  fullscreen.hidden=!root.requestFullscreen||!document.fullscreenEnabled;
  fullscreen.addEventListener('click',()=>{
    const action=document.fullscreenElement===root?document.exitFullscreen():root.requestFullscreen();
    action.catch(()=>{});
  });
  document.addEventListener('fullscreenchange',()=>{
    viewportDirty=true;
    fullscreen.setAttribute('aria-pressed',String(document.fullscreenElement===root));
  });
  window.openIbrahimExploration=open;
  window.closeIbrahimExploration=close;
  window.returnFromIbrahimEncounter=returnToMap;
  window.forestWorld={
    get fighting(){return mode==='battle';},
    get walking(){return mode==='map';},
    openBag(){
      if(mode!=='map'||paused())return;
      if(step){player=step.from;dog=step.dogFrom;step=null;}
      held=null;queuedDirection=null;
      window.openMapBag();
    },
    resolveBattle
  };

  ensureGame();
  const saved=state();
  if(saved.inEncounter){
    const battles=data.game.dailyBattle;
    const previous=saved.battleDate||Object.keys(battles).reverse().find(date=>battles[date]?.exploration);
    if(previous&&previous!==todayKey){
      const resumed=battles[previous];
      if(saved.hadBattle&&saved.savedBattle)battles[previous]=saved.savedBattle;
      else delete battles[previous];
      saved.hadBattle=Object.hasOwn(battles,todayKey);
      saved.savedBattle=battles[todayKey]||null;
      if(resumed)battles[todayKey]=resumed;
    }
    if(!currentBattle()?.exploration){
      const enemy=gameEnemy();
      saved.hadBattle=Object.hasOwn(battles,todayKey);
      saved.savedBattle=battles[todayKey]||null;
      battles[todayKey]={stage:data.game.stage,hp:enemy[2],exploration:true,captureAvailable:!saved.boss};
    }
    saved.battleDate=todayKey;
    restoreActors();
    persistPosition();
    showBattle();
  }
})();
