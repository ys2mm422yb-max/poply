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

test('successful builds switch to Place and resolve named unlock reveals from chapter data',async()=>{
  const [ui,game]=await Promise.all([read('src/aaa-ui.js'),read('src/v2-game.js')]);
  assert.match(ui,/playRestorationReveal=\(upgrade,unlockedPlace=null\)/);
  assert.match(ui,/view='place';menuOpen=false;render\(\);playRestorationReveal\(result\.upgrade,result\.unlockedPlace\)/);
  assert.match(ui,/AUSBAU FERTIG/);
  assert.match(ui,/NEUER PLACE FREIGESCHALTET/);
  assert.match(ui,/PLACE_CHAPTERS\.find\(entry=>entry\.id===unlockedPlace\)/);
  assert.match(ui,/0\$\{chapter\.number\}/);
  assert.match(ui,/chapter\.label/);
  assert.match(game,/label:'Sonnenkai'/);
  assert.match(game,/label:'Dachgarten'/);
  assert.match(ui,/fx-restoration-reveal/);
});

test('AAA motion provides anticipation, delivery, reward, restoration and reduced-motion support',async()=>{
  const [css,entry,sunset]=await Promise.all([read('src/aaa-motion.css'),read('src/aaa.css'),read('src/aaa-sunset.css')]);
  assert.match(entry,/@import '\.\/aaa-motion\.css'/);
  assert.match(css,/merge-target-breathe/);
  assert.match(css,/tier-art-reveal/);
  assert.match(css,/generator-dispense/);
  assert.match(css,/dispensed-item-land/);
  assert.match(css,/delivery-flight/);
  assert.match(css,/reward-arrive/);
  assert.match(css,/restoration-scene-reveal/);
  assert.match(css,/restoration-sweep/);
  assert.match(css,/restoration-badge/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(sunset,/\.world-hero\.fx-restoration-reveal/);
  assert.match(sunset,/place-unlock-reveal/);
  assert.match(sunset,/prefers-reduced-motion:reduce/);
});
