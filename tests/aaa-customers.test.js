import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CUSTOMER_ART, customerArtUrl } from '../src/aaa-customers.js';
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

test('active AAA order views no longer import legacy customer webps',async()=>{
  const view=await read('src/aaa-view.js');
  assert.match(view,/aaa-customers\.js/);
  assert.match(view,/customerArtUrl/);
  assert.doesNotMatch(view,/v2-customer-[abc]\.js/);
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
