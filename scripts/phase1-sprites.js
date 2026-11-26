/* Eight drawn gait frames in each direction, with independent foot and tail poses. */
const forestSprites = (() => {
  const stride = [0, 3, 6, 4, 0, -3, -6, -4];
  const lifts = [.6, 2, 3, 1.5, 0, .2, .4, .2];
  function oval(c,x,y,rx,ry,fill,outline){
    c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
    if(outline){c.strokeStyle=outline;c.lineWidth=1;c.stroke();}
  }
  function limb(c,points,color,width){
    c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';
    c.beginPath();c.moveTo(...points[0]);points.slice(1).forEach(p=>c.lineTo(...p));c.stroke();
  }
  function hero(c,dir,frame){
    const front=dir==='down',back=dir==='up',side=!front&&!back;
    if(dir==='left')c.scale(-1,1);
    const s=frame===8?0:stride[frame], l=frame===8?0:lifts[frame], r=frame===8?0:lifts[(frame+4)%8];
    const leg=(sign,step,lift)=>{
      const x=side?sign*2:sign*6;
      const toe=side?x+step:x+step*.16,y=-3-lift-(side?0:step*.35);
      limb(c,[[x,-24],[x+step*.45,-15],[toe,y-3]],'#533426',8);
      limb(c,[[x,-25],[x+step*.36,-16]],'#81664b',6);
      oval(c,toe+(side?2:0),y,5.2,3.1,'#633e2a','#392b26');
      limb(c,[[toe-2,y-1],[toe+2,y-1]],'#b28450',1);
    };
    const arm=(sign,step)=>{
      const x=side?sign*5:sign*11;
      const handX=x+(side?step:sign*3),handY=-23+(side?0:step*.55);
      limb(c,[[x,-36],[x+(side?step*.4:sign*3),-29],[handX,handY]],'#443427',7);
      limb(c,[[x,-36],[x+(side?step*.4:sign*2),-31]],'#e1a337',5);
      oval(c,handX,handY,3.5,4,'#e9aa72','#8a523d');
    };
    leg(-1,-s,r);leg(1,s,l);
    if(side)arm(1,-s);
    if(side)oval(c,-9,-31,6,9,'#794329','#443127');
    const vest=c.createLinearGradient(-10,-34,11,-23);
    vest.addColorStop(0,'#8f571f');vest.addColorStop(.45,'#e0a438');vest.addColorStop(1,'#a16e27');
    oval(c,0,-31,side?8.6:11,13,vest,'#57412c');
    limb(c,[[-8,-25],[8,-25]],'#5c3a25',4);
    if(back){
      oval(c,0,-32,8,9,'#85482c','#462f25');
      oval(c,-1,-34,5,5,'#ae673e');limb(c,[[-5,-29],[5,-29]],'#e1b257',1.5);
    }else{
      limb(c,[[-6,-39],[4,-27]],'#63462c',2.6);
      oval(c,3,-29,3.6,3.6,'#f8cf70','#845630');
    }
    if(side){
      arm(-1,s);
      if(s>0)limb(c,[[s-5,-25],[s-11,-34]],'#adb7a5',2);
    }else{
      arm(-1,s);arm(1,-s);
      if(front)oval(c,12,-25+s*.4,5,7,'#5c665f','#dabf7b');
    }
    limb(c,[[-8,-42],[0,-40],[8,-42]],'#ab392d',5);
    const face=c.createLinearGradient(-9,-56,9,-44);
    face.addColorStop(0,'#ffe0aa');face.addColorStop(1,'#d39060');
    oval(c,side?2:0,-49,side?10:12,11,back?'#422b25':face,'#6b4433');
    if(!back){
      oval(c,side?6:-4,-49,1.4,2,'#382721');
      if(front)oval(c,4,-49,1.4,2,'#382721');
      if(side)oval(c,11,-47,2.1,1.8,'#e8a06b');
      limb(c,[[side?6:-2,-44],[side?9:2,-44]],'#955039',1.1);
    }
    for(const [x,y,rx,ry] of [[-8,-56,5,5],[-4,-60,6,4],[2,-61,6,4],[7,-58,6,4],[10,-54,4,4],[-10,-52,3,4]]){
      oval(c,x,y,rx,ry,'#493027');oval(c,x-1,y-2,rx*.69,1.5,'#805a3e');
    }
    if(back)oval(c,0,-51,10,6,'#50352a');
  }
  function dog(c,dir,frame){
    const side=dir==='left'||dir==='right', back=dir==='up', s=frame===8?0:stride[frame]*.65;
    if(dir==='left')c.scale(-1,1);
    const l=frame===8?0:lifts[frame],r=frame===8?0:lifts[(frame+4)%8];
    const paw=(x,step,lift,y)=> {
      limb(c,[[x,y-9],[x+step*.5,y-5],[x+step,y-lift]],'#bb804b',5);
      oval(c,x+step,y-lift,3.2,2.1,'#f9d9a2','#9b6744');
    };
    const tailX=side?-14:back?4:-8;
    limb(c,[[tailX,-15],[tailX-5,-20+s*.4],[tailX-3,-26+s*.5]],'#b5703d',5);
    limb(c,[[tailX-5,-20+s*.4],[tailX-3,-26+s*.5]],'#f4c98e',2.5);
    paw(side?-10:-6,-s,r,-3);paw(side?8:6,s,l,-3);
    const fur=c.createLinearGradient(-12,-20,10,-7);
    fur.addColorStop(0,'#cf8d4e');fur.addColorStop(1,'#f9d6a7');
    oval(c,side?-2:0,-13,side?13:9,8,fur,'#835638');
    paw(side?-10:-5,s,l,0);paw(side?7:5,-s,r,0);
    const x=side?9:0,y=back?-25:-22;
    oval(c,x,-16,8,4,'#2680a1','#173f55');
    oval(c,x,y,8,8,fur,'#a26e47');
    oval(c,x-6,y+2+s*.12,3.7,6.4,'#a06139','#754c33');
    if(!side)oval(c,x+6,y+2-s*.12,3.7,6.4,'#a06139','#754c33');
    if(!back){
      oval(c,x+(side?5:0),y+4,5.6,4,'#fae3ba');
      oval(c,x+(side?8:0),y+3,2.6,1.8,'#3c2d27');
      oval(c,x+(side?3:-3),y-1,1.2,1.6,'#392d2a');
      if(!side)oval(c,x+3,y-1,1.2,1.6,'#392d2a');
    }
  }
  const atlas={};
  for(const [name,paint] of Object.entries({hero,dog})){
    atlas[name]={};
    for(const dir of ['up','down','left','right']){
      atlas[name][dir]=Array.from({length:9},(_,i)=>{
        const image=document.createElement('canvas');
        image.width=96;image.height=144;
        const c=image.getContext('2d');
        c.scale(2,2);c.translate(24,67);
        paint(c,dir,i);
        return image;
      });
    }
  }
  function draw(c,name,x,y,dir,frame){
    oval(c,x,y+1,name==='hero'?12:14,4.7,'#142c2566');
    const img=atlas[name][dir][frame];
    c.drawImage(img,x-24,y-67,48,72);
  }
  return {draw};
})();
