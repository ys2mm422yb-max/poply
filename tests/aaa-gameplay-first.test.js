import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');

test('gameplay-first layers stay ordered before the guidance extension',async()=>{
  const [html,main]=await Promise.all([read('index.html'),read('src/aaa-main.js')]);
  assert.match(html,/aaa-ui-hierarchy-active\.css\?v=20260818-hierarchy4[^<]*"><link rel="stylesheet" href="\.\/src\/aaa-gameplay-first\.css\?v=20260818-gameplay1[^<]*"><link rel="stylesheet" href="\.\/src\/aaa-gameplay-first-orders\.css\?v=20260818-gameplay5[^<]*"><link rel="stylesheet" href="\.\/src\/aaa-gameplay-first-polish\.css\?v=20260818-gameplay4[^<]*"><link rel="stylesheet" href="\.\/src\/aaa-item-guidance\.css\?v=20260818-guidance1/);
  assert.match(html,/aaa-place-life-v2\.css\?v=20260818-guidance1[^<]*"><link rel="stylesheet" href="\.\/src\/aaa-iphone-readability\.css\?v=20260819-iphone1/);
  assert.match(html,/data-build="aaa-foundation-20260819-iphone1"/);
  assert.match(html,/aaa-main\.js\?v=20260819-iphone1/);
  assert.match(main,/installGameplayFirst/);
  assert.match(main,/installItemGuidance/);
});

test('Orders missing item becomes an active Board route and Ruf-ready task card cannot stretch',async()=>{
  const [behavior,css,tune,qa]=await Promise.all([read('src/aaa-gameplay-first.js'),read('src/aaa-gameplay-first.css'),read('src/aaa-gameplay-first-orders.css'),read('scripts/gameplay-first-qa.mjs')]);
  assert.match(behavior,/firstMissingRequirement/);
  assert.match(behavior,/button\.disabled=false/);
  assert.match(behavior,/button\.removeAttribute\('data-order'\)/);
  assert.match(behavior,/button\.dataset\.gameplayBoard=order\.id/);
  assert.match(behavior,/Auf dem Board herstellen/);
  assert.match(behavior,/nav-tab\[data-view="board"\]/);
  assert.match(css,/\.service-deliver\.service-missing-action/);
  assert.match(tune,/\.service-orders\.has-service-call-ready \.service-card\{[\s\S]*height:auto!important[\s\S]*grid-template-rows:auto 36px!important/);
  assert.match(tune,/\.service-orders\.has-service-call-ready \.service-card \.service-purpose\{display:none!important\}/);
  assert.match(tune,/grid-template-rows:auto auto 4px auto!important/);
  assert.match(tune,/min-height:36px!important;max-height:42px!important/);
  assert.match(tune,/background:rgba\(24,92,91,\.28\)!important/);
  assert.match(qa,/Orders Ruf-ready \$\{height\}: selected task card stretches into dead dashboard space/);
});

test('Board meta is compressed while measured workbench stays the primary surface',async()=>{
  const css=await read('src/aaa-gameplay-first.css');
  assert.match(css,/\.view-board\.has-service-call-strip \.mission-card\.compact[\s\S]*min-height:30px/);
  assert.match(css,/\.mission-progress,[\s\S]*\.mission-card\.compact button[\s\S]*display:none/);
  assert.match(css,/\.view-board\.has-service-call-strip \.board-job[\s\S]*height:38px/);
  assert.match(css,/\.view-board \.board-title small\{display:none!important\}/);
});

test('Place keeps one compact build ticket, preserves purpose promises, and uses a slim progress rail',async()=>{
  const [behavior,css,polish,purpose]=await Promise.all([read('src/aaa-gameplay-first.js'),read('src/aaa-gameplay-first.css'),read('src/aaa-gameplay-first-polish.css'),read('src/aaa-purpose-ui.js')]);
  assert.match(behavior,/NÄCHSTER AUSBAU/);
  assert.match(css,/\.place-current-goal[\s\S]*min-height:82px/);
  assert.match(css,/\.place-current-goal \.goal-copy>p\{display:none!important\}/);
  assert.match(css,/\.journey-wrap\{height:9px/);
  assert.match(css,/\.journey-head\{display:none!important\}/);
  assert.match(polish,/grid-template-rows:auto 32px!important/);
  assert.match(polish,/\.purpose-place-unlock\{[\s\S]*display:flex!important/);
  assert.match(polish,/\.purpose-place-after\{[\s\S]*display:flex!important/);
  assert.match(polish,/\.purpose-place-after\.is-next-place>strong/);
  assert.match(purpose,/after\.classList\.toggle\('is-next-place',goal\.after\?\.kind==='place'\)/);
});

test('Collection album makes discovery cards primary and meta compact',async()=>{
  const css=await read('src/aaa-gameplay-first.css');
  assert.match(css,/\.collection-hero\{[\s\S]*min-height:50px/);
  assert.match(css,/\.collection-total\{[\s\S]*border-radius:12px/);
  assert.match(css,/\.collection-family\{[\s\S]*min-height:34px/);
  assert.match(css,/\.collection-focus\{[\s\S]*border:0!important[\s\S]*background:transparent!important/);
  assert.match(css,/\.collection-art \.item-art\{width:min\(82px,92%\)!important/);
  assert.match(css,/\.world-discovery\{[\s\S]*min-height:36px/);
});

test('gameplay-first QA covers the four physical-device states at both heights plus Ruf-ready compactness',async()=>{
  const [workflow,qa]=await Promise.all([read('.github/workflows/browser-qa.yml'),read('scripts/gameplay-first-qa.mjs')]);
  assert.match(workflow,/Run gameplay-first real-device WebKit QA/);
  assert.match(qa,/SAFE_TOP=47,SAFE_BOTTOM=34/);
  assert.match(qa,/Orders Ruf-ready compact precondition/);
  assert.match(qa,/collection drinks 3\/6/);
  assert.match(qa,/Orders active Direct missing item/);
  assert.match(qa,/Board active Direct/);
  assert.match(qa,/Place 10\/11/);
  assert.match(qa,/390x844/);
  assert.match(qa,/390x720/);
});
