/* Measure established gameplay after startup, using a fixed route and duration. */
const { chromium, devices } = require('playwright');

const origins=process.argv.slice(2);
if(!origins.length)origins.push('http://127.0.0.1:8313');
const cpuRate=Number(process.env.CPU_RATE||4);
const profiles=[
  ['Pixel 7 emulado',devices['Pixel 7']],
  ['Desktop DPR 2',{viewport:{width:1920,height:1080},deviceScaleFactor:2}]
];
const trials=Number(process.env.TRIALS||2);

async function measure(browser,origin,options,fullscreen) {
  const context=await browser.newContext(options);
  try {
    const page=await context.newPage();
    const cdp=await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpuRate});
    await page.goto(origin);
    await page.locator('#openExploreMode').click();
    if(fullscreen){
      await page.locator('#worldFullscreen').click();
      await page.waitForFunction(()=>document.fullscreenElement?.id==='ibrahimGame');
    }
    await page.waitForTimeout(1000);
    await page.evaluate(()=>{
      Math.random=()=>.99;
      window.sample=new Promise(resolve=>{
        const deltas=[],draws=[],duration=6400,step=800;
        const original=forestTerrain.draw;
        forestTerrain.draw=(...args)=>{
          const start=performance.now();
          original(...args);
          draws.push(performance.now()-start);
        };
        const send=(type,key)=>window.dispatchEvent(new KeyboardEvent(type,{key}));
        let start,previous,key,leg=-1;
        function frame(now){
          start??=now;
          if(previous!==undefined)deltas.push(now-previous);
          previous=now;
          const elapsed=now-start;
          if(elapsed>=duration){
            send('keyup',key);
            forestTerrain.draw=original;
            const pct=(values,p)=>{
              const sorted=values.slice().sort((a,b)=>a-b);
              return Number(sorted[Math.floor((sorted.length-1)*p)].toFixed(2));
            };
            const canvas=document.querySelector('#ibrahimExploreCanvas');
            resolve({fps:Number((1000*deltas.length/elapsed).toFixed(1)),
              frameP50:pct(deltas,.5),frameP95:pct(deltas,.95),drawP95:pct(draws,.95),
              surface:[canvas.width,canvas.height],css:[canvas.clientWidth,canvas.clientHeight],
              dpr:devicePixelRatio,heapMb:Math.round(performance.memory.usedJSHeapSize/1e6)});
            return;
          }
          const next=Math.floor(elapsed/step);
          if(next!==leg){
            if(key)send('keyup',key);
            key=next%2?'ArrowLeft':'ArrowRight';
            send('keydown',key);
            leg=next;
          }
          requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    });
    return await page.evaluate(()=>sample);
  } finally {await context.close();}
}

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',
    args:['--window-size=1920,1080']});
  try {
    const results=[];
    for(let trial=1;trial<=trials;trial++){
      const order=trial%2?origins:origins.slice().reverse();
      for(const [profile,options] of profiles){
        if(process.env.PROFILE&&!profile.includes(process.env.PROFILE))continue;
        for(const fullscreen of [false,true]){
          for(const origin of order){
            const result={trial,profile,fullscreen,origin,cpuRate,
              ...await measure(browser,origin,options,fullscreen)};
            results.push(result);
            if(process.env.BENCH_PROGRESS)console.error(JSON.stringify(result));
          }
        }
      }
    }
    console.log(JSON.stringify(results,null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
