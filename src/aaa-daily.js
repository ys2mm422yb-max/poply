import { activePlaceChapter, countRequirement, ITEM_FAMILIES } from './v2-game.js';
import { totalItemDiscoveryCount } from './aaa-collection.js';

const GOAL_VARIANTS={
  merge:[
    {label:'4 Items mergen',target:4,reward:{coins:35}},
    {label:'6 Items mergen',target:6,reward:{coins:45}},
    {label:'8 Items mergen',target:8,reward:{coins:60}},
  ],
  serve:[
    {label:'1 Gast bedienen',target:1,reward:{coins:40}},
    {label:'2 Gäste bedienen',target:2,reward:{coins:60}},
    {label:'3 Gäste bedienen',target:3,reward:{coins:85}},
  ],
  generate:[
    {label:'5 Items produzieren',target:5,reward:{coins:30}},
    {label:'8 Items produzieren',target:8,reward:{coins:40}},
    {label:'10 Items produzieren',target:10,reward:{coins:55}},
  ],
  discover:[{label:'1 neue Stufe entdecken',target:1,reward:{coins:75}}],
  restore:[{label:'1 Ausbau fertigstellen',target:1,reward:{coins:90}}],
};

export function localDateKey(input=new Date()){
  const date=input instanceof Date?input:new Date(input);
  const pad=value=>String(value).padStart(2,'0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}

export function dailySeed(dateKey){let hash=2166136261;for(const ch of String(dateKey)){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;}
const clone=value=>structuredClone(value);
const mix=(seed,index)=>{let value=(seed^Math.imul(index+1,0x9e3779b1))>>>0;value^=value>>>16;value=Math.imul(value,0x85ebca6b)>>>0;value^=value>>>13;return value>>>0;};
const goal=(type,index,seed)=>{
  const variants=GOAL_VARIANTS[type];
  const variant=variants[mix(seed,index)%variants.length];
  return {id:`goal-${type}-${index}`,type,progress:0,claimed:false,...clone(variant)};
};

function availableGoalTypes(state){
  const candidates=['merge','serve','generate'];
  const discovery=totalItemDiscoveryCount(state);if(discovery.found<discovery.total)candidates.push('discover');
  const chapter=activePlaceChapter(state);if(chapter?.upgrades?.some(upgrade=>!(state.placeUpgrades||[]).includes(upgrade.id)))candidates.push('restore');
  return candidates;
}
function chooseTypes(candidates,seed){
  return candidates.map((type,index)=>({type,score:mix(seed,index)})).sort((a,b)=>a.score-b.score||a.type.localeCompare(b.type)).slice(0,3).map(entry=>entry.type);
}
function previousDateKey(dateKey){const [year,month,day]=String(dateKey).split('-').map(Number),date=new Date(year,month-1,day);date.setDate(date.getDate()-1);return localDateKey(date);}
export function dailyGoalTypes(state,dateKey){
  const candidates=availableGoalTypes(state),seed=dailySeed(dateKey);let selected=chooseTypes(candidates,seed);
  if(candidates.length>3){
    const previous=chooseTypes(candidates,dailySeed(previousDateKey(dateKey)));
    if([...selected].sort().join('|')===[...previous].sort().join('|')){
      const unused=candidates.find(type=>!selected.includes(type));
      if(unused)selected=[selected[0],selected[1],unused];
    }
  }
  return selected;
}

export function createDailyBonus(state,dateKey){
  const seed=dailySeed(dateKey),chapter=activePlaceChapter(state),sunset=chapter.id==='sunset',garden=chapter.id==='garden';
  const families=garden?['herb','fruit','coffee','bakery']:sunset?['fruit','coffee','bakery','sweet']:['coffee','bakery','sweet'];
  const family=families[seed%families.length],level=2+(mix(seed,7)%2);
  const name=ITEM_FAMILIES[family].stages[level-1];
  return {id:`daily-bonus-${dateKey}`,title:`Tagesgast · ${name}`,sequence:900+(seed%90),requirements:[{family,level,qty:1}],rewards:{coins:100,stars:2},served:false};
}

export function createDailyState(state,dateKey=localDateKey()){
  const seed=dailySeed(dateKey),types=dailyGoalTypes(state,dateKey);
  return {dateKey,goals:types.map((type,index)=>goal(type,index,seed)),bonus:createDailyBonus(state,dateKey)};
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
