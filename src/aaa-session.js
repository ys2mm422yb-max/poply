import { loadSavedState, saveGameState, freshState } from './aaa-storage.js';
import { generateFromSlot, moveOrMerge, fulfillOrder, buildNextUpgrade } from './v2-game.js';

let state=loadSavedState();
export const getState=()=>state;
const keep=next=>{state=next;saveGameState(state);return state;};
export function resetSession(){state=freshState();return state;}
export function generateAt(index){const result=generateFromSlot(state,index);if(result.changed)keep(result.state);return result;}
export function moveOrMergeAt(from,to){const result=moveOrMerge(state,from,to);if(result.changed)keep(result.state);return result;}
export function deliverOrder(id){const result=fulfillOrder(state,id);if(result.changed)keep(result.state);return result;}
export function buildUpgrade(){const result=buildNextUpgrade(state);if(result.changed)keep(result.state);return result;}
saveGameState(state);
