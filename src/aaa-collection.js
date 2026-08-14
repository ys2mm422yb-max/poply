import { ITEM_FAMILIES, PLACE_01_UPGRADES } from './v2-game.js';
import { awardPlayerXp } from './aaa-progression.js';

export const DISCOVERY_XP_BASE=20;
export const discoveryItemKey=(family,level)=>`item:${family}:${level}`;
export const discoveryGeneratorKey=generator=>`generator:${generator}`;
export const discoveryPlaceKey=place=>`place:${place}`;
const uniq=values=>[...new Set(values.filter(Boolean))];

export function inferredDiscoveries(state){
  const found=[];
  const highest=new Map();
  for(const item of state?.board||[]){
    if(item?.kind==='item')highest.set(item.family,Math.max(highest.get(item.family)||0,item.level||0));
    if(item?.kind==='generator')found.push(discoveryGeneratorKey(item.generator));
  }
  for(const [family,max] of highest){
    if(!ITEM_FAMILIES[family])continue;
    for(let level=1;level<=max;level+=1)found.push(discoveryItemKey(family,level));
  }
  found.push(discoveryPlaceKey('coast'));
  if((state?.placeUpgrades||[]).some(id=>PLACE_01_UPGRADES.some(upgrade=>upgrade.id===id)))found.push(discoveryGeneratorKey('coffee-gen'),discoveryGeneratorKey('pantry-gen'));
  const coastComplete=PLACE_01_UPGRADES.every(upgrade=>(state?.placeUpgrades||[]).includes(upgrade.id));
  if(coastComplete)found.push(discoveryPlaceKey('sunset'),discoveryGeneratorKey('sunset-gen'));
  return uniq(found);
}

export function ensureCollectionState(state){
  const current=Array.isArray(state?.discoveries)?state.discoveries:[];
  const inferred=inferredDiscoveries(state);
  const combined=uniq([...current,...inferred]);
  if(Array.isArray(state?.discoveries)&&combined.length===current.length&&combined.every((key,index)=>key===current[index]))return {state,changed:false,added:[]};
  const next=structuredClone(state);next.discoveries=combined;
  return {state:next,changed:true,added:combined.filter(key=>!current.includes(key))};
}

export function isDiscovered(state,key){return Array.isArray(state?.discoveries)&&state.discoveries.includes(key);}
export function familyDiscoveryCount(state,family){
  const total=ITEM_FAMILIES[family]?.stages.length||0;
  let found=0;for(let level=1;level<=total;level+=1)if(isDiscovered(state,discoveryItemKey(family,level)))found+=1;
  return {found,total};
}
export function totalItemDiscoveryCount(state){
  let found=0,total=0;for(const family of Object.keys(ITEM_FAMILIES)){const count=familyDiscoveryCount(state,family);found+=count.found;total+=count.total;}return {found,total};
}
export function discoveryXpForItem(level){return DISCOVERY_XP_BASE+Math.max(1,Number(level)||1)*10;}

export function recordDiscovery(state,key,{xp=0}={}){
  const ensured=ensureCollectionState(state).state;
  if(isDiscovered(ensured,key))return {state:ensured,changed:false,key,progression:null};
  const next=structuredClone(ensured);next.discoveries.push(key);
  if(xp>0){const progression=awardPlayerXp(next,xp);return {state:progression.state,changed:true,key,progression};}
  return {state:next,changed:true,key,progression:null};
}

export function recordItemDiscovery(state,item){
  if(item?.kind!=='item'||!ITEM_FAMILIES[item.family])return {state,changed:false,key:null,progression:null};
  return recordDiscovery(state,discoveryItemKey(item.family,item.level),{xp:discoveryXpForItem(item.level)});
}

export function recordGeneratorDiscovery(state,generator){return recordDiscovery(state,discoveryGeneratorKey(generator));}
export function recordPlaceDiscovery(state,place){return recordDiscovery(state,discoveryPlaceKey(place));}
