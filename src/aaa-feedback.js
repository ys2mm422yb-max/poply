const CUES={
  move:{haptic:4,tones:[[220,0.018,0.018]]},
  merge:{haptic:[8,10,18],tones:[[390,0.045,0.028],[590,0.07,0.038]]},
  spawn:{haptic:[5,8],tones:[[280,0.035,0.025],[360,0.05,0.02]]},
  delivery:{haptic:[10,18,14],tones:[[440,0.04,0.025],[660,0.07,0.03]]},
  reward:{haptic:[6,10,8],tones:[[620,0.035,0.025],[820,0.07,0.028]]},
  restoration:{haptic:[16,22,20,28,28],tones:[[330,0.06,0.025],[495,0.09,0.032],[740,0.14,0.035]]},
  invalid:{haptic:7,tones:[[150,0.045,0.018]]}
};

let context=null;
const reducedMotion=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;

function vibrate(pattern){
  if(reducedMotion())return;
  try{globalThis.navigator?.vibrate?.(pattern);}catch{}
}

function audioContext(){
  const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!AudioContext)return null;
  try{
    context??=new AudioContext();
    if(context.state==='suspended')context.resume?.();
    return context;
  }catch{return null;}
}

function tone(ctx,frequency,delay,duration,gainValue){
  const oscillator=ctx.createOscillator();
  const gain=ctx.createGain();
  const start=ctx.currentTime+delay;
  const end=start+duration;
  oscillator.type='sine';
  oscillator.frequency.setValueAtTime(frequency,start);
  gain.gain.setValueAtTime(0.0001,start);
  gain.gain.exponentialRampToValueAtTime(gainValue,start+Math.min(0.012,duration/2));
  gain.gain.exponentialRampToValueAtTime(0.0001,end);
  oscillator.connect(gain);gain.connect(ctx.destination);
  oscillator.start(start);oscillator.stop(end+0.01);
}

function sound(tones){
  const ctx=audioContext();
  if(!ctx)return;
  tones.forEach(([frequency,delay,duration],index)=>tone(ctx,frequency,delay,duration,Math.max(0.018,0.032-index*0.004)));
}

export function playFeedback(name,{soundEnabled=true,hapticsEnabled=true}={}){
  const cue=CUES[name];
  if(!cue)return false;
  if(hapticsEnabled)vibrate(cue.haptic);
  if(soundEnabled)sound(cue.tones);
  return true;
}

export function getFeedbackProfile(name){
  const cue=CUES[name];
  return cue?{haptic:Array.isArray(cue.haptic)?[...cue.haptic]:cue.haptic,tones:cue.tones.map(tone=>[...tone])}:null;
}
