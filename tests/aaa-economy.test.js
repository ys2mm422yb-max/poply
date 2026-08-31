import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrder } from '../src/v2-game.js';
import { requirementBaseUnits, theoreticalOrderEnergy, orderEconomy, bandEconomyProfile, simulateChapterPacing, storageExpansionPlan, simulateEconomyJourney, economySnapshot, economyGuardFailures } from '../src/aaa-economy.js';

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

test('chapter pacing remains finite and intentionally scales by orders served',()=>{
  const coast=simulateChapterPacing('coast');
  const sunset=simulateChapterPacing('sunset');
  const garden=simulateChapterPacing('garden');
  assert.deepEqual({orders:coast.ordersServed,energy:coast.energy,coins:coast.coins},{orders:15,energy:218,coins:1767});
  assert.deepEqual({orders:sunset.ordersServed,energy:sunset.energy,coins:sunset.coins},{orders:16,energy:286,coins:3195});
  assert.deepEqual({orders:garden.ordersServed,energy:garden.energy,coins:garden.coins},{orders:20,energy:288,coins:4800});
  assert.ok(coast.ordersServed<sunset.ordersServed);
  assert.ok(sunset.ordersServed<garden.ordersServed);
  assert.ok(coast.energy<228,'first-session variety should not make Place 01 grindier than the previous baseline');
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

test('core journey models orders, required discoveries, levels, loyalty and mastery together',()=>{
  const journey=simulateEconomyJourney();
  assert.deepEqual(journey.checkpoints.coast,{
    ...journey.checkpoints.coast,
    ordersServed:15,
    totalXp:3090,
    level:9,
    sources:{initialCoins:100,orderCoins:1767,levelCoins:800,loyaltyCoins:375,masteryCoins:500},
    grossCoins:3542,
    storageCost:650,
    coinsAfterFullStorage:2892,
    discoveryLevels:{coffee:5,bakery:6,sweet:6,fruit:0,herb:0},
  });
  assert.deepEqual(journey.checkpoints.sunset.sources,{initialCoins:100,orderCoins:4962,levelCoins:1200,loyaltyCoins:375,masteryCoins:750});
  assert.deepEqual(journey.checkpoints.garden.sources,{initialCoins:100,orderCoins:9762,levelCoins:1600,loyaltyCoins:1125,masteryCoins:1000});
  assert.deepEqual(journey.totals,{
    ordersServed:51,
    orderCoins:9762,
    orderXp:5110,
    discoveryXp:1480,
    restorationXp:2720,
    totalXp:9310,
    level:17,
    levelCoins:1600,
    loyaltyCoins:1125,
    masteryCoins:1000,
    grossCoins:13587,
    coinsAfterFullStorage:12937,
  });
});

test('economy guard catches pacing and permanent-sink regressions before release',()=>{
  const snapshot=economySnapshot();
  assert.deepEqual(economyGuardFailures(snapshot),[]);
  const brokenPacing=structuredClone(snapshot);
  brokenPacing.chapters.coast.pacing.ordersServed=99;
  assert.match(economyGuardFailures(brokenPacing)[0],/coast: 99 orders outside/);

  const brokenStorage=structuredClone(snapshot);
  brokenStorage.journey.checkpoints.coast.coinsAfterFullStorage=-1;
  assert.match(economyGuardFailures(brokenStorage).at(-1),/full Storage costs 650/);
});
