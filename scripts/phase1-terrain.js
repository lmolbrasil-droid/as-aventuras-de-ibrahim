/* Painted terrain and the collision map share the same coordinates. */
const forestTerrain = (() => {
  const tile = 40, cols = 40, rows = 32, width = cols * tile, height = rows * tile;
  const arena = {x: 34, y: 24};
  const trails = [
    [[1,2],[4,2],[7,4],[10,4],[12,7],[15,9],[19,8],[23,7],[27,8],[31,11],[35,10],[38,13]],
    [[4,2],[5,6],[4,9],[6,12],[5,16],[7,19],[10,20],[12,24],[15,26],[19,25],[23,23],[28,22],[31,23],[34,24]],
    [[12,7],[11,11],[13,14],[17,15],[18,19],[15,21],[12,24],[9,27],[6,29],[2,28]],
    [[27,8],[26,12],[28,15],[31,16],[35,15],[37,18],[37,21],[34,24],[36,27],[35,29],[31,29],[28,27],[28,22]]
  ];
  const bridges = [{left:18,right:25,y:8},{left:18,right:25,y:23}];
  const meadows = [[9,9,3,3],[14,17,4,3],[8,25,3,3],[29,12,3,3],[32,19,4,3],[27,27,3,2]];
  const woods = new Map(), stones = new Map();
  const key = (x,y) => y * cols + x;
  const rng = (x,y,seed) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const river = y => 21.5 + Math.sin(y * .31) * 1.1 + Math.cos(y * .16) * .6;
  const riverWidth = y => 1.03 + Math.cos(y * .47) * .2;
  const onBridge = (x,y) => bridges.some(b => x >= b.left && x <= b.right && Math.abs(y-b.y) <= .43);
  const onWater = (x,y) => Math.abs(x-river(y)) < riverWidth(y);
  const inArena = (x,y) => Math.hypot((x-arena.x)*.83,y-arena.y) < 3.25;
  const nearTrail = (x,y) => trails.some(path => path.slice(1).some(([bx,by],i) => {
    const [ax,ay] = path[i], dx = bx-ax, dy = by-ay;
    const t = Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
    return Math.hypot(x-ax-t*dx,y-ay-t*dy) < 1.03;
  }));
  const grass = (x,y) => !nearTrail(x,y) && !inArena(x,y) && !onWater(x,y) &&
    meadows.some(([mx,my,rx,ry]) => ((x-mx)/rx)**2+((y-my)/ry)**2 < .96+rng(x,y,7)*.23);
  for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){
    if(nearTrail(x,y)||onBridge(x,y)||inArena(x,y)||onWater(x,y)||grass(x,y))continue;
    const chance=rng(x,y,2);
    if(x===0||x===cols-1||y===0||y===rows-1||chance<.36)woods.set(key(x,y),{x,y});
    else if(chance>.964)stones.set(key(x,y),{x,y});
  }
  function blocked(x,y){
    return x<0||y<0||x>=cols||y>=rows||woods.has(key(x,y))||stones.has(key(x,y))||
      (onWater(x,y)&&!onBridge(x,y));
  }
  const paper=document.createElement('canvas');
  paper.width=width;
  paper.height=height;
  const ctx=paper.getContext('2d',{alpha:false});
  const X=x=>(x+.5)*tile;
  function ellipse(c,x,y,rx,ry,fill){
    c.fillStyle=fill;
    c.beginPath();
    c.ellipse(x,y,rx,ry,0,0,Math.PI*2);
    c.fill();
  }
  function line(points,color,size){
    ctx.strokeStyle=color;
    ctx.lineWidth=size;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.beginPath();
    ctx.moveTo(X(points[0][0]),X(points[0][1]));
    for(let i=1;i<points.length-1;i++){
      const [x,y]=points[i], [nx,ny]=points[i+1];
      ctx.quadraticCurveTo(X(x),X(y),X((x+nx)/2),X((y+ny)/2));
    }
    const [ex,ey]=points.at(-1);
    ctx.lineTo(X(ex),X(ey));
    ctx.stroke();
  }
  const earth=ctx.createLinearGradient(0,0,width,height);
  earth.addColorStop(0,'#396243');earth.addColorStop(.5,'#568050');earth.addColorStop(1,'#355f49');
  ctx.fillStyle=earth;
  ctx.fillRect(0,0,width,height);
  for(let i=0;i<850;i++){
    const x=rng(i,4,1)*width,y=rng(i,4,2)*height,r=12+rng(i,4,3)*52;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,i%3===0?'#dab76532':'#143f3033');g.addColorStop(1,'#30593800');
    ellipse(ctx,x,y,r,r,g);
  }
  for(const [color,size] of [['#536c43',78],['#83734d',63],['#b89c67',49],['#c5a973',36]]){
    for(const path of trails)line(path,color,size);
  }
  for(let i=0;i<18000;i++){
    const x=rng(i,5,1)*width,y=rng(i,5,2)*height;
    ellipse(ctx,x,y,.5+rng(i,5,3)*1.7,.5,i%3?'#2b583646':'#e0cf8a6b');
  }

  const stream=Array.from({length:136},(_,i)=>{const y=i/4-1;return [river(y),y];});
  line(stream,'#304f46',128);
  line(stream,'#998a66',107);
  line(stream,'#1a5660',94);
  line(stream,'#31898a',74);
  for(let i=0;i<540;i++){
    const y=rng(i,8,1)*rows-.5,x=river(y)+(rng(i,8,2)-.5)*1.8;
    line([[x-.08,y],[x+.07,y-.025]],i%2?'#97d2b17a':'#d2e5b04a',.8+i%3*.4);
  }
  for(const {left,right,y} of bridges){
    const x0=X(left)+9,x1=X(right)-9,cy=X(y);
    ctx.fillStyle='#263a2d88';ctx.fillRect(x0+4,cy-20,x1-x0,48);
    ctx.fillStyle='#664b35';ctx.fillRect(x0,cy-18,x1-x0,36);
    for(let x=x0+2;x<x1-5;x+=8){
      const plank=ctx.createLinearGradient(x,cy-16,x,cy+19);
      plank.addColorStop(0,'#d1a76a');plank.addColorStop(.55,'#966b44');plank.addColorStop(1,'#b18853');
      ctx.fillStyle=plank;ctx.fillRect(x,cy-16,6,32);
    }
    for(const dy of [-18,18]){
      ctx.fillStyle='#523924';ctx.fillRect(x0,cy+dy-2,x1-x0,4);
      for(let x=x0+2;x<=x1;x+=27){
        ctx.fillStyle='#513b2d';ctx.fillRect(x,cy+dy-6,5,10);
        ctx.fillStyle='#d4ae77';ctx.fillRect(x,cy+dy-6,5,3);
      }
    }
  }
  const ax=X(arena.x),ay=X(arena.y);
  ellipse(ctx,ax,ay,125,105,'#4b6345');
  ellipse(ctx,ax,ay,115,92,'#a69b71');
  ellipse(ctx,ax,ay,104,81,'#737957');
  ctx.strokeStyle='#d9bd78'; ctx.lineWidth=2;
  for(const r of [34,52,77]){
    ctx.beginPath();ctx.ellipse(ax,ay,r,r*.8,0,0,Math.PI*2);ctx.stroke();
  }
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6,x=ax+Math.cos(a)*100,y=ay+Math.sin(a)*80;
    ellipse(ctx,x,y+2,9,5,'#4d5241');ellipse(ctx,x,y-1,8,4,'#b0a58b');
  }
  ctx.strokeStyle='#dfcb90';ctx.lineJoin='round';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(ax,ay-25);ctx.lineTo(ax+20,ay);ctx.lineTo(ax,ay+25);ctx.lineTo(ax-20,ay);ctx.closePath();ctx.stroke();

  for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){
    if(onWater(x,y)||onBridge(x,y)||inArena(x,y)||woods.has(key(x,y)))continue;
    const tall=grass(x,y);
    if(tall)ellipse(ctx,X(x),X(y),24,23,'#32644773');
    const count=tall?25:nearTrail(x,y)?1:8;
    for(let i=0;i<count;i++){
      const cx=X(x)+(rng(x+i,y,31)-.5)*39,cy=X(y)+(rng(x,y+i,32)-.5)*38;
      const h=(tall?7:2)+rng(x,y,i+33)*(tall?13:5);
      ctx.strokeStyle=['#264f38','#608a49','#8da65b','#466d3f'][i%4];
      ctx.lineWidth=tall?1.7:1;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.quadraticCurveTo(cx-2,cy-h*.6,cx+(i%2?4:-4),cy-h);ctx.stroke();
      if(i%13===4){
        const color=(x+y)%3===0?'#f5d68f':(x+y)%3===1?'#e99391':'#c7b7e8';
        for(let k=0;k<5;k++)ellipse(ctx,cx+2.5*Math.cos(k*1.26),cy-h+2.5*Math.sin(k*1.26),1.9,1.8,color);
        ellipse(ctx,cx,cy-h,1.5,1.4,'#fcde7c');
      }
    }
  }
  for(const {x,y} of stones.values()){
    ellipse(ctx,X(x)+3,X(y)+5,16,8,'#243e305d');
    ellipse(ctx,X(x),X(y),13,9,'#65796e');
    ellipse(ctx,X(x)-3,X(y)-3,8,4,'#a0ad91');
    ellipse(ctx,X(x)+4,X(y)+1,6,2,'#648251');
  }

  function tree(c,x,y){
    const cx=X(x),cy=X(y),type=Math.floor(rng(x,y,4)*3),h=34+rng(x,y,5)*27;
    const colors=[['#193d36','#326446','#628a56'],['#1e4b3c','#387150','#70a45f'],['#333e33','#576345','#a09a5c']][type];
    ellipse(c,cx+6,cy+4,24,10,'#152e2d70');
    c.fillStyle='#594431';c.fillRect(cx-4,cy-16,8,21);
    c.fillStyle='#997054';c.fillRect(cx-3,cy-13,2,15);
    for(let k=0;k<9;k++){
      const angle=k*2.4, r=k===0?0:12+rng(x,y,k)*9;
      const a=cx+Math.cos(angle)*r,b=cy-h*.62+Math.sin(angle)*r*.8;
      const size=9+rng(x,k+y,7)*11;
      const g=c.createRadialGradient(a-4,b-6,2,a,b,size*1.32);
      g.addColorStop(0,colors[2]);g.addColorStop(.54,colors[1]);g.addColorStop(1,colors[0]);
      if(type===0){
        c.fillStyle=g;c.beginPath();c.moveTo(a,b-size-6);c.lineTo(a-size,b+size*.65);c.lineTo(a+size,b+size*.65);c.closePath();c.fill();
      }else ellipse(c,a,b,size,size*.87,g);
      for(let j=0;j<7;j++){
        const dx=(rng(j+x,y+k,13)-.5)*size,dy=(rng(j+y,x+k,17)-.5)*size*.8;
        ellipse(c,a+dx,b+dy,2,1,colors[(j+1)%3]+'88');
      }
    }
  }

  // Pre-render the trees; draw each canopy in depth order with the actors.
  const canopies=[...woods.values()].map(({x,y})=>{
    const art=document.createElement('canvas');art.width=86;art.height=88;
    const c=art.getContext('2d');c.translate(43-X(x),74-X(y));tree(c,x,y);
    return {x:X(x),y:X(y),art,left:X(x)-43,top:X(y)-74};
  });
  const canopyRows=Array.from({length:rows},()=>[]);
  for(const tree of canopies)canopyRows[Math.floor(tree.y/tile)].push(tree);
  for(const {art,left,top} of canopies)ctx.drawImage(art,left,top);
  const fireflies=Array.from({length:24},(_,i)=>({x:rng(i,3,1)*width,y:rng(i,3,2)*height}));
  function draw(c,view,actors,time){
    const cropX=Math.floor(view.x),cropY=Math.floor(view.y);
    const cropWidth=Math.min(width,Math.ceil(view.right))-cropX;
    const cropHeight=Math.min(height,Math.ceil(view.bottom))-cropY;
    c.drawImage(paper,cropX,cropY,cropWidth,cropHeight,cropX,cropY,cropWidth,cropHeight);
    for(let i=0;i<34;i++){
      const y=((i*37+time*.012)%height),x=X(river(y/tile-.5))+Math.sin(i*7)*22;
      if(x<view.x||x>view.right||y<view.y||y>view.bottom||onBridge(x/tile-.5,y/tile-.5))continue;
      ellipse(c,x,y,5+i%3,1,'#c5f4d278');
    }
    actors.sort((a,b)=>a.y-b.y);
    for(const actor of actors){
      actor.draw();
      // The landscape is a single blit. Only repaint trees that overlap a
      // moving object's footprint, in front of that object.
      const left=actor.x-37,top=actor.y-82,right=actor.x+37,bottom=actor.y+6;
      const start=Math.max(0,Math.floor(actor.y/tile));
      const end=Math.min(rows,Math.ceil((bottom+74)/tile));
      let clipped=false;
      for(let row=start;row<end;row++){
        for(const tree of canopyRows[row]){
          if(tree.y<actor.y||tree.left>right||tree.left+86<left||tree.top>bottom||tree.top+88<top)continue;
          if(!clipped){
            c.save();c.beginPath();c.rect(left,top,right-left,bottom-top);c.clip();clipped=true;
          }
          c.drawImage(tree.art,tree.left,tree.top);
        }
      }
      if(clipped)c.restore();
    }
    for(let i=0;i<24;i++){
      const x=fireflies[i].x+Math.sin(time*.001+i)*15,y=fireflies[i].y+Math.cos(time*.002+i)*9;
      if(x<view.x||x>view.right||y<view.y||y>view.bottom)continue;
      ellipse(c,x,y,4,4,'#e8ed7b25');ellipse(c,x,y,1.3,1.3,'#f8f2bbaa');
    }
  }
  return {tile,cols,rows,width,height,arena,blocked,grass,draw};
})();
