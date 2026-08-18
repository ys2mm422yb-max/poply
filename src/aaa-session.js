import { loadSavedState, saveGameState, freshState } from './aaa-storage.js';
import { generateFromSlot, moveOrMerge, fulfillOrder, buildNextUpgrade } from './v2-game.js';
import { ensureEnergyClock, regenerateEnergy, recordEnergySpend } from './aaa-energy.js';
import { ensurePlayerProgress, awardPlayerXp, xpForOrder, xpForRestoration } from './aaa-progression.js';
import { ensureCollectionState, recordItemDiscovery, recordGeneratorDiscovery, recordPlaceDiscovery } from './aaa-collection.js';
import { ensureInventoryState, storeBoardItem, restoreStoredItem, recycleStoredItem, upgradeStorage } from './aaa-inventory.js';
import { ensureDailyState, progressDailyEvent, claimDailyGoal, fulfillDailyBonus } from './aaa-daily.js';
import { ensureGuestState, recordGuestService } from './aaa-guests.js';
import { applyDynamicServiceBonus } from './aaa-guest-dynamics.js';
import { ensureFlowState, recordMergeFlow, applyGeneratorBoost } from './aaa-flow.js';
import { ensureServiceSpecials, progressServiceSpecials, awardServiceSpecialBonus } from './aaa-specials.js';
import { ensurePlacePowerState, applyPreparationBonus, recordServicePlacePowers, replaceOrderWithGuestChoice, unlockPlacePowerForUpgrade } from './aaa-place-powers.js';
import { ensureServiceCallState, serviceCallStatus, chooseServiceCall, progressServiceCallGenerator, recordServiceCallDelivery } from './aaa-service-call.js';

const ensureMeta=source=>ensurePlacePowerState(ensureGuestState(ensureDailyState(ensureInventoryState(ensureCollectionState(ensurePlayerProgress(ensureServiceCallState(ensureServiceSpecials(ensureFlowState(source).state).state).state).state).state).state).state).state).state;
let state=ensureMeta(loadSavedState());
const keep=next=>{state=next;saveGameState(state);return state;};
const collectSpecialProgress=(result,event)=>{
  const progress=progressServiceSpecials(result.state,event);result.state=progress.state;
  if(progress.updates.length)result.specialUpdates=[...(result.specialUpdates||[]),...progress.updates];
  return progress;
};
const syncEnergy=(now=Date.now())=>{
  const result=regenerateEnergy(state,now);
  if(result.changed)keep(result.state);
  return {...result,state};
};
const syncDaily=()=>{
  const result=ensureDailyState(state);
  if(result.changed)keep(result.state);
  return {...result,state};
};
syncEnergy();syncDaily();

