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

test('AAA UI turns fulfilled jobs into delivery and reward travel feedback',async()=>{
  const ui=await read('src/aaa-ui.js');
  assert.match(ui,/playDelivery\(card\)/);
  assert.match(ui,/querySelectorAll\('\.need \.item-art'\)/);
  assert.match(ui,/playRewards\(result\.rewards\)/);
  assert.match(ui,/\.resource\.coin/);
  assert.match(ui,/\.mission-card/);
});

test('successful builds switch to Place and support named Place unlock reveals',async()=>{
  const ui=await read('src/aaa-ui.js');
  assert.match(ui,/playRestorationReveal=\(upgrade,unlockedPlace=null\)/);
  assert.match(ui,/view='place';menuOpen=false;render\(\);playRestorationReveal\(result\.upgrade,result\.unlockedPlace\)/);
  assert.match(ui,/AUSBAU FERTIG/);
  assert.match(ui,/NEUER PLACE FREIGESCHALTET/);
  assert.match(ui,/Sonnenkai/);
  assert.match(ui,/fx-restoration-reveal/);
});

test('AAA motion provides colorful anticipation, delivery, reward, restoration and reduced-motion support',async()=>{
  const [css,entry,sunset,color,discovery]=await Promise.all([read('src/aaa-motion.css'),read('src/aaa.css'),read('src/aaa-sunset.css'),read('src/aaa-color.css'),read('src/aaa-discovery.css')]);
  assert.match(entry,/@import '\.\/aaa-color\.css'/);
  assert.match(entry,/@import '\.\/aaa-motion\.css'/);
  assert.match(css,/merge-target-breathe/);
  assert.match(css,/tier-art-reveal/);
  assert.match(css,/generator-dispense/);
  assert.match(css,/generator-pulse/);
  assert.match(css,/dispensed-item-land/);
  assert.match(css,/delivery-flight/);
  assert.match(css,/reward-arrive/);
  assert.match(css,/\.board-cell\.family-coffee\{--fx-accent:/);
  assert.match(css,/\.board-cell\.family-sweet\{--fx-accent:/);
  assert.match(css,/\.place-coast \.world-hero\.fx-restoration-reveal/);
  assert.match(css,/restoration-scene-reveal/);
  assert.match(css,/restoration-sweep/);
  assert.match(css,/restoration-badge/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(sunset,/\.world-hero\.fx-restoration-reveal/);
  assert.match(sunset,/place-unlock-reveal/);
  assert.match(sunset,/prefers-reduced-motion:reduce/);
  for(const family of ['coffee','bakery','sweet','fruit'])assert.match(color,new RegExp(`family-${family}`));
  for(const generator of ['coffee-gen','pantry-gen','sunset-gen'])assert.match(color,new RegExp(`generator-${generator}`));
  assert.match(discovery,/discovery-rays/);
  assert.match(discovery,/discovery-sparks/);
  assert.match(discovery,/:has\(\.art-fruit-1\)/);
  assert.match(discovery,/prefers-reduced-motion:reduce/);
});
