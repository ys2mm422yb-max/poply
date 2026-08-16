import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createInitialState } from '../src/v2-game.js';
import { SERVICE_CALL_INTERVAL, SERVICE_CALL_STOCK_TARGET, ensureServiceCallState, serviceCallStatus, serviceCallReward, chooseServiceCall, progressServiceCallGenerator, recordServiceCallDelivery } from '../src/aaa-service-call.js';

const readyState=()=>{const state=createInitialState();state.stats.orders=3;return ensureServiceCallState(state).state;};

test('Service-Ruf becomes ready deterministically after three delivered orders',()=>{
  const fresh=ensureServiceCallState(createInitialState()).state;
  assert.equal(serviceCallStatus(fresh).ready,false);assert.equal(serviceCallStatus(fresh).untilReady,3);
  fresh.stats.orders=3;
  const status=serviceCallStatus(fresh);assert.equal(status.ready,true);assert.equal(status.nextAt,3);
});

test('Direkt commits one waiting guest and pays only when that guest is next',()=>{
  let state=readyState();const target=state.currentOrders[0],before=state.coins,reward=serviceCallReward(target,'direct');
  const chosen=chooseServiceCall(state,target.id,'direct');state=chosen.state;
  assert.equal(chosen.changed,true);assert.equal(chosen.status.active,true);assert.equal(chosen.status.orderId,target.id);
  const delivered=recordServiceCallDelivery(state,target.id);state=delivered.state;
  assert.equal(delivered.completed,true);assert.equal(delivered.expired,false);assert.equal(delivered.bonusCoins,reward);assert.equal(state.coins,before+reward);
  assert.equal(state.serviceCallState.nextAt,3+1+SERVICE_CALL_INTERVAL);
});

test('serving another guest expires only the optional call bonus',()=>{
  let state=readyState();const target=state.currentOrders[0],other=state.currentOrders[1],before=state.coins;
  state=chooseServiceCall(state,target.id,'direct').state;
  const delivered=recordServiceCallDelivery(state,other.id);
  assert.equal(delivered.completed,false);assert.equal(delivered.expired,true);assert.equal(delivered.reason,'other-order');assert.equal(delivered.bonusCoins,0);assert.equal(delivered.state.coins,before);
  assert.equal(delivered.state.serviceCallState.callsExpired,1);
});

test('Nachschub needs exactly two real generator actions before the chosen next delivery',()=>{
  let state=readyState();const target=state.currentOrders[1],reward=serviceCallReward(target,'stock');
  state=chooseServiceCall(state,target.id,'stock').state;
  let progress=progressServiceCallGenerator(state);state=progress.state;
  assert.equal(progress.gained,1);assert.equal(progress.status.generatorProgress,1);assert.equal(progress.becameReady,false);
  progress=progressServiceCallGenerator(state);state=progress.state;
  assert.equal(progress.status.generatorProgress,SERVICE_CALL_STOCK_TARGET);assert.equal(progress.becameReady,true);
  const extra=progressServiceCallGenerator(state);assert.equal(extra.gained,0);
  const delivered=recordServiceCallDelivery(state,target.id);
  assert.equal(delivered.completed,true);assert.equal(delivered.bonusCoins,reward);
});

test('Nachschub delivery before its generator target expires harmlessly',()=>{
  let state=readyState();const target=state.currentOrders[2],before=state.coins;
  state=chooseServiceCall(state,target.id,'stock').state;state=progressServiceCallGenerator(state).state;
  const delivered=recordServiceCallDelivery(state,target.id);
  assert.equal(delivered.completed,false);assert.equal(delivered.expired,true);assert.equal(delivered.reason,'stock-incomplete');assert.equal(delivered.state.coins,before);
});

test('existing saves normalize safely and a missing focused order reopens a due call',()=>{
  const legacy=createInitialState();legacy.stats.orders=12;
  let ensured=ensureServiceCallState(JSON.parse(JSON.stringify(legacy)));
  assert.equal(ensured.changed,true);assert.equal(ensured.status.ready,true);assert.equal(ensured.status.nextAt,12);
  const target=ensured.state.currentOrders[0];let state=chooseServiceCall(ensured.state,target.id,'direct').state;
  state.currentOrders=state.currentOrders.filter(order=>order.id!==target.id);
  ensured=ensureServiceCallState(state);
  assert.equal(ensured.status.active,false);assert.equal(ensured.status.ready,true);assert.equal(ensured.state.serviceCallState.orderId,null);
});

test('Service-Ruf UI is wired into the shell and mutation decoration stays idempotent',async()=>{
  const [index,main,ui,workflow]=await Promise.all([
    readFile(new URL('../index.html',import.meta.url),'utf8'),
    readFile(new URL('../src/aaa-main.js',import.meta.url),'utf8'),
    readFile(new URL('../src/aaa-service-call-ui.js',import.meta.url),'utf8'),
    readFile(new URL('../.github/workflows/browser-qa.yml',import.meta.url),'utf8'),
  ]);
  assert.match(index,/aaa-service-call\.css\?v=20260816-servicecall1/);
  assert.match(main,/installServiceCallUI\(root,ui\)/);
  assert.match(ui,/node\.textContent!==text/);
  assert.match(workflow,/Run Service-Ruf WebKit QA/);
  assert.match(workflow,/node scripts\/service-call-qa\.mjs/);
});
