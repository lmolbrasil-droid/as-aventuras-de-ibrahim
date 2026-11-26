/*
 * Chromium smoke/regression checks against a running static server.
 * Requires Playwright and Chromium. Optional BASE_URL, CHROMIUM_PATH, SCREENSHOTS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium, devices} = require('playwright');
const url = process.env.BASE_URL || 'http://127.0.0.1:8000';
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
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
  try {
    const context=await browser.newContext({...devices['iPhone 13'],defaultBrowserType:undefined});
    const errors=[], badResponses=[], forbiddenArt=[];
    let goAt;
    await context.route('**/assets/enemy_guardian.svg',request=>{
      forbiddenArt.push(request.request().url());return request.abort();
    });
    await context.addInitScript(({saveKey,legacyDay,legacyBattle})=>{
      if(!localStorage.getItem(saveKey)){
        localStorage.setItem(saveKey,JSON.stringify({
          days:{[legacyDay]:[0,1]},coins:95,coinLedger:[{text:'Saldo anterior',amount:95,date:'2024-01-02'}],
          daySnapshots:{[legacyDay]:{xp:20,rank:'Anterior'}},
          rewards:[{id:'chocolate',name:'Chocolate pequeno',price:30,category:'quick'}],
          game:{stage:1,diamonds:12,wonStages:[1],owned:['ironSword'],inventory:{medicine:2,rope:0,injection:0,smoke:1},
            combat:{hp:120,maxHp:120,guard:0},exploration:{player:{x:2,y:2}},
            dailyBattle:{[legacyDay]:legacyBattle}}
        }));
      }
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
      ['Remédio','Cura','Rede de captura','Bomba de fumaça']);
    assert.deepEqual(await page.locator('.game-item img').evaluateAll(imgs=>imgs.map(i=>i.naturalWidth>0)),
      [true,true,true,true]);
    await snapshot(page,'loja');
    await page.locator('.game-item').first().getByRole('button').tap();
    assert.deepEqual(await page.evaluate(()=>[data.coins,data.game.inventory.medicine]),[77,3]);
    await page.locator('.shop-back').tap();
    await page.locator('#openExploreMode').tap();
    await visible(page,'#ibrahimExploreCanvas');
    const mapAudio=await audioSignature(page);
    console.log('Loja com quatro itens, compra de Remédio e áudio da exploração.');
    await snapshot(page,'exploracao');
    const bounds=await page.locator('#ibrahimGame').boundingBox();
    assert.equal(bounds.height,devices['iPhone 13'].viewport.height);
    await page.locator('[data-move=right]').tap();
    await page.waitForFunction(()=>data.game.exploration.player?.x===3);
    await roundTrip(page,{x:3,y:2,from:{x:2,y:2}});
    const atlas=await page.evaluate(()=>{
      const c=document.createElement('canvas');c.width=100;c.height=100;
      const ctx=c.getContext('2d');
      return ['hero','dog'].map(name=>['up','down','left','right'].map(dir=>{
        const frames=Array.from({length:8},(_,i)=>{
          ctx.clearRect(0,0,100,100);forestSprites.draw(ctx,name,50,75,dir,i);
          return c.toDataURL();
        });
        return new Set(frames).size;
      }));
    });
    assert.ok(atlas.flat().every(n=>n>=6));
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

    await page.evaluate(()=>{window.dice=0;});
    const randomRoute=route(page,'grass');
    await openIntro(page,/Ogro/, 'ogre-idle.webp',()=>randomRoute);
    const ogreAudio=await audioSignature(page);
    assert.notDeepEqual(mapAudio,ogreAudio);
    const encounter=await position(page);
    await visible(page,'#worldMusic');
    await snapshot(page,'combate-ogro');
    await page.locator('#defendBtn').tap();
    await waitAsset(page,'ogre-attack.webp');
    await page.waitForFunction(()=>!document.getElementById('attackBtn').disabled);
    assert.equal(await page.evaluate(()=>data.game.combat.hp),116);
    await page.locator('#bagBtn').tap();
    await visible(page,'#battleBagModal');
    await page.locator('#battleBagItems .bag-item').first().getByRole('button').tap();
    await page.waitForFunction(()=>!document.getElementById('attackBtn').disabled);
    assert.equal(await page.evaluate(()=>data.game.inventory.medicine),2);
    await page.locator('#attackBtn').tap();
    await waitAsset(page,'ogre-hurt.webp');
    await page.waitForFunction(()=>!document.getElementById('doubleBtn').disabled);
    goAt=Date.now();
    await page.locator('#doubleBtn').tap();
    await waitAsset(page,'ogre-defeated.webp');
    await snapshot(page,'ogro-derrotado');
    await visible(page,'#ibrahimExploreCanvas');
    assert.ok(Date.now()-goAt>=1950);
    assert.deepEqual(await position(page),encounter);
    assert.deepEqual(await page.evaluate(()=>[data.game.diamonds,data.game.exploration.cooldown]),[14,7]);
    console.log('Encontro, defesa, mochila, ataque, quatro poses do Ogro, vitória e retorno com proteção.');

    await page.evaluate(()=>{window.dice=.99;});
    await route(page,{x:22,y:23});
    await snapshot(page,'ponte');
    await route(page,{x:33,y:24});
    await snapshot(page,'clareira-arborian');
    await openIntro(page,/Arborian/, 'enemy_guardian.webp',()=>page.keyboard.press('ArrowRight'));
    const bossAudio=await audioSignature(page);
    assert.notDeepEqual(bossAudio,mapAudio);
    assert.notDeepEqual(bossAudio,ogreAudio);
    await snapshot(page,'combate-arborian');
    await page.locator('#doubleBtn').tap();
    await visible(page,'#battleVictory');
    await page.locator('#openChestBtn').tap();
    assert.ok(await page.locator('#openChestBtn').isDisabled());
    await snapshot(page,'vitoria-arborian');
    await page.getByRole('button',{name:/CONTINUAR A AVENTURA/}).tap();
    await visible(page,'#ibrahimExploreCanvas');
    assert.deepEqual(await position(page),{x:34,y:24});
    assert.deepEqual(await page.evaluate(()=>[data.game.diamonds,data.game.exploration.arborianDefeated]),[16,true]);
    console.log('Rota atravessável até a arena, Arborian oficial, baú e três assinaturas de áudio distintas.');

    await page.locator('#worldMusic').tap();
    assert.equal(await page.locator('#worldMusic').getAttribute('aria-pressed'),'false');
    await page.evaluate(()=>caches.open('ibrahim-test-obsoleto'));
    await page.evaluate(async()=>{
      const registration=await navigator.serviceWorker.getRegistration();
      // A cache of a non-project app is expected to survive.
      await caches.open('outro-app');
      await registration.unregister();
    });
    await page.reload();
    await page.waitForFunction(async()=>{
      const names=await caches.keys();
      return !!navigator.serviceWorker.controller&&names.includes('ibrahim-v152-phase1-r4')&&
        names.includes('outro-app')&&!names.includes('ibrahim-test-obsoleto');
    },null,{timeout:10000});
    const manifest=await context.request.get(url+'/manifest-v143.webmanifest');
    assert.equal(manifest.status(),200);
    assert.ok((await manifest.json()).icons.length>=2);
    await context.setOffline(true);
    await page.reload();
    await page.locator('#appLaunchSplash.done').waitFor();
    assert.equal(await page.evaluate(()=>document.querySelector('[data-phase-art] img').naturalWidth),1671);
    await page.locator('#openExploreMode').tap();
    assert.equal(await page.locator('#worldMusic').getAttribute('aria-pressed'),'false');
    assert.deepEqual(await position(page),{x:34,y:24});
    await page.locator('.explore-exit').tap();
    await page.locator('#shopLauncher').tap();
    assert.equal(await page.locator('.game-item').count(),4);
    assert.deepEqual(errors,[]);
    assert.deepEqual(badResponses,[]);
    assert.deepEqual(forbiddenArt,[]);
    console.log('Atualização e limpeza do cache, manifesto e jogo offline, sem erros no console.');
    await context.close();

    // Exercise inventory effects with older saves already in a wild encounter.
    for(const effect of ['Cura','Rede de captura','Bomba de fumaça']){
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
      await waitAsset(itemPage,'ogre-idle.webp');
      await itemPage.locator('#bagBtn').click();
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
        if(effect==='Rede de captura'){
          assert.equal(await itemPage.evaluate(()=>data.game.inventory.rope),0);
          assert.equal(await itemPage.evaluate(()=>data.game.capturedCompanions[0].name),'Ogro da Floresta');
          assert.equal(await itemPage.evaluate(()=>gamePower()),15);
        }else{
          assert.equal(await itemPage.evaluate(()=>data.game.inventory.smoke),0);
        }
      }
      await itemContext.close();
    }
    console.log('Retomada de encontros de outro dia, Cura, Rede de captura e Bomba de fumaça.');

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
    await openIntro(desktop,/Arborian/,'enemy_guardian.webp',()=>desktop.keyboard.press('ArrowRight'));
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
