import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createInitialState } from '../src/v2-game.js';
import { CUSTOMER_ART, customerArtUrl } from '../src/aaa-customers.js';
import { GUEST_PROFILES, guestForSequence, ensureGuestState, guestLoyalty, recordGuestService, totalGuestVisits } from '../src/aaa-guests.js';
import { ORDER_CHOICE_POLISH_CSS } from '../src/aaa-order-choice-polish.js';

const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');

test('customer art exposes three original vector portraits',()=>{
  assert.equal(CUSTOMER_ART.length,3);
  for(const art of CUSTOMER_ART){
    assert.match(art,/^data:image\/svg\+xml/);
    assert.match(decodeURIComponent(art),/<svg/);
    assert.match(decodeURIComponent(art),/viewBox="0 0 120 120"/);
  }
  assert.equal(customerArtUrl(0),CUSTOMER_ART[0]);
  assert.equal(customerArtUrl(4),CUSTOMER_ART[1]);
});

test('guest identity follows the same deterministic portrait sequence',()=>{
  assert.deepEqual(GUEST_PROFILES.map(guest=>guest.id),['mika','nora','sam']);
  assert.equal(guestForSequence(0).id,'mika');
  assert.equal(guestForSequence(1).id,'nora');
  assert.equal(guestForSequence(2).id,'sam');
  assert.equal(guestForSequence(3).id,'mika');
});

test('guest loyalty persists real visits and rewards milestones exactly once',()=>{
  let state=ensureGuestState(createInitialState()).state;
  assert.deepEqual(state.guestVisits,{mika:0,nora:0,sam:0});
  let result=recordGuestService(state,0);state=result.state;
  assert.equal(result.guest.id,'mika');assert.equal(result.visits,1);assert.equal(result.rewardCoins,25);assert.equal(state.coins,125);
  assert.equal(guestLoyalty(state,'mika').title,'Bekannt');
  for(let i=0;i<3;i+=1)state=recordGuestService(state,0).state;
  assert.equal(guestLoyalty(state,'mika').visits,4);assert.equal(state.coins,125);
  result=recordGuestService(state,0);state=result.state;
  assert.equal(result.visits,5);assert.equal(result.rewardCoins,100);assert.equal(result.milestone.title,'Stammgast');assert.equal(state.coins,225);
  assert.equal(totalGuestVisits(state),5);
  const normalized=ensureGuestState(structuredClone(state));assert.equal(normalized.changed,false);assert.equal(normalized.state.guestVisits.mika,5);
});

test('legacy saves start guest loyalty at zero without retroactive rewards',()=>{
  const legacy=createInitialState();legacy.stats.orders=25;legacy.coins=777;
  const result=ensureGuestState(legacy);
  assert.equal(result.changed,true);assert.deepEqual(result.state.guestVisits,{mika:0,nora:0,sam:0});assert.equal(result.state.coins,777);
});

test('active AAA order views no longer import legacy customer webps',async()=>{
  const view=await read('src/aaa-view.js');
  assert.match(view,/aaa-customers\.js/);
  assert.match(view,/customerArtUrl/);
  assert.doesNotMatch(view,/v2-customer-[abc]\.js/);
});

test('Collection exposes compact guest loyalty without a new main navigation tab',async()=>{
  const [view,css]=await Promise.all([read('src/aaa-collection-view.js'),read('src/aaa-guests.css')]);
  assert.match(view,/collection-guests/);assert.match(view,/STAMMGÄSTE/);assert.match(view,/guestLoyalty/);
  assert.match(css,/\.guest-summary-row/);assert.match(css,/@media\(max-height:740px\)/);
  assert.doesNotMatch(view,/nav-guest|data-view="guests"/);
});

test('Orders service stage uses interaction-safe authored light and distinct reward colors',async()=>{
  const css=await read('src/aaa-service.css');
  assert.match(css,/Orders vibrance pass/);
  assert.match(css,/\.service-card:after\{[^}]*pointer-events:none[^}]*animation:service-stage-breathe/s);
  assert.match(css,/\.service-rewards>span:first-child\{/);
  assert.match(css,/\.service-rewards>span:nth-child\(2\)\{/);
  assert.match(css,/@keyframes service-stage-breathe/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.service-card:after\{animation:none!important;transform:none!important\}\}/);
});

test('compact Orders guest choices preserve two readable title lines without growing the queue',async()=>{
  const main=await read('src/aaa-main.js');
  assert.match(main,/aaa-order-choice-polish\.js/);
  assert.match(ORDER_CHOICE_POLISH_CSS,/\.customer-choice strong/);
  assert.match(ORDER_CHOICE_POLISH_CSS,/white-space:normal/);
  assert.match(ORDER_CHOICE_POLISH_CSS,/-webkit-line-clamp:2/);
  assert.match(ORDER_CHOICE_POLISH_CSS,/\.customer-choice\{height:68px/);
  assert.doesNotMatch(ORDER_CHOICE_POLISH_CSS,/height:\s*(?:7[3-9]|[89]\d|\d{3,})px/);
});

test('Orders counter polish is loaded after the main bundle and stays interaction-safe',async()=>{
  const [html,css]=await Promise.all([read('index.html'),read('src/aaa-orders-counter.css')]);
  const mainIndex=html.indexOf('./src/aaa.css');
  const counterIndex=html.indexOf('./src/aaa-orders-counter.css');
  assert.ok(mainIndex>=0&&counterIndex>mainIndex,'counter polish must load after the main AAA stylesheet');
  assert.match(css,/Orders service-counter anchor/);
  assert.match(css,/\.service-card:after\{[\s\S]*pointer-events:none/);
  assert.match(css,/\.service-deliver:disabled\{/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(css,/pointer-events:\s*(?:auto|all)/);
});
