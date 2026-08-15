export const ENERGY_REGEN_MS=2*60*1000;
export const ENERGY_REGEN_MINUTES=2;
export const ENERGY_RESERVE_CAP=5;
export const ENERGY_RESERVE_MAX_CAP=8;
export const ENERGY_RESERVE_STEP=5;
export const ENERGY_RESERVE_BASE_MAX_ENERGY=40;

const clone=value=>structuredClone(value);
const validClock=(value,now)=>Number.isFinite(Number(value))&&Number(value)>0&&Number(value)<=now;

export function energyReserveCap(state){
  const maxEnergy=Math.max(ENERGY_RESERVE_BASE_MAX_ENERGY,Math.floor(Number(state?.maxEnergy)||ENERGY_RESERVE_BASE_MAX_ENERGY));
  const earnedSteps=Math.max(0,Math.floor((maxEnergy-ENERGY_RESERVE_BASE_MAX_ENERGY)/ENERGY_RESERVE_STEP));
  return Math.min(ENERGY_RESERVE_MAX_CAP,ENERGY_RESERVE_CAP+earnedSteps);
}

const reserveValue=state=>Math.max(0,Math.min(energyReserveCap(state),Math.floor(Number(state?.energyReserve)||0)));

export function ensureEnergyClock(inputState,now=Date.now()){
  if(validClock(inputState.energyUpdatedAt,now))return {state:inputState,changed:false};
  const state=clone(inputState);state.energyUpdatedAt=now;return {state,changed:true};
}

export function regenerateEnergy(inputState,now=Date.now()){
  const ensured=ensureEnergyClock(inputState,now);
  const base=ensured.state;
  const maxEnergy=Math.max(1,Number(base.maxEnergy)||40);
  const reserveCap=energyReserveCap(base);
  let energy=Math.max(0,Math.min(maxEnergy,Number(base.energy)||0));
  let reserve=reserveValue(base);
  const reserveNeedsSync=Number(base.energyReserve)!==reserve;
  const anchor=Number(base.energyUpdatedAt);
  const elapsed=Math.max(0,now-anchor);
  const intervals=Math.floor(elapsed/ENERGY_REGEN_MS);

  if(energy>=maxEnergy){
    const reserveGained=Math.min(reserveCap-reserve,intervals);
    if(reserveGained>0){
      const state=clone(base);state.energy=maxEnergy;state.energyReserve=reserve+reserveGained;
      state.energyUpdatedAt=state.energyReserve>=reserveCap?now:anchor+reserveGained*ENERGY_REGEN_MS;
      state.updatedAt=now;
      return {state,changed:true,gained:0,reserveGained,reserveUsed:0,reserveCap};
    }
    if(!ensured.changed&&!reserveNeedsSync&&energy===base.energy)return {state:inputState,changed:false,gained:0,reserveGained:0,reserveUsed:0,reserveCap};
    const state=clone(base);state.energy=maxEnergy;state.energyReserve=reserve;
    return {state,changed:true,gained:0,reserveGained:0,reserveUsed:0,reserveCap};
  }

  const reserveUsed=Math.min(reserve,maxEnergy-energy);
  if(reserveUsed){energy+=reserveUsed;reserve-=reserveUsed;}
  if(energy>=maxEnergy){
    const reserveGained=Math.min(reserveCap-reserve,intervals);
    const state=clone(base);state.energy=maxEnergy;state.energyReserve=reserve+reserveGained;
    state.energyUpdatedAt=reserveGained?state.energyReserve>=reserveCap?now:anchor+reserveGained*ENERGY_REGEN_MS:anchor;
    state.updatedAt=now;
    return {state,changed:true,gained:reserveUsed,reserveGained,reserveUsed,reserveCap};
  }

  if(intervals<1){
    if(!ensured.changed&&!reserveNeedsSync&&!reserveUsed&&energy===base.energy)return {state:inputState,changed:false,gained:0,reserveGained:0,reserveUsed:0,reserveCap};
    const state=clone(base);state.energy=energy;state.energyReserve=reserve;if(reserveUsed)state.updatedAt=now;
    return {state,changed:true,gained:reserveUsed,reserveGained:0,reserveUsed,reserveCap};
  }

  const regenerated=Math.min(maxEnergy-energy,intervals);
  const state=clone(base);state.energy=energy+regenerated;state.energyReserve=reserve;
  state.energyUpdatedAt=state.energy>=maxEnergy?now:anchor+regenerated*ENERGY_REGEN_MS;
  state.updatedAt=now;
  return {state,changed:true,gained:reserveUsed+regenerated,reserveGained:0,reserveUsed,reserveCap};
}

