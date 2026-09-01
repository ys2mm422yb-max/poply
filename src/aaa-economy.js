import { ITEM_FAMILIES, PLACE_CHAPTERS, activePlaceChapter, buildNextUpgrade, createInitialState, createProgressionOrder, fulfillOrder, isPlace03Complete, makeItem, orderDifficultyBand } from './v2-game.js';
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
const TRACE_SERVICE_LIMIT=120;
const TRACE_POOL_PROBE_LIMIT=32;

export const RUNTIME_TRACE_POLICIES=Object.freeze(['fifo','restoration-efficient','coin-conservative']);
export const ECONOMY_GUARDS={
  maxSingleOrderEnergy:64,
  maxEstablishedEnergyPerStar:7.25,
  storageAffordableByChapter:'coast',
  runtimeTracePolicy:'coin-conservative',
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

// Isolated reference model retained for template/band regressions. It intentionally
// does not represent the live three-order queue; simulateRuntimeOrderRoute does.
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

const completedUpgradeCountForChapter=(state,chapterId)=>{
  const chapter=PLACE_CHAPTERS.find(entry=>entry.id===chapterId);
  if(!chapter)return 0;
  return chapter.upgrades.reduce((count,upgrade)=>count+(state.placeUpgrades.includes(upgrade.id)?1:0),0);
};
const chapterForUpgrade=upgradeId=>PLACE_CHAPTERS.find(chapter=>chapter.upgrades.some(upgrade=>upgrade.id===upgradeId))||null;
const chapterComplete=(state,chapter)=>chapter?.upgrades.every(upgrade=>state.placeUpgrades.includes(upgrade.id))||false;
const safeSequence=order=>Number.isInteger(order?.sequence)?order.sequence:Number.MAX_SAFE_INTEGER;
const compareNumber=(left,right)=>left-right;

function visibleOrderEconomy(state){
  return (state.currentOrders||[]).map(order=>({...orderEconomy(order),chapter:order.chapter||null}));
}

function selectRuntimeOrder(state,policy){
  if(!RUNTIME_TRACE_POLICIES.includes(policy))throw new Error(`Unknown runtime trace policy: ${policy}`);
  const choices=visibleOrderEconomy(state);
  if(!choices.length)throw new Error('Runtime trace has no visible orders');
  const compareSequence=(left,right)=>compareNumber(safeSequence(left),safeSequence(right));
  const comparators={
    fifo:(left,right)=>compareSequence(left,right),
    'restoration-efficient':(left,right)=>compareNumber(left.energyPerStar,right.energyPerStar)||compareNumber(left.energy,right.energy)||compareSequence(left,right),
    'coin-conservative':(left,right)=>compareNumber(left.coins,right.coins)||compareNumber(left.energy,right.energy)||compareSequence(left,right),
  };
  return [...choices].sort(comparators[policy])[0];
}

function runtimeCandidateTitles(state,chapterId){
  const probe=structuredClone(state);probe.currentOrders=[];
  const titles=new Set();
  for(let sequence=0;sequence<TRACE_POOL_PROBE_LIMIT;sequence+=1)titles.add(createProgressionOrder(probe,sequence,chapterId).title);
  return [...titles];
}

function readyRuntimeTraceOrder(inputState,order){
  const state=structuredClone(inputState);
  state.board=state.board.map(slot=>slot?.kind==='item'?null:slot);
  let cursor=0;
  for(const requirement of order.requirements||[]){
    for(let count=0;count<Math.max(0,Number(requirement.qty)||0);count+=1){
      while(cursor<state.board.length&&state.board[cursor]!==null)cursor+=1;
      if(cursor>=state.board.length)throw new Error(`Runtime trace cannot seed ${order.title}: Board is full`);
      state.board[cursor]=makeItem(requirement.family,requirement.level,`economy-trace-${order.sequence}-${requirement.family}-${requirement.level}-${count}-${cursor}`);
      cursor+=1;
    }
  }
  return state;
}

function summarizeVisibleChoice(visible){
  const energy=visible.map(order=>order.energy),energyPerStar=visible.map(order=>order.energyPerStar);
  return {
    lowestEnergy:Math.min(...energy),
    highestEnergy:Math.max(...energy),
    lowestEnergyPerStar:Math.min(...energyPerStar),
    highestEnergyPerStar:Math.max(...energyPerStar),
  };
}

export function simulateRuntimeOrderRoute(policy='fifo'){
  if(!RUNTIME_TRACE_POLICIES.includes(policy))throw new Error(`Unknown runtime trace policy: ${policy}`);
  let state=createInitialState(),services=0,energy=0,orderCoins=0;
  const orderLog=[],checkpoints={},avoidableRepeatViolations=[],forcedRepeats=[],queueSizeViolations=[];
  let previousCheckpoint={services:0,energy:0,orderCoins:0};

  while(!isPlace03Complete(state)&&services<TRACE_SERVICE_LIMIT){
    const activeBefore=activePlaceChapter(state).id;
    const visible=visibleOrderEconomy(state);
    if(visible.length!==3)queueSizeViolations.push({service:services+1,size:visible.length});
    const selected=selectRuntimeOrder(state,policy);
    const choice=summarizeVisibleChoice(visible);
    const sequenceBefore=state.orderSequence;
    const remainingTitles=(state.currentOrders||[]).filter(order=>order.id!==selected.id).map(order=>order.title);
    const candidateTitles=runtimeCandidateTitles(state,activeBefore);
    const blockedTitles=new Set([...remainingTitles,selected.title]);
    const unblockedCandidateTitles=candidateTitles.filter(title=>!blockedTitles.has(title));
    const replacementContext={
      chapterId:activeBefore,
      completedRestorations:completedUpgradeCountForChapter(state,activeBefore),
      candidateTitles,
      unblockedCandidateTitles,
    };

    const ready=readyRuntimeTraceOrder(state,selected);
    const fulfilled=fulfillOrder(ready,selected.id);
    if(!fulfilled.changed)throw new Error(`Runtime trace could not fulfill ${selected.id}: ${fulfilled.reason||'unknown'}`);
    state=fulfilled.state;
    services+=1;energy+=selected.energy;orderCoins+=selected.coins;

    const replacement=state.currentOrders.find(order=>order.id===`order-${sequenceBefore}`)||null;
    if(!replacement){
      avoidableRepeatViolations.push({service:services,reason:'replacement-missing',selected:selected.title});
    }else if(replacement.title===selected.title||remainingTitles.includes(replacement.title)){
      const repeat={service:services,selected:selected.title,replacement:replacement.title,remainingTitles,candidateTitles};
      if(unblockedCandidateTitles.length)avoidableRepeatViolations.push({...repeat,reason:'avoidable-repeat',unblockedCandidateTitles});
      else forcedRepeats.push({...repeat,reason:'pool-exhausted'});
    }
    const queueAfterReplacement=visibleOrderEconomy(state);

    const builds=[],completedChapters=[];
    for(let buildGuard=0;buildGuard<PLACE_CHAPTERS.reduce((sum,chapter)=>sum+chapter.upgrades.length,0);buildGuard+=1){
      const built=buildNextUpgrade(state);
      if(!built.changed){
        if(['not-enough-stars','place-complete'].includes(built.reason))break;
        throw new Error(`Runtime trace build failed: ${built.reason||'unknown'}`);
      }
      state=built.state;
      const chapter=chapterForUpgrade(built.upgrade.id);
      const build={id:built.upgrade.id,chapterId:chapter?.id||null,cost:built.upgrade.cost,unlockedPlace:built.unlockedPlace||null};
      builds.push(build);
      if(chapter&&chapterComplete(state,chapter)&&!checkpoints[chapter.id]){
        const checkpoint={
          chapterId:chapter.id,
          services,
          energy,
          orderCoins,
          starsLeft:state.stars,
          delta:{
            ordersServed:services-previousCheckpoint.services,
            energy:energy-previousCheckpoint.energy,
            orderCoins:orderCoins-previousCheckpoint.orderCoins,
          },
          queueAfter:visibleOrderEconomy(state).map(order=>({sequence:order.sequence,chapter:order.chapter,title:order.title,energy:order.energy,coins:order.coins,stars:order.stars})),
        };
        checkpoints[chapter.id]=checkpoint;
        previousCheckpoint={services,energy,orderCoins};
        completedChapters.push(chapter.id);
      }
    }

    orderLog.push({
      service:services,
      activeChapterBefore:activeBefore,
      replacementContext,
      visible:visible.map(order=>({sequence:order.sequence,chapter:order.chapter,title:order.title,energy:order.energy,coins:order.coins,stars:order.stars,energyPerStar:order.energyPerStar})),
      choice,
      selected:{sequence:selected.sequence,chapter:selected.chapter,title:selected.title,energy:selected.energy,coins:selected.coins,stars:selected.stars,energyPerStar:selected.energyPerStar,requirements:selected.requirements},
      replacement:replacement?{sequence:replacement.sequence,chapter:replacement.chapter,title:replacement.title,difficulty:replacement.difficulty||null}:null,
      queueAfterReplacement:queueAfterReplacement.map(order=>({sequence:order.sequence,chapter:order.chapter,title:order.title})),
      builds,
      completedChapters,
      activeChapterAfter:activePlaceChapter(state).id,
      completedRestorationsAfter:completedUpgradeCountForChapter(state,activePlaceChapter(state).id),
      starsLeft:state.stars,
      cumulative:{energy,orderCoins},
    });
  }

  const completed=isPlace03Complete(state);
  const selectedEnergy=orderLog.map(entry=>entry.selected.energy),selectedEnergyPerStar=orderLog.map(entry=>entry.selected.energyPerStar);
  const choiceFloorEnergy=orderLog.map(entry=>entry.choice.lowestEnergy),choiceFloorEnergyPerStar=orderLog.map(entry=>entry.choice.lowestEnergyPerStar);
  return {
    policy,
    completed,
    services,
    energy,
    orderCoins,
    starsLeft:state.stars,
    checkpoints,
    avoidableRepeatViolations,
    forcedRepeats,
    queueSizeViolations,
    maxSelectedEnergy:selectedEnergy.length?Math.max(...selectedEnergy):0,
    maxSelectedEnergyPerStar:selectedEnergyPerStar.length?Math.max(...selectedEnergyPerStar):0,
    maxChoiceFloorEnergy:choiceFloorEnergy.length?Math.max(...choiceFloorEnergy):0,
    maxChoiceFloorEnergyPerStar:choiceFloorEnergyPerStar.length?Math.max(...choiceFloorEnergyPerStar):0,
    orderLog,
  };
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

export function simulateEconomyJourney(policy=ECONOMY_GUARDS.runtimeTracePolicy,route=simulateRuntimeOrderRoute(policy)){
  if(route.policy!==policy)throw new Error(`Journey policy ${policy} does not match route policy ${route.policy}`);
  const initialCoins=Math.max(0,Number(createInitialState().coins)||0),storage=storageExpansionPlan();
  const discoveredLevels=initialDiscoveryLevels(),masteredFamilies=new Set(),guestVisits={};
  let ordersServed=0,theoreticalEnergy=0,orderCoins=0,orderXp=0,discoveryXp=0,restorationXp=0,loyaltyCoins=0,masteryCoins=0;
  const checkpoints={};
  let previous={ordersServed:0,theoreticalEnergy:0,orderCoins:0,orderXp:0,discoveryXp:0,restorationXp:0,loyaltyCoins:0,masteryCoins:0};

  for(const entry of route.orderLog){
    const order=entry.selected;
    ordersServed+=1;theoreticalEnergy+=order.energy;orderCoins+=order.coins;orderXp+=xpForOrder(order);
    const discovery=requiredDiscoveryProgress(order.requirements,discoveredLevels,masteredFamilies);
    discoveryXp+=discovery.xp;masteryCoins+=discovery.masteryCoins;

    const guest=guestForSequence(order.sequence),beforeVisits=Math.max(0,Number(guestVisits[guest.id])||0),visits=beforeVisits+1;
    guestVisits[guest.id]=visits;
    const loyalty=GUEST_LOYALTY_MILESTONES.find(milestone=>milestone.visits===visits);
    loyaltyCoins+=loyalty?.rewardCoins||0;

    for(const build of entry.builds)restorationXp+=xpForRestoration({unlockedPlace:build.unlockedPlace||PLACE_UNLOCK_BY_UPGRADE[build.id]||null});

    for(const chapterId of entry.completedChapters){
      const totalXp=orderXp+discoveryXp+restorationXp,level=playerProgress(totalXp).level;
      const levelCoins=Math.max(0,level-1)*LEVEL_REWARD_COINS;
      const grossCoins=initialCoins+orderCoins+levelCoins+loyaltyCoins+masteryCoins;
      checkpoints[chapterId]={
        chapterId,
        policy,
        ordersServed,
        theoreticalEnergy,
        totalXp,
        level,
        sources:{initialCoins,orderCoins,levelCoins,loyaltyCoins,masteryCoins},
        grossCoins,
        storageCost:storage.totalCost,
        coinsAfterFullStorage:grossCoins-storage.totalCost,
        discoveryLevels:{...discoveredLevels},
        guestVisits:{...guestVisits},
        chapterDelta:{
          ordersServed:ordersServed-previous.ordersServed,
          theoreticalEnergy:theoreticalEnergy-previous.theoreticalEnergy,
          orderCoins:orderCoins-previous.orderCoins,
          orderXp:orderXp-previous.orderXp,
          discoveryXp:discoveryXp-previous.discoveryXp,
          restorationXp:restorationXp-previous.restorationXp,
          loyaltyCoins:loyaltyCoins-previous.loyaltyCoins,
          masteryCoins:masteryCoins-previous.masteryCoins,
        },
      };
      previous={ordersServed,theoreticalEnergy,orderCoins,orderXp,discoveryXp,restorationXp,loyaltyCoins,masteryCoins};
    }
  }

  const totalXp=orderXp+discoveryXp+restorationXp,level=playerProgress(totalXp).level,levelCoins=Math.max(0,level-1)*LEVEL_REWARD_COINS;
  const grossCoins=initialCoins+orderCoins+levelCoins+loyaltyCoins+masteryCoins;
  return {
    policy,
    initialCoins,
    storage,
    checkpoints,
    totals:{
      ordersServed,
      theoreticalEnergy,
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
  const runtimeTraces=Object.fromEntries(RUNTIME_TRACE_POLICIES.map(policy=>[policy,simulateRuntimeOrderRoute(policy)]));
  const journey=simulateEconomyJourney(ECONOMY_GUARDS.runtimeTracePolicy,runtimeTraces[ECONOMY_GUARDS.runtimeTracePolicy]);
  return {chapters,runtimeTraces,journey};
}

export function economyGuardFailures(snapshot=economySnapshot()){
  const failures=[];
  for(const [chapterId,data] of Object.entries(snapshot.chapters)){
    const [minOrders,maxOrders]=ECONOMY_GUARDS.chapterOrderWindows[chapterId]||[1,100];
    if(data.pacing.ordersServed<minOrders||data.pacing.ordersServed>maxOrders){
      failures.push(`${chapterId}: isolated ${data.pacing.ordersServed} orders outside ${minOrders}-${maxOrders}`);
    }
    for(const entry of data.pacing.orderLog){
      if(entry.energy>ECONOMY_GUARDS.maxSingleOrderEnergy)failures.push(`${chapterId}/${entry.title}: ${entry.energy} energy exceeds ${ECONOMY_GUARDS.maxSingleOrderEnergy}`);
    }
    const established=data.bands.find(band=>band.band==='established');
    if(established?.energyPerStar>ECONOMY_GUARDS.maxEstablishedEnergyPerStar){
      failures.push(`${chapterId}: established ${established.energyPerStar.toFixed(2)} energy/star exceeds ${ECONOMY_GUARDS.maxEstablishedEnergyPerStar}`);
    }
  }
  for(const [policy,trace] of Object.entries(snapshot.runtimeTraces||{})){
    if(!trace.completed)failures.push(`${policy}: runtime route did not complete within ${TRACE_SERVICE_LIMIT} services`);
    if(trace.avoidableRepeatViolations.length)failures.push(`${policy}: ${trace.avoidableRepeatViolations.length} avoidable anti-repeat violations`);
    if(trace.queueSizeViolations.length)failures.push(`${policy}: ${trace.queueSizeViolations.length} three-order queue violations`);
    if(trace.maxSelectedEnergy>ECONOMY_GUARDS.maxSingleOrderEnergy)failures.push(`${policy}: selected ${trace.maxSelectedEnergy} energy exceeds ${ECONOMY_GUARDS.maxSingleOrderEnergy}`);
    for(const [chapterId,checkpoint] of Object.entries(trace.checkpoints||{})){
      const [minOrders,maxOrders]=ECONOMY_GUARDS.chapterOrderWindows[chapterId]||[1,100];
      if(checkpoint.delta.ordersServed<minOrders||checkpoint.delta.ordersServed>maxOrders){
        failures.push(`${policy}/${chapterId}: ${checkpoint.delta.ordersServed} runtime orders outside ${minOrders}-${maxOrders}`);
      }
    }
  }
  const storageCheckpoint=snapshot.journey?.checkpoints?.[ECONOMY_GUARDS.storageAffordableByChapter];
  if(storageCheckpoint&&storageCheckpoint.coinsAfterFullStorage<0){
    failures.push(`${ECONOMY_GUARDS.storageAffordableByChapter}: full Storage costs ${storageCheckpoint.storageCost} but conservative runtime Coins only reach ${storageCheckpoint.grossCoins}`);
  }
  return failures;
}

export function familySource(family){return FAMILY_SOURCE[family]||null;}
