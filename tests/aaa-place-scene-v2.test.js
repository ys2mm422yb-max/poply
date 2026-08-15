import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { placeSceneMarkup } from '../src/aaa-place-art.js';

const upgrades=['lights','counter','menu','seating','terrace','sign'];

test('coast Place Scene V2 exposes authored depth planes and volumetric shell',()=>{
  const scene=placeSceneMarkup(0);
  assert.match(scene,/place-scene-v2/);
  assert.match(scene,/scene-depth-back/);
  assert.match(scene,/scene-depth-ground/);
  assert.match(scene,/scene-depth-mid cafe-shell/);
  assert.match(scene,/cafe-side-face/);
  assert.match(scene,/cafe-front-face/);
  assert.match(scene,/cafe-roof-side/);
  assert.match(scene,/cafe-plinth-top/);
  assert.match(scene,/scene-ground-plane/);
});

test('all six Café stages retain exact authored upgrade groups and grow the occupied world',()=>{
  for(let stage=0;stage<=6;stage++){
    const scene=placeSceneMarkup(stage);
    assert.match(scene,new RegExp(`Ausbau ${stage} von 6`));
    for(let i=0;i<upgrades.length;i++){
      const pattern=new RegExp(`scene-upgrade ${upgrades[i]}`);
      if(i<stage)assert.match(scene,pattern,`stage ${stage} missing ${upgrades[i]}`);
      else assert.doesNotMatch(scene,pattern,`stage ${stage} rendered future ${upgrades[i]}`);
    }
  }
  const terrace=placeSceneMarkup(5);
  assert.match(terrace,/terrace-plane/);
  assert.match(terrace,/terrace-perspective-lines/);
  assert.match(terrace,/terrace-service-cart/);
  assert.match(placeSceneMarkup(4),/cafe-guest guest-a/);
  assert.match(placeSceneMarkup(4),/cafe-guest guest-b/);
});

test('Scene V2 presentation has depth-aware build staging and reduced-motion protection',async()=>{
  const css=await readFile(new URL('../src/aaa-place-scene-v2.css',import.meta.url),'utf8');
  assert.match(css,/perspective:900px/);
  assert.match(css,/scene-camera-push/);
  assert.match(css,/scene-build-rise/);
  assert.match(css,/data-stage="5".*scene-upgrade\.terrace/s);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/animation:none!important/);
});
