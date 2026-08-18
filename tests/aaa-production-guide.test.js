import test from 'node:test';
import assert from 'node:assert/strict';
import { productionGuide, generatorGuide } from '../src/aaa-production-guide.js';
import { createInitialState } from '../src/v2-game.js';

test('Eiskaffee explains its real generator and merge chain',()=>{
  const guide=productionGuide('coffee',3);
  assert.equal(guide.itemName,'Eiskaffee');
  assert.equal(guide.generatorKey,'coffee-gen');
  assert.equal(guide.generatorLabel,'Kaffeemaschine');
  assert.equal(guide.baseItem,'Kaffeebohnen');
  assert.equal(guide.baseUnits,4);
  assert.deepEqual(guide.chain.map(step=>step.name),['Kaffeebohnen','Kaffeetasse','Eiskaffee']);
});

test('Mehl points to Vorratskiste instead of making the player guess',()=>{
  const guide=productionGuide('bakery',2);
  assert.equal(guide.itemName,'Mehl');
  assert.equal(guide.generatorKey,'pantry-gen');
  assert.equal(guide.generatorLabel,'Vorratskiste');
  assert.equal(guide.baseUnits,2);
});

test('generator guide exposes all produced families and relevant waiting orders',()=>{
  const state=createInitialState();
  const guide=generatorGuide('pantry-gen',state);
  assert.deepEqual(guide.families.map(entry=>entry.family),['bakery','sweet']);
  assert.ok(guide.waitingOrders.length>=1);
});
