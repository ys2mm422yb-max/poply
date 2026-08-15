import test from 'node:test';
import assert from 'node:assert/strict';
import { nextPlayerMilestone, playerMilestones } from '../src/aaa-milestones.js';

const state=(overrides={})=>({
  stats:{orders:0,merges:0},
  placeUpgrades:[],
  discoveries:[],
  playerXp:0,
  ...overrides
});

test('nextPlayerMilestone picks the closest normalized unfinished milestone',()=>{
  const current=state({
    stats:{orders:1,merges:20},
    placeUpgrades:['lights','counter','menu'],
    discoveries:['item:coffee:1','item:coffee:2'],
    playerXp:120
  });
  const focus=nextPlayerMilestone(current);
  assert.equal(focus.id,'merge-rhythm');
  assert.equal(focus.current,20);
  assert.equal(focus.remaining,5);
});

test('nextPlayerMilestone skips completed milestones and resolves ties deterministically',()=>{
  const current=state({
    stats:{orders:1,merges:0},
    placeUpgrades:[],
    discoveries:[],
    playerXp:0
  });
  assert.equal(nextPlayerMilestone(current).id,'level-five');
});

test('nextPlayerMilestone returns null when all milestone goals are complete',()=>{
  const current=state({
    stats:{orders:20,merges:50},
    placeUpgrades:['lights','counter','menu','seating','terrace','sign'],
    discoveries:Array.from({length:12},(_,index)=>`item:test:${index+1}`),
    playerXp:2000
  });
  assert.ok(playerMilestones(current).every(entry=>entry.complete));
  assert.equal(nextPlayerMilestone(current),null);
});
