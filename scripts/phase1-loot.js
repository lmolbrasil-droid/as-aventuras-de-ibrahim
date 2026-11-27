const forestLoot = (() => {
  // IDs are part of the saved game. Keep them stable when adjusting placement.
  const drops=[
    {id:'trail-medicine',x:5,y:5,kind:'medicine',amount:1},
    {id:'west-coins',x:4,y:9,kind:'coins',amount:9},
    {id:'fern-candy',x:11,y:11,kind:'sleepCandy',amount:1},
    {id:'lowland-chest',x:6,y:29,kind:'chest',amount:1},
    {id:'south-smoke',x:15,y:26,kind:'smoke',amount:1},
    {id:'river-net',x:26,y:12,kind:'rope',amount:1},
    {id:'east-cure',x:38,y:13,kind:'injection',amount:1},
    {id:'upper-diamond',x:35,y:10,kind:'diamonds',amount:1},
    {id:'arena-chest',x:36,y:27,kind:'chest',amount:1},
    {id:'deep-coins',x:28,y:27,kind:'coins',amount:12}
  ];
  const treasureArt='assets/forest-treasure.svg';
  const meta={
    coins:{name:'Moedas',art:treasureArt+'#coins',sound:'discover-coins'},
    diamonds:{name:'Diamante',art:treasureArt+'#diamond',sound:'discover-gem'},
    chest:{name:'Baú da floresta',art:treasureArt+'#chest',sound:'discover-chest'}
  };
  const items=new Map(gameStore.map(item=>[item.id,item]));
  const icons=new Map([...items,...Object.entries(meta)].map(([id,item])=>{
    const image=new Image();image.src=item.art;
    return [id,image];
  }));
  const collected=()=>data.game.exploration.collected ||= {};
  const tile=forestTerrain.tile;
  let sparkle=null;
  function collect(x,y){
    const drop=drops.find(item=>item.x===x&&item.y===y&&!collected()[item.id]);
    if(!drop)return null;
    const {id,kind,amount}=drop;
    const inventory=data.game.inventory;
    const item=meta[kind]||items.get(kind);
    const reward={title:'Tesouro encontrado',art:item.art,sound:item.sound||'discover-item'};
    if(kind==='coins'||kind==='chest'){
      const coins=kind==='chest'?12:amount;
      data.coins+=coins;
      data.coinLedger.unshift({text:'Tesouro da Floresta Encantada',amount:coins,date:new Date().toISOString()});
      reward.name='+'+coins+' moedas';
      reward.detail='Adicionadas à carteira.';
      if(kind==='chest'){
        const bonus=id==='lowland-chest'?'medicine':'sleepCandy';
        inventory[bonus]=(inventory[bonus]||0)+1;
        reward.name=item.name;
        reward.detail='+'+coins+' moedas na carteira · +1 '+items.get(bonus).name+' na mochila.';
      }
    }else if(kind==='diamonds'){
      data.game.diamonds+=amount;
      reward.name='+'+amount+' '+item.name;
      reward.detail='Adicionado à carteira.';
    }else{
      inventory[kind]=(inventory[kind]||0)+amount;
      reward.name='+'+amount+' '+item.name;
      reward.detail='Adicionado à mochila.';
    }
    collected()[id]=true;
    sparkle={x:(x+.5)*tile,y:(y+.5)*tile,start:performance.now()};
    return reward;
  }
  function actors(ctx,time,view){
    const seen=collected();
    const entries=[];
    for(const drop of drops){
      if(seen[drop.id])continue;
      const x=(drop.x+.5)*tile,y=(drop.y+.5)*tile;
      if(x<view.x-30||x>view.right+30||y<view.y-30||y>view.bottom+42)continue;
      entries.push({x,y,draw(){
        const lift=Math.sin(time/350+drop.x)*2;
        ctx.save();
        ctx.translate(x,y-12+lift);
        ctx.shadowColor='#ffe1a0';ctx.shadowBlur=9;
        ctx.fillStyle='#f1cd6b';
        ctx.beginPath();ctx.ellipse(0,8,15,5,0,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
        ctx.fillStyle='#253c30';
        ctx.beginPath();ctx.ellipse(0,6,14,5,0,0,Math.PI*2);ctx.fill();
        const img=icons.get(drop.kind);
        if(img?.complete&&img.naturalWidth)ctx.drawImage(img,-26,-23,52,36);
        ctx.restore();
      }});
    }
    if(sparkle&&time-sparkle.start<780){
      const {x,y,start}=sparkle,t=Math.max(0,(time-start)/780);
      entries.push({x,y:y+4,draw(){
        ctx.save();ctx.globalAlpha=1-t;ctx.fillStyle='#ffeab0';
        for(let i=0;i<7;i++){
          const angle=i*Math.PI*2/7;
          ctx.fillRect(x+Math.cos(angle)*t*36,y-11+Math.sin(angle)*t*25-t*15,3,3);
        }
        ctx.restore();
      }});
    }
    return entries;
  }
  return {drops,collect,actors};
})();
