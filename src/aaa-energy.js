export const ENERGY_REGEN_MS=2*60*1000;
export const ENERGY_REGEN_MINUTES=2;

const clone=value=>structuredClone(value);
const validClock=(value,now)=>Number.isFinite(Number(value))&&Number(value)>0&&Number(value)<=now;

export function ensureEnergyClock(inputState,now=Date.now()){
  if(validClock(inputState.energyUpdatedAt,now))return {state:inputState,changed:false};
  const state=clone(inputState);state.energyUpdatedAt=now;return {state,changed:true};
}

export function regenerateEnergy(inputState,now=Date.now()){
  const ensured=ensureEnergyClock(inputState,now);
  const base=ensured.state;
  const maxEnergy=Math.max(1,Number(base.maxEnergy)||40);
  const energy=Math.max(0,Math.min(maxEnergy,Number(base.energy)||0));
  if(energy>=maxEnergy){
    if(!ensured.changed&&energy===base.energy)return {state:inputState,changed:false,gained:0};
    const state=ensured.changed?base:clone(base);state.energy=maxEnergy;return {state,changed:true,gained:0};
  }
  const elapsed=Math.max(0,now-Number(base.energyUpdatedAt));
  const intervals=Math.floor(elapsed/ENERGY_REGEN_MS);
  if(intervals<1){
    if(!ensured.changed&&energy===base.energy)return {state:inputState,changed:false,gained:0};
    const state=ensured.changed?base:clone(base);state.energy=energy;return {state,changed:true,gained:0};
  }
  const gained=Math.min(maxEnergy-energy,intervals);
  const state=clone(base);state.energy=energy+gained;
  state.energyUpdatedAt=state.energy>=maxEnergy?now:Number(base.energyUpdatedAt)+gained*ENERGY_REGEN_MS;
  state.updatedAt=now;
  return {state,changed:true,gained};
}

export function recordEnergySpend(inputState,previousEnergy,now=Date.now()){
  const ensured=ensureEnergyClock(inputState,now);
  const state=ensured.changed?ensured.state:clone(inputState);
  const maxEnergy=Math.max(1,Number(state.maxEnergy)||40);
  if(Number(previousEnergy)>=maxEnergy&&Number(state.energy)<maxEnergy)state.energyUpdatedAt=now;
  return state;
}

export function energyMsUntilNext(state,now=Date.now()){
  const maxEnergy=Math.max(1,Number(state.maxEnergy)||40);
  if(Number(state.energy)>=maxEnergy)return 0;
  const anchor=validClock(state.energyUpdatedAt,now)?Number(state.energyUpdatedAt):now;
  const elapsed=Math.max(0,now-anchor);
  const remainder=elapsed%ENERGY_REGEN_MS;
  return remainder===0?ENERGY_REGEN_MS:ENERGY_REGEN_MS-remainder;
}

export function energyRechargePlan(state,now=Date.now()){
  const maxEnergy=Math.max(1,Number(state.maxEnergy)||40);
  const energy=Math.max(0,Math.min(maxEnergy,Number(state.energy)||0));
  const missing=Math.max(0,maxEnergy-energy);
  if(missing===0)return {energy,maxEnergy,missing:0,nextMs:0,fullMs:0,fullAt:now};
  const nextMs=energyMsUntilNext({...state,energy,maxEnergy},now);
  const fullMs=nextMs+(missing-1)*ENERGY_REGEN_MS;
  return {energy,maxEnergy,missing,nextMs,fullMs,fullAt:now+fullMs};
}

export function energyFullRechargeLabel(state,now=Date.now()){
  const plan=energyRechargePlan(state,now);
  if(plan.missing===0)return 'Voll geladen';
  const totalMinutes=Math.max(1,Math.ceil(plan.fullMs/60_000));
  if(totalMinutes<60)return `Voll in ca. ${totalMinutes} Min`;
  const hours=Math.floor(totalMinutes/60),minutes=totalMinutes%60;
  return `Voll in ca. ${hours} Std${minutes?` ${minutes} Min`:''}`;
}

export function energyStatusLabel(state,now=Date.now()){
  const maxEnergy=Math.max(1,Number(state.maxEnergy)||40);
  if(Number(state.energy)>=maxEnergy)return `Auto · ${ENERGY_REGEN_MINUTES} Min`;
  const seconds=Math.max(1,Math.ceil(energyMsUntilNext(state,now)/1000));
  const minutes=Math.floor(seconds/60),rest=String(seconds%60).padStart(2,'0');
  return `+1 in ${minutes}:${rest}`;
}
