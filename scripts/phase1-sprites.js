/* Complete poses from the approved sheets, aligned to a shared ground line. */
const forestSprites=(()=>{
  const width=128,height=120,scale=.73;
  const rows={up:0,down:1,left:2,right:3};
  const atlases={
    hero:{image:new Image(),steps:8,file:'walk-ibrahim-r10.webp'},
    dog:{image:new Image(),steps:7,file:'walk-dog-r9.webp',stride:{
      up:[3,4,5,6,0,1,2],
      down:[3,4,5,6,0,1,2],
      left:[3,0,1,2,6,5,4],
      right:[3,2,1,0,6,5,4]
    }}
  };
  for(const atlas of Object.values(atlases))atlas.image.src='assets/'+atlas.file+'?v=11';

  function draw(ctx,name,x,y,dir,pose){
    const {distance=0,weight=0}=pose||{};
    const {image,steps,stride}=atlases[name];
    const isDog=name==='dog';
    const drawScale=isDog?scale*.75:scale;
    // Each dog cycle returns to a contact pose before the grid step ends.
    // Use complete atlas cells to keep the paws and silhouette crisp.
    const frame=stride
      ? (pose?.progress==null?steps:stride[dir][Math.min(steps,Math.floor(pose.progress*(steps+1)))%steps])
      : (weight<.10?steps:Math.floor(distance/80*steps)%steps);
    const shadowScale=isDog?.75:1;
    ctx.fillStyle='#172b2380';
    ctx.beginPath();
    ctx.ellipse(x,y+1,(isDog?14:12)*shadowScale,4.7*shadowScale,0,0,Math.PI*2);
    ctx.fill();
    if(image.complete&&image.naturalWidth){
      ctx.drawImage(image,width*frame,height*rows[dir],width,height,
        x-width*drawScale/2,y-116*drawScale,width*drawScale,height*drawScale);
    }
  }
  return {draw};
})();
