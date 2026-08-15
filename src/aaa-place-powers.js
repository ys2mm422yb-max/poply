import { ITEM_FAMILIES, activePlaceChapter, createProgressionOrder } from './v2-game.js';
import { chargeFlow } from './aaa-flow.js';

export const PLACE_POWER_DEFS=[
  {key:'evening-service',upgradeId:'lights',label:'Abendservice',tag:'LICHTER',copy:'Geschaffte Bonusziele laden zusätzlich +1 FLOW.',short:'Special geschafft → +1 FLOW'},
  {key:'counter-prep',upgradeId:'counter',label:'Vorbereitung',tag:'THEKE',copy:'Nach jeder Lieferung ist der nächste gewählte Generator +1 Stufe vorbereitet.',short:'Nächster Generator → +1 Stufe'},
  {key:'guest-choice',upgradeId:'menu',label:'Gastwahl',tag:'MENÜ',copy:'Tausche einen wartenden Auftrag. Nach jeder Lieferung wird Gastwahl wieder bereit.',short:'1 Auftrag tauschen'},
];

const byKey=new Map(PLACE_POWER_DEFS.map(power=>[power.key,power]));
const byUpgrade=new Map(PLACE_POWER_DEFS.map(power=>[power.upgradeId,power]));
const count=value=>Math.max(0,Number.isInteger(Number(value))?Number(value):0);
const hasUpgrade=(state,upgradeId)=>Array.isArray(state?.placeUpgrades)&&state.placeUpgrades.includes(upgradeId);

export const placePowerByKey=key=>byKey.get(key)??null;
export const placePowerForUpgrade=upgradeId=>byUpgrade.get(upgradeId)??null;
export const hasPlacePower=(state,key)=>{const power=placePowerByKey(key);return !!(power&&hasUpgrade(state,power.upgradeId));};
export const unlockedPlacePowers=state=>PLACE_POWER_DEFS.filter(power=>hasUpgrade(state,power.upgradeId));

export function placePowerStatus(state){
  const raw=state?.placePowerState||{};
  return {
    prepReady:hasPlacePower(state,'counter-prep')&&Boolean(raw.prepReady),
    menuChoiceReady:hasPlacePower(state,'guest-choice')&&Boolean(raw.menuChoiceReady),
    prepsUsed:count(raw.prepsUsed),
    rerollsUsed:count(raw.rerollsUsed),
  };
}

export function ensurePlacePowerState(source){
  if(!source)return {state:source,changed:false,status:{prepReady:false,menuChoiceReady:false,prepsUsed:0,rerollsUsed:0}};
  const raw=source.placePowerState;
  const menuUnlocked=hasPlacePower(source,'guest-choice');
  const canonical={
    prepReady:hasPlacePower(source,'counter-prep')&&Boolean(raw?.prepReady),
    menuChoiceReady:menuUnlocked?(raw?Boolean(raw.menuChoiceReady):true):false,
    prepsUsed:count(raw?.prepsUsed),
    rerollsUsed:count(raw?.rerollsUsed),
  };
  const changed=!raw||raw.prepReady!==canonical.prepReady||raw.menuChoiceReady!==canonical.menuChoiceReady||raw.prepsUsed!==canonical.prepsUsed||raw.rerollsUsed!==canonical.rerollsUsed;
  if(!changed)return {state:source,changed:false,status:canonical};
  const state=structuredClone(source);state.placePowerState=canonical;
  return {state,changed:true,status:placePowerStatus(state)};
}

export function unlockPlacePowerForUpgrade(source,upgradeId){
  const power=placePowerForUpgrade(upgradeId),ensured=ensurePlacePowerState(source);
  if(!power)return {state:ensured.state,changed:ensured.changed,power:null,status:placePowerStatus(ensured.state)};
  let state=ensured.state,changed=ensured.changed;
  if(power.key==='guest-choice'&&!placePowerStatus(state).menuChoiceReady){
    state=structuredClone(state);state.placePowerState.menuChoiceReady=true;changed=true;
  }
  return {state,changed,power,status:placePowerStatus(state)};
}

export function recordServicePlacePowers(source,order){
  const ensured=ensurePlacePowerState(source);let state=ensured.state,changed=ensured.changed;
  const effects={flowCharged:0,flowReady:false,prepArmed:false,menuArmed:false};
  if(hasPlacePower(state,'evening-service')&&order?.special?.completed){
    const flow=chargeFlow(state,1);state=flow.state;changed=changed||flow.changed;effects.flowCharged=flow.gained;effects.flowReady=flow.becameReady;
  }
  const status=placePowerStatus(state);
  if(hasPlacePower(state,'counter-prep')&&!status.prepReady){
    state=structuredClone(state);state.placePowerState.prepReady=true;changed=true;effects.prepArmed=true;
  }
  if(hasPlacePower(state,'guest-choice')&&!placePowerStatus(state).menuChoiceReady){
    state=structuredClone(state);state.placePowerState.menuChoiceReady=true;changed=true;effects.menuArmed=true;
  }
  return {state,changed,effects,status:placePowerStatus(state)};
}

export function applyPreparationBonus(source,spawnedIndex){
  const ensured=ensurePlacePowerState(source),status=placePowerStatus(ensured.state);
  if(!status.prepReady)return {state:ensured.state,changed:ensured.changed,boosted:false,status};
  const item=ensured.state?.board?.[spawnedIndex];
  if(!item||item.kind!=='item')return {state:ensured.state,changed:ensured.changed,boosted:false,status};
  const maxLevel=ITEM_FAMILIES[item.family]?.stages?.length||item.level,fromLevel=item.level,toLevel=Math.min(maxLevel,fromLevel+1);
  const state=structuredClone(ensured.state);state.board[spawnedIndex]={...item,level:toLevel};state.placePowerState.prepReady=false;state.placePowerState.prepsUsed=status.prepsUsed+1;
  return {state,changed:true,boosted:toLevel>fromLevel,fromLevel,toLevel,item:structuredClone(state.board[spawnedIndex]),status:placePowerStatus(state)};
}

export function replaceOrderWithGuestChoice(source,orderId){
  const ensured=ensurePlacePowerState(source),status=placePowerStatus(ensured.state);
  if(!hasPlacePower(ensured.state,'guest-choice'))return {state:ensured.state,changed:ensured.changed,reason:'power-locked',status};
  if(!status.menuChoiceReady)return {state:ensured.state,changed:ensured.changed,reason:'not-ready',status};
  const index=ensured.state.currentOrders?.findIndex(order=>order.id===orderId)??-1;
  if(index<0)return {state:ensured.state,changed:ensured.changed,reason:'unknown-order',status};
  const state=structuredClone(ensured.state),previous=structuredClone(state.currentOrders[index]),sequence=state.orderSequence;
  const replacement=createProgressionOrder(state,sequence,activePlaceChapter(state).id,[previous.title]);
  state.currentOrders[index]=replacement;state.orderSequence=sequence+1;state.placePowerState.menuChoiceReady=false;state.placePowerState.rerollsUsed=status.rerollsUsed+1;state.updatedAt=Date.now();
  return {state,changed:true,reason:null,previous,replacement:structuredClone(replacement),status:placePowerStatus(state)};
}
