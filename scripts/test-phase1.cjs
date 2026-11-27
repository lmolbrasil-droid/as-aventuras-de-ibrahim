/*
 * Chromium smoke/regression checks against a running static server.
 * Requires Playwright and Chromium. Optional BASE_URL, CHROMIUM_PATH, SCREENSHOTS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium, devices} = require('playwright');
const url = process.env.BASE_URL || 'http://127.0.0.1:8321';
const screenshots = process.env.SCREENSHOTS;
const legacyDay = '2024-01-02';
const legacyBattle = {stage:1,hp:13,attacks:1};
const saveKey = 'minhaAventuraKids_v1';

async function snapshot(page, name) {
  if(screenshots){
    fs.mkdirSync(screenshots,{recursive:true});
    const region={capa:'[data-phase-art]',loja:'#shopView'}[name];
    const target=region?page.locator(region):page;
    await target.screenshot({path:path.join(screenshots,name+'.png')});
  }
}
async function visible(page, selector){
  await page.locator(selector).waitFor({state:'visible',timeout:6000});
}
async function hidden(page, selector){
  await page.locator(selector).waitFor({state:'hidden',timeout:6000});
}
async function waitAsset(page, filename){
  await page.waitForFunction(name=>{
    const img=document.querySelector('#enemySprite');
    return img.src.endsWith(name)&&img.complete&&img.naturalWidth>0;
  },filename,{timeout:6000});
}
async function audioSignature(page){
  await page.waitForFunction(()=>{
    const analyser=window.scoreAnalyser;
    if(!analyser)return false;
    const bytes=new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(bytes);
    return bytes.some(v=>v>15);
  },null,{timeout:6000});
  return page.evaluate(async()=>{
    const analyser=window.scoreAnalyser,bins=new Uint8Array(analyser.frequencyBinCount),signature=new Array(12).fill(0);
    for(let i=0;i<8;i++){
      analyser.getByteFrequencyData(bins);
      bins.slice(0,192).forEach((v,index)=>{signature[index>>4]+=v;});
      await new Promise(resolve=>setTimeout(resolve,75));
    }
    return signature;
  });
}
async function position(page){
  return page.evaluate(()=>data.game.exploration.player);
}
async function roundTrip(page, move){
  const end=await position(page);
  assert.deepEqual(end,{x:move.x,y:move.y});
  const companion=await page.evaluate(()=>data.game.exploration.companion);
  assert.deepEqual(companion,move.from);
}
async function route(page, target){
  const moves=await page.evaluate(({target})=>{
    const start=data.game.exploration.player||{x:2,y:2};
    const queue=[{...start,path:[]}], seen=new Set([start.x+','+start.y]);
    for(let i=0;i<queue.length;i++){
      const item=queue[i], {x,y}=item;
      if(target==='grass'?forestTerrain.grass(x,y):x===target.x&&y===target.y)return item.path;
      for(const [key,dx,dy] of [['ArrowRight',1,0],['ArrowDown',0,1],['ArrowUp',0,-1],['ArrowLeft',-1,0]]){
        const nx=x+dx,ny=y+dy,tag=nx+','+ny;
        if(seen.has(tag)||forestTerrain.blocked(nx,ny))continue;
        seen.add(tag);
        queue.push({x:nx,y:ny,path:[...item.path,{key,x:nx,y:ny,from:{x,y}}]});
      }
    }
    return null;
  },{target});
  assert.ok(moves,'destino alcançável');
  for(const move of moves){
    await page.keyboard.press(move.key);
    await page.waitForFunction(({x,y})=>data.game.exploration.player?.x===x&&data.game.exploration.player?.y===y,
      move,{timeout:2000});
    await roundTrip(page,move);
    if(await page.locator('#forestTreasure').isVisible())await page.locator('#treasureContinue').click();
  }
}
async function openIntro(page, name, filename, trigger){
  await trigger();
  await visible(page,'#encounterIntro');
  const start=Date.now();
  assert.match(await page.locator('#encounterIntro strong').textContent(),name);
  assert.equal(await page.locator('#encounterIntro img').getAttribute('src'),'assets/'+filename);
  assert.equal(await page.locator('#attackBtn').isDisabled(),true);
  await snapshot(page,name.source.includes('Arborian')?'arborian-apresentacao':'ogro-apresentacao');
  await hidden(page,'#encounterIntro');
  assert.ok(Date.now()-start>=2050);
  await waitAsset(page,filename);
  assert.equal(await page.locator('.battle-menu button:visible').count(),4);
}
async function run(){
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--autoplay-policy=user-gesture-required']});
  try {
    const context=await browser.newContext({...devices['Pixel 7'],defaultBrowserType:undefined});
    const errors=[], badResponses=[], forbiddenArt=[];

    await context.route(/\/assets\/enemy_guardian\.(svg|webp)$/,request=>{
      forbiddenArt.push(request.request().url());return request.abort();
    });
    await context.addInitScript(({saveKey,legacyDay,legacyBattle})=>{
      if(!localStorage.getItem(saveKey)){
        localStorage.setItem(saveKey,JSON.stringify({
          days:{[legacyDay]:[0,1]},coins:95,coinLedger:[{text:'Saldo anterior',amount:95,date:'2024-01-02'}],
          daySnapshots:{[legacyDay]:{xp:20,rank:'Anterior'}},
          rewards:[{id:'chocolate',name:'Chocolate pequeno',price:30,category:'quick'}],
          game:{stage:1,diamonds:12,wonStages:[1],owned:['ironSword'],inventory:{medicine:2,rope:0,injection:1,smoke:1},
            combat:{hp:50,maxHp:120,guard:0},exploration:{player:{x:2,y:2}},
            dailyBattle:{[legacyDay]:legacyBattle}}
        }));
      }
      AudioParam.prototype.cancelAndHoldAtTime=undefined;
      const connect=AudioNode.prototype.connect;
      AudioNode.prototype.connect=function(destination,...args){
        if(!window.scoreAnalyser && this instanceof DynamicsCompressorNode && destination===this.context.destination){
          const analyser=this.context.createAnalyser();
          analyser.fftSize=2048;
          connect.call(this,analyser);
          window.scoreAnalyser=analyser;
        }
        return connect.call(this,destination,...args);
      };
      const startNoise=AudioBufferSourceNode.prototype.start;
      window.strikeAudio=[];
      AudioBufferSourceNode.prototype.start=function(...args){
        const phase=document.getElementById('battleScene')?.dataset.normalStrike;
        if(phase&&this.buffer?.duration===3&&args[2])strikeAudio.push([phase,args[1],args[2]]);
        return startNoise.apply(this,args);
      };
      const random=Math.random;
      Math.random=()=>typeof window.dice==='number'?window.dice:random();
    },{saveKey,legacyDay,legacyBattle});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.stack));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('response',r=>{if(r.status()>=400)badResponses.push(r.status()+' '+r.url());});
    await page.goto(url);
    await page.locator('#appLaunchSplash.done').waitFor();
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    assert.equal(await page.locator("#appRevision").textContent(),"Revisão 10");
    assert.equal(await page.evaluate(()=>document.querySelector('[data-phase-art] img').naturalWidth),1671);
    const old=await page.evaluate(day=>({
      coins:data.coins, diamonds:data.game.diamonds, days:data.days[day], battle:data.game.dailyBattle[day],
      xp:data.daySnapshots[day].xp, ledger:data.coinLedger[0].text,
      owned:data.game.owned, won:data.game.wonStages, rewardPrice:data.rewards[0].price
    }),legacyDay);
    assert.deepEqual(old,{coins:95,diamonds:12,days:[0,1],battle:legacyBattle,xp:20,ledger:'Saldo anterior',
      owned:['ironSword'],won:[1],rewardPrice:30});
    console.log('Inicialização, capa local, registro automático e preservação de dados antigos.');
    await snapshot(page,'capa');
    await page.locator('#shopLauncher').tap();
    await visible(page,'#shopView');
    assert.deepEqual(await page.locator('.game-item strong').allTextContents(),
      ['Remédio','Cura','Bomba de fumaça','Doce do Sono']);
    assert.deepEqual(await page.locator('.game-item img').evaluateAll(imgs=>imgs.map(i=>i.naturalWidth>0)),
      [true,true,true,true]);
    await snapshot(page,'loja');
    await page.locator('.game-item').first().getByRole('button').tap();
    assert.deepEqual(await page.evaluate(()=>[data.coins,data.game.inventory.medicine]),[77,3]);
    await page.locator('.game-item').last().getByRole('button').tap();
    assert.deepEqual(await page.evaluate(()=>[data.coins,data.game.inventory.sleepCandy]),[42,1]);
    await page.locator('.shop-back').tap();
    await page.locator('#openExploreMode').tap();
    await visible(page,'#ibrahimExploreCanvas');
    const mapAudio=await audioSignature(page);
    console.log('Loja com quatro itens, compra de Remédio e Doce do Sono, e sinal de áudio no mapa.');
    await snapshot(page,'exploracao');
    await page.evaluate(()=>scoreAnalyser.context.suspend());
    await page.locator('#mapBagBtn').tap();
    await audioSignature(page);
    await visible(page,'#battleBagModal');
    const beforeBag=await position(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250);
    assert.deepEqual(await position(page),beforeBag);
    assert.ok(await page.getByRole('button',{name:'Usar Doce do Sono'}).isDisabled());
    await snapshot(page,'mochila-antes-da-cura');
    await page.getByRole('button',{name:'Usar Remédio'}).tap();
    assert.equal(await page.evaluate(()=>data.game.combat.hp),85);
    assert.equal(await page.locator('#bagHealth').getAttribute('aria-valuenow'),'85');
    await page.getByRole('button',{name:'Usar Cura',exact:true}).tap();
    assert.equal(await page.evaluate(()=>data.game.combat.hp),120);
    await snapshot(page,'mochila-mapa');
    await page.getByRole('button',{name:'Fechar mochila'}).tap();
    await hidden(page,'#battleBagModal');
    const bounds=await page.locator('#ibrahimGame').boundingBox();
    assert.equal(bounds.height,devices['Pixel 7'].viewport.height);
    await page.locator('[data-move=right]').tap();
    await page.waitForFunction(()=>data.game.exploration.player?.x===3);
    await roundTrip(page,{x:3,y:2,from:{x:2,y:2}});
    const atlas=await page.evaluate(()=>{
      const c=document.createElement('canvas');c.width=100;c.height=100;
      const ctx=c.getContext('2d');
      return ['hero','dog'].map(name=>['up','down','left','right'].map(dir=>{
        const frames=Array.from({length:name==="hero"?8:7},(_,i)=>{
          ctx.clearRect(0,0,100,100);forestSprites.draw(ctx,name,50,75,dir,{distance:i*80/(name==="hero"?8:7)+.5,weight:1});
          return c.toDataURL();
        });
        return new Set(frames).size;
      }));
    });
    assert.ok(atlas.every((dirs,index)=>dirs.every(n=>n===(index?7:8))));
    const obstacle=await page.evaluate(()=>{
      const start=data.game.exploration.player;
      const directions=[['ArrowUp',0,-1],['ArrowLeft',-1,0],['ArrowDown',0,1],['ArrowRight',1,0]];
      const queue=[start],seen=new Set();
      for(const {x,y} of queue){
        for(const [key,dx,dy] of directions){
          const nx=x+dx,ny=y+dy,id=nx+','+ny;
          if(forestTerrain.blocked(nx,ny))return {x,y,key};
          if(!seen.has(id)){seen.add(id);queue.push({x:nx,y:ny});}
        }
      }
    });
    await route(page,obstacle);
    await page.keyboard.press(obstacle.key);
    await page.waitForTimeout(225);
    assert.deepEqual(await position(page),{x:obstacle.x,y:obstacle.y});
    console.log('Controle por toque, colisão, rastro do cachorro e quadros nas quatro direções.');

    assert.deepEqual(await page.evaluate(()=>{
      const seen=new Set(['2,2']),front=[[2,2]];
      for(const [x,y] of front){
        for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]){
          const key=(x+dx)+','+(y+dy);
          if(seen.has(key)||forestTerrain.blocked(x+dx,y+dy))continue;
          seen.add(key);front.push([x+dx,y+dy]);
        }
      }
      return forestLoot.drops.filter(({x,y})=>!seen.has(x+','+y)).map(d=>d.id);
    }),[]);
    await route(page,{x:4,y:9});
    assert.equal(await page.evaluate(()=>data.coins),51);
    assert.equal(await page.evaluate(()=>data.game.exploration.collected['west-coins']),true);
    await page.reload();
    await page.locator('#openExploreMode').tap();
    await route(page,{x:4,y:8});
    await route(page,{x:4,y:9});
    assert.equal(await page.evaluate(()=>data.coins),51);
    console.log('Mochila no mapa, retomada do áudio após suspensão e coletas acessíveis sem duplicação.');

    await page.evaluate(()=>{window.dice=0;});
    const randomRoute=route(page,'grass');
    await openIntro(page,/Ogro/, 'ogre-r8/idle.webp',()=>randomRoute);
    const ogreAudio=await audioSignature(page);
    assert.notDeepEqual(mapAudio,ogreAudio);
    const encounter=await position(page);
    await visible(page,'#worldMusic');
    await snapshot(page,'combate-ogro');
    await page.locator('#defendBtn').tap();
    await waitAsset(page,'ogre-r8/attack.webp');
    await page.waitForFunction(()=>!document.getElementById('attackBtn').disabled);
    assert.equal(await page.evaluate(()=>data.game.combat.hp),116);
    await page.locator('#bagBtn').tap();
    await visible(page,'#battleBagModal');
    await page.locator('#battleBagItems .bag-item').first().getByRole('button').tap();
    await page.waitForFunction(()=>!document.getElementById('attackBtn').disabled);
    assert.ok((await page.evaluate(()=>data.game.inventory.medicine))>=1);
    const strikeAt=await page.evaluate(()=>{
      window.ogreTrace=[];
      window.ogreAudio=[];
      window.strikeTrace=[];
      const stage=document.querySelector('#battleScene');
      new MutationObserver(()=>{
        if(stage.dataset.normalStrike)strikeTrace.push([stage.dataset.normalStrike,performance.now(),data.game.dailyBattle[todayKey].hp]);
        if(stage.dataset.ogreStrike)ogreTrace.push([stage.dataset.ogreStrike,performance.now(),data.game.combat.hp]);
      }).observe(stage,{attributeFilter:['data-normal-strike','data-ogre-strike']});
      const startNoise=AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start=function(...args){
        if(stage.dataset.ogreStrike&&[.55,.4,.29].some(seconds=>Math.abs(seconds-args[2])<.0001)){
          ogreAudio.push([stage.dataset.ogreStrike,Number(args[2].toFixed(2))]);
        }
        return startNoise.apply(this,args);
      };
      return performance.now();
    });
    await page.locator('#attackBtn').tap();
    assert.ok(await page.locator('#doubleBtn').isDisabled());
    await page.evaluate(()=>attackGuardian()); // An attempted duplicate while locked.
    await waitAsset(page,'ogre-r8/hurt.webp');
    await snapshot(page,'impacto-ogro');
    const afterNormal=await page.evaluate(()=>data.game.dailyBattle[todayKey].hp);
    assert.equal(afterNormal,16);
    await page.waitForFunction(()=>!document.getElementById('doubleBtn').disabled);
    const ogre=await page.evaluate(()=>ogreTrace);
    assert.deepEqual(ogre.map(beat=>beat[0]),['regroup','prepare','swing','impact','return','settle']);
    assert.ok(ogre[1][1]-ogre[0][1]>=470);
    assert.ok(ogre[3][1]-ogre[1][1]>=950);
    assert.equal(ogre[2][2]-ogre[3][2],10);
    assert.ok(ogre[5][1]-ogre[1][1]>=2250);
    assert.deepEqual(await page.evaluate(()=>ogreAudio),[['prepare',.55],['swing',.4],['impact',.29]]);
    const strikeTrace=await page.evaluate(()=>strikeTrace);
    assert.deepEqual(strikeTrace.map(beat=>beat[0]),['prepare','swing','impact','recover']);
    assert.deepEqual(strikeTrace.map(beat=>beat[2]),[32,32,16,16]);
    assert.ok(strikeTrace[2][1]-strikeTrace[0][1]>=1100);
    assert.ok(strikeTrace[3][1]-strikeAt>=1700);
    assert.deepEqual(await page.evaluate(()=>strikeAudio),[['prepare',0,.70],['swing',.75,.43],['impact',1.25,.43],['impact',1.76,.72]]);
    await page.locator('#bagBtn').tap();
    await page.getByRole('button',{name:'Usar Doce do Sono'}).tap();
    await page.waitForFunction(()=>data.game.dailyBattle[todayKey].sleepTurns===2&&!document.querySelector('#defendBtn').disabled);
    const health=await page.evaluate(()=>data.game.combat.hp);
    await page.locator('#defendBtn').tap();
    await page.waitForFunction(()=>data.game.dailyBattle[todayKey].sleepTurns===1&&!document.querySelector('#defendBtn').disabled);
    await page.locator('#defendBtn').tap();
    await page.waitForFunction(()=>data.game.dailyBattle[todayKey].sleepTurns===0&&!document.querySelector('#defendBtn').disabled);
    assert.equal(await page.evaluate(()=>data.game.combat.hp),health);
    assert.match(await page.locator('#gameStory').textContent(),/despertou/);
    await page.locator('#doubleBtn').tap();
    await page.waitForFunction(()=>document.querySelector('#forestImpact').dataset.cue==='slash');
    await page.waitForFunction(()=>document.querySelector('#forestImpact').dataset.cue==='companion');
    await waitAsset(page,'ogre-r8/fallen.webp');
    await visible(page,'#battleVictory');
    await audioSignature(page);
    await snapshot(page,'vitoria-ogro');
    assert.equal(await page.evaluate(()=>ogreTrace.filter(([phase])=>phase==='prepare').length),1);
    assert.ok(await page.locator('#victoryContinue').isDisabled());
    await page.waitForFunction(()=>!document.querySelector('#victoryContinue').disabled);
    assert.equal(await page.evaluate(()=>data.game.diamonds),14);
    await page.reload();
    await visible(page,'#battleVictory');
    assert.equal(await page.evaluate(()=>data.game.diamonds),14);
    await page.locator('#victoryContinue').tap();
    await visible(page,'#ibrahimExploreCanvas');
    assert.deepEqual(await position(page),encounter);
    assert.deepEqual(await page.evaluate(()=>[data.game.diamonds,data.game.exploration.cooldown]),[14,7]);
    console.log('Defesa, impacto normal e dois impactos do ataque duplo, sono e vitória sem prêmio duplicado.');

    await page.evaluate(()=>{window.dice=.99;});
    await route(page,{x:11,y:11});
    assert.ok(await page.evaluate(()=>data.game.inventory.sleepCandy>=1));
    await route(page,{x:22,y:23});
    await snapshot(page,'ponte');
    await route(page,{x:33,y:24});
    await snapshot(page,'clareira-arborian');
    await openIntro(page,/Arborian/, 'poses-r8-aprovadas/arborian/idle.webp',()=>page.keyboard.press('ArrowRight'));
    const bossAudio=await audioSignature(page);
    assert.notDeepEqual(bossAudio,mapAudio);
    assert.notDeepEqual(bossAudio,ogreAudio);
    await snapshot(page,'combate-arborian');
    await page.locator('#attackBtn').tap();
    await waitAsset(page,'poses-r8-aprovadas/arborian/hurt.webp');
    await snapshot(page,'impacto-arborian');
    await page.waitForFunction(()=>!document.querySelector('#defendBtn').disabled);
    assert.ok(await page.evaluate(()=>data.game.dailyBattle[todayKey].hp<40));

    await page.locator('#bagBtn').tap();
    await page.getByRole('button',{name:'Usar Doce do Sono'}).tap();
    await page.waitForFunction(()=>data.game.dailyBattle[todayKey].sleepTurns===2&&!document.querySelector('#defendBtn').disabled);
    await snapshot(page,'arborian-adormecido');
    const bossHP=await page.evaluate(()=>data.game.combat.hp);
    for(const remaining of [1,0]){
      await page.locator('#defendBtn').tap();
      await page.waitForFunction(n=>data.game.dailyBattle[todayKey].sleepTurns===n&&!document.querySelector('#defendBtn').disabled,remaining);
    }
    assert.equal(await page.evaluate(()=>data.game.combat.hp),bossHP);
    await page.locator('#defendBtn').tap();
    await waitAsset(page,'poses-r8-aprovadas/arborian/attack.webp');
    await page.waitForFunction(()=>document.querySelector('#forestImpact').dataset.guard==='on');
    await snapshot(page,'defesa-arborian');
    await page.waitForFunction(()=>!document.querySelector('#doubleBtn').disabled);
    await page.locator('#doubleBtn').tap();
    await visible(page,'.boss-fallen');
    const fall=Date.now();
    await waitAsset(page,'poses-r8-aprovadas/arborian/defeated.webp');
    assert.equal(await page.locator('#attackBtn').isDisabled(),true);
    assert.equal(await page.locator('#battleVictory').count(),0);
    await visible(page,'.boss-reveal');
    const reveal=Date.now();
    assert.ok(reveal-fall>=3500);
    await visible(page,'#battleVictory.boss-victory');
    assert.ok(Date.now()-reveal>=1650);
    assert.equal(await page.locator('#battleVictory h2').textContent(),'FASE CONCLUÍDA!');
    assert.equal(await page.locator('#battleVictory h3').textContent(),'RECOMPENSA ESPECIAL');
    assert.ok(await page.locator('#victoryContinue').isDisabled());
    await page.locator('#openChestBtn').tap();
    assert.ok(await page.locator('#openChestBtn').isDisabled());
    assert.doesNotMatch(await page.locator('#chestResult').textContent(),/undefined/);
    await snapshot(page,'vitoria-arborian');
    await page.locator('#victoryContinue').tap();
    await visible(page,'#ibrahimExploreCanvas');
    assert.deepEqual(await position(page),{x:34,y:24});
    assert.deepEqual(await page.evaluate(()=>[data.game.diamonds,data.game.exploration.arborianDefeated]),[16,true]);
    console.log('Rota atravessável até a arena, Arborian oficial, baú e três assinaturas de áudio distintas.');

    await page.locator('#worldMusic').tap();
    assert.equal(await page.locator('#worldMusic').getAttribute('aria-pressed'),'false');
    await page.waitForFunction(()=>{
      const a=window.scoreAnalyser;if(!a)return false;
      const data=new Uint8Array(a.frequencyBinCount);a.getByteFrequencyData(data);return data.every(v=>v<6);
    });
    assert.ok(await page.evaluate(async()=>{
      const cache=await caches.open('ibrahim-v158-phase1-r10');
      return !!(await cache.match('./index.html'))&&!!(await cache.match('./scripts/phase1-world.js?v=10'));
    }));
    const manifest=await context.request.get(url+'/manifest-v143.webmanifest');
    assert.equal(manifest.status(),200);
    assert.ok((await manifest.json()).icons.length>=2);
    await context.setOffline(true);
    await page.reload();
    await page.locator('#appLaunchSplash.done').waitFor();
    assert.equal(await page.evaluate(()=>document.querySelector('[data-phase-art] img').naturalWidth),1671);
    await page.locator('#openExploreMode').tap();
    assert.equal(await page.locator('#worldMusic').getAttribute('aria-pressed'),'false');
    await page.locator('#worldMusic').tap();
    await audioSignature(page);
    assert.deepEqual(await position(page),{x:34,y:24});
    await page.locator('.explore-exit').tap();
    await page.locator('#shopLauncher').tap();
    assert.equal(await page.locator('.game-item').count(),4);
    assert.deepEqual(errors,[]);
    assert.deepEqual(badResponses,[]);
    assert.deepEqual(forbiddenArt,[]);
    console.log('Cache versionado, manifesto e jogo offline, sem erros no console.');
    await context.close();

    // Exercise inventory effects with older saves already in a wild encounter.
    for(const effect of ['Cura','Bomba de fumaça']){
      const itemContext=await browser.newContext();
      await itemContext.addInitScript(({saveKey,legacyDay,legacyBattle})=>{
        if(localStorage.getItem(saveKey))return;
        localStorage.setItem(saveKey,JSON.stringify({days:{},game:{
          stage:1,inventory:{medicine:0,injection:1,rope:1,smoke:1},
          combat:{hp:72,maxHp:120,guard:0},
          exploration:{inEncounter:true,boss:false,player:{x:6,y:8},battleDate:legacyDay},
          dailyBattle:{[legacyDay]:{...legacyBattle,exploration:true,captureAvailable:true}}
        }}));
      },{saveKey,legacyDay,legacyBattle});
      const itemPage=await itemContext.newPage();
      await itemPage.goto(url);
      await waitAsset(itemPage,'ogre-r8/idle.webp');
      await itemPage.locator('#bagBtn').click();
      assert.equal(await itemPage.getByRole('button',{name:'Usar Rede de captura'}).count(),0);
      assert.equal(await itemPage.evaluate(()=>forestLoot.drops.some(drop=>drop.id==='river-net')),false);
      const item=itemPage.locator('.bag-item').filter({hasText:effect});
      await item.getByRole('button').click();
      if(effect==='Cura'){
        await itemPage.waitForFunction(()=>!document.querySelector('#attackBtn').disabled);
        const [quantity,hp]=await itemPage.evaluate(()=>[data.game.inventory.injection,data.game.combat.hp]);
        assert.equal(quantity,0);
        assert.ok(hp>=102&&hp<=110,'vida restaurada antes do contra-ataque');
      }else{
        await visible(itemPage,'#ibrahimExploreCanvas');
        assert.deepEqual(await position(itemPage),{x:6,y:8});
        assert.equal(await itemPage.evaluate(()=>data.game.inventory.smoke),0);
      }
      assert.equal(await itemPage.evaluate(()=>JSON.parse(localStorage.getItem(KEY)).game.inventory.rope),1);
      await itemContext.close();
    }
    console.log('Retomada de encontros antigos, Cura, Bomba de fumaça e preservação da rede em inventário legado.');

    const desktop=await browser.newPage();
    await desktop.addInitScript(({saveKey})=>{
      if(!localStorage.getItem(saveKey))localStorage.setItem(saveKey,JSON.stringify({
        days:{},game:{exploration:{player:{x:33,y:24}},combat:{hp:1,maxHp:120,guard:0}}
      }));
    },{saveKey});
    await desktop.goto(url);
    await desktop.locator('#openExploreMode').click();
    await desktop.locator('#worldFullscreen').click();
    await desktop.waitForFunction(()=>document.fullscreenElement?.id==='ibrahimGame');
    await openIntro(desktop,/Arborian/,'poses-r8-aprovadas/arborian/idle.webp',()=>desktop.keyboard.press('ArrowRight'));
    assert.equal(await desktop.evaluate(()=>document.fullscreenElement?.id),'ibrahimGame');
    await desktop.locator('#defendBtn').click();
    await visible(desktop,'#battleDefeat');
    await snapshot(desktop,'derrota');
    await desktop.getByRole('button',{name:'VOLTAR À TRILHA'}).click();
    await visible(desktop,'#ibrahimExploreCanvas');
    assert.deepEqual(await position(desktop),{x:34,y:24});
    assert.equal(await desktop.evaluate(()=>document.fullscreenElement?.id),'ibrahimGame');
    await desktop.locator('.explore-exit').click();
    await desktop.waitForFunction(()=>!document.fullscreenElement);
    console.log('Tela cheia nativa preservada durante combate, derrota e retorno.');
  } finally {
    await browser.close();
  }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
