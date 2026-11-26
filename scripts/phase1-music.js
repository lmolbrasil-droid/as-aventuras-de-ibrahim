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
      bpm: 132, meter: 8, lead:'reed',
      chords:['Am','Am','F','G','Am','C','Dm','E','F','G','Am','Am','Dm','F','E','Am'],
      melody:[
        'A4:2 C5 E5 A4 G4 E4 G4','A4:2 r E5 G5:2 E5 C5','F4 A4 C5:2 F5 E5 C5 A4','D5:2 G4 B4 D5 E5 G5:2',
        'A5 G5 E5:2 C5 E5 B4 C5','G5:2 E5 C5 D5 E5 G5:2','F5 D5 F5 A5:2 G5 F5 D5','E5:2 B4 G#4 E5:3 r',
        'C6:2 A5 F5 A5 C6 A5 F5','B5:2 G5 D5 F5 G5 A5:2','E5 A5:2 C6 B5 A5 G5 E5','A4 C5 E5 A5:2 E5 C5 B4',
        'D5:2 F5 E5 D5 A4 D5 F5','C5 F5:2 A5 G5 F5 E5 C5','B4 E5 G#5:2 B5 A5 G#5 E5','A5:3 E5 C5 B4 A4 r'
      ]
    },
    boss: {
      bpm: 106, meter: 8, lead:'horn',
      chords:['Dm','Bb','Gm','A','Dm','F','Bb','A','Gm','Bb','F','C','Dm','Bb','A','Dm'],
      melody:[
        'D4:3 A4 Bb4:2 A4 F4','F4:2 Bb4:2 D5:3 C5','Bb4:2 G4 D5 G5:2 F5 D5','E5:3 C#5 A4:3 r',
        'D5:3 A5 C6:2 Bb5 A5','A5:2 C6:2 F6:3 E6','D6:2 Bb5 F5 G5:2 A5 Bb5','A5:3 E5 C#5:3 r',
        'G4:2 Bb4 D5 G5:3 F5','F5:2 Bb5 A5 Bb5:2 D6 C6','C6:3 A5 F5:2 A5 C6','E6:2 G6 E6 D6:2 C6 G5',
        'F5:2 A5 D6 F6:2 E6 D6','Bb5:3 F5 Bb5:2 D6 C6','A5:2 G5 E5 C#5:2 E5 A5','D5:5 A4:2 r'
      ]
    }
  };
  const chords={Dm:[50,57,62,65],Bb:[46,53,58,62],F:[41,53,57,60],C:[48,55,60,64],
    Gm:[43,55,58,62],A:[45,52,57,61],Am:[45,52,57,60],G:[43,55,59,62],E:[40,52,56,59]};
  const pitch={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const note=value=>value==='r'?0:12*(Number(value.at(-1))+1)+pitch[value[0]]+Number(value.includes('#'))-Number(value.includes('b'));
  const instruments={
    flute:{harmonics:[1,.23,.11,.03],attack:.075,release:.2,vibrato:3.3},
    string:{harmonics:[1,.51,.34,.22,.15,.08],attack:.17,release:.32,vibrato:2.3},
    harp:{harmonics:[1,.32,.18,.14,.06],attack:.009,release:.16,vibrato:0},
    reed:{harmonics:[1,.31,.49,.14,.15],attack:.04,release:.11,vibrato:2.5},
    horn:{harmonics:[1,.54,.26,.2,.1,.06],attack:.095,release:.2,vibrato:1.2}
  };
  let ctx, master, dry, reverb, noise, timer, track;
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
    master=ctx.createGain();master.gain.value=.7;
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
    const map=mode==='map',boss=mode==='boss';
    for(const [i,midi] of upper.entries())add(i*.19,midi,map?5.7:7.4,.036,'string');
    for(const t of map?[0,3]:[0,2,4,6])add(t,bass+(t%4?12:0),map?2.6:1.45,.075,boss?'string':'harp');
    for(let t=0;t<score.meter;t++){
      if(map||t%2===1)add(t,upper[(t+bar)%3]+(map&&t%3===2?12:0),.67,map?.052:.032,'harp');
    }
    if(!map){
      for(const t of boss?[0,3,4,7]:[0,2.5,4,6,7])notes.push({beat:t,drum:true,big:t%4===0,volume:t%4===0?.13:.047});
      if(boss&&bar%4>=2)add(4,upper[1]+12,3.1,.035,'horn');
    }
    return notes.sort((a,b)=>a.beat-b.beat);
  }
  function schedule(){
    if(!track||ctx.state!=='running')return;
    const {score,dest}=track,d=30/score.bpm;
    if(track.time<ctx.currentTime-.5)track.time=ctx.currentTime+.03;
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
    if(!ctx)return;
    const mode=enabled&&!document.hidden?requested:'';
    if(track?.mode===mode)return;
    if(track){
      const gain=track.dest, t=ctx.currentTime;
      gain.gain.cancelAndHoldAtTime(t);
      gain.gain.linearRampToValueAtTime(0,t+.42);
      setTimeout(()=>gain.disconnect(),850);
      track=null;
    }
    clearInterval(timer);
    if(!mode)return;
    const dest=ctx.createGain(),score=scores[mode],t=ctx.currentTime;
    dest.gain.setValueAtTime(0,t);dest.gain.linearRampToValueAtTime(1,t+.42);dest.connect(master);
    track={mode,score,dest,bar:0,index:0,time:t+.025,events:arrange(mode,score,0)};
    timer=setInterval(schedule,50);schedule();
  }
  function unlock(){
    init();
    if(ctx)ctx.resume().then(activate).catch(()=>{});
  }
  document.addEventListener('pointerdown',unlock,{once:true});
  document.addEventListener('keydown',unlock,{once:true});
  document.addEventListener('visibilitychange',activate);
  button.addEventListener('click',()=>{
    enabled=!enabled;localStorage.setItem('ibrahimMusic',enabled?'on':'off');
    label();unlock();activate();
  });
  return {
    unlock,
    setMode(mode){requested=mode;activate();},
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
