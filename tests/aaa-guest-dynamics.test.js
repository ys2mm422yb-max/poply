import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInitialState } from '../src/v2-game.js';
import { guestTraitForOrder, guestTraitQualifies, dailyServiceCondition, applyDynamicServiceBonus, isDynamicServiceUnlocked } from '../src/aaa-guest-dynamics.js';

test('recurring guests have deterministic distinct service traits',()=>{
  const state=createInitialState();
  const traits=state.currentOrders.map(order=>guestTraitForOrder(order).trait.id);
  assert.equal(new Set(traits).size,3);
});

test('trait qualification follows actual order composition',()=>{
  const combo={sequence:0,requirements:[{family:'coffee',level:2,qty:1},{family:'bakery',level:2,qty:1}]};
  assert.equal(guestTraitQualifies(combo,'combo'),true);
  assert.equal(guestTraitQualifies(combo,'variety'),true);
  assert.equal(guestTraitQualifies(combo,'coffee'),true);
});

test('daily condition is deterministic for the same local day and only uses unlocked generator families',()=>{
  const state=createInitialState(),now=new Date(2026,7,18,12,0,0).getTime();
  const first=dailyServiceCondition(state,now),second=dailyServiceCondition(state,now+1000);
  assert.deepEqual(first,second);
  assert.ok(['coffee','bakery','sweet'].includes(first.family));
});

test('guest and daily service bonuses unlock with the Menüwand instead of changing the opening economy',()=>{
  const state=createInitialState(),order=state.currentOrders.find(entry=>entry.title==='Frühstück am Fenster')||state.currentOrders[1],now=new Date(2026,7,18,12,0,0).getTime();
  assert.equal(isDynamicServiceUnlocked(state),false);
  const locked=applyDynamicServiceBonus(state,order,now);
  assert.equal(locked.totalCoins,0);
  assert.equal(locked.state.coins,state.coins);
  const unlocked=structuredClone(state);unlocked.placeUpgrades=['lights','counter','menu'];
  assert.equal(isDynamicServiceUnlocked(unlocked),true);
  const result=applyDynamicServiceBonus(unlocked,order,now);
  assert.ok(result.totalCoins>0&&result.totalCoins<=25);
  assert.equal(result.state.coins,unlocked.coins+result.totalCoins);
  assert.equal(result.state.stars,unlocked.stars);
});

test('guest dynamics stay a single lightweight metadata line on short phones',()=>{
  const css=readFileSync(new URL('../src/aaa-guest-dynamics.css',import.meta.url),'utf8');
  assert.match(css,/@media\(max-height:760px\)\{\.guest-dynamic-line\{font-size:8px;line-height:1;margin-top:1px;gap:1px 6px\}/);
  assert.match(css,/\.daily-condition\{max-width:100%;overflow:hidden;text-overflow:ellipsis\}/);
});
