import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('AAA shell keeps map then loads authored color effects and integration guards last',()=>{
  const css=read('src/aaa.css');
  assert.match(css,/@import '\.\/aaa-place-map\.css';[\s\S]*@import '\.\/aaa-motion\.css';\s*@import '\.\/aaa-color-fx\.css';\s*@import '\.\/aaa-integration\.css';/);
});

test('color effects layer gives all item families authored identity and reduced-motion safety',()=>{
  const css=read('src/aaa-color-fx.css');
  for(const family of ['coffee','bakery','sweet','fruit'])assert.match(css,new RegExp(`family-${family}`));
  for(const generator of ['coffee-gen','pantry-gen','sunset-gen'])assert.match(css,new RegExp(`generator-${generator}`));
  assert.match(css,/\.service-orders/);
  assert.match(css,/\.discovery-sparks/);
  assert.match(css,/\.level-up-overlay::before/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('Board atmosphere uses spare phone height without stealing interaction',()=>{
  const css=read('src/aaa-color-fx.css');
  assert.match(css,/\.qa-board \.board-area\{[\s\S]*animation:poply-workbench-ambient/);
  assert.match(css,/\.qa-board \.board-area::after\{[\s\S]*pointer-events:none[\s\S]*poply-workbench-glimmer/);
  assert.match(css,/\.qa-board \.board-title,\.qa-board \.board-frame\{position:relative;z-index:1\}/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{[\s\S]*\.qa-board \.board-area[\s\S]*animation:none!important/);
});

test('discovery UI exposes family color hook and authored spark burst',()=>{
  const source=read('src/aaa-discovery-ui.js');
  assert.match(source,/discovery-reveal family-\$\{item\.family\}/);
  assert.match(source,/class="discovery-sparks"/);
  assert.equal((source.match(/<span><\/span>/g)||[]).length,6);
});

test('Discovery celebration gives all five families distinct one-shot light with reduced-motion safety',()=>{
  const css=read('src/aaa-discovery-celebration.css'),html=read('index.html');
  for(const family of ['coffee','bakery','sweet','fruit','herb'])assert.match(css,new RegExp(`discovery-reveal\\.family-${family}`));
  assert.match(css,/poply-discovery-family-ring/);
  assert.match(css,/poply-discovery-sheen/);
  assert.match(css,/\.discovery-sparks span/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*animation:none!important/);
  assert.match(html,/aaa-discovery-celebration\.css\?v=20260815-discovery2/);
});

test('Level-up celebration differentiates Coin, Energy and capacity reward colors without new gameplay markup',()=>{
  const css=read('src/aaa-level-up-celebration.css'),html=read('index.html'),ui=read('src/aaa-player-ui.js');
  assert.match(css,/linear-gradient\(90deg,#ffd25e[\s\S]*#82e5eb[\s\S]*#a7e98b/);
  assert.match(css,/poply-level-reward-bloom/);
  assert.match(css,/poply-level-reward-sparks/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*animation:none!important/);
  assert.match(html,/aaa-level-up-celebration\.css\?v=20260815-level2/);
  assert.match(ui,/\+\$\{progression\.bonusCoins\} Coins · Energie voll/);
});

test('Daily ribbon participates in Orders grid instead of creating a dead flexible row',()=>{
  const source=read('src/aaa-daily-ui.js'),css=read('src/aaa-integration.css');
  assert.match(source,/classList\.add\('has-daily-ribbon'\)/);
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
