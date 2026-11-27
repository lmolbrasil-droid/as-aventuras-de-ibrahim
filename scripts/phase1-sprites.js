/* Rows follow up, down, left, right. After the 12 gait frames: rest and two settling frames per planted side. */
const forestSprites=(()=>{
  const width=160,height=192,scale=.45;
  const rows={up:0,down:1,left:2,right:3};
  const sprites={hero:new Image(),dog:new Image()};
  sprites.hero.src='assets/walk-ibrahim.webp?v=6';
  sprites.dog.src='assets/walk-dog.webp?v=6';
  function draw(ctx,name,x,y,dir,frame){
    ctx.fillStyle='#172b2380';
    ctx.beginPath();ctx.ellipse(x,y+1,name==='hero'?12:14,4.7,0,0,Math.PI*2);ctx.fill();
    const atlas=sprites[name];
    if(atlas.complete&&atlas.naturalWidth){
      ctx.drawImage(atlas,width*frame,height*rows[dir],width,height,
        x-width*scale/2,y-178*scale,width*scale,height*scale);
    }
  }
  return {draw};
})();
