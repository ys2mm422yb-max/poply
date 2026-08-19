import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('shell loads guidance and installs it after the gameplay-first stack',async()=>{
  const [html,main]=await Promise.all([read('index.html'),read('src/aaa-main.js')]);
  assert.match(html,/aaa-item-guidance\.css\?v=20260818-guidance1/);
  assert.match(html,/aaa-guest-dynamics\.css\?v=20260818-guidance1/);
  assert.match(html,/aaa-place-life-v2\.css\?v=20260818-guidance1/);
  assert.match(html,/aaa-main\.js\?v=20260818-guidance1/);
  assert.match(html,/data-build="aaa-foundation-20260818-guidance1"/);
  assert.match(main,/installItemGuidance\(root,ui\)/);
  assert.match(main,/installGuestDynamicsUI\(root\)/);
  assert.match(main,/installPlaceLifeV2\(root\)/);
});

test('order needs become tappable provenance controls with direct Board generator focus',async()=>{
  const source=await read('src/aaa-item-guidance.js');
  assert.match(source,/data-guide-family/);
  assert.match(source,/Quelle und Merge-Weg anzeigen/);
  assert.match(source,/Generator auf Board zeigen/);
  assert.match(source,/generator-guide-focus/);
  assert.match(source,/\.nav-tab\[data-view="board"\]/);
});

test('generator inspector is separate from normal generator production tap',async()=>{
  const [guidance,drag]=await Promise.all([read('src/aaa-item-guidance.js'),read('src/aaa-drag.js')]);
  assert.match(guidance,/data-generator-info/);
  assert.match(guidance,/GERADE GEBRAUCHT FÜR/);
  assert.match(drag,/closest\('\[data-generator-info\]'\)/);
});

test('guest dynamics decorator is idempotent under its child-list observer',async()=>{
  const source=await read('src/aaa-guest-dynamics-ui.js');
  assert.doesNotMatch(source,/existing\?\.remove\(\)/);
  assert.match(source,/if\(!line\)\{[\s\S]*heading\.append\(line\);return;\}/);
  assert.match(source,/if\(line\.innerHTML!==markup\)line\.innerHTML=markup/);
});

test('guest dynamics are mechanically and visually gated behind the Menüwand',async()=>{
  const [model,ui]=await Promise.all([read('src/aaa-guest-dynamics.js'),read('src/aaa-guest-dynamics-ui.js')]);
  assert.match(model,/isDynamicServiceUnlocked=state=>\(state\?\.placeUpgrades\|\|\[\]\)\.includes\('menu'\)/);
  assert.match(model,/traitCoins=unlocked&&guestTraitQualifies/);
  assert.match(model,/dailyCoins=unlocked&&/);
  assert.match(ui,/if\(!unlocked\)\{heading\.querySelector\('\.guest-dynamic-line'\)\?\.remove\(\);return;\}/);
});
