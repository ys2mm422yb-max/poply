import { createInitialState } from './v2-game.js';

const SAVE_KEY='poply-v2-state-1';
const STARTER_PLACEMENTS=[[1,'coffee'],[5,'bakery'],[8,'sweet'],[12,'coffee'],[15,'bakery'],[19,'sweet']];

function untouchedStarter(state){
  if(!state||!Array.isArray(state.board)||state.board.length!==49)return false;
  const stats=state.stats||{};
  return Number(stats.merges||0)===0&&Number(stats.generated||0)===0&&Number(stats.orders||0)===0&&Array.isArray(state.placeUpgrades)&&state.placeUpgrades.length===0&&state.board.filter(Boolean).length<=8;
}

export function enrichStarterState(input){
  const state=structuredClone(input);
  if(!untouchedStarter(state))return state;
  let seq=0;
  for(const [index,family] of STARTER_PLACEMENTS){
    if(state.board[index])continue;
    seq+=1;
    state.board[index]={id:`starter-plus-${family}-${seq}`,kind:'item',family,level:1};
  }
  state.updatedAt=Date.now();
  return state;
}

function boot(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    const base=raw?JSON.parse(raw):createInitialState();
    localStorage.setItem(SAVE_KEY,JSON.stringify(enrichStarterState(base)));
  }catch{
    try{localStorage.setItem(SAVE_KEY,JSON.stringify(enrichStarterState(createInitialState())));}catch{}
  }
}

boot();
