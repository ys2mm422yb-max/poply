export const LEVEL_REWARD_COINS=100;
export const LEVEL_REWARD_ENERGY='full';
export const BASE_MAX_ENERGY=40;
export const ENERGY_CAPACITY_MILESTONES=Object.freeze([
  Object.freeze({level:5,bonus:5}),
  Object.freeze({level:10,bonus:5}),
  Object.freeze({level:15,bonus:5})
]);
export const ORDER_XP_BASE=40;
export const RESTORATION_XP=140;
export const PLACE_UNLOCK_BONUS_XP=100;

export function xpNeededForLevel(level){
  const safe=Math.max(1,Number(level)||1);
  return 120+(safe-1)*60;
}

export function playerProgress(totalXp=0){
  const total=Math.max(0,Math.floor(Number(totalXp)||0));
  let level=1,spent=0,need=xpNeededForLevel(level);
  while(total-spent>=need){spent+=need;level+=1;need=xpNeededForLevel(level);}
  const current=total-spent;
  return {level,totalXp:total,current,next:need,ratio:need?current/need:1};
}

export function maxEnergyForLevel(level=1){
  const safeLevel=Math.max(1,Math.floor(Number(level)||1));
  return ENERGY_CAPACITY_MILESTONES.reduce((max,milestone)=>safeLevel>=milestone.level?max+milestone.bonus:max,BASE_MAX_ENERGY);
}

export function nextEnergyCapacityUpgrade(totalXp=0,currentMaxEnergy=BASE_MAX_ENERGY){
  const progress=playerProgress(totalXp),nextLevel=progress.level+1;
  const safeCurrent=Math.max(BASE_MAX_ENERGY,Number(currentMaxEnergy)||BASE_MAX_ENERGY,maxEnergyForLevel(progress.level));
  const target=Math.max(safeCurrent,maxEnergyForLevel(nextLevel));
  const gain=Math.max(0,target-safeCurrent);
  const nextMilestone=ENERGY_CAPACITY_MILESTONES.find(entry=>entry.level>progress.level)||null;
  return {level:nextLevel,gain,maxEnergy:target,nextMilestoneLevel:nextMilestone?.level||null};
}

export function nextLevelRewardPreview(totalXp=0,currentMaxEnergy=BASE_MAX_ENERGY){
  const progress=playerProgress(totalXp),capacity=nextEnergyCapacityUpgrade(totalXp,currentMaxEnergy);
  return {
    level:progress.level+1,
    remainingXp:Math.max(0,progress.next-progress.current),
    rewardCoins:LEVEL_REWARD_COINS,
    rewardEnergy:LEVEL_REWARD_ENERGY,
    rewardMaxEnergyGain:capacity.gain,
    rewardMaxEnergy:capacity.maxEnergy,
    currentXp:progress.current,
    requiredXp:progress.next,
    ratio:progress.ratio
  };
}

export function legacyXpForState(state){
  const orders=Math.max(0,Number(state?.stats?.orders)||0);
  const upgrades=Math.max(0,state?.placeUpgrades?.length||0);
  return orders*60+upgrades*RESTORATION_XP;
}

export function ensurePlayerProgress(state){
  const hasXp=Number.isFinite(Number(state?.playerXp))&&Number(state.playerXp)>=0;
  const playerXp=hasXp?Number(state.playerXp):legacyXpForState(state);
  const progress=playerProgress(playerXp);
  const rawMaxEnergy=Number(state?.maxEnergy);
  const existingMax=Number.isFinite(rawMaxEnergy)&&rawMaxEnergy>0?rawMaxEnergy:BASE_MAX_ENERGY;
  const requiredMax=Math.max(BASE_MAX_ENERGY,existingMax,maxEnergyForLevel(progress.level));
  const needsMaxSync=rawMaxEnergy!==requiredMax;
  if(hasXp&&!needsMaxSync)return {state,changed:false};
  const next=structuredClone(state);
  if(!hasXp)next.playerXp=playerXp;
  if(needsMaxSync)next.maxEnergy=requiredMax;
  return {state:next,changed:true};
}

export function xpForOrder(order){
  const complexity=(order?.requirements||[]).reduce((sum,req)=>sum+Math.max(1,Number(req.level)||1)*Math.max(1,Number(req.qty)||1),0);
  return ORDER_XP_BASE+complexity*10;
}

export function xpForRestoration(result){
  return RESTORATION_XP+(result?.unlockedPlace?PLACE_UNLOCK_BONUS_XP:0);
}

export function awardPlayerXp(state,amount,now=Date.now()){
  const ensured=ensurePlayerProgress(state).state;
  const before=playerProgress(ensured.playerXp);
  const next=structuredClone(ensured);
  const gained=Math.max(0,Math.floor(Number(amount)||0));
  next.playerXp=before.totalXp+gained;
  const after=playerProgress(next.playerXp);
  const levelsGained=Math.max(0,after.level-before.level);
  const bonusCoins=levelsGained*LEVEL_REWARD_COINS;
  if(bonusCoins)next.coins=Math.max(0,Number(next.coins)||0)+bonusCoins;
  const beforeMaxEnergy=Math.max(BASE_MAX_ENERGY,Number(next.maxEnergy)||BASE_MAX_ENERGY,maxEnergyForLevel(before.level));
  const maxEnergy=Math.max(beforeMaxEnergy,maxEnergyForLevel(after.level));
  const capacityGain=Math.max(0,maxEnergy-beforeMaxEnergy);
  next.maxEnergy=maxEnergy;
  const beforeEnergy=Math.max(0,Math.min(beforeMaxEnergy,Number(next.energy)||0));
  const bonusEnergy=levelsGained?Math.max(0,maxEnergy-beforeEnergy):0;
  if(levelsGained){next.energy=maxEnergy;next.energyUpdatedAt=now;}
  return {state:next,gained,before,after,levelsGained,bonusCoins,bonusEnergy,capacityGain};
}
