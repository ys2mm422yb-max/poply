import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_LIFE_CSS, worldLifeMarkup } from '../src/aaa-world-life.js';

test('coast life is present before upgrades and service details arrive with Café progress',()=>{
  const base=worldLifeMarkup('coast',0),counter=worldLifeMarkup('coast',2),seating=worldLifeMarkup('coast',4);
  assert.match(base,/coast-gull/);assert.doesNotMatch(base,/coast-counter-aroma/);assert.doesNotMatch(base,/coast-table-service/);
  assert.match(counter,/coast-counter-aroma/);assert.match(counter,/life-steam/);assert.doesNotMatch(counter,/coast-table-service/);
  assert.match(seating,/coast-table-service/);assert.equal((seating.match(/coast-table-cup/g)||[]).length,2);assert.match(seating,/life-cup/);assert.match(seating,/life-cup-coffee/);assert.match(seating,/life-steam/);
});

test('sunset life gains lounge drinks and music with stage without placeholder people',()=>{
  const base=worldLifeMarkup('sunset',0),lounge=worldLifeMarkup('sunset',3),stage=worldLifeMarkup('sunset',5);
  assert.match(base,/sunset-spark/);assert.doesNotMatch(base,/sunset-table-service/);
  assert.match(lounge,/sunset-table-service/);assert.equal((lounge.match(/sunset-table-glass/g)||[]).length,2);assert.match(lounge,/life-glass/);assert.doesNotMatch(lounge,/sunset-music/);
  assert.match(stage,/sunset-table-service/);assert.match(stage,/sunset-music/);assert.match(stage,/sunset-note/);
  assert.doesNotMatch(stage,/life-patron|sunset-guest|coast-guest/);
});

test('world life animates authored environment and respects Reduced Motion',()=>{
  assert.match(WORLD_LIFE_CSS,/pointer-events:none/);
  assert.match(WORLD_LIFE_CSS,/path\[stroke="#8dd8dc"\]/);assert.match(WORLD_LIFE_CSS,/path\[stroke="#f5c492"\]/);assert.match(WORLD_LIFE_CSS,/poply-life-wave/);
  assert.match(WORLD_LIFE_CSS,/poply-lamp-warmth/);assert.match(WORLD_LIFE_CSS,/poply-palm-sway/);assert.match(WORLD_LIFE_CSS,/poply-fire-breathe/);
  assert.match(WORLD_LIFE_CSS,/poply-gull-float/);assert.match(WORLD_LIFE_CSS,/poply-steam-rise/);assert.match(WORLD_LIFE_CSS,/poply-glass-shine/);assert.match(WORLD_LIFE_CSS,/poply-note-rise/);
  assert.match(WORLD_LIFE_CSS,/@media\(prefers-reduced-motion:reduce\)/);assert.match(WORLD_LIFE_CSS,/animation:none!important/);
});

test('Place-life overlay avoids fake human cutouts and stays environment-first',()=>{
  const combined=worldLifeMarkup('coast',4)+worldLifeMarkup('sunset',5);
  assert.doesNotMatch(combined,/life-patron|life-chair|coast-guest|sunset-guest/);
  assert.match(combined,/coast-table-cup/);assert.match(combined,/sunset-table-glass/);
});

test('unknown Places do not get foreign decorative life',()=>{assert.equal(worldLifeMarkup('garden',4),'');assert.equal(worldLifeMarkup('',0),'');});
