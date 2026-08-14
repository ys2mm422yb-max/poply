import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('AAA shell loads authored color effects and integration guards last',()=>{
  const css=read('src/aaa.css');
  assert.match(css,/@import '\.\/aaa-motion\.css';\s*@import '\.\/aaa-color-fx\.css';\s*@import '\.\/aaa-integration\.css';/);
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

test('discovery UI exposes family color hook and authored spark burst',()=>{
  const source=read('src/aaa-discovery-ui.js');
  assert.match(source,/discovery-reveal family-\$\{item\.family\}/);
  assert.match(source,/class="discovery-sparks"/);
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

test('color effects release cache key is explicit',()=>{
  const html=read('index.html');
  assert.match(html,/aaa\.css\?v=20260814-colorfx1/);
  assert.match(html,/data-build="aaa-foundation-20260814-colorfx1"/);
});
