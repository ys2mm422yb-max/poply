import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createInitialState } from '../src/v2-game.js';
import {
  GUEST_PROFILES,
  guestForSequence,
  ensureGuestState,
  guestLoyalty,
  regularGuestsForPlace,
  recordGuestService,
  totalGuestVisits,
} from '../src/aaa-guests.js';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');

test('guest identity follows the existing three-portrait order sequence with stable personalities',()=>{
  assert.deepEqual(GUEST_PROFILES.map(guest=>guest.id),['mika','nora','sam']);
  assert.deepEqual(GUEST_PROFILES.map(guest=>guest.personality),['Kombi-Mensch','Kaffee-Fan','Entdeckerin']);
  assert.equal(guestForSequence(0).id,'mika');
  assert.equal(guestForSequence(1).id,'nora');
  assert.equal(guestForSequence(2).id,'sam');
  assert.equal(guestForSequence(3).id,'mika');
  assert.equal(guestForSequence(901).id,'nora');
});

test('legacy saves get zero guest history and no retroactive reward',()=>{
  const legacy=createInitialState();
  legacy.stats.orders=99;
  legacy.coins=777;
  const result=ensureGuestState(legacy);
  assert.equal(result.changed,true);
  assert.deepEqual(result.state.guestVisits,{mika:0,nora:0,sam:0});
  assert.equal(result.state.coins,777);
  assert.equal(totalGuestVisits(result.state),0);
  assert.equal(ensureGuestState(result.state).changed,false);
});

test('malformed guest counters migrate to safe non-negative integers while preserving numeric progress',()=>{
  const source={...createInitialState(),guestVisits:{mika:-4,nora:'3',sam:2,ghost:9}};
  const result=ensureGuestState(source);
  assert.deepEqual(result.state.guestVisits,{mika:0,nora:3,sam:2});
  assert.equal(typeof result.state.guestVisits.nora,'number');
});

test('Mika loyalty pays exact automatic one-time rewards at 1, 5 and 12 visits',()=>{
  let state=ensureGuestState(createInitialState()).state;
  const payouts=[];
  for(let visit=1;visit<=13;visit+=1){
    const result=recordGuestService(state,0);
    state=result.state;
    if(result.rewardCoins)payouts.push([visit,result.rewardCoins,result.milestone.title]);
  }
  assert.deepEqual(payouts,[[1,25,'Bekannt'],[5,100,'Stammgast'],[12,250,'Lieblingsgast']]);
  assert.equal(state.coins,475);
  assert.equal(state.guestVisits.mika,13);
  assert.equal(state.guestVisits.nora,0);
  assert.equal(guestLoyalty(state,'mika').title,'Lieblingsgast');
  assert.equal(guestLoyalty(state,'mika').complete,true);
});

test('guest progress is independent for all three recurring guests',()=>{
  let state=ensureGuestState(createInitialState()).state;
  state=recordGuestService(state,0).state;
  state=recordGuestService(state,1).state;
  state=recordGuestService(state,1).state;
  state=recordGuestService(state,2).state;
  state=recordGuestService(state,2).state;
  state=recordGuestService(state,2).state;
  assert.deepEqual(state.guestVisits,{mika:1,nora:2,sam:3});
  assert.equal(totalGuestVisits(state),6);
  assert.equal(guestLoyalty(state,'mika').title,'Bekannt');
  assert.equal(guestLoyalty(state,'nora').visitsUntilNext,3);
  assert.equal(guestLoyalty(state,'sam').visitsUntilNext,2);
});

test('Place regulars derive deterministically from existing visits without new persistence or rewards',()=>{
  const state={...createInitialState(),guestVisits:{mika:5,nora:2,sam:1},coins:333};
  const regulars=regularGuestsForPlace(state,3);
  assert.deepEqual(regulars.map(entry=>[entry.guest.id,entry.loyalty.visits,entry.loyalty.title]),[
    ['mika',5,'Stammgast'],
    ['nora',2,'Bekannt'],
    ['sam',1,'Bekannt'],
  ]);
  assert.equal(state.coins,333);
  assert.deepEqual(state.guestVisits,{mika:5,nora:2,sam:1});
  assert.deepEqual(regularGuestsForPlace({...state,guestVisits:{mika:0,nora:0,sam:0}},3),[]);
  assert.deepEqual(regularGuestsForPlace({...state,guestVisits:{mika:2,nora:2,sam:2}},2).map(entry=>entry.guest.id),['mika','nora']);
});

test('live service integration records normal and Daily Bonus guests without touching PWA code',async()=>{
  const [session,main,guestUi]=await Promise.all([
    read('src/aaa-session.js'),
    read('src/aaa-main.js'),
    read('src/aaa-guest-ui.js'),
  ]);
  assert.match(session,/recordGuestService\(result\.state,order\.sequence\)/);
  assert.match(session,/recordGuestService\(result\.state,result\.order\.sequence\)/);
  assert.match(main,/installGuestUI\(root,ui\)/);
  assert.match(guestUi,/customer-choice\[data-select-order\]/);
  assert.match(guestUi,/service-card\[data-service-order\]/);
  assert.match(guestUi,/guest-regular-chip/);
  assert.doesNotMatch(guestUi,/data-view=["']guests|nav-guest|Collection/);
});