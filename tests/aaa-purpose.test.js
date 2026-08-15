import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, PLACE_01_UPGRADES, PLACE_02_UPGRADES, PLACE_03_UPGRADES } from '../src/v2-game.js';
import { purposeGoal, purposeLine, purposeRewardLine } from '../src/aaa-purpose.js';

test('purpose model exposes the first meaningful restoration goal',()=>{
  const state=createInitialState();
  const goal=purposeGoal(state);
  assert.equal(goal.kind,'restoration');
  assert.equal(goal.chapter.id,'coast');
  assert.equal(goal.label,'Lichter');
  assert.equal(goal.step,1);
  assert.equal(goal.total,6);
  assert.equal(goal.cost,4);
  assert.equal(goal.missing,4);
  assert.equal(goal.after.label,'Neue Theke');
  assert.equal(purposeLine(state),'Noch 4 ★ bis Lichter');
});

test('purpose model makes build readiness explicit without adding a new currency',()=>{
  const state=createInitialState();state.stars=4;
  const goal=purposeGoal(state);
  assert.equal(goal.ready,true);
  assert.equal(goal.missing,0);
  assert.equal(purposeLine(state),'Lichter ist bereit zum Bauen');
  assert.equal(purposeRewardLine(state,2),'+2 ★ · Lichter kann jetzt gebaut werden');
});

test('final chapter step promises the next Place and its gameplay unlock',()=>{
  const state=createInitialState();
  state.placeUpgrades=PLACE_01_UPGRADES.slice(0,5).map(entry=>entry.id);
  const coastFinal=purposeGoal(state);
  assert.equal(coastFinal.label,'Poply-Schild');
  assert.equal(coastFinal.after.kind,'place');
  assert.equal(coastFinal.after.label,'Place 02: Sonnenkai');
  assert.match(coastFinal.after.detail,/Tropenbar/);

  state.placeUpgrades=[...PLACE_01_UPGRADES.map(entry=>entry.id),...PLACE_02_UPGRADES.slice(0,5).map(entry=>entry.id)];
  const sunsetFinal=purposeGoal(state);
  assert.equal(sunsetFinal.label,'Sonnenkai-Schild');
  assert.equal(sunsetFinal.after.label,'Place 03: Dachgarten');
  assert.match(sunsetFinal.after.detail,/Gewächshaus/);
});

test('purpose model resolves complete world state deterministically',()=>{
  const state=createInitialState();
  state.placeUpgrades=[...PLACE_01_UPGRADES,...PLACE_02_UPGRADES,...PLACE_03_UPGRADES].map(entry=>entry.id);
  const goal=purposeGoal(state);
  assert.equal(goal.complete,true);
  assert.equal(goal.label,'Alle Places aufgebaut');
  assert.equal(goal.after,null);
  assert.equal(purposeLine(state),'Alle Places aufgebaut');
});
