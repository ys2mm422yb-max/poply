import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrder } from '../src/v2-game.js';
import { requirementBaseUnits, theoreticalOrderEnergy, orderEconomy, bandEconomyProfile, simulateChapterPacing, simulateRuntimeOrderRoute, storageExpansionPlan, simulateEconomyJourney, economySnapshot, economyGuardFailures } from '../src/aaa-economy.js';

test('tier energy uses exact merge base units',()=>{
  assert.equal(requirementBaseUnits({family:'coffee',level:1,qty:1}),1);
  assert.equal(requirementBaseUnits({family:'coffee',level:6,qty:1}),32);
  assert.equal(requirementBaseUnits({family:'coffee',level:4,qty:2}),16);
});

test('generator topology is reflected in theoretical energy',()=>{
  assert.equal(theoreticalOrderEnergy([{family:'coffee',level:4,qty:1}]),8);
  assert.equal(theoreticalOrderEnergy([{family:'fruit',level:4,qty:1}]),8);
  assert.equal(theoreticalOrderEnergy([{family:'bakery',level:4,qty:1}]),16);
  assert.equal(theoreticalOrderEnergy([{family:'bakery',level:3,qty:1},{family:'sweet',level:3,qty:1}]),8);
  assert.equal(theoreticalOrderEnergy([{family:'herb',level:6,qty:1}]),26);
});

test('order effort exposes transparent reward efficiency',()=>{
  const effort=orderEconomy(createOrder(0,'coast'));
  assert.equal(effort.title,'Morgenkaffee');
  assert.equal(effort.energy,2);
  assert.equal(effort.coins,45);
  assert.equal(effort.stars,2);
  assert.equal(effort.energyPerStar,1);
  assert.deepEqual(effort.requirements,[{family:'coffee',level:2,qty:1}]);
});

test('visible restoration progress raises effort in explicit bands',()=>{
  const coastStarter=bandEconomyProfile('coast',0);
  const coastGrowing=bandEconomyProfile('coast',2);
  const coastEstablished=bandEconomyProfile('coast',4);
  assert.equal(coastStarter.band,'starter');
  assert.equal(coastGrowing.band,'growing');
  assert.equal(coastEstablished.band,'established');
  assert.ok(coastStarter.energyPerStar<coastGrowing.energyPerStar);
  assert.ok(coastGrowing.energyPerStar<coastEstablished.energyPerStar);
  assert.ok(coastEstablished.energyPerStar<6);
});

test('isolated chapter reference remains stable for template and band regressions',()=>{
  const coast=simulateChapterPacing('coast');
  const sunset=simulateChapterPacing('sunset');
  const garden=simulateChapterPacing('garden');
  assert.deepEqual({orders:coast.ordersServed,energy:coast.energy,coins:coast.coins},{orders:15,energy:218,coins:1767});
  assert.deepEqual({orders:sunset.ordersServed,energy:sunset.energy,coins:sunset.coins},{orders:16,energy:286,coins:3195});
  assert.deepEqual({orders:garden.ordersServed,energy:garden.energy,coins:garden.coins},{orders:20,energy:288,coins:4800});
  assert.ok(coast.ordersServed<sunset.ordersServed);
  assert.ok(sunset.ordersServed<garden.ordersServed);
  assert.ok(coast.energy<228,'first-session variety should not make Place 01 grindier than the previous isolated baseline');
});

test('runtime trace preserves the real opening queue, anti-repeat and replacement-before-build order',()=>{
  const trace=simulateRuntimeOrderRoute('fifo');
  assert.equal(trace.completed,true);
  assert.deepEqual(trace.antiRepeatViolations,[]);
  assert.deepEqual(trace.queueSizeViolations,[]);

  const first=trace.orderLog[0];
  assert.deepEqual(first.visible.map(order=>order.title),['Erster Kaffee','Frühstück am Fenster','Süße Begrüßung']);
  assert.equal(first.selected.title,'Erster Kaffee');
  assert.equal(first.replacement.title,'Frühstücksduo');
  assert.deepEqual(first.builds.map(build=>build.id),['lights']);
  assert.deepEqual(first.queueAfterReplacement.map(order=>order.title),['Frühstück am Fenster','Süße Begrüßung','Frühstücksduo']);

  const third=trace.orderLog[2];
  assert.equal(third.replacementContext.completedRestorations,1,'replacement should use the pre-build Coast stage');
  assert.equal(third.completedRestorationsAfter,2,'build should advance the Coast stage only after replacement creation');
});

