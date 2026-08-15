import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_LIFE_CSS, worldLifeMarkup } from '../src/aaa-world-life.js';

test('coast life is present before upgrades and guests arrive with seating',()=>{
  const base=worldLifeMarkup('coast',0),seating=worldLifeMarkup('coast',4);
  assert.match(base,/coast-gull/);assert.match(base,/coast-wave/);assert.doesNotMatch(base,/coast-guests/);
  assert.match(seating,/coast-guests/);assert.match(seating,/life-cup/);assert.match(seating,/life-steam/);
});

test('sunset life gains guests with lounge and music with stage',()=>{
  const base=worldLifeMarkup('sunset',0),lounge=worldLifeMarkup('sunset',3),stage=worldLifeMarkup('sunset',5);
  assert.match(base,/sunset-wave/);assert.match(base,/sunset-spark/);assert.doesNotMatch(base,/sunset-guests/);
  assert.match(lounge,/sunset-guests/);assert.doesNotMatch(lounge,/sunset-music/);
  assert.match(stage,/sunset-guests/);assert.match(stage,/sunset-music/);assert.match(stage,/sunset-note/);
});

test('world life is decorative, animated and respects Reduced Motion',()=>{
  assert.match(WORLD_LIFE_CSS,/pointer-events:none/);
  assert.match(WORLD_LIFE_CSS,/poply-life-wave/);
  assert.match(WORLD_LIFE_CSS,/poply-gull-float/);
  assert.match(WORLD_LIFE_CSS,/poply-guest-breathe/);
  assert.match(WORLD_LIFE_CSS,/poply-note-rise/);
  assert.match(WORLD_LIFE_CSS,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(WORLD_LIFE_CSS,/animation:none!important/);
});

test('unknown Places do not get foreign decorative life',()=>{assert.equal(worldLifeMarkup('garden',4),'');assert.equal(worldLifeMarkup('',0),'');});
