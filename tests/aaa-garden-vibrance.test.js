import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('Dachgarten authored scene carries city depth, glass reflections and environmental life',()=>{
  const art=read('src/aaa-garden-place.js'),css=read('src/aaa-garden.css');
  for(const hook of ['garden-clouds','garden-skyline-back','garden-skyline-front','garden-edge-plants','garden-glass-shimmer','garden-bed-leaves','garden-lamp'])assert.match(art,new RegExp(hook));
  for(const animation of ['gardenCloudDrift','gardenSkylineHaze','gardenLeafSway','gardenBedBreathe','gardenGlassShimmer','gardenLampWarmth'])assert.match(css,new RegExp(animation));
  assert.match(css,/\.garden-place-svg\{filter:saturate\(1\.09\) contrast\(1\.025\)/);
});

test('Dachgarten environmental motion respects Reduced Motion',()=>{
  const css=read('src/aaa-garden.css');
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.garden-place-svg \.garden-clouds/);
  assert.match(css,/\.garden-place-svg \.garden-glass-shimmer/);
  assert.match(css,/animation:none!important/);
  assert.match(css,/transform:none!important/);
});
