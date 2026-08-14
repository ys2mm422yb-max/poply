import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');

test('navigation delegation only matches actual nav tabs',async()=>{
  const source=await read('src/aaa-ui.js');
  assert.match(source,/const\s+tab\s*=\s*target\.closest\('\.nav-tab\[data-view\]'\)/);
  assert.doesNotMatch(source,/const\s+tab\s*=\s*target\.closest\('\[data-view\]'\)/);
});

test('serve action remains reachable after navigation dispatch',async()=>{
  const source=await read('src/aaa-ui.js');
  const navIndex=source.indexOf("closest('.nav-tab[data-view]')");
  const orderIndex=source.indexOf("closest('[data-order]')");
  assert.ok(navIndex>=0,'nav routing missing');
  assert.ok(orderIndex>navIndex,'order dispatch missing after nav routing');
  assert.match(source,/deliverOrder\(orderId\)/);
});

test('Collection is rendered as a real view and family buttons change its focus',async()=>{
  const source=await read('src/aaa-ui.js');
  assert.match(source,/view==='collection'\?collectionView\(state,collectionFamily\)/);
  assert.match(source,/closest\('\[data-collection-family\]'\)/);
  assert.match(source,/collectionFamily=family\.dataset\.collectionFamily/);
  const collection=await read('src/aaa-collection-view.js');
  assert.match(collection,/data-view="collection"/);assert.match(collection,/Sammlung/);
});

test('Place unlock reveal is data-driven for Sonnenkai and Dachgarten',async()=>{
  const source=await read('src/aaa-ui.js');
  assert.match(source,/PLACE_UNLOCKS=\{sunset:\{number:'02',label:'Sonnenkai'\},garden:\{number:'03',label:'Dachgarten'\}\}/);
  assert.match(source,/const unlock=PLACE_UNLOCKS\[unlockedPlace\]/);
  assert.match(source,/Place \$\{unlock\.number\} freigeschaltet: \$\{unlock\.label\}/);
  assert.doesNotMatch(source,/unlockedPlace\?`<span>02<\/span><small>NEUER PLACE FREIGESCHALTET<\/small><strong>Sonnenkai<\/strong>`/);
});

test('Gewächshaus bonus gets explicit player-facing reward feedback',async()=>{
  const source=await read('src/aaa-ui.js');
  assert.match(source,/result\.bonus\?'Erntebonus! Kräuterbund'/);
});
