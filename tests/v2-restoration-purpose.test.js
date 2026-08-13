import test from 'node:test';
import assert from 'node:assert/strict';
import { PLACE_UPGRADES, createInitialState, buildNextUpgrade, restorationStatus } from '../src/v2-game.js';

test('first place has six restoration steps',()=>{
  assert.equal(PLACE_UPGRADES.length,6);
  assert.deepEqual(PLACE_UPGRADES.map(step=>step.id),['lights','counter','menu','seating','terrace','sign']);
});

test('restoration status connects stars to next goal',()=>{
  const state=createInitialState();
  let status=restorationStatus({...state,stars:2});
  assert.equal(status.upgrade.id,'lights');
  assert.equal(status.current,2);
  assert.equal(status.cost,4);
  assert.equal(status.missing,2);
  const built=buildNextUpgrade({...state,stars:4}).state;
  status=restorationStatus(built);
  assert.equal(status.completed,1);
  assert.equal(status.upgrade.id,'counter');
  assert.equal(status.cost,6);
});
