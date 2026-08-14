const itemDiscoveryCount=state=>(state?.discoveries||[]).filter(key=>String(key).startsWith('item:')).length;

export const PLAYER_MILESTONES=[
  {id:'first-service',label:'Erster Service',detail:'Bediene deinen ersten Gast.',target:1,measure:state=>Number(state?.stats?.orders)||0},
  {id:'merge-rhythm',label:'Merge-Rhythm',detail:'Schaffe 25 echte Merges.',target:25,measure:state=>Number(state?.stats?.merges)||0},
  {id:'place-maker',label:'Place-Maker',detail:'Baue 6 Place-Schritte fertig.',target:6,measure:state=>(state?.placeUpgrades||[]).length},
  {id:'discoverer',label:'Entdecker',detail:'Entdecke 12 Item-Stufen.',target:12,measure:itemDiscoveryCount},
  {id:'level-five',label:'Stammspieler',detail:'Erreiche Spielerlevel 5.',target:5,measure:state=>Number(state?.playerLevel)||1}
];

export function milestoneProgress(state,definition){
  const raw=Math.max(0,Number(definition.measure(state))||0),current=Math.min(definition.target,raw);
  return {...definition,current,raw,complete:raw>=definition.target,ratio:definition.target?current/definition.target:1};
}

export function playerMilestones(state){return PLAYER_MILESTONES.map(definition=>milestoneProgress(state,definition));}
export function completedMilestoneCount(state){return playerMilestones(state).filter(entry=>entry.complete).length;}