export function recordEnergySpend(inputState,previousEnergy,now=Date.now()){
  const ensured=ensureEnergyClock(inputState,now);
  const state=ensured.changed?ensured.state:clone(inputState);
  const maxEnergy=Math.max(1,Number(state.maxEnergy)||40);
  state.energyReserve=reserveValue(state);
  if(Number(previousEnergy)>=maxEnergy&&Number(state.energy)<maxEnergy)state.energyUpdatedAt=now;
  return state;
}

export function energyMsUntilNext(state,now=Date.now()){
  const maxEnergy=Math.max(1,Number(state.maxEnergy)||40);
  const reserve=reserveValue(state),reserveCap=energyReserveCap(state);
  if(Number(state.energy)>=maxEnergy&&reserve>=reserveCap)return 0;
  const anchor=validClock(state.energyUpdatedAt,now)?Number(state.energyUpdatedAt):now;
  const elapsed=Math.max(0,now-anchor);
  const remainder=elapsed%ENERGY_REGEN_MS;
  return remainder===0?ENERGY_REGEN_MS:ENERGY_REGEN_MS-remainder;
}

export function energyRechargePlan(state,now=Date.now()){
  const maxEnergy=Math.max(1,Number(state.maxEnergy)||40);
  const energy=Math.max(0,Math.min(maxEnergy,Number(state.energy)||0));
  const reserve=reserveValue(state);
  const effectiveEnergy=Math.min(maxEnergy,energy+reserve);
  const reserveUsed=Math.min(reserve,maxEnergy-energy);
  const reserveAfter=Math.max(0,reserve-reserveUsed);
  const missing=Math.max(0,maxEnergy-effectiveEnergy);
  if(missing===0)return {energy:effectiveEnergy,maxEnergy,reserve:reserveAfter,reserveCap:energyReserveCap(state),missing:0,nextMs:0,fullMs:0,fullAt:now};
  const nextMs=energyMsUntilNext({...state,energy:effectiveEnergy,energyReserve:reserveAfter,maxEnergy},now);
  const fullMs=nextMs+(missing-1)*ENERGY_REGEN_MS;
  return {energy:effectiveEnergy,maxEnergy,reserve:reserveAfter,reserveCap:energyReserveCap(state),missing,nextMs,fullMs,fullAt:now+fullMs};
}

export function energyFullRechargeLabel(state,now=Date.now()){
  const plan=energyRechargePlan(state,now);
  if(plan.missing===0)return 'Voll geladen';
  const totalMinutes=Math.max(1,Math.ceil(plan.fullMs/60_000));
  if(totalMinutes<60)return `Voll in ca. ${totalMinutes} Min`;
  const hours=Math.floor(totalMinutes/60),minutes=totalMinutes%60;
  return `Voll in ca. ${hours} Std${minutes?` ${minutes} Min`:''}`;
}

export function energyReserveLabel(state){return `Reserve ${reserveValue(state)}/${energyReserveCap(state)}`;}

export function energyStatusLabel(state,now=Date.now()){
  const maxEnergy=Math.max(1,Number(state.maxEnergy)||40);
  const reserve=reserveValue(state),reserveCap=energyReserveCap(state);
  if(Number(state.energy)>=maxEnergy)return `Reserve ${reserve}/${reserveCap}`;
  const seconds=Math.max(1,Math.ceil(energyMsUntilNext(state,now)/1000));
  const minutes=Math.floor(seconds/60),rest=String(seconds%60).padStart(2,'0');
  return `+1 in ${minutes}:${rest}`;
}
