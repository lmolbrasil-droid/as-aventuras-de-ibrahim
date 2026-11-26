/* Rows follow up, down, left, right. The ninth frame is the standing pose. */
const forestSprites=(()=>{
  const width=160,height=192,scale=.45;
  const rows={up:0,down:1,left:2,right:3};
  const sprites={hero:new Image(),dog:new Image()};
  sprites.hero.src='assets/walk-ibrahim.webp';
  sprites.dog.src='assets/walk-dog.webp';
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
