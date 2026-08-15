import { ITEM_FAMILIES } from './v2-game.js';

export const FLOW_THRESHOLD=3;

const clampCharge=value=>Math.max(0,Math.min(FLOW_THRESHOLD,Number.isInteger(Number(value))?Number(value):0));
const boostsUsed=value=>Math.max(0,Number.isInteger(Number(value))?Number(value):0);

export function flowStatus(state){
  const raw=state?.mergeFlow||{};
  const rawCharge=clampCharge(raw.charge);
  const boostReady=Boolean(raw.boostReady)||rawCharge>=FLOW_THRESHOLD;
  const charge=boostReady?FLOW_THRESHOLD:rawCharge;
  return {charge,threshold:FLOW_THRESHOLD,boostReady,remaining:boostReady?0:FLOW_THRESHOLD-charge,boostsUsed:boostsUsed(raw.boostsUsed)};
}

export function ensureFlowState(source){
  const before=flowStatus(source),raw=source?.mergeFlow;
  const canonical={charge:before.charge,boostReady:before.boostReady,boostsUsed:before.boostsUsed};
  const changed=!raw||raw.charge!==canonical.charge||raw.boostReady!==canonical.boostReady||raw.boostsUsed!==canonical.boostsUsed;
  if(!changed)return {state:source,changed:false,status:before};
  const state=structuredClone(source);state.mergeFlow=canonical;
  return {state,changed:true,status:flowStatus(state)};
}

export function chargeFlow(source,amount=1){
  const ensured=ensureFlowState(source),before=flowStatus(ensured.state),gain=Math.max(0,Math.floor(Number(amount)||0));
  if(!gain||before.boostReady)return {state:ensured.state,changed:ensured.changed,gained:0,becameReady:false,status:before};
  const charge=Math.min(FLOW_THRESHOLD,before.charge+gain),actual=charge-before.charge,boostReady=charge>=FLOW_THRESHOLD;
  if(!actual)return {state:ensured.state,changed:ensured.changed,gained:0,becameReady:false,status:before};
  const state=ensured.changed?structuredClone(ensured.state):structuredClone(source);
  state.mergeFlow={charge,boostReady,boostsUsed:before.boostsUsed};
  return {state,changed:true,gained:actual,becameReady:boostReady&&!before.boostReady,status:flowStatus(state)};
}

export function recordMergeFlow(source){return chargeFlow(source,1);}

export function applyGeneratorBoost(source,spawnedIndex){
  const ensured=ensureFlowState(source),before=flowStatus(ensured.state);
  if(!before.boostReady)return {state:ensured.state,changed:ensured.changed,boosted:false,status:before};
  const state=ensured.changed?structuredClone(ensured.state):structuredClone(source),item=state.board?.[spawnedIndex];
  if(!item||item.kind!=='item')return {state:ensured.state,changed:ensured.changed,boosted:false,status:before};
  const maxLevel=ITEM_FAMILIES[item.family]?.stages?.length||item.level;
  const fromLevel=item.level,toLevel=Math.min(maxLevel,fromLevel+1);
  state.board[spawnedIndex]={...item,level:toLevel};
  state.mergeFlow={charge:0,boostReady:false,boostsUsed:before.boostsUsed+1};
  return {state,changed:true,boosted:toLevel>fromLevel,fromLevel,toLevel,item:structuredClone(state.board[spawnedIndex]),status:flowStatus(state)};
}