export const getState=()=>{syncEnergy();syncDaily();return state;};
export const refreshEnergy=(now=Date.now())=>{const result=syncEnergy(now);syncDaily();return {...result,state};};
export function resetSession(){
  const fresh=ensureMeta(freshState()),tracked=ensureEnergyClock(fresh);
  state=tracked.state;saveGameState(state);return state;
}
export function chooseServiceCallAt(orderId,mode){
  const result=chooseServiceCall(getState(),orderId,mode);
  if(result.changed)keep(result.state);
  return result;
}
export function generateAt(index){
  const current=getState(),beforeEnergy=current.energy,result=generateFromSlot(current,index);
  if(result.changed){
    const preparation=applyPreparationBonus(result.state,result.spawnedIndex);
    result.state=preparation.state;result.preparation=preparation;result.preparationBoosted=preparation.boosted;
    if(preparation.boosted)result.level=preparation.toLevel;
    const boost=applyGeneratorBoost(result.state,result.spawnedIndex);
    result.state=boost.state;result.flow=boost.status;result.flowBoosted=boost.boosted;result.flowBoost=boost.boosted?boost:null;
    if(boost.boosted)result.level=boost.toLevel;
    result.state=recordEnergySpend(result.state,beforeEnergy);
    const item=result.state.board[result.spawnedIndex],discovery=recordItemDiscovery(result.state,item);
    result.state=discovery.state;result.discovery=discovery.changed?discovery:null;result.discoveredItem=discovery.changed?structuredClone(item):null;result.progression=discovery.progression||null;result.mastery=discovery.mastery||null;
    const generated=progressDailyEvent(result.state,'generate');result.state=generated.state;
    if(discovery.changed){const discovered=progressDailyEvent(result.state,'discover');result.state=discovered.state;}
    collectSpecialProgress(result,{type:'item-created',family:item.family});
    if(boost.boosted)collectSpecialProgress(result,{type:'flow-boost',family:item.family});
    const serviceCall=progressServiceCallGenerator(result.state);result.state=serviceCall.state;result.serviceCall=serviceCall;result.serviceCallProgress=serviceCall.gained?serviceCall:null;
    keep(result.state);
  }
  return result;
}
export function moveOrMergeAt(from,to){
  const result=moveOrMerge(getState(),from,to);
  if(result.changed){
    if(result.type==='merge'){
      const flow=recordMergeFlow(result.state);result.state=flow.state;result.flow=flow.status;result.flowReady=flow.becameReady;
      const discovery=recordItemDiscovery(result.state,result.item);result.state=discovery.state;result.discovery=discovery.changed?discovery:null;result.discoveredItem=discovery.changed?structuredClone(result.item):null;result.progression=discovery.progression||null;result.mastery=discovery.mastery||null;
      const merged=progressDailyEvent(result.state,'merge');result.state=merged.state;
      if(discovery.changed){const discovered=progressDailyEvent(result.state,'discover');result.state=discovered.state;}
      collectSpecialProgress(result,{type:'merge'});
      collectSpecialProgress(result,{type:'item-created',family:result.item.family});
    }
    keep(result.state);
  }
  return result;
}
export function storeAt(boardIndex){const result=storeBoardItem(getState(),boardIndex);if(result.changed)keep(result.state);return result;}
export function restoreAt(storageIndex,targetIndex=null){const result=restoreStoredItem(getState(),storageIndex,targetIndex);if(result.changed)keep(result.state);return result;}
export function recycleStorageAt(storageIndex){const result=recycleStoredItem(getState(),storageIndex);if(result.changed)keep(result.state);return result;}
export function expandStorage(){const result=upgradeStorage(getState());if(result.changed)keep(result.state);return result;}
export function replaceOrder(id){
  const result=replaceOrderWithGuestChoice(getState(),id);if(!result.changed)return result;
  result.state=ensureServiceSpecials(result.state).state;result.state=ensureServiceCallState(result.state).state;result.serviceCallStatus=serviceCallStatus(result.state);result.replacement=structuredClone(result.state.currentOrders.find(order=>order.id===result.replacement.id));
  keep(result.state);return result;
}
export function deliverOrder(id){
  const current=getState(),order=current.currentOrders.find(entry=>entry.id===id),preview=fulfillOrder(current,id);
  if(!preview.changed)return preview;
  const serviceCall=recordServiceCallDelivery(current,id),result=serviceCall.changed?fulfillOrder(serviceCall.state,id):preview;
  const baseRewards={...result.rewards},special=awardServiceSpecialBonus(result.state,order);
  result.state=special.state;result.specialBonus=special.changed?{coins:special.bonusCoins,special:special.special}:null;
  result.serviceCall=serviceCall;result.serviceCallBonus=serviceCall.completed?{coins:serviceCall.bonusCoins,mode:serviceCall.mode}:null;
  const dynamics=applyDynamicServiceBonus(result.state,order);
  result.state=dynamics.state;result.guestDynamic=dynamics;
  result.rewards={...baseRewards,coins:baseRewards.coins+special.bonusCoins+serviceCall.bonusCoins+dynamics.totalCoins};
  result.state=ensureServiceSpecials(result.state).state;
  const progression=awardPlayerXp(result.state,xpForOrder(order));
  result.state=progression.state;result.progression=progression;
  result.state=progressDailyEvent(result.state,'serve').state;
  const guest=recordGuestService(result.state,order.sequence);
  result.state=guest.state;result.guest=guest;
  const powers=recordServicePlacePowers(result.state,order);result.state=powers.state;result.placePowers=powers.effects;result.placePowerStatus=powers.status;result.serviceCallStatus=serviceCallStatus(result.state);
  keep(result.state);return result;
}
export function buildUpgrade(){
  const result=buildNextUpgrade(getState());
  if(!result.changed)return result;
  const progression=awardPlayerXp(result.state,xpForRestoration(result));
  result.state=progression.state;result.progression=progression;
  const discoveries=[];
  if(result.unlockedPlace){
    const place=recordPlaceDiscovery(result.state,result.unlockedPlace);result.state=place.state;if(place.changed)discoveries.push(place.key);
    const generatorId={sunset:'sunset-gen',garden:'garden-gen'}[result.unlockedPlace];
    if(generatorId){const generator=recordGeneratorDiscovery(result.state,generatorId);result.state=generator.state;if(generator.changed)discoveries.push(generator.key);}
  }
  result.state=progressDailyEvent(result.state,'restore').state;
  const power=unlockPlacePowerForUpgrade(result.state,result.upgrade.id);result.state=power.state;result.placePower=power.power;result.placePowerStatus=power.status;
  result.discoveries=discoveries;keep(result.state);return result;
}
export function claimTodayGoal(goalId){const result=claimDailyGoal(getState(),goalId);if(result.changed)keep(result.state);return result;}
export function serveDailyGuest(){
  const result=fulfillDailyBonus(getState());if(!result.changed)return result;
  const progression=awardPlayerXp(result.state,xpForOrder(result.order));result.state=progression.state;result.progression=progression;
  result.state=progressDailyEvent(result.state,'serve').state;
  const guest=recordGuestService(result.state,result.order.sequence);result.state=guest.state;result.guest=guest;
  keep(result.state);return result;
}
saveGameState(state);