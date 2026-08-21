import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createInitialState } from '../src/v2-game.js';
import { ensureServiceCallState, chooseServiceCall, progressServiceCallGenerator, recordServiceCallDelivery } from '../src/aaa-service-call.js';
import { guestForSequence } from '../src/aaa-guests.js';
import { serviceMomentStatus, progressServiceMomentGenerator, applyServiceMomentDelivery } from '../src/aaa-service-moments.js';

const readyState=()=>{const state=createInitialState();state.stats.orders=3;return ensureServiceCallState(state).state;};

test('Kaffee-Tag is deterministic and uses the existing Service-Ruf cadence',()=>{
  const state=readyState(),moment=serviceMomentStatus(state);
  assert.equal(moment.available,true);assert.equal(moment.key,'coffee-day');assert.equal(moment.mode,'stock');
  assert.equal(moment.call.ready,true);assert.equal(state.serviceMoments,undefined);
});

test('Kaffee-Tag makes one coffee generator action count twice only for the matching Nachschub call',()=>{
  let state=readyState(),moment=serviceMomentStatus(state);
  state=chooseServiceCall(state,moment.orderId,'stock').state;
  let normal=progressServiceCallGenerator(state);state=normal.state;assert.equal(normal.status.generatorProgress,1);
  const bonus=progressServiceMomentGenerator(state,'coffee');state=bonus.state;
  assert.equal(bonus.extraProgress,1);assert.equal(bonus.moment.call.generatorProgress,2);
  const other=progressServiceMomentGenerator(state,'bakery');assert.equal(other.changed,false);assert.equal(other.extraProgress,0);
});

test('a visible Stammgast becomes an authored priority without creating a second reward currency',()=>{
  const state=readyState(),order=state.currentOrders[1],guest=guestForSequence(order.sequence);state.guestVisits={mika:0,nora:0,sam:0,[guest.id]:5};
  const moment=serviceMomentStatus(state);
  assert.equal(moment.key,'regular-guest');assert.equal(moment.orderId,order.id);assert.equal(moment.mode,'direct');assert.match(moment.bonusLabel,/Loyalität/);
});

test('Sonnenuntergang-Service combines an existing Special with the Lichter Place Power',()=>{
  const state=readyState();state.placeUpgrades=['lights'];state.serviceCallState.callsCompleted=1;state.serviceCallState.callsExpired=0;
  const order=state.currentOrders.find(entry=>entry.special)||state.currentOrders[1];if(!order.special)order.special={key:'qa',completed:false};
  const moment=serviceMomentStatus(state);
  assert.equal(moment.key,'sunset-service');assert.equal(moment.mode,'direct');assert.match(moment.bonusLabel,/Abendservice/);
});

test('Rush Hour completion charges existing FLOW once and never changes the order reward table',()=>{
  let state=readyState();state.currentOrders=state.currentOrders.map((order,index)=>({...order,requirements:[{family:index?'bakery':'sweet',level:index+1,qty:1}],special:null}));
  let moment=serviceMomentStatus(state);assert.equal(moment.key,'rush-hour');
  const target=state.currentOrders.find(order=>order.id===moment.orderId),rewards=structuredClone(target.rewards);state=chooseServiceCall(state,target.id,'direct').state;
  moment=serviceMomentStatus(state);assert.equal(moment.matched,true);
  const call=recordServiceCallDelivery(state,target.id);state=call.state;
  const applied=applyServiceMomentDelivery(state,moment,call,{});
  assert.equal(applied.completed,true);assert.equal(applied.flowCharged,1);assert.equal(applied.state.mergeFlow.charge,1);assert.deepEqual(target.rewards,rewards);
});

test('Service moments are wired as a thin layer around Service-Ruf',async()=>{
  const [index,main,session,ui,workflow]=await Promise.all([
    readFile(new URL('../index.html',import.meta.url),'utf8'),
    readFile(new URL('../src/aaa-main.js',import.meta.url),'utf8'),
    readFile(new URL('../src/aaa-session.js',import.meta.url),'utf8'),
    readFile(new URL('../src/aaa-service-moments-ui.js',import.meta.url),'utf8'),
    readFile(new URL('../.github/workflows/browser-qa.yml',import.meta.url),'utf8'),
  ]);
  assert.match(index,/aaa-service-moments\.css\?v=20260821-moments1/);
  assert.match(main,/installServiceMomentsUI\(root\)/);
  assert.match(session,/progressServiceMomentGenerator/);assert.match(session,/applyServiceMomentDelivery/);
  assert.match(ui,/data-service-moment-focus/);assert.match(ui,/service-moment-recommended/);
  assert.match(workflow,/Run Service moments WebKit QA/);
});
