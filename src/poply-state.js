import { createInitialState, normalizeState } from './v2-game.js';

export const SAVE_KEY='poply-v2-state-1';
export const CLIENT_SCHEMA=3;

const clone=value=>structuredClone(value);

function isUntouchedLegacyStarter(state){
  const stats=state?.stats??{};
  return Number(stats.merges||0)===0&&Number(stats.generated||0)===0&&Number(stats.orders||0)===0&&Array.isArray(state.placeUpgrades)&&state.placeUpgrades.length===0;
}

function removeLegacyStarterExtras(state){
  if(!isUntouchedLegacyStarter(state))return state;
  const plus=state.board
    .map((item,index)=>({item,index}))
    .filter(entry=>entry.item?.kind==='item'&&String(entry.item.id||'').startsWith('starter-plus-'));
  if(!plus.length)return state;
  const next=clone(state);
  for(const {index} of plus)next.board[index]=null;
  return next;
}

export function migrateState(input){
  let state=normalizeState(input);
  state=removeLegacyStarterExtras(state);
  state.clientSchema=CLIENT_SCHEMA;
  state.updatedAt=Date.now();
  return state;
}

export function createFreshState(){
  const state=createInitialState();
  state.clientSchema=CLIENT_SCHEMA;
  return state;
}

export function readState(storage=globalThis.localStorage){
  try{
    const raw=storage?.getItem?.(SAVE_KEY);
    return raw?migrateState(JSON.parse(raw)):createFreshState();
  }catch{
    return createFreshState();
  }
}

export function writeState(state,storage=globalThis.localStorage){
  try{
    storage?.setItem?.(SAVE_KEY,JSON.stringify({...state,clientSchema:CLIENT_SCHEMA,updatedAt:Date.now()}));
    return true;
  }catch{
    return false;
  }
}

export function resetState(storage=globalThis.localStorage){
  const state=createFreshState();
  writeState(state,storage);
  return state;
}
