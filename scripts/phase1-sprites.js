/* Grounded gait. Forward offsets decrease with world distance during stance;
   only the swinging limbs advance. Knees are solved as two connected bones. */
const forestSprites=(()=>{
  const body=new Image();
  body.src='assets/forest-rig.webp?v=7';
  const columns={up:0,down:1,left:2,right:3};
  const axis={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  const tau=2*Math.PI;
  const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  function print(distance,length,shift,duty,lift){
    const phase=((distance/length+shift)%1+1)%1;
    const reach=length*duty/2;
    if(phase<duty)return [reach-phase*length,0];
    const t=(phase-duty)/(1-duty);
    const eased=t*t*(3-2*t);
    return [-reach+2*reach*eased,lift*Math.sin(Math.PI*t)**1.5];
  }
  function knee(ax,ay,bx,by,a,b,bend){
    const dx=bx-ax,dy=by-ay,d=clamp(Math.hypot(dx,dy),.01,a+b-.01);
    const angle=Math.atan2(dy,dx)+bend*Math.acos(clamp((a*a+d*d-b*b)/(2*a*d),-1,1));
    return [ax+Math.cos(angle)*a,ay+Math.sin(angle)*a];
  }
  function stroke(ctx,points,width,color){
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(...points[0]);
    for(const point of points.slice(1))ctx.lineTo(...point);
    ctx.stroke();
  }
  function oval(ctx,x,y,rx,ry,color){
    ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,tau);ctx.fill();
  }
  function draw(ctx,name,x,y,dir,pose){
    const {distance=0,weight=0}=typeof pose==='number'?{distance:pose*4,weight:1}:pose||{};
    const dog=name==='dog',side=dir==='left'||dir==='right',front=dir==='down';
    const [dx,dy]=axis[dir];
    const cycle=dog?(side?35:27):(side?43:32);
    const rhythm=distance/cycle*tau;
    const sway=Math.cos(rhythm)*weight;
    const rise=(.4+.85*Math.cos(2*rhythm))*weight;
    ctx.save();ctx.translate(x,y);
    oval(ctx,0,1,dog?13:12,4.5,'#142c2390');
    const limbs=[];
    if(dog){
      for(const frontPaw of [false,true]){
        for(const near of [false,true]){
          const sign=near?1:-1;
          const [step,lift]=print(distance,cycle,(near?.5:0)+(frontPaw?.19:0),.56,5.5);
          const centerX=side?(frontPaw?9:-11)*dx:sign*(frontPaw?5.4:7);
          const centerY=side?-12:(frontPaw?(front?-12:-16):(front?-17:-11));
          const hip=[centerX+(side?0:sway*.8),centerY-rise];
          const foot=[centerX+dx*step*weight,dy*step*weight-lift*weight+(near?1:-2)];
          const joint=knee(...hip,...foot,side?7:9,side?9:12,(frontPaw?-1:1)*(side?dx:sign));
          limbs.push({near,draw(){
            stroke(ctx,[hip,joint,foot],near?4.7:4,'#81502c');
            stroke(ctx,[hip,joint,foot],near?3.3:2.8,frontPaw?'#e7b77b':'#be8959');
            oval(ctx,foot[0],foot[1],2.8,1.65,near?'#f3d2a3':'#cc9e6b');
          }});
        }
      }
      const tailX=side?-12*dx:-6,tailY=-12-rise;
      stroke(ctx,[[tailX,tailY],[tailX-6*(dx||1),tailY-5],[tailX-9*(dx||1),tailY-13+sway*2]],4.8,'#874b2e');
      stroke(ctx,[[tailX,tailY],[tailX-6*(dx||1),tailY-5],[tailX-9*(dx||1),tailY-13+sway*2]],2.6,'#d39f64');
    }else{
      for(const near of [false,true]){
        const sign=near?1:-1;
        const [step,lift]=print(distance,cycle,near?.5:0,.57,8);
        const center=side?sign*2.8:sign*7;
        const hip=[center+sway*(side?1.6:.95),-22-rise];
        const foot=[center+dx*step*weight,dy*step*weight-lift*weight+(side&&near?1:0)];
        const joint=knee(...hip,...foot,side?12:14,side?13:16,side?-dx:sign);
        const shin=[joint[0]+(foot[0]-joint[0])*.36,joint[1]+(foot[1]-joint[1])*.36];
        limbs.push({near,draw(){
          stroke(ctx,[hip,joint],8,'#4b301f');
          stroke(ctx,[hip,joint],5.5,near?'#a36c3e':'#704727');
          stroke(ctx,[joint,shin],5.2,near?'#ca925d':'#a26e47');
          stroke(ctx,[shin,foot],6.9,near?'#523121':'#38271c');
          oval(ctx,foot[0]+dx*1.6,foot[1]-.65,side?4.8:3.9,2.65,near?'#683d25':'#482c1d');
          stroke(ctx,[[foot[0]-1.5,foot[1]-3.4],[foot[0]+1.6,foot[1]-3.4]],1,'#b1885c');
        }});
        const swing=Math.sin(rhythm+sign*Math.PI/2)*weight;
        const shoulder=[side?sign*3:sign*12,-39-rise];
        const elbow=[shoulder[0]+dx*swing*4+(side?0:sign*2),shoulder[1]+6];
        const fist=[elbow[0]+dx*swing*4,elbow[1]+5+dy*swing*3];
        limbs.push({near,draw(){
          stroke(ctx,[shoulder,elbow],6,'#783d22');
          stroke(ctx,[shoulder,elbow],4.5,'#c88747');
          stroke(ctx,[elbow,fist],4.2,'#d2955b');
          oval(ctx,fist[0],fist[1],2.55,2.4,'#ae7547');
        }});
      }
      if(front){
        const lift=sway*1.6;
        stroke(ctx,[[-13,-28+lift],[-20,-45+lift]],3,'#a7bec0');
        stroke(ctx,[[-16,-30+lift],[-10,-33+lift]],2.4,'#d6a351');
      }
    }
    for(const limb of limbs)if(!limb.near)limb.draw();
    if(body.complete&&body.naturalWidth){
      // Head and torso share the approved texture but pitch independently.
      const row=dog?192:0,split=dog?137:79;
      ctx.drawImage(body,columns[dir]*160,row+split,160,192-split,-36+sway*.8,-80-rise+split*.45,72,(192-split)*.45);
      if(dog){
        const pivotX=side?dx*12:0,pivotY=-80+split*.45;
        ctx.save();ctx.translate(pivotX,pivotY);ctx.rotate(sway*.045);
        ctx.drawImage(body,columns[dir]*160,row,160,split,-36+sway*.5-pivotX,-split*.45-rise*.78,72,split*.45);
        ctx.restore();
      }else{
        ctx.drawImage(body,columns[dir]*160,row,160,split,-36+sway*.5,-80-rise*.78,72,split*.45);
      }
    }
    for(const limb of limbs)if(limb.near&& (dog||side||dir==='up'))limb.draw();
    if(!dog&&front)limbs[2].draw();
    ctx.restore();
  }
  return {draw};
})();
