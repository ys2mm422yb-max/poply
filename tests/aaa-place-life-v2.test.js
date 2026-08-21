import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('living Place pass hides the old stiff guests and installs furniture-aware authored poses',async()=>{
  const [source,css]=await Promise.all([read('src/aaa-place-life-v2.js'),read('src/aaa-place-life-v2.css')]);
  assert.match(css,/\.view-place \.cafe-guest,\.place-map-preview\.place-coast \.cafe-guest\{display:none!important\}/);
  assert.match(source,/place-life-guests-v2/);
  assert.match(source,/place-life-guests-v2-front/);
  assert.match(source,/guest-left/);
  assert.match(source,/guest-right/);
  assert.match(source,/guest-sip-arm/);
  assert.match(source,/insertBefore\(back,seating\)/);
  assert.match(source,/insertBefore\(front,seating\.nextSibling\)/);
  assert.match(css,/\.place-life-guest-layer \.guest-arm/);
});

test('living guests keep rendered coast stage but bind identities to existing loyalty visits',async()=>{
  const source=await read('src/aaa-place-life-v2.js');
  assert.match(source,/getState\(\)/);
  assert.match(source,/regularGuestsForPlace\(state,3\)/);
  assert.match(source,/data-regular-guest/);
  assert.match(source,/data-regular-visits/);
  assert.match(source,/scene-upgrade\.seating/);
  assert.match(source,/scene-upgrade\.sign/);
  assert.match(source,/scene-upgrade\.terrace/);
  assert.match(source,/\?6:[\s\S]*\?5:4/);
});

test('completed coast map previews receive the same authored regular guest layer',async()=>{
  const [source,css]=await Promise.all([read('src/aaa-place-life-v2.js'),read('src/aaa-place-life-v2.css')]);
  assert.match(source,/place-map-preview\.place-coast \.place-scene-svg/);
  assert.match(source,/MutationObserver\(refresh\)\.observe\(document\.body\|\|root/);
  assert.match(source,/scenes\.forEach\(svg=>decorateScene\(svg,regulars\)\)/);
  assert.match(source,/regular-guest-nameplate/);
  assert.match(css,/\.regular-guest-nameplate/);
  assert.match(css,/\.place-map-preview\.place-coast \.cafe-guest\{display:none!important\}/);
});

test('Place regular identities have stable visual accents with reduced-motion safety',async()=>{
  const css=await read('src/aaa-place-life-v2.css');
  assert.match(css,/regular-mika/);
  assert.match(css,/regular-nora/);
  assert.match(css,/regular-sam/);
  assert.match(css,/placeGuestBreathe/);
  assert.match(css,/placeGuestSip/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.place-life-guest-layer \*\{animation:none!important\}\}/);
});