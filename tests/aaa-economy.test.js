import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrder } from '../src/v2-game.js';
import { requirementBaseUnits, theoreticalOrderEnergy, orderEconomy, bandEconomyProfile, simulateChapterPacing, economySnapshot, economyGuardFailures } from '../src/aaa-economy.js';

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
  assert.deepEqual({orders:coast.ordersServed,energy:coast.energy,coins:coast.coins},{orders:15,energy:228,coins:1745});
  assert.deepEqual({orders:sunset.ordersServed,energy:sunset.energy,coins:sunset.coins},{orders:16,energy:286,coins:3195});
  assert.deepEqual({orders:garden.ordersServed,energy:garden.energy,coins:garden.coins},{orders:20,energy:288,coins:4800});
  assert.ok(coast.ordersServed<sunset.ordersServed);
  assert.ok(sunset.ordersServed<garden.ordersServed);
});

test('economy guard catches pacing regressions before release',()=>{
  const snapshot=economySnapshot();
  assert.deepEqual(economyGuardFailures(snapshot),[]);
  const broken=structuredClone(snapshot);
  broken.chapters.coast.pacing.ordersServed=99;
  assert.match(economyGuardFailures(broken)[0],/coast: 99 orders outside/);
});
