import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, createProgressionOrder } from '../src/v2-game.js';
import { ensureServiceSpecials, progressServiceSpecials, awardServiceSpecialBonus, serviceSpecialTemplate } from '../src/aaa-specials.js';

test('opening keeps the first coffee simple and gives the other guests different Specials',()=>{
  const state=ensureServiceSpecials(createInitialState()).state;
  assert.equal(state.currentOrders[0].title,'Erster Kaffee');assert.equal(state.currentOrders[0].special,undefined);
  assert.equal(state.currentOrders[1].special.type,'merge-series');assert.equal(state.currentOrders[1].special.target,2);assert.equal(state.currentOrders[1].special.rewardCoins,40);
  assert.equal(state.currentOrders[2].special.type,'fresh');assert.equal(state.currentOrders[2].special.family,'sweet');assert.equal(state.currentOrders[2].special.rewardCoins,40);
});

test('later deterministic order sequences rotate through Flow, Series and Fresh play goals',()=>{
  const base=createInitialState(),order3=createProgressionOrder(base,3,'coast'),order4=createProgressionOrder(base,4,'coast'),order5=createProgressionOrder(base,5,'coast');
  assert.equal(serviceSpecialTemplate(order3).type,'flow-tip');
  assert.equal(serviceSpecialTemplate(order4).type,'merge-series');
  assert.equal(serviceSpecialTemplate(order5).type,'fresh');
});

test('Merge-Serie progresses only on real merge events and completes at target',()=>{
  let state=ensureServiceSpecials(createInitialState()).state;
  const ignored=progressServiceSpecials(state,{type:'item-created',family:'coffee'});state=ignored.state;
  assert.equal(state.currentOrders[1].special.progress,0);
  const first=progressServiceSpecials(state,{type:'merge'});state=first.state;
  assert.equal(state.currentOrders[1].special.progress,1);assert.equal(first.updates.find(update=>update.orderId==='order-1')?.becameCompleted,false);
  const second=progressServiceSpecials(state,{type:'merge'});state=second.state;
  assert.equal(state.currentOrders[1].special.completed,true);assert.equal(second.updates.find(update=>update.orderId==='order-1')?.becameCompleted,true);
});

test('Frisch serviert only accepts a newly created matching required family',()=>{
  let state=ensureServiceSpecials(createInitialState()).state;
  state=progressServiceSpecials(state,{type:'item-created',family:'coffee'}).state;
  assert.equal(state.currentOrders[2].special.progress,0);
  const completed=progressServiceSpecials(state,{type:'item-created',family:'sweet'});state=completed.state;
  assert.equal(state.currentOrders[2].special.completed,true);assert.equal(completed.updates.some(update=>update.orderId==='order-2'&&update.becameCompleted),true);
});

test('Flow-Tipp requires a Flow boost on the deterministic required family',()=>{
  const base=createInitialState(),order=createProgressionOrder(base,3,'coast');base.currentOrders=[order];
  let state=ensureServiceSpecials(base).state,special=state.currentOrders[0].special;
  assert.equal(special.type,'flow-tip');assert.ok(special.family);
  const wrong=special.family==='coffee'?'bakery':'coffee';state=progressServiceSpecials(state,{type:'flow-boost',family:wrong}).state;
  assert.equal(state.currentOrders[0].special.progress,0);
  state=progressServiceSpecials(state,{type:'flow-boost',family:special.family}).state;
  assert.equal(state.currentOrders[0].special.completed,true);
});

test('Special progress survives safe ensure/reload normalization',()=>{
  let state=ensureServiceSpecials(createInitialState()).state;state=progressServiceSpecials(state,{type:'merge'}).state;
  const reloaded=JSON.parse(JSON.stringify(state)),ensured=ensureServiceSpecials(reloaded).state;
  assert.equal(ensured.currentOrders[1].special.progress,1);assert.equal(ensured.currentOrders[1].special.completed,false);
});

test('Special bonus stays optional and pays Coins only after completion',()=>{
  let state=ensureServiceSpecials(createInitialState()).state,order=state.currentOrders[1],before=state.coins;
  const incomplete=awardServiceSpecialBonus(state,order);assert.equal(incomplete.changed,false);assert.equal(incomplete.state.coins,before);
  state=progressServiceSpecials(state,{type:'merge'}).state;state=progressServiceSpecials(state,{type:'merge'}).state;order=state.currentOrders[1];
  const paid=awardServiceSpecialBonus(state,order);assert.equal(paid.changed,true);assert.equal(paid.bonusCoins,40);assert.equal(paid.state.coins,before+40);assert.equal(paid.state.stars,state.stars);
});
