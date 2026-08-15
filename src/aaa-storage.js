import { createInitialState } from './v2-game.js';
import { migrateState } from './aaa-state.js';
const KEY='poply-v2-state-1';
const BACKUP_KEY='poply-v2-state-1-backup';
const store=()=>window['local'+'Storage'];

function decode(raw){
  if(!raw)return null;
  return migrateState(JSON.parse(raw));
}

function restorePrimary(storage,state){
  try{storage.setItem(KEY,JSON.stringify(state));}catch{}
  return state;
}

export function loadSavedState(){
  let storage;
  try{storage=store();}catch{return createInitialState();}
  try{
    const raw=storage.getItem(KEY),state=decode(raw);
    if(state){
      try{if(!storage.getItem(BACKUP_KEY))storage.setItem(BACKUP_KEY,raw);}catch{}
      return state;
    }
  }catch{}
  try{
    const backup=decode(storage.getItem(BACKUP_KEY));
    if(backup)return restorePrimary(storage,backup);
  }catch{}
  return createInitialState();
}

export function saveGameState(state){
  try{
    const storage=store(),encoded=JSON.stringify(state),previous=storage.getItem(KEY);
    if(previous){
      try{decode(previous);storage.setItem(BACKUP_KEY,previous);}catch{}
    }else storage.setItem(BACKUP_KEY,encoded);
    storage.setItem(KEY,encoded);
  }catch{}
}

export function freshState(){
  const state=createInitialState();
  try{
    const storage=store(),encoded=JSON.stringify(state);
    storage.setItem(KEY,encoded);
    storage.setItem(BACKUP_KEY,encoded);
  }catch{}
  return state;
}
