import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { guestLifeDestination, guestLifePath } from '../src/aaa-guest-life-ui.js';
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

test('served guest route reacts deterministically to built Cafe furniture',()=>{
  assert.deepEqual(guestLifeDestination(0),{kind:'entrance',x:405,y:306,scale:1,seated:false});
  assert.deepEqual(guestLifeDestination(2),{kind:'counter',x:384,y:292,scale:1,seated:false});
  assert.deepEqual(guestLifeDestination(4,'left'),{kind:'seat-left',x:278,y:282,scale:1,seated:true});
  assert.deepEqual(guestLifeDestination(4,'right'),{kind:'seat-right',x:458,y:288,scale:1,seated:true});
  assert.deepEqual(guestLifeDestination(5,'back'),{kind:'terrace-seat',x:628,y:282,scale:.82,seated:true});
  assert.match(guestLifePath(guestLifeDestination(4,'right')),/^M742 338 C684 334 628 327 570 315 C512 303 /);
});

test('real services feed transient guest-life choreography without new persistence',async()=>{
  const [life,ui,daily,main,css]=await Promise.all([read('src/aaa-guest-life-ui.js'),read('src/aaa-ui.js'),read('src/aaa-daily-ui.js'),read('src/aaa-main.js'),read('src/aaa-place-life-v2.css')]);
  assert.match(ui,/poply:guest-served/);
  assert.match(ui,/emitGuestServed\(result,'order'\)/);
  assert.match(daily,/poply:guest-served/);
  assert.match(daily,/source:'daily-bonus'/);
  assert.match(main,/installGuestLife\(root\)/);
  assert.match(life,/MAX_PENDING=3/);
  assert.match(life,/root\.dataset\.view!=='place'/);
  assert.match(life,/scene-upgrade\.counter/);
  assert.match(life,/scene-upgrade\.seating/);
  assert.match(life,/matchMedia\?\.\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.doesNotMatch(life,/localStorage|saveGameState|updatedAt/);
  assert.match(css,/guestLifeStepA/);
  assert.match(css,/guestLifeSettle/);
  assert.match(css,/data-guest-life-arrival/);
});