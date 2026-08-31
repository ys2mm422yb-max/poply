import { ITEM_FAMILIES, PLACE_CHAPTERS, createInitialState, createProgressionOrder, orderDifficultyBand } from './v2-game.js';
import { INITIAL_STORAGE_CAPACITY, STORAGE_CAPACITY_STEP, STORAGE_MAX_CAPACITY, STORAGE_UPGRADE_COSTS } from './aaa-inventory.js';
import { LEVEL_REWARD_COINS, playerProgress, xpForOrder, xpForRestoration } from './aaa-progression.js';
import { FAMILY_MASTERY_REWARD_COINS, discoveryXpForItem } from './aaa-collection.js';
import { GUEST_LOYALTY_MILESTONES, guestForSequence } from './aaa-guests.js';

const FAMILY_SOURCE={
  coffee:'coffee-gen',
  bakery:'pantry-gen',
  sweet:'pantry-gen',
  fruit:'sunset-gen',
  herb:'garden-gen',
};
const PLACE_UNLOCK_BY_UPGRADE={sign:'sunset','sunset-sign':'garden'};

export const ECONOMY_GUARDS={
  maxSingleOrderEnergy:64,
  maxEstablishedEnergyPerStar:7.25,
  storageAffordableByChapter:'coast',
  chapterOrderWindows:{
    coast:[12,18],
    sunset:[13,20],
    garden:[16,24],
  },
};

export function requirementBaseUnits(requirement){
  const level=Math.max(1,Number(requirement?.level)||1);
  const qty=Math.max(0,Number(requirement?.qty)||0);
  return (2**(level-1))*qty;
}

function greenhouseEnergy(baseUnits){
  const units=Math.max(0,Math.ceil(baseUnits));
  const cycles=Math.floor(units/5),remainder=units%5;
  return cycles*4+[0,1,2,3,4][remainder];
}

export function theoreticalOrderEnergy(requirements=[]){
  let coffee=0,fruit=0,herb=0,bakery=0,sweet=0;
  for(const requirement of requirements){
    const units=requirementBaseUnits(requirement);
    switch(requirement.family){
      case 'coffee': coffee+=units; break;
      case 'fruit': fruit+=units; break;
      case 'herb': herb+=units; break;
      case 'bakery': bakery+=units; break;
      case 'sweet': sweet+=units; break;
      default: throw new Error(`Unknown economy family: ${requirement.family}`);
    }
  }
  // Pantry alternates Bakery/Sweet. Using 2*max() is phase-safe: regardless of
  // which family is next, this many taps can satisfy both requested base-unit totals.
  const pantry=(bakery||sweet)?2*Math.max(bakery,sweet):0;
  return coffee+fruit+greenhouseEnergy(herb)+pantry;
}

export function orderEconomy(order){
  const requirements=(order?.requirements||[]).map(requirement=>({...requirement}));
  const energy=theoreticalOrderEnergy(requirements);
  const coins=Math.max(0,Number(order?.rewards?.coins)||0);
  const stars=Math.max(0,Number(order?.rewards?.stars)||0);
  return {
    id:order?.id||null,
    sequence:Number.isInteger(order?.sequence)?order.sequence:null,
    title:order?.title||'',
    difficulty:order?.difficulty||null,
    requirements,
    energy,
    coins,
    stars,
    coinsPerEnergy:energy?coins/energy:0,
    starsPerEnergy:energy?stars/energy:0,
    energyPerStar:stars?energy/stars:Infinity,
  };
}

export function stateForChapterStage(chapterId,completed=0){
  const state=createInitialState();
  const chapterIndex=PLACE_CHAPTERS.findIndex(chapter=>chapter.id===chapterId);
  if(chapterIndex<0)throw new Error(`Unknown chapter: ${chapterId}`);
  const previous=PLACE_CHAPTERS.slice(0,chapterIndex).flatMap(chapter=>chapter.upgrades.map(upgrade=>upgrade.id));
  const chapter=PLACE_CHAPTERS[chapterIndex];
  state.placeUpgrades=[...previous,...chapter.upgrades.slice(0,Math.max(0,completed)).map(upgrade=>upgrade.id)];
  return state;
}

export function bandEconomyProfile(chapterId,completed){
  const state=stateForChapterStage(chapterId,completed);
  const band=orderDifficultyBand(state,chapterId);
  const orders=band.indexes.map((_,sequence)=>orderEconomy(createProgressionOrder(state,sequence,chapterId)));
  const sum=key=>orders.reduce((total,entry)=>total+entry[key],0);
  const energy=sum('energy'),stars=sum('stars'),coins=sum('coins');
  return {
    chapterId,
    completed,
    band:band.key,
    orders,
    averageEnergy:energy/orders.length,
    averageStars:stars/orders.length,
    averageCoins:coins/orders.length,
    energyPerStar:stars?energy/stars:Infinity,
    coinsPerEnergy:energy?coins/energy:0,
  };
}

