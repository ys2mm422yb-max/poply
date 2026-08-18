import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/v2-game.js';
import { guestTraitForOrder, guestTraitQualifies, dailyServiceCondition, applyDynamicServiceBonus } from '../src/aaa-guest-dynamics.js';

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

test('dynamic service bonus adds only its explicit guest/day coins without changing stars',()=>{
  const state=createInitialState(),order=state.currentOrders.find(entry=>entry.title==='Frühstück am Fenster')||state.currentOrders[1];
  const before=state.coins,result=applyDynamicServiceBonus(state,order,new Date(2026,7,18,12,0,0).getTime());
  assert.equal(result.state.coins,before+result.totalCoins);
  assert.ok(result.totalCoins>=0&&result.totalCoins<=25);
  assert.equal(result.state.stars,state.stars);
});
