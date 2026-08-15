import { playerProgress } from './aaa-progression.js';

const itemDiscoveryCount=state=>(state?.discoveries||[]).filter(key=>String(key).startsWith('item:')).length;

export const PLAYER_MILESTONES=[
  {id:'first-service',label:'Erster Service',detail:'Bediene deinen ersten Gast.',target:1,measure:state=>Number(state?.stats?.orders)||0},
  {id:'merge-rhythm',label:'Merge-Rhythm',detail:'Schaffe 25 echte Merges.',target:25,measure:state=>Number(state?.stats?.merges)||0},
  {id:'place-maker',label:'Place-Maker',detail:'Baue 6 Place-Schritte fertig.',target:6,measure:state=>(state?.placeUpgrades||[]).length},
  {id:'discoverer',label:'Entdecker',detail:'Entdecke 12 Item-Stufen.',target:12,measure:itemDiscoveryCount},
  {id:'level-five',label:'Stammspieler',detail:'Erreiche Spielerlevel 5.',target:5,measure:state=>playerProgress(state?.playerXp).level}
];

export const PLAYER_TITLES=[
  {rank:0,label:'Neu dabei'},
  {rank:1,label:'Gastgeber'},
  {rank:2,label:'Merge-Kenner'},
  {rank:3,label:'Place-Macher'},
  {rank:4,label:'Entdecker'},
  {rank:5,label:'Poply-Profi'}
];

export const PLACE_COMPLETION_BADGES=[
  {id:'coast',number:1,label:'Café am Meer',shortLabel:'Café',upgradeIds:['lights','counter','menu','seating','terrace','sign']},
  {id:'sunset',number:2,label:'Sonnenkai',shortLabel:'Sonnenkai',upgradeIds:['sunset-lanterns','sunset-bar','sunset-lounge','sunset-fire','sunset-stage','sunset-sign']}
];

export function milestoneProgress(state,definition){
  const raw=Math.max(0,Number(definition.measure(state))||0),current=Math.min(definition.target,raw);
  return {...definition,current,raw,complete:raw>=definition.target,ratio:definition.target?current/definition.target:1,remaining:Math.max(0,definition.target-current)};
}

export function playerMilestones(state){return PLAYER_MILESTONES.map(definition=>milestoneProgress(state,definition));}
export function completedMilestoneCount(state){return playerMilestones(state).filter(entry=>entry.complete).length;}
export function nextPlayerMilestone(state){
  const incomplete=playerMilestones(state).filter(entry=>!entry.complete);
  if(!incomplete.length)return null;
  return incomplete.reduce((best,entry)=>{
    if(!best)return entry;
    if(entry.ratio>best.ratio)return entry;
    if(entry.ratio===best.ratio&&entry.remaining<best.remaining)return entry;
    return best;
  },null);
}
export function playerTitleProgress(state){
  const completed=completedMilestoneCount(state),rank=Math.min(completed,PLAYER_TITLES.length-1);
  return {current:PLAYER_TITLES[rank],next:PLAYER_TITLES[rank+1]||null,completed,total:PLAYER_MILESTONES.length,remaining:Math.max(0,PLAYER_MILESTONES.length-completed)};
}

export function placeCompletionBadges(state){
  const upgrades=new Set(state?.placeUpgrades||[]);
  return PLACE_COMPLETION_BADGES.map((definition,index)=>{
    const completedSteps=definition.upgradeIds.filter(id=>upgrades.has(id)).length;
    const unlocked=index===0||PLACE_COMPLETION_BADGES[index-1].upgradeIds.every(id=>upgrades.has(id))||completedSteps>0;
    return {...definition,completedSteps,totalSteps:definition.upgradeIds.length,unlocked,complete:completedSteps===definition.upgradeIds.length,ratio:definition.upgradeIds.length?completedSteps/definition.upgradeIds.length:1};
  });
}

export function completedPlaceBadgeCount(state){return placeCompletionBadges(state).filter(entry=>entry.complete).length;}