export function simulateChapterPacing(chapterId){
  const chapter=PLACE_CHAPTERS.find(entry=>entry.id===chapterId);
  if(!chapter)throw new Error(`Unknown chapter: ${chapterId}`);
  let completed=0,stars=0,coins=0,energy=0,ordersServed=0,sequence=0;
  const orderLog=[];
  while(completed<chapter.upgrades.length&&ordersServed<100){
    const state=stateForChapterStage(chapterId,completed);
    const order=createProgressionOrder(state,sequence,chapterId);
    const effort=orderEconomy(order),completedBefore=completed,upgradesBuilt=[];
    stars+=effort.stars;coins+=effort.coins;energy+=effort.energy;ordersServed+=1;sequence+=1;
    while(completed<chapter.upgrades.length&&stars>=chapter.upgrades[completed].cost){
      stars-=chapter.upgrades[completed].cost;
      upgradesBuilt.push(chapter.upgrades[completed].id);
      completed+=1;
    }
    orderLog.push({...effort,completedBefore,completedAfter:completed,upgradesBuilt});
  }
  return {chapterId,ordersServed,energy,coins,starsLeft:stars,completed,orderLog};
}

export function storageExpansionPlan(){
  let capacity=INITIAL_STORAGE_CAPACITY,totalCost=0;
  const steps=[];
  while(capacity<STORAGE_MAX_CAPACITY){
    const cost=Number(STORAGE_UPGRADE_COSTS[capacity]);
    if(!Number.isFinite(cost)||cost<0)throw new Error(`Missing storage upgrade cost for capacity ${capacity}`);
    const nextCapacity=Math.min(STORAGE_MAX_CAPACITY,capacity+STORAGE_CAPACITY_STEP);
    steps.push({from:capacity,to:nextCapacity,cost});
    totalCost+=cost;capacity=nextCapacity;
  }
  return {initialCapacity:INITIAL_STORAGE_CAPACITY,maxCapacity:STORAGE_MAX_CAPACITY,steps,totalCost};
}

function initialDiscoveryLevels(){
  const levels=Object.fromEntries(Object.keys(ITEM_FAMILIES).map(family=>[family,0]));
  for(const item of createInitialState().board){
    if(item?.kind==='item'&&Object.hasOwn(levels,item.family))levels[item.family]=Math.max(levels[item.family],item.level||0);
  }
  return levels;
}

function requiredDiscoveryProgress(requirements,discoveredLevels,masteredFamilies){
  let xp=0,masteryCoins=0;
  for(const requirement of requirements){
    const family=requirement?.family,definition=ITEM_FAMILIES[family];
    if(!definition)throw new Error(`Unknown discovery family: ${family}`);
    const requiredLevel=Math.min(definition.stages.length,Math.max(1,Number(requirement.level)||1));
    const previous=Math.max(0,Number(discoveredLevels[family])||0);
    if(requiredLevel<=previous)continue;
    for(let level=previous+1;level<=requiredLevel;level+=1)xp+=discoveryXpForItem(level);
    discoveredLevels[family]=requiredLevel;
    if(requiredLevel===definition.stages.length&&!masteredFamilies.has(family)){
      masteredFamilies.add(family);masteryCoins+=FAMILY_MASTERY_REWARD_COINS;
    }
  }
  return {xp,masteryCoins};
}

