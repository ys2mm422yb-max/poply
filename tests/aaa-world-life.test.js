import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_LIFE_CSS, worldLifeMarkup } from '../src/aaa-world-life.js';

test('coast life is present before upgrades and authored seated guests arrive with seating',()=>{
  const base=worldLifeMarkup('coast',0),seating=worldLifeMarkup('coast',4);
  assert.match(base,/coast-gull/);assert.doesNotMatch(base,/coast-guests/);
  assert.match(seating,/coast-guests/);assert.match(seating,/life-chair/);assert.match(seating,/life-shadow/);assert.match(seating,/life-cup/);assert.match(seating,/life-cup-coffee/);assert.match(seating,/life-steam/);
});

test('sunset life gains lounge guests with drinks and music with stage',()=>{
  const base=worldLifeMarkup('sunset',0),lounge=worldLifeMarkup('sunset',3),stage=worldLifeMarkup('sunset',5);
  assert.match(base,/sunset-spark/);assert.doesNotMatch(base,/sunset-guests/);
  assert.match(lounge,/sunset-guests/);assert.match(lounge,/life-chair/);assert.match(lounge,/life-glass/);assert.doesNotMatch(lounge,/sunset-music/);
  assert.match(stage,/sunset-guests/);assert.match(stage,/sunset-music/);assert.match(stage,/sunset-note/);
});

test('world life animates authored environment and respects Reduced Motion',()=>{
  assert.match(WORLD_LIFE_CSS,/pointer-events:none/);
  assert.match(WORLD_LIFE_CSS,/path\[stroke="#8dd8dc"\]/);assert.match(WORLD_LIFE_CSS,/path\[stroke="#f5c492"\]/);assert.match(WORLD_LIFE_CSS,/poply-life-wave/);
  assert.match(WORLD_LIFE_CSS,/poply-lamp-warmth/);assert.match(WORLD_LIFE_CSS,/poply-palm-sway/);assert.match(WORLD_LIFE_CSS,/poply-fire-breathe/);
  assert.match(WORLD_LIFE_CSS,/poply-gull-float/);assert.match(WORLD_LIFE_CSS,/poply-guest-breathe/);assert.match(WORLD_LIFE_CSS,/poply-note-rise/);
  assert.match(WORLD_LIFE_CSS,/@media\(prefers-reduced-motion:reduce\)/);assert.match(WORLD_LIFE_CSS,/animation:none!important/);
});

test('guest styling is scene-integrated instead of hard outlined placeholder figures',()=>{
  assert.match(WORLD_LIFE_CSS,/\.life-shadow/);assert.match(WORLD_LIFE_CSS,/\.life-chair/);assert.match(WORLD_LIFE_CSS,/\.life-guest \.eye/);assert.match(WORLD_LIFE_CSS,/stroke-width:\.8/);
});

test('unknown Places do not get foreign decorative life',()=>{assert.equal(worldLifeMarkup('garden',4),'');assert.equal(worldLifeMarkup('',0),'');});
