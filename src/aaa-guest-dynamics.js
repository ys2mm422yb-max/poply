import { GENERATORS } from './v2-game.js';
import { guestForSequence } from './aaa-guests.js';

export const GUEST_TRAITS=Object.freeze({
  mika:Object.freeze({id:'combo',label:'Kombi-Fan',short:'Kombi',copy:'Mag Bestellungen mit mehreren Komponenten.',bonusCoins:10}),
  nora:Object.freeze({id:'coffee',label:'Kaffee-Liebe',short:'Kaffee',copy:'Freut sich besonders über Kaffee-Bestellungen.',bonusCoins:10}),
  sam:Object.freeze({id:'variety',label:'Abwechslung',short:'Vielfalt',copy:'Belohnt Bestellungen aus mehreren Familien.',bonusCoins:10}),
});

const availableFamilies=state=>{
  const generators=(state?.board||[]).filter(item=>item?.kind==='generator').map(item=>GENERATORS[item.generator]).filter(Boolean);
  return [...new Set(generators.flatMap(generator=>generator.families))];
};

const localDayKey=now=>{
  const date=new Date(now);
  return date.getFullYear()*10000+(date.getMonth()+1)*100+date.getDate();
};

export const isDynamicServiceUnlocked=state=>(state?.placeUpgrades||[]).includes('menu');

export function guestTraitForOrder(order){
  const guest=guestForSequence(order?.sequence||0);
  return {guest,trait:GUEST_TRAITS[guest.id]||GUEST_TRAITS.mika};
}

export function guestTraitQualifies(order,traitId){
  const requirements=order?.requirements||[];
  const families=new Set(requirements.map(req=>req.family));
  if(traitId==='combo')return requirements.length>=2;
  if(traitId==='coffee')return families.has('coffee');
  if(traitId==='variety')return families.size>=2;
  return false;
}

export function dailyServiceCondition(state,now=Date.now()){
  const families=availableFamilies(state);
  const pool=families.length?families:['coffee','bakery','sweet'];
  const family=pool[localDayKey(now)%pool.length];
  return {
    family,
    label:{coffee:'Kaffeezeit',bakery:'Backstuben-Tag',sweet:'Süßer Tag',fruit:'Sonnenfrucht-Tag',herb:'Gartentag'}[family]||'Tagesfokus',
    bonusCoins:15,
  };
}

export function dynamicServiceBonus(state,order,now=Date.now()){
  const {guest,trait}=guestTraitForOrder(order);
  const condition=dailyServiceCondition(state,now);
  const unlocked=isDynamicServiceUnlocked(state);
  const traitCoins=unlocked&&guestTraitQualifies(order,trait.id)?trait.bonusCoins:0;
  const dailyCoins=unlocked&&(order?.requirements||[]).some(req=>req.family===condition.family)?condition.bonusCoins:0;
  return {guest,trait,condition,unlocked,traitCoins,dailyCoins,totalCoins:traitCoins+dailyCoins};
}

export function applyDynamicServiceBonus(inputState,order,now=Date.now()){
  const bonus=dynamicServiceBonus(inputState,order,now);
  if(!bonus.totalCoins)return {state:inputState,changed:false,...bonus};
  const state=structuredClone(inputState);
  state.coins=Math.max(0,Number(state.coins)||0)+bonus.totalCoins;
  state.updatedAt=Date.now();
  return {state,changed:true,...bonus};
}