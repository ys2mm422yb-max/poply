import { normalizeState } from './v2-game.js';
import { ensurePlayerProgress } from './aaa-progression.js';
import { ensureCollectionState } from './aaa-collection.js';

const FAMILIES=['coffee','bakery','sweet'];
const noProgress=state=>Number(state.stats?.generated||0)===0&&Number(state.stats?.orders||0)===0&&(state.placeUpgrades?.length||0)===0;

export function migrateState(input){
  let state=structuredClone(normalizeState(input));
  if(noProgress(state)&&Number(state.stats?.merges||0)===0){
    for(let i=0;i<state.board.length;i+=1){
      if(String(state.board[i]?.id||'').startsWith('starter-plus-'))state.board[i]=null;
    }
  }
  const items=state.board.filter(item=>item?.kind==='item');
  const generators=state.board.filter(item=>item?.kind==='generator');
  if(noProgress(state)&&generators.length===2&&items.length===3&&FAMILIES.every(f=>items.some(item=>item.family===f&&item.level===3))){
    const free=state.board.map((item,index)=>item?null:index).filter(index=>index!==null);
    let serial=0;
    for(const family of FAMILIES){
      const index=state.board.findIndex(item=>item?.kind==='item'&&item.family===family&&item.level===3);
      state.board[index]={...state.board[index],id:`migrated-${family}-2`,level:2};
      for(let count=0;count<2;count+=1){
        const slot=free.shift();
        if(slot==null)break;
        state.board[slot]={id:`migrated-${family}-1-${++serial}`,kind:'item',family,level:1};
      }
    }
  }
  state=ensurePlayerProgress(state).state;
  state=ensureCollectionState(state).state;
  state.updatedAt=Date.now();
  return state;
}
