import { activePlaceChapter, countRequirement, ITEM_FAMILIES } from './v2-game.js';
import { totalItemDiscoveryCount } from './aaa-collection.js';

const GOALS={
  merge:{label:'6 Items mergen',target:6,reward:{coins:40}},
  serve:{label:'2 Gäste bedienen',target:2,reward:{coins:60}},
  generate:{label:'8 Items produzieren',target:8,reward:{coins:35}},
  discover:{label:'1 neue Stufe entdecken',target:1,reward:{coins:75}},
  restore:{label:'1 Ausbau fertigstellen',target:1,reward:{coins:80}}
};

export function localDateKey(input=new Date()){
  const date=input instanceof Date?input:new Date(input);
  const pad=value=>String(value).padStart(2,'0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}

export function dailySeed(dateKey){let hash=2166136261;for(const ch of String(dateKey)){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;}
const clone=value=>structuredClone(value);
const goal=(type,index)=>({id:`goal-${type}-${index}`,type,progress:0,claimed:false,...clone(GOALS[type])});

function thirdGoalType(state,seed){
  const candidates=['generate'];
  const discovery=totalItemDiscoveryCount(state);if(discovery.found<discovery.total)candidates.push('discover');
  const chapter=activePlaceChapter(state);if(chapter?.upgrades?.some(upgrade=>!(state.placeUpgrades||[]).includes(upgrade.id)))candidates.push('restore');
  return candidates[seed%candidates.length];
}

export function createDailyBonus(state,dateKey){
  const seed=dailySeed(dateKey),chapter=activePlaceChapter(state),sunset=chapter.id==='sunset';
  const families=sunset?['fruit','coffee','bakery','sweet']:['coffee','bakery','sweet'];
  const family=sunset?'fruit':families[seed%families.length],level=2+(seed%2);
  const name=ITEM_FAMILIES[family].stages[level-1];
  return {id:`daily-bonus-${dateKey}`,title:`Tagesgast · ${name}`,sequence:900+(seed%90),requirements:[{family,level,qty:1}],rewards:{coins:100,stars:2},served:false};
}

export function createDailyState(state,dateKey=localDateKey()){
  const seed=dailySeed(dateKey),third=thirdGoalType(state,seed);
  return {dateKey,goals:[goal('merge',0),goal('serve',1),goal(third,2)],bonus:createDailyBonus(state,dateKey)};
}

export function ensureDailyState(state,dateKey=localDateKey()){
  if(state?.daily?.dateKey===dateKey&&Array.isArray(state.daily.goals)&&state.daily.goals.length===3&&state.daily.bonus)return {state,changed:false,reset:false};
  const next=structuredClone(state);next.daily=createDailyState(next,dateKey);next.updatedAt=Date.now();
  return {state:next,changed:true,reset:Boolean(state?.daily?.dateKey&&state.daily.dateKey!==dateKey)};
}

export function progressDailyEvent(inputState,type,amount=1,dateKey=localDateKey()){
  const ensured=ensureDailyState(inputState,dateKey),state=structuredClone(ensured.state);let changed=ensured.changed;
  for(const goal of state.daily.goals){if(goal.type!==type||goal.claimed)continue;const next=Math.min(goal.target,goal.progress+Math.max(0,Number(amount)||0));if(next!==goal.progress){goal.progress=next;changed=true;}}
  if(changed)state.updatedAt=Date.now();
  return {state:changed?state:inputState,changed,reset:ensured.reset};
}

export function claimDailyGoal(inputState,goalId,dateKey=localDateKey()){
  const ensured=ensureDailyState(inputState,dateKey),state=structuredClone(ensured.state),goal=state.daily.goals.find(entry=>entry.id===goalId);
  if(!goal)return {state:inputState,changed:false,reason:'goal-not-found'};
  if(goal.claimed)return {state:inputState,changed:false,reason:'already-claimed'};
  if(goal.progress<goal.target)return {state:inputState,changed:false,reason:'goal-incomplete'};
  goal.claimed=true;state.coins=Math.max(0,Number(state.coins)||0)+(goal.reward.coins||0);state.updatedAt=Date.now();
  return {state,changed:true,goal,reward:clone(goal.reward)};
}

export function dailyCompletedCount(state){return (state?.daily?.goals||[]).filter(goal=>goal.progress>=goal.target).length;}
export function dailyClaimedCount(state){return (state?.daily?.goals||[]).filter(goal=>goal.claimed).length;}

export function canServeDailyBonus(state,dateKey=localDateKey()){
  const daily=ensureDailyState(state,dateKey).state.daily;if(daily.bonus.served)return false;
  return daily.bonus.requirements.every(req=>countRequirement(state,req)>=req.qty);
}

export function fulfillDailyBonus(inputState,dateKey=localDateKey()){
  const ensured=ensureDailyState(inputState,dateKey),daily=ensured.state.daily,bonus=daily.bonus;
  if(bonus.served)return {state:inputState,changed:false,reason:'already-served'};
  if(!canServeDailyBonus(ensured.state,dateKey))return {state:inputState,changed:false,reason:'requirements-missing'};
  const state=structuredClone(ensured.state);
  for(const req of bonus.requirements){
    let remaining=req.qty;
    for(let index=0;index<state.board.length&&remaining>0;index+=1){const item=state.board[index];if(item?.kind==='item'&&item.family===req.family&&item.level===req.level){state.board[index]=null;remaining-=1;}}
  }
  state.daily.bonus.served=true;state.coins+=bonus.rewards.coins;state.stars+=bonus.rewards.stars;state.stats.orders=(state.stats.orders||0)+1;state.updatedAt=Date.now();
  return {state,changed:true,reason:null,order:clone(bonus),rewards:clone(bonus.rewards)};
}
