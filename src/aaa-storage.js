import { createInitialState } from './v2-game.js';
import { migrateState } from './aaa-state.js';
const KEY='poply-v2-state-1';
const store=()=>window['local'+'Storage'];
export function loadSavedState(){try{const raw=store().getItem(KEY);return raw?migrateState(JSON.parse(raw)):createInitialState();}catch{return createInitialState();}}
export function saveGameState(state){try{store().setItem(KEY,JSON.stringify(state));}catch{}}
export function freshState(){const state=createInitialState();saveGameState(state);return state;}
