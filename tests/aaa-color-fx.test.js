import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('global mobile chrome carries authored resource and destination color identity',()=>{
  const css=read('src/aaa-color-fx.css');
  assert.match(css,/--coin/);assert.match(css,/--star/);assert.match(css,/--energy/);
  assert.match(css,/\.resource\.energy/);assert.match(css,/\.resource\.coin/);assert.match(css,/\.resource\.star/);
  assert.match(css,/\.nav-tab\[data-view="place"\]/);assert.match(css,/\.nav-tab\[data-view="orders"\]/);assert.match(css,/\.nav-tab\[data-view="board"\]/);
});

test('color effects layer gives all item families authored identity and reduced-motion safety',()=>{
  const css=read('src/aaa-color-fx.css');
  for(const family of ['coffee','bakery','sweet','fruit','herb'])assert.match(css,new RegExp(`family-${family}`));
  assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/animation:none!important/);
});

test('Board atmosphere uses spare phone height without stealing interaction',()=>{
  const js=read('src/aaa-board-atmosphere.js');
  assert.match(js,/pointer-events:none/);assert.match(js,/production-board/);assert.match(js,/board-atmosphere/);
});

test('discovery UI exposes family color hook and authored spark burst',()=>{
  const js=read('src/aaa-discovery-ui.js');
  assert.match(js,/family-/);assert.match(js,/discovery-sparks/);
});

test('Discovery celebration gives all five families distinct one-shot light with reduced-motion safety',()=>{
  const css=read('src/aaa-discovery-celebration.css');
  for(const family of ['coffee','bakery','sweet','fruit','herb'])assert.match(css,new RegExp(`discovery-reveal\\.family-${family}`));
  assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/animation:none!important/);
});

test('Level-up celebration differentiates Coin, Energy and capacity reward colors without new gameplay markup',()=>{
  const css=read('src/aaa-level-up-celebration.css');
  assert.match(css,/level-reward-coins/);assert.match(css,/level-reward-energy/);assert.match(css,/level-reward-capacity/);
});

test('Daily ribbon participates in Orders grid instead of creating a dead flexible row',()=>{
  const css=read('src/aaa-integration.css');
  assert.match(css,/\.service-orders\.has-daily-ribbon\{\s*grid-template-rows:auto auto auto minmax\(0,1fr\) auto;/);
});

test('mobile Board title keeps high contrast after the final color layer',()=>{
  const css=read('src/aaa-integration.css');
  assert.match(css,/@media\(max-width:430px\)/);
  assert.match(css,/\.qa-board \.board-title strong\{color:#f4fbf8!important/);
  assert.match(css,/\.qa-board \.board-title small\{color:#9eb9b6!important/);
});

test('combined shell release cache key is explicit',()=>{
  const html=read('index.html');
  assert.match(html,/aaa\.css\?v=20260815-worldlife2/);
  assert.match(html,/aaa-flow\.css\?v=20260815-flow1/);
  assert.match(html,/aaa-specials\.css\?v=20260815-specials1/);
  assert.match(html,/aaa-place-powers\.css\?v=20260815-powers1/);
  assert.match(html,/aaa-place-scene-v2\.css\?v=20260816-scenev2/);
  assert.match(html,/aaa-main\.js\?v=20260816-scenev2/);
  assert.match(html,/data-build="aaa-foundation-20260816-scenev2"/);
});
