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
  const coins={name:'moedas',glyph:'●',color:'#fbd470'};
  const gems={name:'diamante',glyph:'◆',color:'#a0f3ee'};
  const chest={name:'baú',glyph:'▣',color:'#e3a64e'};
  const icons=new Map(gameStore.map(item=>{
    const image=new Image();image.src=item.art;
    return [item.id,image];
  }));
  const meta={coins,diamonds:gems,chest};
  const collected=()=>data.game.exploration.collected ||= {};
  const tile=forestTerrain.tile;
  let sparkle=null;
  function collect(x,y){
    const drop=drops.find(item=>item.x===x&&item.y===y&&!collected()[item.id]);
    if(!drop)return '';
    const {id,kind,amount}=drop;
    const inventory=data.game.inventory;
    let message;
    if(kind==='coins'||kind==='chest'){
      const coins=kind==='chest'?12:amount;
      data.coins+=coins;
      data.coinLedger.unshift({text:'Tesouro da Floresta Encantada',amount:coins,date:new Date().toISOString()});
      message='+'+coins+' moedas';
      if(kind==='chest'){
        const item=id==='lowland-chest'?'medicine':'sleepCandy';
        inventory[item]=(inventory[item]||0)+1;
        message='Baú aberto: '+message+' e +1 '+gameStore.find(entry=>entry.id===item).name;
      }
    }else if(kind==='diamonds'){
      data.game.diamonds+=amount;
      message='+'+amount+' diamante';
    }else{
      inventory[kind]=(inventory[kind]||0)+amount;
      message='+'+amount+' '+gameStore.find(item=>item.id===kind).name;
    }
    collected()[id]=true;
    sparkle={x:(x+.5)*tile,y:(y+.5)*tile,start:performance.now()};
    forestMusic.effect(kind==='chest'?'treasure':'pickup');
    return message;
  }
  function actors(ctx,time){
    const seen=collected();
    const entries=drops.filter(drop=>!seen[drop.id]).map(drop=>{
      const x=(drop.x+.5)*tile,y=(drop.y+.5)*tile;
      return {x,y,draw(){
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
        else if(drop.kind==='chest'){
          ctx.fillStyle='#613a23';ctx.fillRect(-12,-12,24,19);
          ctx.fillStyle='#ba7942';ctx.fillRect(-11,-12,22,7);
          ctx.strokeStyle='#ffe3a2';ctx.lineWidth=2;ctx.strokeRect(-12,-12,24,19);
          ctx.fillStyle='#ffe3a2';ctx.fillRect(-2,-3,4,5);
        }else{
          ctx.fillStyle=meta[drop.kind]?.color||'#f9e5a8';
          ctx.font='bold 22px sans-serif';ctx.textAlign='center';
          ctx.fillText(meta[drop.kind]?.glyph||'✦',0,4);
        }
        ctx.restore();
      }};
    });
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
