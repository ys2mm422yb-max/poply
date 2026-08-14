import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CUSTOMER_ART, customerArtUrl } from '../src/aaa-customers.js';

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
