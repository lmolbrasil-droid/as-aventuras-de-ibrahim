/* Original scores for the forest. Durations are in eighth notes; r is a rest. */
window.forestMusic = (() => {
  const scores = {
    map: {
      bpm: 92, meter: 6, lead:'flute',
      chords:['Dm','Bb','F','C','Gm','Dm','Bb','A','Dm','F','Gm','A','Bb','F','A','Dm'],
      melody:[
        'D5:2 F5 A5 G5 F5','D5:3 C5 Bb4 C5','A4:2 C5 F5 E5 C5','G4:3 E5:2 r',
        'Bb4 D5 G5:2 F5 D5','A4:2 D5 F5 A5:2','Bb5:2 A5 F5 D5 F5','E5:3 C#5 B4 C#5',
        'D5:2 A5 C6 Bb5 A5','G5 F5:2 A4 C5 E5','G5:2 Bb5 A5 G5 D5','E5:2 C#5 E5 A5:2',
        'Bb5 A5 F5:2 D5 F5','C6:2 A5 G5 F5 E5','E5 C#5 A4:2 E5 C#5','D5:4 A4 r'
      ]
    },
    wild: {
      bpm: 156, meter: 8, lead:'reed',
      chords:['Em','Em','C','D','Em','C','B','Em'],
      melody:[
        'E5:2 E5 G5 B4:2 D5 E5','r G5 E5 D5 B4:2 G4 B4',
        'C5 E5 G5:2 A5 G5 E5:2','D5:2 F#5 A5 r A5 F#5 D5',
        'E5 E5 G5 B5:2 G5 F#5 E5','G5 A5 G5 E5 C5:2 G4 C5',
        'F#5:2 D#5 B4 F#5 D#5 C5 B4','E5:3 B4 G4 E4:2 r'
      ]
    },
    boss: {
      bpm: 78, meter: 12, lead:'horn',
      chords:['Dm','Bb','Gm','A','Dm','Bb','Gm','A'],
      melody:[
        'D4:3 A4:3 C5:2 D5:4','F5:4 D5:2 Bb4:3 A4:3',
        'G4:3 Bb4:3 D5:3 G5:3','E5:3 C#5:3 B4:3 A4:3',
        'D5:3 A5:3 G5:2 F5:4','F5:3 D5:3 C5 Bb4 A4:4',
        'Bb4:3 D5:3 G5:4 F5:2','E5:3 C#5:3 A4:3 r:3'
      ]
    }
  };
  const chords={Dm:[50,57,62,65],Bb:[46,53,58,62],F:[41,53,57,60],C:[48,55,60,64],
    Gm:[43,55,58,62],A:[45,52,57,61],D:[50,57,62,66],Em:[40,52,55,59],B:[47,54,59,63]};
  const pitch={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const note=value=>value==='r'?0:12*(Number(value.at(-1))+1)+pitch[value[0]]+Number(value.includes('#'))-Number(value.includes('b'));
  const instruments={
    flute:{harmonics:[1,.23,.11,.03],attack:.075,release:.2,vibrato:3.3},
    string:{harmonics:[1,.51,.34,.22,.15,.08],attack:.17,release:.32,vibrato:2.3},
    harp:{harmonics:[1,.32,.18,.14,.06],attack:.009,release:.16,vibrato:0},
    reed:{harmonics:[1,.31,.49,.14,.15],attack:.04,release:.11,vibrato:2.5},
    choir:{harmonics:[1,.31,.18,.44,.28,.12],attack:.38,release:.39,vibrato:2.2},
    horn:{harmonics:[1,.54,.26,.2,.1,.06],attack:.095,release:.2,vibrato:1.2}
  };
  let ctx, master, scoreBus, dry, reverb, noise, timer, track, lightningBuffer;
  let lastVictory=false;
  let requested='',enabled=localStorage.getItem('ibrahimMusic')!=='off';
  const waves={};
  const button=document.getElementById('worldMusic');
  function label(){
    button.textContent=enabled?'♫ Música':'♫ Muda';
    button.setAttribute('aria-pressed',String(enabled));
  }
  label();
  function init(){
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio||ctx)return;
    ctx=new Audio();
    fetch('assets/corte-relampago-r9.wav')
      .then(response=>{if(!response.ok)throw Error('Arquivo de áudio indisponível');return response.arrayBuffer();})
      .then(bytes=>ctx.decodeAudioData(bytes))
      .then(buffer=>{lightningBuffer=buffer;})
      .catch(error=>console.warn('Corte Relâmpago:',error.message));
    master=ctx.createGain();master.gain.value=.7;
    scoreBus=ctx.createGain();scoreBus.connect(master);
    ctx.addEventListener('statechange',activate);
    dry=ctx.createDynamicsCompressor();
    master.connect(dry);dry.connect(ctx.destination);
    reverb=ctx.createConvolver();
    const impulse=ctx.createBuffer(2,ctx.sampleRate*1.5,ctx.sampleRate);
    for(let channel=0;channel<2;channel++){
      const samples=impulse.getChannelData(channel);
      for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*(1-i/samples.length)**3*.36;
    }
    reverb.buffer=impulse;
    const wet=ctx.createGain();wet.gain.value=.26;
    master.connect(reverb);reverb.connect(wet);wet.connect(dry);
    noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
    const samples=noise.getChannelData(0);
    for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
    for(const [type,spec] of Object.entries(instruments)){
      const harmonics=[0,...spec.harmonics];
      waves[type]=ctx.createPeriodicWave(new Float32Array(harmonics.length),Float32Array.from(harmonics));
    }
  }
  function voice(dest,midi,t,length,volume,type){
    if(!midi)return;
    const spec=instruments[type], osc=ctx.createOscillator(), amp=ctx.createGain();
    const end=t+length+spec.release;
    osc.setPeriodicWave(waves[type]);osc.frequency.value=440*2**((midi-69)/12);
    amp.gain.setValueAtTime(.0001,t);
    amp.gain.linearRampToValueAtTime(volume,t+Math.min(spec.attack,length*.4));
    amp.gain.exponentialRampToValueAtTime(volume*(type==='harp'?.12:.69),t+length);
    amp.gain.exponentialRampToValueAtTime(.0001,end);
    osc.connect(amp);amp.connect(dest);
    if(spec.vibrato){
      const lfo=ctx.createOscillator(), depth=ctx.createGain();
      lfo.frequency.value=5;depth.gain.value=spec.vibrato;
      lfo.connect(depth);depth.connect(osc.detune);lfo.start(t);lfo.stop(end);
    }
    osc.start(t);osc.stop(end);
  }
  function drum(dest,t,big,volume){
    const sample=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),amp=ctx.createGain();
    sample.buffer=noise;
    filter.type=big?'lowpass':'bandpass';filter.frequency.value=big?270:2400;
    amp.gain.setValueAtTime(volume,t);
    amp.gain.exponentialRampToValueAtTime(.0001,t+(big?.34:.10));
    sample.connect(filter);filter.connect(amp);amp.connect(dest);
    sample.start(t,0,big?.36:.13);
    if(big){
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.frequency.setValueAtTime(95,t);osc.frequency.exponentialRampToValueAtTime(41,t+.22);
      gain.gain.setValueAtTime(volume*.67,t);gain.gain.exponentialRampToValueAtTime(.0001,t+.3);
      osc.connect(gain);gain.connect(dest);osc.start(t);osc.stop(t+.32);
    }
  }
  function arrange(mode,score,bar){
    const [, ...upper]=chords[score.chords[bar]], bass=chords[score.chords[bar]][0];
    const notes=[];
    let beat=0;
    for(const token of score.melody[bar].split(' ')){
      const [value,length='1']=token.split(':');
      notes.push({beat,midi:note(value),length:Number(length)*.85,volume:.12,type:score.lead});
      beat+=Number(length);
    }
    const add=(beat,midi,length,volume,type)=>notes.push({beat,midi,length,volume,type});
    const hit=(beat,big,volume)=>notes.push({beat,drum:true,big,volume});
    if(mode==='map'){
      upper.forEach((midi,i)=>add(i*.19,midi,5.7,.036,'string'));
      for(const t of [0,3])add(t,bass+(t?12:0),2.6,.075,'harp');
      for(let t=0;t<6;t++)add(t,upper[(t+bar)%3]+(t%3===2?12:0),.67,.052,'harp');
    }else if(mode==='wild'){
      for(const [i,t] of [0,.75,1.5,2.5,3,4,4.75,5.5,6.5,7].entries())
        add(t,i%3?bass+12:upper[0],.37,i%3?.061:.096,'string');
      for(const t of [0,3.5,5,7])hit(t,true,.19);
      for(const t of [1,2,3,4.5,5.5,6,7.5])hit(t,false,.056);
      for(const t of [2,6])add(t,upper[2]-12,.42,.095,'horn');
    }else{
      upper.forEach((midi,i)=>{
        add(i*.19,midi,9,.066,'choir');
        add(3+i*.33,midi+12,7.2,.044,'string');
      });
      for(const t of [0,3,6,9]){
        add(t,bass,2.35,.103,'string');
        add(t+.5,upper[0],1.6,.058,'horn');
      }
      for(const t of [0,5,6,10.5])hit(t,true,t%6===0?.24:.13);
    }
    return notes.sort((a,b)=>a.beat-b.beat);
  }
  function schedule(){
    if(!track?.score||ctx.state!=='running')return;
    const {score,dest}=track,d=30/score.bpm;
    const nextEvent=track.time+track.events[track.index].beat*d;
    if(nextEvent<ctx.currentTime-.35)track.time+=ctx.currentTime+.03-nextEvent;
    while(track.time+track.events[track.index].beat*d<ctx.currentTime+.19){
      const event=track.events[track.index++];
      const t=track.time+event.beat*d;
      if(event.drum)drum(dest,t,event.big,event.volume);
      else voice(dest,event.midi,t,event.length*d,event.volume,event.type);
      if(track.index===track.events.length){
        track.bar=(track.bar+1)%score.chords.length;
        track.time+=score.meter*d;
        track.events=arrange(track.mode,score,track.bar);
        track.index=0;
      }
    }
  }
  function activate(){
    if(!ctx||ctx.state!=='running')return;
    const mode=enabled&&!document.hidden?requested:'';
    if(mode!=='victory')lastVictory=false;
    if(mode==='victory'&&lastVictory)return;
    if(track?.mode===mode)return;
    const now=ctx.currentTime, handoff=track?.mode?.length ? .045 : 0;
    if(track){
      const gain=track.dest;
      if(typeof gain.gain.cancelAndHoldAtTime==='function')gain.gain.cancelAndHoldAtTime(now);
      else{
        const fraction=Math.max(0,Math.min(1,(now-track.started)/track.fade));
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(fraction,now);
      }
      gain.gain.linearRampToValueAtTime(0,now+handoff);
      setTimeout(()=>gain.disconnect(),100);
      track=null;
    }
    clearInterval(timer);
    if(!mode)return;
    const dest=ctx.createGain(),score=scores[mode],t=now+handoff;
    const fade=mode==='wild'||mode==='boss'?.065:.42;
    dest.gain.setValueAtTime(0,now);dest.gain.setValueAtTime(0,t);
    dest.gain.linearRampToValueAtTime(1,t+fade);dest.connect(scoreBus);
    if(mode==='victory'||mode==='boss-victory'){
      if(mode==='victory'){lastVictory=true;playVictory(dest,t+.04);}
      else playBossVictory(dest,t+.04);
      track={mode,dest,started:t,fade};
      return;
    }
    track={mode,score,dest,started:t,fade,bar:0,index:0,time:t+.025,events:arrange(mode,score,0)};
    timer=setInterval(schedule,50);schedule();
  }
  function playVictory(dest,t){
    const theme=[[67,0,.28],[72,.26,.36],[76,.56,.42],[79,.9,.47],[81,1.32,.39],
      [79,1.68,.35],[76,1.99,.29],[77,2.25,.48],[74,2.65,.39],[72,3.03,1.24]];
    for(const [midi,offset,length] of theme){
      voice(dest,midi,t+offset,length,.17,'horn');
      voice(dest,midi+12,t+offset+.015,length*.65,.067,'flute');
    }
    for(const [i,notes] of [[48,55,64],[45,57,65],[53,57,65],[43,55,62],[48,55,64]].entries()){
      const beat=[0,.92,1.71,2.45,3.03][i];
      for(const [j,midi] of notes.entries()){
        voice(dest,midi,t+beat+j*.052,.66,.077,'string');
        voice(dest,midi+12,t+beat+j*.1,.54,.047,'harp');
      }
    }
    drum(dest,t,true,.2);drum(dest,t+3.03,true,.18);
  }
  function playBossVictory(dest,t){
    const bars=[
      {h:[50,57,65,69],m:[62,65,69,74]},
      {h:[46,53,62,65],m:[77,76,74,70]},
      {h:[43,55,62,70],m:[67,70,74,79]},
      {h:[45,57,64,73],m:[76,74,73,69]},
      {h:[50,57,66,74],m:[74,78,81,86]},
      {h:[50,57,66,78],m:[86,81,78,74]}
    ];
    bars.forEach(({h,m},bar)=>{
      const when=t+bar*1.9;
      h.forEach((midi,i)=>{
        voice(dest,midi,when+i*.04,bar===5?1.38:1.52,i===0?.13:.063,'string');
        voice(dest,midi+12,when+.12+i*.17,.52,.058,'harp');
      });
      m.forEach((midi,i)=>{
        const offset=[0,.38,.76,1.14][i];
        const length=i===3?.64:.30;
        voice(dest,midi,when+offset,length,.142,'horn');
        if(bar>=2)voice(dest,midi+12,when+offset+.026,length*.78,.046,'flute');
      });
      if([0,2,4,5].includes(bar))drum(dest,when,true,.17);
    });
  }
  function unlock(){
    try{
      init();
      if(ctx?.state==='running'){activate();return;}
      if(ctx)ctx.resume().then(activate).catch(()=>{});
    }catch(error){console.warn('Áudio da floresta indisponível:',error.message);}
  }
  // Android Chrome unlocks touch input on release rather than pointerdown.
  for(const name of ['pointerup','touchend','click','keydown']){
    document.addEventListener(name,unlock,{capture:true,passive:true});
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)activate();else if(ctx)unlock();});
  window.addEventListener('pageshow',()=>{if(ctx)unlock();});
  button.addEventListener('click',()=>{
    enabled=!enabled;localStorage.setItem('ibrahimMusic',enabled?'on':'off');
    label();unlock();activate();
  });
  function sweep(t,duration,from,to,gain){
    const sample=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),amp=ctx.createGain();
    sample.buffer=noise;
    filter.type='bandpass';filter.Q.value=.85;
    filter.frequency.setValueAtTime(from,t);
    filter.frequency.exponentialRampToValueAtTime(to,t+duration);
    amp.gain.setValueAtTime(.0001,t);
    amp.gain.linearRampToValueAtTime(gain,t+.025);
    amp.gain.exponentialRampToValueAtTime(.0001,t+duration);
    sample.connect(filter);filter.connect(amp);amp.connect(master);
    sample.start(t,0,duration+.01);
  }
  // Corte Relâmpago has its own amplitude and pitch envelopes. The sub
  // impact and upper resonances are separate so the strike stays clear at
  // low speaker volume without increasing the bus gain.
  const lightning={
    'normal-ready':[0,.70],
    'normal-swing':[.75,.43],
    'normal-impact':[1.25,.43],
    'normal-recoil':[1.76,.72]
  };
  function playLightning(name){
    if(!lightningBuffer)return;
    const source=ctx.createBufferSource(),gain=ctx.createGain();
    source.buffer=lightningBuffer;
    gain.gain.value=.68;
    source.connect(gain);gain.connect(master);
    const [offset,duration]=lightning[name];
    source.start(ctx.currentTime+.008,offset,duration);
  }
  const details={
    'bag-open':{sweep:[.23,430,870,.17],notes:[91,96,88],voice:'harp',gap:.055,delay:.09,volume:.056},
    'bag-close':{sweep:[.13,790,305,.10],notes:[81,88],voice:'harp',gap:.035,delay:.02,volume:.04},
    'ogre-growl':{sweep:[.54,142,370,.19],notes:[32,37,34],voice:'reed',gap:.13,volume:.14},
    'ogre-swing':{sweep:[.39,620,1740,.24],notes:[47,40],voice:'horn',gap:.11,volume:.105},
    'ogre-crush':{sweep:[.28,810,140,.26],notes:[31,43,47],voice:'horn',gap:.055,volume:.14,drum:true},
    'ogre-parry':{sweep:[.24,2650,920,.24],notes:[41,79,88],voice:'reed',gap:.05,volume:.115,drum:true},
    'discover-item':{notes:[67,72,76,79,84],voice:'harp',gap:.086,volume:.115},
    'discover-coins':{notes:[81,88,84,91],voice:'harp',gap:.059,volume:.11},
    'discover-gem':{notes:[72,79,83,86,91],voice:'flute',gap:.10,volume:.098},
    'discover-chest':{sweep:[.20,330,960,.14],notes:[48,60,67,74,79,84],voice:'horn',gap:.093,volume:.09}
  };
  return {
    unlock,
    setMode(mode){requested=mode;activate();},
    duck(duration){
      if(!ctx||ctx.state!=='running')return;
      const now=ctx.currentTime;
      scoreBus.gain.cancelScheduledValues(now);
      scoreBus.gain.setValueAtTime(1,now);
      scoreBus.gain.linearRampToValueAtTime(.61,now+.16);
      scoreBus.gain.setValueAtTime(.61,now+duration-.35);
      scoreBus.gain.linearRampToValueAtTime(1,now+duration);
    },
    effect(name){
      if(!ctx||ctx.state!=='running')return;
      if(name.startsWith('bag-')&&!enabled)return;
      if(lightning[name]){playLightning(name);return;}
      const detail=details[name];
      if(detail){
        const t=ctx.currentTime+.012;
        if(detail.sweep)sweep(t,...detail.sweep);
        if(detail.drum)drum(master,t,true,.21);
        detail.notes.forEach((note,index)=>voice(master,note,t+(detail.delay||0)+detail.gap*index,.2,detail.volume,detail.voice));
        return;
      }
      const patterns={slash:[[76,68,81],'reed',.07],companion:[[52,67,74],'horn',.09],
        ward:[[62,69,81],'string',.12],block:[[45,72,84],'horn',.06],
        'ogre-charge':[[36,41],'reed',.15],club:[[32,28],'horn',.08],
        leaves:[[69,74,81],'harp',.13],roots:[[38,50,63,57],'horn',.09],
        medicine:[[60,64,72],'harp',.10],injection:[[60,67,76,84],'flute',.09],
        smoke:[[43,40,35],'flute',.13],
        sleepCandy:[[74,70,65,58],'string',.15],sleep:[[72,69],'flute',.16],
        pickup:[[72,79,84],'harp',.06],treasure:[[60,67,72,79,84],'harp',.08]};
      const pattern=patterns[name];if(!pattern)return;
      const [notes,voiceName,spacing]=pattern;
      const t=ctx.currentTime+.015;
      if(['club','block','roots','smoke','companion'].includes(name))drum(master,t,name!=='smoke',.22);
      notes.forEach((n,i)=>voice(master,n,t+i*spacing,.23,.16,voiceName));
    },
    encounter(boss){
      if(!ctx||ctx.state!=='running')return;
      const t=ctx.currentTime+.015;
      drum(master,t,true,.21);
      for(const [i,midi] of (boss?[38,50,57,65]:[45,51,57,60]).entries()){
        voice(master,midi,t+i*.07,.48,.10,boss?'horn':'reed');
      }
    }
  };
})();
