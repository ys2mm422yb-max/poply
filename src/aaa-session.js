import { loadSavedState, saveGameState, freshState } from './aaa-storage.js';
import { generateFromSlot, moveOrMerge, fulfillOrder, buildNextUpgrade } from './v2-game.js';
import { ensureEnergyClock, regenerateEnergy, recordEnergySpend } from './aaa-energy.js';
import { ensurePlayerProgress, awardPlayerXp, xpForOrder, xpForRestoration } from './aaa-progression.js';
import { ensureCollectionState, recordItemDiscovery, recordGeneratorDiscovery, recordPlaceDiscovery } from './aaa-collection.js';
import { ensureInventoryState, storeBoardItem, restoreStoredItem, upgradeStorage } from './aaa-inventory.js';

const ensureMeta=source=>ensureInventoryState(ensureCollectionState(ensurePlayerProgress(source).state).state).state;
let state=ensureMeta(loadSavedState());
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
  const fresh=ensureMeta(freshState()),tracked=ensureEnergyClock(fresh);
  state=tracked.state;saveGameState(state);return state;
}
export function generateAt(index){
  const current=syncEnergy().state,beforeEnergy=current.energy,result=generateFromSlot(current,index);
  if(result.changed){
    result.state=recordEnergySpend(result.state,beforeEnergy);
    const item=result.state.board[result.spawnedIndex],discovery=recordItemDiscovery(result.state,item);
    result.state=discovery.state;result.discovery=discovery.changed?discovery:null;result.discoveredItem=discovery.changed?structuredClone(item):null;result.progression=discovery.progression||null;keep(result.state);
  }
  return result;
}
export function moveOrMergeAt(from,to){
  const result=moveOrMerge(state,from,to);
  if(result.changed){
    if(result.type==='merge'){
      const discovery=recordItemDiscovery(result.state,result.item);result.state=discovery.state;result.discovery=discovery.changed?discovery:null;result.discoveredItem=discovery.changed?structuredClone(result.item):null;result.progression=discovery.progression||null;
    }
    keep(result.state);
  }
  return result;
}
export function storeAt(boardIndex){const result=storeBoardItem(state,boardIndex);if(result.changed)keep(result.state);return result;}
export function restoreAt(storageIndex,targetIndex=null){const result=restoreStoredItem(state,storageIndex,targetIndex);if(result.changed)keep(result.state);return result;}
export function expandStorage(){const result=upgradeStorage(state);if(result.changed)keep(result.state);return result;}
export function deliverOrder(id){
  const order=state.currentOrders.find(entry=>entry.id===id);
  const result=fulfillOrder(state,id);
  if(!result.changed)return result;
  const progression=awardPlayerXp(result.state,xpForOrder(order));
  result.state=progression.state;result.progression=progression;keep(result.state);return result;
}
export function buildUpgrade(){
  const result=buildNextUpgrade(state);
  if(!result.changed)return result;
  const progression=awardPlayerXp(result.state,xpForRestoration(result));
  result.state=progression.state;result.progression=progression;
  const discoveries=[];
  if(result.unlockedPlace==='sunset'){
    const place=recordPlaceDiscovery(result.state,'sunset');result.state=place.state;if(place.changed)discoveries.push(place.key);
    const generator=recordGeneratorDiscovery(result.state,'sunset-gen');result.state=generator.state;if(generator.changed)discoveries.push(generator.key);
  }
  result.discoveries=discoveries;keep(result.state);return result;
}
saveGameState(state);
