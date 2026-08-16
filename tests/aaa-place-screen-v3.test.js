import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');

test('Place Screen V3 makes the scene primary and removes dashboard chrome',async()=>{
  const css=await read('../src/aaa-place-screen-v3.css');
  assert.match(css,/grid-template-rows:minmax\(0,58fr\) minmax\(0,42fr\)/);
  assert.match(css,/\.production-place \.world-progress\{display:none!important\}/);
  assert.match(css,/\.production-place \.place-progress-dial\{display:none!important\}/);
  assert.match(css,/grid-template-rows:minmax\(0,1fr\) 72px/);
  assert.match(css,/\.production-place \.journey-step>span/);
  assert.match(css,/@media\(max-height:760px\)/);
});

test('Place Screen V3 explains blocked builds and routes to orders',async()=>{
  const behavior=await read('../src/aaa-place-screen-v3.js');
  assert.match(behavior,/purposeGoal\(getState\(\)\)/);
  assert.match(behavior,/Noch \$\{goal\.missing\}/);
  assert.match(behavior,/Aufträge bringen Ausbau-Sterne/);
  assert.match(behavior,/data-place-v3-orders/);
  assert.match(behavior,/Baubereit/);
  assert.match(behavior,/aria-describedby/);
});

test('Place map launcher is a scene utility, not a command-panel row',async()=>{
  const map=await read('../src/aaa-place-map.js');
  assert.match(map,/const hero=root\.querySelector\('\.world-hero'\)/);
  assert.match(map,/hero\.append\(button\)/);
  assert.match(map,/Places Karte öffnen/);
  assert.doesNotMatch(map,/const command=root\.querySelector\('\.place-command'\)/);
});

test('Place Screen V3 stylesheet and build marker are loaded',async()=>{
  const index=await read('../index.html');
  assert.match(index,/aaa-place-screen-v3\.css\?v=20260816-placev3/);
  assert.match(index,/data-build="aaa-foundation-20260816-placev3"/);
});