import { PLACE_CHAPTERS, createInitialState, createProgressionOrder, orderDifficultyBand } from './v2-game.js';

const FAMILY_SOURCE={
  coffee:'coffee-gen',
  bakery:'pantry-gen',
  sweet:'pantry-gen',
  fruit:'sunset-gen',
  herb:'garden-gen',
};

export const ECONOMY_GUARDS={
  maxSingleOrderEnergy:64,
  maxEstablishedEnergyPerStar:7.25,
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
  const energy=theoreticalOrderEnergy(order?.requirements||[]);
  const coins=Math.max(0,Number(order?.rewards?.coins)||0);
  const stars=Math.max(0,Number(order?.rewards?.stars)||0);
  return {
    id:order?.id||null,
    title:order?.title||'',
    difficulty:order?.difficulty||null,
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
    const effort=orderEconomy(order);
    stars+=effort.stars;coins+=effort.coins;energy+=effort.energy;ordersServed+=1;sequence+=1;
    orderLog.push({...effort,completedBefore:completed});
    while(completed<chapter.upgrades.length&&stars>=chapter.upgrades[completed].cost){
      stars-=chapter.upgrades[completed].cost;
      completed+=1;
    }
  }
  return {chapterId,ordersServed,energy,coins,starsLeft:stars,completed,orderLog};
}

export function economySnapshot(){
  const chapters={};
  for(const chapter of PLACE_CHAPTERS){
    chapters[chapter.id]={
      pacing:simulateChapterPacing(chapter.id),
      bands:[0,2,4].map(completed=>bandEconomyProfile(chapter.id,completed)),
    };
  }
  return {chapters};
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
  return failures;
}

export function familySource(family){return FAMILY_SOURCE[family]||null;}
