import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('Café progression payoff layer is loaded after Guest-Life and suppresses ambiguous smoke',async()=>{
  const [index,css]=await Promise.all([
    read('index.html'),
    read('src/aaa-place-progression-payoff.css'),
  ]);
  const guestLife=index.indexOf('aaa-guest-life-contract.css');
  const payoff=index.indexOf('aaa-place-progression-payoff.css');
  assert.ok(guestLife>=0&&payoff>guestLife,'payoff layer must load after Guest-Life contract');
  assert.match(css,/\.cafe-steam\{[\s\S]*opacity:0!important/);
  assert.match(css,/\.cafe-steam path\{[\s\S]*animation:none!important/);
  assert.match(css,/has-guest-life-service \.cafe-cups/);
  assert.match(css,/placeServiceCupPayoff/);
  assert.match(css,/has-guest-life-service \.counter-top/);
});

test('all six Coast restoration beats receive authored visual payoff without changing gameplay data',async()=>{
  const css=await read('src/aaa-place-progression-payoff.css');
  for(const stage of ['0','1','2','3','4','5','6'])assert.match(css,new RegExp(`data-stage=\\"${stage}\\"`));
  for(const upgrade of ['lights','counter','menu','seating','terrace','sign'])assert.match(css,new RegExp(`scene-upgrade\\.${upgrade}`));
  assert.match(css,/cafe-bulb/);
  assert.match(css,/counter-top/);
  assert.match(css,/menu-spark/);
  assert.match(css,/cafe-table/);
  assert.match(css,/terrace-plane/);
  assert.match(css,/cafe-celebration-dots/);
  assert.doesNotMatch(css,/coins|stars|xp|energy|localStorage|currentOrders/i);
});

test('build and service payoff remain reduced-motion safe',async()=>{
  const css=await read('src/aaa-place-progression-payoff.css');
  assert.match(css,/fx-restoration-reveal::after/);
  assert.match(css,/placeBuildWorldPulse/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/animation:none!important/);
});
