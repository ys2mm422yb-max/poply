import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('living Place pass hides the old stiff guests and installs furniture-aware authored poses',async()=>{
  const [source,css]=await Promise.all([read('src/aaa-place-life-v2.js'),read('src/aaa-place-life-v2.css')]);
  assert.match(css,/\.view-place \.cafe-guest\{display:none!important\}/);
  assert.match(source,/place-life-guests-v2/);
  assert.match(source,/place-life-guests-v2-front/);
  assert.match(source,/guest-left/);
  assert.match(source,/guest-right/);
  assert.match(source,/guest-sip-arm/);
  assert.match(source,/insertBefore\(back,seating\)/);
  assert.match(source,/insertBefore\(front,seating\.nextSibling\)/);
  assert.match(css,/\.place-life-guest-layer \.guest-arm/);
});

test('living guests derive coast stage from rendered scene so completed revisits keep people',async()=>{
  const source=await read('src/aaa-place-life-v2.js');
  assert.doesNotMatch(source,/currentChapterProgress|getState/);
  assert.match(source,/scene-upgrade\.seating/);
  assert.match(source,/scene-upgrade\.sign/);
  assert.match(source,/scene-upgrade\.terrace/);
  assert.match(source,/\?6:[\s\S]*\?5:4/);
});

test('completed coast map previews receive the same authored living guests',async()=>{
  const source=await read('src/aaa-place-life-v2.js');
  assert.match(source,/place-map-preview\.place-coast \.place-scene-svg/);
  assert.match(source,/MutationObserver\(refresh\)\.observe\(document\.body\|\|root/);
  assert.match(source,/scenes\.forEach\(decorateScene\)/);
});

test('Place guests use subtle idle life with reduced-motion safety',async()=>{
  const css=await read('src/aaa-place-life-v2.css');
  assert.match(css,/placeGuestBreathe/);
  assert.match(css,/placeGuestSip/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.place-life-guest-layer \*\{animation:none!important\}\}/);
});