test('rolling three-order policies expose materially different but finite pacing',()=>{
  const fifo=simulateRuntimeOrderRoute('fifo');
  const restoration=simulateRuntimeOrderRoute('restoration-efficient');
  const conservative=simulateRuntimeOrderRoute('coin-conservative');

  assert.deepEqual(fifo.checkpoints.coast.delta,{ordersServed:15,energy:180,orderCoins:1611});
  assert.deepEqual(fifo.checkpoints.sunset.delta,{ordersServed:14,energy:290,orderCoins:2845});
  assert.deepEqual(fifo.checkpoints.garden.delta,{ordersServed:20,energy:317,orderCoins:4890});
  assert.deepEqual({services:fifo.services,energy:fifo.energy,orderCoins:fifo.orderCoins},{services:49,energy:787,orderCoins:9346});

  assert.deepEqual(restoration.checkpoints.coast.delta,{ordersServed:16,energy:160,orderCoins:1603});
  assert.deepEqual(restoration.checkpoints.sunset.delta,{ordersServed:15,energy:238,orderCoins:2805});
  assert.deepEqual(restoration.checkpoints.garden.delta,{ordersServed:20,energy:266,orderCoins:4515});
  assert.deepEqual({services:restoration.services,energy:restoration.energy,orderCoins:restoration.orderCoins},{services:51,energy:664,orderCoins:8923});

  assert.deepEqual(conservative.checkpoints.coast.delta,{ordersServed:16,energy:152,orderCoins:1464});
  assert.deepEqual(conservative.checkpoints.sunset.delta,{ordersServed:16,energy:238,orderCoins:2735});
  assert.deepEqual(conservative.checkpoints.garden.delta,{ordersServed:21,energy:273,orderCoins:4495});
  assert.deepEqual({services:conservative.services,energy:conservative.energy,orderCoins:conservative.orderCoins},{services:53,energy:663,orderCoins:8694});
});

test('permanent Storage sink stays tied to canonical upgrade configuration',()=>{
  const storage=storageExpansionPlan();
  assert.deepEqual(storage,{
    initialCapacity:4,
    maxCapacity:8,
    steps:[{from:4,to:6,cost:200},{from:6,to:8,cost:450}],
    totalCost:650,
  });
});

test('core journey follows the conservative rolling queue and actual order guest sequence',()=>{
  const journey=simulateEconomyJourney();
  assert.equal(journey.policy,'coin-conservative');
  assert.deepEqual(journey.checkpoints.coast,{
    ...journey.checkpoints.coast,
    ordersServed:16,
    theoreticalEnergy:152,
    totalXp:2770,
    level:9,
    sources:{initialCoins:100,orderCoins:1464,levelCoins:800,loyaltyCoins:375,masteryCoins:0},
    grossCoins:2739,
    storageCost:650,
    coinsAfterFullStorage:2089,
    discoveryLevels:{coffee:4,bakery:5,sweet:4,fruit:0,herb:0},
    guestVisits:{mika:5,nora:6,sam:5},
  });
  assert.deepEqual(journey.checkpoints.sunset.sources,{initialCoins:100,orderCoins:4199,levelCoins:1200,loyaltyCoins:625,masteryCoins:0});
  assert.deepEqual(journey.checkpoints.garden.sources,{initialCoins:100,orderCoins:8694,levelCoins:1500,loyaltyCoins:1125,masteryCoins:500});
  assert.deepEqual(journey.totals,{
    ordersServed:53,
    theoreticalEnergy:663,
    orderCoins:8694,
    orderXp:5060,
    discoveryXp:1320,
    restorationXp:2720,
    totalXp:9100,
    level:16,
    levelCoins:1500,
    loyaltyCoins:1125,
    masteryCoins:500,
    grossCoins:11919,
    coinsAfterFullStorage:11269,
  });
});

test('economy guard catches isolated, rolling-queue and permanent-sink regressions before release',()=>{
  const snapshot=economySnapshot();
  assert.deepEqual(economyGuardFailures(snapshot),[]);

  const brokenPacing=structuredClone(snapshot);
  brokenPacing.chapters.coast.pacing.ordersServed=99;
  assert.match(economyGuardFailures(brokenPacing)[0],/coast: isolated 99 orders outside/);

  const brokenQueue=structuredClone(snapshot);
  brokenQueue.runtimeTraces.fifo.antiRepeatViolations.push({service:1});
  assert.ok(economyGuardFailures(brokenQueue).some(failure=>/fifo: 1 anti-repeat violations/.test(failure)));

  const brokenStorage=structuredClone(snapshot);
  brokenStorage.journey.checkpoints.coast.coinsAfterFullStorage=-1;
  assert.match(economyGuardFailures(brokenStorage).at(-1),/full Storage costs 650/);
});
