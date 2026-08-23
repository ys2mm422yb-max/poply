import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GUEST_LIFE_PENDING_KEY, activeOrderGuestIds, guestLifeDestination, guestLifePath, guestLifeWaitingTargets, normalizeGuestLifePending, readGuestLifePending, writeGuestLifePending } from '../src/aaa-guest-life-ui.js';
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
  assert.deepEqual(guestLifeDestination(2),{kind:'counter',x:382,y:322,scale:1,seated:false});
  assert.deepEqual(guestLifeDestination(4,'left'),{kind:'seat-left',x:278,y:358,scale:1,seated:true});
  assert.deepEqual(guestLifeDestination(4,'right'),{kind:'seat-right',x:458,y:360,scale:1,seated:true});
  assert.deepEqual(guestLifeDestination(5,'back'),{kind:'terrace-seat',x:628,y:315,scale:.82,seated:true});
  const path=guestLifePath(guestLifeDestination(4,'right'));
  assert.match(path,/^M742 344 C684 344 628 342 570 338 C512 334 /);
  assert.match(path,/ 458 360$/);
});

test('waiting guests use three stage-aware authored queue positions',()=>{
  assert.deepEqual(guestLifeWaitingTargets(0),[
    {kind:'entrance-wait',x:438,y:338,scale:.9},
    {kind:'entrance-queue',x:526,y:348,scale:.81},
    {kind:'entrance-queue-back',x:614,y:356,scale:.72},
  ]);
  assert.deepEqual(guestLifeWaitingTargets(1),guestLifeWaitingTargets(0));
  assert.deepEqual(guestLifeWaitingTargets(2),[
    {kind:'counter-wait',x:420,y:338,scale:.9},
    {kind:'counter-queue',x:504,y:348,scale:.81},
    {kind:'counter-queue-back',x:590,y:356,scale:.72},
  ]);
  assert.deepEqual(guestLifeWaitingTargets(6),guestLifeWaitingTargets(2));
});

test('active order guests are deterministic, unique and bounded for visible Place waiting',()=>{
  const state={currentOrders:[{sequence:1},{sequence:2},{sequence:1},{sequence:0}]};
  assert.deepEqual(activeOrderGuestIds(state),['nora','sam','mika']);
  assert.deepEqual(activeOrderGuestIds(state,2),['nora','sam']);
  assert.deepEqual(activeOrderGuestIds({currentOrders:[]},2),[]);
  assert.deepEqual(activeOrderGuestIds(null,2),[]);
});

test('guest-life pending arrivals are bounded, identity-safe and reload-readable without touching gameplay save',()=>{
  const values=new Map();
  const storage={
    getItem:key=>values.get(key)??null,
    setItem:(key,value)=>values.set(key,value),
    removeItem:key=>values.delete(key),
  };
  assert.deepEqual(normalizeGuestLifePending(['nora','unknown','mika','nora','sam','mika']),['nora','sam','mika']);
  assert.deepEqual(writeGuestLifePending(['nora','mika','sam','nora'],storage),['mika','sam','nora']);
  assert.equal(values.has('poply-v2-state-1'),false);
  assert.equal(values.has(GUEST_LIFE_PENDING_KEY),true);
  assert.deepEqual(readGuestLifePending(storage),['mika','sam','nora']);
  values.set(GUEST_LIFE_PENDING_KEY,'{bad json');
  assert.deepEqual(readGuestLifePending(storage),[]);
  writeGuestLifePending([],storage);
  assert.equal(values.has(GUEST_LIFE_PENDING_KEY),false);
});

test('visible Place people are role-driven: three active guests, stable entry motion, no anonymous barista, and service state feedback',async()=>{
  const [life,ui,daily,main,css,roleCss,index]=await Promise.all([
    read('src/aaa-guest-life-ui.js'),read('src/aaa-ui.js'),read('src/aaa-daily-ui.js'),read('src/aaa-main.js'),read('src/aaa-place-life-v2.css'),read('src/aaa-guest-life-contract.css'),read('index.html')
  ]);
  assert.match(ui,/poply:guest-served/);
  assert.match(ui,/emitGuestServed\(result,'order'\)/);
  assert.match(daily,/poply:guest-served/);
  assert.match(daily,/source:'daily-bonus'/);
  assert.match(main,/installGuestLife\(root\)/);
  assert.match(index,/aaa-guest-life-contract\.css/);
  assert.match(roleCss,/\.view-place\.place-coast \.cafe-barista\{display:none!important\}/);
  assert.match(roleCss,/\.view-place\.place-coast \.cafe-steam\{display:none!important\}/);
  assert.match(roleCss,/has-guest-life-service \.cafe-steam\{display:block!important\}/);
  assert.match(life,/GUEST_LIFE_PENDING_KEY='poply-guest-life-pending-v1'/);
  assert.match(life,/WAIT_IN_MS=900/);
  assert.match(life,/MAX_PENDING=3,MAX_WAITING=3/);
  assert.match(life,/guestForSequence/);
  assert.match(life,/currentOrders/);
  assert.match(life,/guestLifeWaitingTargets\(stage\)/);
  assert.match(life,/counter-queue-back/);
  assert.match(life,/data-guest-life-waiting-kind/);
  assert.match(life,/animateMotion class="guest-life-wait-in"/);
  assert.doesNotMatch(life,/animateTransform class="guest-life-wait-in"/);
  assert.match(life,/signature=`\$\{stage\}\|\$\{waiting\.join\('\|'\)\}`/);
  assert.match(life,/has-guest-life-service/);
  assert.match(life,/readGuestLifePending\(storage\)/);
  assert.match(life,/writeGuestLifePending\(pending,storage\)/);
  assert.match(life,/root\.dataset\.view!=='place'/);
  assert.match(life,/scene-upgrade\.counter/);
  assert.match(life,/scene-upgrade\.seating/);
  assert.match(life,/foot\/ground baselines/);
  assert.match(life,/guestLifeState='arrived'|dataset\.guestLifeState='arrived'|dataset\.guestLifeState="arrived"/);
  assert.match(life,/matchMedia\?\.\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.doesNotMatch(life,/saveGameState|updatedAt|poply-v2-state-1/);
  assert.match(css,/guestLifeStepA/);
  assert.match(css,/guestLifeWait/);
  assert.match(css,/guestLifeSettle/);
  assert.match(css,/data-guest-life-arrival/);
});