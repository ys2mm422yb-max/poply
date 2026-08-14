import { loadSavedState, saveGameState, freshState } from './aaa-storage.js';
import { generateFromSlot, moveOrMerge, fulfillOrder, buildNextUpgrade } from './v2-game.js';
import { ensureEnergyClock, regenerateEnergy, recordEnergySpend } from './aaa-energy.js';

let state=loadSavedState();
const keep=next=>{state=next;saveGameState(state);return state;};
const syncEnergy=(now=Date.now())=>{
  const result=regenerateEnergy(state,now);
  if(result.changed)keep(result.state);
  return {...result,state};
};
syncEnergy();

export const getState=()=>syncEnergy().state;
export const refreshEnergy=(now=Date.now())=>syncEnergy(now);
export function resetSession(){
  const fresh=freshState(),tracked=ensureEnergyClock(fresh);
  state=tracked.state;saveGameState(state);return state;
}
export function generateAt(index){
  const current=syncEnergy().state,beforeEnergy=current.energy,result=generateFromSlot(current,index);
  if(result.changed){result.state=recordEnergySpend(result.state,beforeEnergy);keep(result.state);}
  return result;
}
export function moveOrMergeAt(from,to){const result=moveOrMerge(state,from,to);if(result.changed)keep(result.state);return result;}
export function deliverOrder(id){const result=fulfillOrder(state,id);if(result.changed)keep(result.state);return result;}
export function buildUpgrade(){const result=buildNextUpgrade(state);if(result.changed)keep(result.state);return result;}
saveGameState(state);