export function simulateEconomyJourney(){
  const initialCoins=Math.max(0,Number(createInitialState().coins)||0),storage=storageExpansionPlan();
  const discoveredLevels=initialDiscoveryLevels(),masteredFamilies=new Set(),guestVisits={};
  let ordersServed=0,orderCoins=0,orderXp=0,discoveryXp=0,restorationXp=0,loyaltyCoins=0,masteryCoins=0,serviceSequence=0;
  const checkpoints={};

  for(const chapter of PLACE_CHAPTERS){
    const pacing=simulateChapterPacing(chapter.id);
    const before={ordersServed,orderCoins,orderXp,discoveryXp,restorationXp,loyaltyCoins,masteryCoins};
    for(const entry of pacing.orderLog){
      ordersServed+=1;orderCoins+=entry.coins;orderXp+=xpForOrder(entry);
      const discovery=requiredDiscoveryProgress(entry.requirements,discoveredLevels,masteredFamilies);
      discoveryXp+=discovery.xp;masteryCoins+=discovery.masteryCoins;

      const guest=guestForSequence(serviceSequence),beforeVisits=Math.max(0,Number(guestVisits[guest.id])||0),visits=beforeVisits+1;
      guestVisits[guest.id]=visits;serviceSequence+=1;
      const loyalty=GUEST_LOYALTY_MILESTONES.find(milestone=>milestone.visits===visits);
      loyaltyCoins+=loyalty?.rewardCoins||0;

      for(const upgradeId of entry.upgradesBuilt){
        restorationXp+=xpForRestoration({unlockedPlace:PLACE_UNLOCK_BY_UPGRADE[upgradeId]||null});
      }
    }

    const totalXp=orderXp+discoveryXp+restorationXp,level=playerProgress(totalXp).level;
    const levelCoins=Math.max(0,level-1)*LEVEL_REWARD_COINS;
    const grossCoins=initialCoins+orderCoins+levelCoins+loyaltyCoins+masteryCoins;
    checkpoints[chapter.id]={
      chapterId:chapter.id,
      ordersServed,
      totalXp,
      level,
      sources:{initialCoins,orderCoins,levelCoins,loyaltyCoins,masteryCoins},
      grossCoins,
      storageCost:storage.totalCost,
      coinsAfterFullStorage:grossCoins-storage.totalCost,
      discoveryLevels:{...discoveredLevels},
      chapterDelta:{
        ordersServed:ordersServed-before.ordersServed,
        orderCoins:orderCoins-before.orderCoins,
        orderXp:orderXp-before.orderXp,
        discoveryXp:discoveryXp-before.discoveryXp,
        restorationXp:restorationXp-before.restorationXp,
        loyaltyCoins:loyaltyCoins-before.loyaltyCoins,
        masteryCoins:masteryCoins-before.masteryCoins,
      },
    };
  }

  const totalXp=orderXp+discoveryXp+restorationXp,level=playerProgress(totalXp).level,levelCoins=Math.max(0,level-1)*LEVEL_REWARD_COINS;
  const grossCoins=initialCoins+orderCoins+levelCoins+loyaltyCoins+masteryCoins;
  return {
    initialCoins,
    storage,
    checkpoints,
    totals:{
      ordersServed,
      orderCoins,
      orderXp,
      discoveryXp,
      restorationXp,
      totalXp,
      level,
      levelCoins,
      loyaltyCoins,
      masteryCoins,
      grossCoins,
      coinsAfterFullStorage:grossCoins-storage.totalCost,
    },
  };
}

export function economySnapshot(){
  const chapters={};
  for(const chapter of PLACE_CHAPTERS){
    chapters[chapter.id]={
      pacing:simulateChapterPacing(chapter.id),
      bands:[0,2,4].map(completed=>bandEconomyProfile(chapter.id,completed)),
    };
  }
  return {chapters,journey:simulateEconomyJourney()};
}

export function economyGuardFailures(snapshot=economySnapshot()){
  const failures=[];
  for(const [chapterId,data] of Object.entries(snapshot.chapters)){
    const [minOrders,maxOrders]=ECONOMY_GUARDS.chapterOrderWindows[chapterId]||[1,100];
    if(data.pacing.ordersServed<minOrders||data.pacing.ordersServed>maxOrders){
      failures.push(`${chapterId}: ${data.pacing.ordersServed} orders outside ${minOrders}-${maxOrders}`);
    }
    for(const entry of data.pacing.orderLog){
      if(entry.energy>ECONOMY_GUARDS.maxSingleOrderEnergy)failures.push(`${chapterId}/${entry.title}: ${entry.energy} energy exceeds ${ECONOMY_GUARDS.maxSingleOrderEnergy}`);
    }
    const established=data.bands.find(band=>band.band==='established');
    if(established?.energyPerStar>ECONOMY_GUARDS.maxEstablishedEnergyPerStar){
      failures.push(`${chapterId}: established ${established.energyPerStar.toFixed(2)} energy/star exceeds ${ECONOMY_GUARDS.maxEstablishedEnergyPerStar}`);
    }
  }
  const storageCheckpoint=snapshot.journey?.checkpoints?.[ECONOMY_GUARDS.storageAffordableByChapter];
  if(storageCheckpoint&&storageCheckpoint.coinsAfterFullStorage<0){
    failures.push(`${ECONOMY_GUARDS.storageAffordableByChapter}: full Storage costs ${storageCheckpoint.storageCost} but deterministic core Coins only reach ${storageCheckpoint.grossCoins}`);
  }
  return failures;
}

export function familySource(family){return FAMILY_SOURCE[family]||null;}
