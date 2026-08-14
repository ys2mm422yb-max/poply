import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('AAA shell loads authored color and effects layer last',()=>{
  const css=read('src/aaa.css');
  assert.match(css,/@import '\.\/aaa-motion\.css';\s*@import '\.\/aaa-color-fx\.css';/);
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

test('color effects release cache key is explicit',()=>{
  const html=read('index.html');
  assert.match(html,/aaa\.css\?v=20260814-colorfx1/);
  assert.match(html,/data-build="aaa-foundation-20260814-colorfx1"/);
});
