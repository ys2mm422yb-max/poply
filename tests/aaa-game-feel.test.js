import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('AAA UI wires distinct merge and generator game-feel states',async()=>{
  const [ui,drag]=await Promise.all([read('src/aaa-ui.js'),read('src/aaa-drag.js')]);
  assert.match(ui,/fx-generator-dispense/);
  assert.match(ui,/fx-dispensed-item/);
  assert.match(ui,/sourceIndex:index,index:result\.spawnedIndex/);
  assert.match(drag,/sourceIndex:from/);
  assert.match(ui,/fx-tier-up/);
});

test('AAA motion provides anticipation, tier reveal, generator dispense and reduced-motion support',async()=>{
  const [css,entry]=await Promise.all([read('src/aaa-motion.css'),read('src/aaa.css')]);
  assert.match(entry,/@import '\.\/aaa-motion\.css'/);
  assert.match(css,/merge-target-breathe/);
  assert.match(css,/tier-art-reveal/);
  assert.match(css,/generator-dispense/);
  assert.match(css,/dispensed-item-land/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
});
