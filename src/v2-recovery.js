import { normalizeState } from './v2-game.js';
const KEY='poply-v2-state-1';
const F=['coffee','bakery','sweet'];
export function repairStarterState(input){
  const s=structuredClone(input),stats=s.stats||{};
  if(Number(stats.generated||0)!==0||Number(stats.orders||0)!==0||s.placeUpgrades?.length)return s;
  if(Number(stats.merges||0)===0&&s.board.filter(Boolean).length===14){for(const family of F){const xs=s.board.map((item,i)=>({item,i})).filter(x=>x.item?.family===family&&x.item.level===1&&String(x.item.id).startsWith('starter-plus-'));xs.slice(1).forEach(x=>s.board[x.i]=null);}}
  const items=s.board.filter(x=>x?.kind==='item'),gens=s.board.filter(x=>x?.kind==='generator');
  if(gens.length===2&&items.length===3&&F.every(f=>items.some(x=>x.family===f&&x.level===3))){let free=s.board.map((x,i)=>x?null:i).filter(i=>i!==null),n=0;for(const family of F){const i=s.board.findIndex(x=>x?.family===family&&x.level===3);s.board[i]={...s.board[i],level:2,id:`recover-${family}-2`};for(let k=0;k<2;k++){const slot=free.shift();s.board[slot]={id:`recover-${family}-1-${++n}`,kind:'item',family,level:1};}}}
  s.updatedAt=Date.now();return s;
}
try{const raw=localStorage.getItem(KEY);if(raw){const s=repairStarterState(normalizeState(JSON.parse(raw)));localStorage.setItem(KEY,JSON.stringify(s));}}catch{}
