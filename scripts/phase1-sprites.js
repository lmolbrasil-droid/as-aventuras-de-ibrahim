/* Complete poses from the approved sheets, aligned to a shared ground line. */
const forestSprites=(()=>{
  const width=128,height=120,scale=.73;
  const rows={up:0,down:1,left:2,right:3};
  const atlases={
    hero:{image:new Image(),steps:8,file:'walk-ibrahim-r9.webp'},
    dog:{image:new Image(),steps:7,file:'walk-dog-r9.webp'}
  };
  for(const atlas of Object.values(atlases))atlas.image.src='assets/'+atlas.file+'?v=9';

  function draw(ctx,name,x,y,dir,pose){
    const {distance=0,weight=0}=pose||{};
    const {image,steps}=atlases[name];
    const frame=weight<.10?steps:Math.floor(distance/80*steps)%steps;
    ctx.fillStyle='#172b2380';
    ctx.beginPath();
    ctx.ellipse(x,y+1,name==='hero'?12:14,4.7,0,0,Math.PI*2);
    ctx.fill();
    if(image.complete&&image.naturalWidth){
      ctx.drawImage(image,width*frame,height*rows[dir],width,height,
        x-width*scale/2,y-116*scale,width*scale,height*scale);
    }
  }
  return {draw};
})();
