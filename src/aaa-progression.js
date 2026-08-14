export const LEVEL_REWARD_COINS=100;
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

export function nextLevelRewardPreview(totalXp=0){
  const progress=playerProgress(totalXp);
  return {
    level:progress.level+1,
    remainingXp:Math.max(0,progress.next-progress.current),
    rewardCoins:LEVEL_REWARD_COINS,
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
  if(Number.isFinite(Number(state?.playerXp))&&Number(state.playerXp)>=0)return {state,changed:false};
  const next=structuredClone(state);
  next.playerXp=legacyXpForState(next);
  return {state:next,changed:true};
}

export function xpForOrder(order){
  const complexity=(order?.requirements||[]).reduce((sum,req)=>sum+Math.max(1,Number(req.level)||1)*Math.max(1,Number(req.qty)||1),0);
  return ORDER_XP_BASE+complexity*10;
}

export function xpForRestoration(result){
  return RESTORATION_XP+(result?.unlockedPlace?PLACE_UNLOCK_BONUS_XP:0);
}

export function awardPlayerXp(state,amount){
  const ensured=ensurePlayerProgress(state).state;
  const before=playerProgress(ensured.playerXp);
  const next=structuredClone(ensured);
  const gained=Math.max(0,Math.floor(Number(amount)||0));
  next.playerXp=before.totalXp+gained;
  const after=playerProgress(next.playerXp);
  const levelsGained=Math.max(0,after.level-before.level);
  const bonusCoins=levelsGained*LEVEL_REWARD_COINS;
  if(bonusCoins)next.coins=Math.max(0,Number(next.coins)||0)+bonusCoins;
  return {state:next,gained,before,after,levelsGained,bonusCoins};
}
