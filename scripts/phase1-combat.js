/* One turn owns the controls, from the wind-up to the end of the counterattack. */
(() => {
  const $=id=>document.getElementById(id);
  const scene=$('battleScene'),effect=$('forestImpact'),modal=$('battleBagModal');
  const sleepId='sleepCandy';
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const current=()=>data.game.dailyBattle[todayKey];
  let busy=false;
  const story=message=>{$('gameStory').textContent=message;};
  const ready=b=>!!(window.forestWorld?.fighting&&b&&!b.won&&!b.escaped&&data.game.combat.hp>0);
  const sound=name=>forestMusic.effect(name);

  function refresh(){
    renderGame();
    const b=current(),disabled=busy||!ready(b);
    for(const id of ['attackBtn','defendBtn','doubleBtn','bagBtn']){
      $(id).disabled=disabled||(id==='doubleBtn'&&!!b?.doubleUsed);
    }
    scene.classList.toggle('turn-locked',busy);
  }

  function cue(name){
    effect.dataset.cue='';
    void effect.offsetWidth;
    effect.dataset.cue=name;
    sound(name);
  }
  function hitNumber(damage,target){
    const number=$('damageNumber');
    number.dataset.target=target;
    number.textContent='−'+damage;
    number.classList.remove('damage-pop');void number.offsetWidth;number.classList.add('damage-pop');
  }
  function finish(b){
    b.hp=0;b.won=true;b.pendingEnemy=false;
    if(!b.rewardClaimed){
      data.game.diamonds+=2;
      b.rewardClaimed=true;
    }
    if(data.game.exploration.boss){
      const stage=Number(data.game.stage);
      if(!data.game.wonStages.includes(stage))data.game.wonStages.push(stage);
      data.game.exploration.arborianDefeated=true;
    }
    save();
    setHeroPose('victory',0);
    setEnemyPose('defeated',0);
    story('Vitória! Ibrahim e seu fiel escudeiro ganharam 2 diamantes.');
    window.forestWorld.resolveBattle(b);
  }
  function applyEnemyImpact(b,combat,damage){
    combat.hp=Math.max(0,combat.hp-damage);
    combat.guard=0;b.guardActive=false;b.pendingEnemy=false;delete b.counterDamage;
    save();
    hitNumber(damage,'hero');
    refresh();
  }
  async function ogreTurn(b,combat,damage,guarded,recoverFromHit){
    if(recoverFromHit){
      scene.dataset.ogreStrike='regroup';
      setEnemyPose('idle',0);
      story('O Ogro recupera o equilíbrio.');
      await wait(500);
    }
    if(guarded)setHeroPose('defend',0);
    story('O Ogro ergueu sua clava.');
    scene.dataset.ogreStrike='prepare';
    setEnemyPose('attack',0);
    forestMusic.duck(2.5);
    sound('ogre-growl');
    await wait(500);

    scene.dataset.ogreStrike='swing';
    sound('ogre-swing');
    await wait(500);

    scene.dataset.ogreStrike='impact';
    setHeroPose(guarded?'defend':'hurt',0);
    effect.dataset.guard=guarded?'on':'';
    sound(guarded?'ogre-parry':'ogre-crush');
    applyEnemyImpact(b,combat,damage);
    story(guarded?'O escudo bloqueou 60% do golpe. Ibrahim perdeu '+damage+' de vida.':'A clava atingiu Ibrahim. −'+damage+' de vida.');
    await wait(600);

    scene.dataset.ogreStrike='return';
    await wait(700);
    setEnemyPose('idle',0);
    if(combat.hp&&!guarded)setHeroPose('idle',0);
    scene.dataset.ogreStrike='settle';
    effect.dataset.guard='';
    await wait(800);
    delete scene.dataset.ogreStrike;
    if(!combat.hp)window.forestWorld.resolveBattle(b);
  }

  async function enemyTurn(b,recoverFromHit=false){
    const combat=data.game.combat;
    if(b.sleepTurns>0){
      b.sleepTurns--;
      b.guardActive=false;
      b.pendingEnemy=false;
      save();refresh();
      cue('sleep');
      story(b.sleepTurns?'O inimigo dormiu e perdeu a vez.':'O inimigo perdeu a vez e despertou.');
      await wait(710);
      return;
    }
    const boss=data.game.exploration.boss,guarded=!!b.guardActive;
    const raw=b.counterDamage??(10+Math.floor(Math.random()*9));
    b.counterDamage=raw;
    b.pendingEnemy=true;
    save();
    const damage=Math.max(1,Math.round(raw*(guarded?.4:1)));
    if(!boss){await ogreTurn(b,combat,damage,guarded,recoverFromHit);return;}
    scene.dataset.motion='arborian-windup';
    if(guarded)setHeroPose('defend',0);
    setEnemyPose('attack',0);
    cue('leaves');
    story('Arborian reuniu a energia das raízes.');
    await wait(630);
    setHeroPose(guarded?'defend':'hurt',830);
    effect.dataset.guard=guarded?'on':'';
    cue('roots');
    if(guarded)sound('block');
    applyEnemyImpact(b,combat,damage);
    story(guarded?'O escudo bloqueou 60% do golpe. Ibrahim perdeu '+damage+' de vida.':'Ibrahim perdeu '+damage+' de vida.');
    await wait(860);
    setEnemyPose('idle',0);
    if(!combat.hp)window.forestWorld.resolveBattle(b);
  }

  async function run(action){
    const b=current();
    if(busy||!ready(b))return;
    busy=true;refresh();
    try{await action(b);}
    finally{
      scene.dataset.motion='';
      delete scene.dataset.companionPose;
      delete scene.dataset.normalStrike;
      delete scene.dataset.ogreStrike;
      effect.dataset.cue='';effect.dataset.guard='';
      busy=false;
      refresh();
    }
  }
  function normalAttack(){
    return run(async b=>{
      const damage=gamePower()+Math.floor(Math.random()*7)+4;
      story('Ibrahim prepara o Corte Relâmpago.');
      if(data.game.exploration.boss)setEnemyPose('defend',0);
      scene.dataset.normalStrike='prepare';
      setHeroPose('ready',0);
      forestMusic.duck(2.5);
      sound('normal-ready');
      await wait(700);
      scene.dataset.normalStrike='swing';
      story('Corte Relâmpago!');
      setHeroPose('attack',0);
      sound('normal-swing');
      await wait(500);

      scene.dataset.normalStrike='impact';
      setEnemyPose('hurt',0);
      story(gameEnemy()[0]+' recebeu '+damage+' de dano.');
      sound('normal-impact');
      b.hp=Math.max(0,b.hp-damage);
      b.attacks=(b.attacks||0)+1;
      hitNumber(damage,'enemy');
      refresh();
      await wait(155);
      sound('normal-recoil');
      await wait(345);
      if(b.hp&&!data.game.exploration.boss)setEnemyPose('idle',0);
      await wait(100);

      scene.dataset.normalStrike='recover';
      setHeroPose('idle',0);
      await wait(700);
      delete scene.dataset.normalStrike;
      if(!b.hp){finish(b);return;}
      b.pendingEnemy=true;
      save();
      await enemyTurn(b,true);
    });
  }
  function doubleAttack(){
    return run(async b=>{
      if(b.doubleUsed)return;
      const total=gamePower()*3+25;
      const first=Math.max(1,Math.round(total*.43));
      story('Ibrahim e seu fiel escudeiro preparam um golpe combinado.');
      if(data.game.exploration.boss)setEnemyPose('defend',0);
      for(const [index,damage] of [first,total-first].entries()){
        scene.dataset.motion=index?'companion-windup':'hero-windup';
        setHeroPose(index?'idle':'ready',0);
        await wait(index?410:460);
        scene.dataset.motion=index?'companion-strike':'hero-strike';
        setHeroPose(index?'idle':'attack',0);
        setEnemyPose('hurt',0);
        cue(index?'companion':'slash');
        b.hp=Math.max(0,b.hp-damage);hitNumber(damage,'enemy');refresh();
        if(index){
          await wait(340);
          scene.dataset.companionPose='recover';
          renderTeamSprites(b);
          await wait(340);
        }else await wait(610);
      }
      b.doubleUsed=true;
      b.attacks=(b.attacks||0)+1;
      setHeroPose('idle',0);
      if(!b.hp){finish(b);return;}
      b.pendingEnemy=true;
      save();
      await enemyTurn(b,true);
    });
  }
  function defend(){
    return run(async b=>{
      b.guardActive=true;b.pendingEnemy=true;save();
      setHeroPose('defend',0);cue('ward');
      story('Ibrahim ergueu o escudo.');
      await wait(560);
      await enemyTurn(b);
      setHeroPose('idle',0);
    });
  }

  const isHeal=id=>id==='medicine'||id==='injection';
  function heal(id){
    const combat=data.game.combat;
    combat.hp=id==='medicine'?Math.min(combat.hp+35,combat.maxHp):combat.maxHp;
  }
  function bag(mode,message=''){
    if(mode==='battle'&&(busy||!ready(current())))return;
    const map=mode==='map',inventory=data.game.inventory;
    const opening=modal.hidden;
    const combat=data.game.combat,b=current();
    modal.dataset.mode=mode;
    $('bagMessage').textContent=message||(map?'':'Vida de Ibrahim: '+combat.hp+'/'+combat.maxHp);
    if(map){
      const meter=$('bagHealth');
      meter.setAttribute('aria-valuemax',combat.maxHp);
      meter.setAttribute('aria-valuenow',combat.hp);
      meter.querySelector('i').style.width=(combat.hp/combat.maxHp*100)+'%';
      meter.querySelector('.bag-health-track span').textContent=combat.hp+' / '+combat.maxHp;
    }
    const items=$('battleBagItems');
    items.replaceChildren();
    for(const item of gameStore){
      const quantity=inventory[item.id]||0;
      const row=document.createElement('article');row.className='bag-item';
      const art=document.createElement('img');art.src=item.art;art.alt='';
      const copy=document.createElement('div');
      const name=document.createElement('strong');name.textContent=item.name;
      const count=document.createElement('span');
      count.className=map?'bag-quantity':'';
      count.textContent=map?'×'+quantity:' · '+quantity;
      name.append(count);
      const desc=document.createElement('small');desc.textContent=item.desc;
      copy.append(name,desc);
      const use=document.createElement('button');
      use.type='button';use.textContent='Usar';use.setAttribute('aria-label','Usar '+item.name);
      const unavailable=map&&!isHeal(item.id)
        ||item.id===sleepId&&b?.sleepTurns>0||isHeal(item.id)&&combat.hp>=combat.maxHp;
      use.disabled=!quantity||unavailable;
      use.addEventListener('click',()=>useItem(item,mode));
      row.append(art,copy,use);items.append(row);
    }
    modal.hidden=false;
    if(opening){
      modal.querySelector('.bag-close').focus();
      if(map)sound('bag-open');
    }
  }
  function useItem(item,mode){
    if(modal.hidden||modal.classList.contains('is-closing')||modal.dataset.mode!==mode)return;
    const id=item.id,inventory=data.game.inventory,combat=data.game.combat;
    if(!inventory[id]||isHeal(id)&&combat.hp>=combat.maxHp)return;
    if(mode==='map'){
      if(!window.forestWorld.walking||!isHeal(id))return;
      inventory[id]--;heal(id);save();renderShop();sound(id);
      bag('map',item.name+' usado.');
      modal.querySelector('.bag-close').focus();
      return;
    }
    return run(async b=>{
      if(id===sleepId&&b.sleepTurns>0)return;
      closeBattleBag();
      story('Ibrahim usou '+item.name+'.');
      cue(id);
      await wait(850);
      inventory[id]--;
      if(id===sleepId){
        b.sleepTurns=2;
        save();refresh();
        story('O inimigo adormeceu por duas rodadas.');
        return;
      }
      if(id==='smoke'){
        b.escaped=true;
        save();
        window.returnFromIbrahimEncounter();
        return;
      }
      heal(id);b.pendingEnemy=true;save();refresh();
      await enemyTurn(b);
    });
  }

  window.attackGuardian=normalAttack;
  window.doubleStrike=doubleAttack;
  window.defendGuardian=defend;
  window.openBattleBag=()=>bag('battle');
  window.openMapBag=()=>bag('map');
  window.closeBattleBag=()=>{
    if(modal.hidden||modal.classList.contains('is-closing'))return;
    const map=modal.dataset.mode==='map';
    const finish=()=>{
      modal.hidden=true;
      modal.classList.remove('is-closing');
      $(map?'mapBagBtn':'bagBtn').focus({preventScroll:true});
    };
    if(!map){finish();return;}
    modal.classList.add('is-closing');
    sound('bag-close');
    setTimeout(finish,170);
  };
  window.refreshForestBattle=refresh;
  window.resumeForestTurn=()=>{if(current()?.pendingEnemy)run(enemyTurn);};
  $('mapBagBtn').addEventListener('click',()=>window.forestWorld.openBag());
  modal.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.stopPropagation();closeBattleBag();}
    if(e.key!=='Tab')return;
    const buttons=[...modal.querySelectorAll('button:not(:disabled)')];
    const end=e.shiftKey?buttons[0]:buttons.at(-1);
    if(document.activeElement!==end)return;
    e.preventDefault();
    (e.shiftKey?buttons.at(-1):buttons[0]).focus();
  });
})();
