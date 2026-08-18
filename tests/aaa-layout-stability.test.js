import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');

test('layout foundation is followed by explicit real-device hierarchy release layers',async()=>{
  const [html,main]=await Promise.all([read('index.html'),read('src/aaa-main.js')]);
  assert.match(html,/aaa-layout-stability\.css\?v=20260818-layout1[^<]*"><link rel="stylesheet" href="\.\/src\/aaa-ui-hierarchy\.css\?v=20260818-hierarchy1[^<]*"><link rel="stylesheet" href="\.\/src\/aaa-ui-hierarchy-active\.css\?v=20260818-hierarchy3/);
  assert.match(html,/aaa-main\.js\?v=20260818-hierarchy3/);
  assert.match(main,/installLayoutStability/);
});

test('mobile shell budgets bottom safe area and keeps the dock in its own row',async()=>{
  const css=await read('src/aaa-layout-stability.css');
  assert.match(css,/--poply-safe-bottom:env\(safe-area-inset-bottom,0px\)/);
  assert.match(css,/grid-template-rows:calc\(56px \+ var\(--poply-safe-top,0px\)\) minmax\(0,1fr\) calc\(var\(--poply-dock-base\) \+ var\(--poply-safe-bottom,0px\)\)!important/);
  assert.match(css,/\.main-nav\{[\s\S]*min-height:calc\(var\(--poply-dock-base\) \+ var\(--poply-safe-bottom,0px\)\)/);
});

test('Place action tray stays content-safe and duplicate scene-next badge is suppressed',async()=>{
  const [layout,hierarchy,purpose]=await Promise.all([read('src/aaa-layout-stability.css'),read('src/aaa-ui-hierarchy.css'),read('src/aaa-purpose-ui.js')]);
  assert.match(layout,/\.production-place\{[\s\S]*grid-template-rows:minmax\(0,1fr\) auto!important/);
  assert.match(layout,/padding:6px 8px var\(--poply-dock-clearance\)!important/);
  assert.match(hierarchy,/\.production-place \.purpose-blueprint-tag\{display:none!important\}/);
  assert.doesNotMatch(purpose,/tag\.innerHTML=`<small>ALS NÄCHSTES/);
});

test('mobile guest choices reserve enough text track for full German order titles',async()=>{
  const css=await read('src/aaa-layout-stability.css');
  assert.match(css,/\.customer-choice\{[\s\S]*grid-template-columns:32px minmax\(0,1fr\)!important[\s\S]*column-gap:3px!important[\s\S]*padding-inline:5px!important/);
  assert.match(css,/\.customer-choice \.choice-avatar img\{width:31px!important;height:31px!important\}/);
});

test('Service-Ruf ready is a direct Orders choice row while active Ruf keeps one compact content-sized card status',async()=>{
  const [hierarchy,activeFix,ui]=await Promise.all([read('src/aaa-ui-hierarchy.css'),read('src/aaa-ui-hierarchy-active.css'),read('src/aaa-service-call-ui.js')]);
  assert.match(ui,/view\.classList\.toggle\('has-service-call-ready',status\.ready\)/);
  assert.match(ui,/view\.classList\.remove\('has-service-call-strip'\)/);
  assert.match(ui,/panel\.className='service-call-choice-panel is-ready'/);
  assert.match(ui,/queue\.after\(panel\)/);
  assert.match(ui,/const shouldShow=status\.active&&status\.orderId===orderId/);
  assert.match(ui,/content\.after\(panel\)/);
  assert.match(hierarchy,/\.service-orders\.has-service-call-ready\.has-daily-ribbon\{\s*grid-template-rows:auto auto auto auto minmax\(0,1fr\) auto!important/);
  assert.match(hierarchy,/\.view-orders>\.service-call-strip\{display:none!important\}/);
  assert.match(hierarchy,/\.service-call-choice-panel\{[\s\S]*display:grid!important/);
  assert.match(activeFix,/\.service-orders\.has-service-call-active\.has-daily-ribbon\{\s*grid-template-rows:auto auto auto auto minmax\(0,1fr\)!important/);
  assert.match(activeFix,/height:auto!important;[\s\S]*align-self:start!important;[\s\S]*grid-template-rows:auto auto 10px auto!important/);
  assert.match(activeFix,/"panel panel"[\s\S]*"\. \."[\s\S]*"deliver deliver"/);
  assert.match(activeFix,/max-height:72px!important/);
});

test('Orders purpose hero becomes contextual after a Ruf commitment',async()=>{
  const purpose=await read('src/aaa-purpose-ui.js');
  assert.match(purpose,/serviceCallStatus\(state\)/);
  assert.match(purpose,/activeOrder\.title} zuerst\./);
  assert.match(purpose,/activeOrder\.title} vorbereiten\./);
  assert.match(purpose,/Service-Ruf ist optional/);
  assert.match(purpose,/call\.ready}:\$\{call\.active}/);
});

test('Board square still has one geometry owner while active Ruf chrome is compressed',async()=>{
  const [css,layout,hierarchy]=await Promise.all([read('src/aaa-layout-stability.css'),read('src/aaa-layout-stability.js'),read('src/aaa-ui-hierarchy.css')]);
  assert.match(css,/\.board-frame\{[\s\S]*width:var\(--board-square,320px\)!important[\s\S]*height:var\(--board-square,320px\)!important[\s\S]*aspect-ratio:1\/1!important/);
  assert.match(layout,/Math\.floor\(Math\.min\(availableWidth,availableHeight\)\)/);
  assert.match(layout,/--board-square/);
  assert.doesNotMatch(layout,/--app-height/);
  assert.match(hierarchy,/\.view-board>\.service-call-strip\{[\s\S]*min-height:48px!important/);
  assert.match(hierarchy,/\.view-board\.has-service-call-strip \.purpose-board-after\{display:none!important\}/);
  assert.match(hierarchy,/\.board-job:not\(\.service-call-active\)\{opacity:\.72!important/);
});

test('dedicated Browser QA reproduces four real-device hierarchy states at both phone heights',async()=>{
  const [workflow,qa]=await Promise.all([read('.github/workflows/browser-qa.yml'),read('scripts/mobile-layout-stability-qa.mjs')]);
  assert.match(workflow,/Run mobile layout stability WebKit QA/);
  assert.match(workflow,/node scripts\/mobile-layout-stability-qa\.mjs/);
  assert.match(qa,/SAFE_TOP=47,SAFE_BOTTOM=34/);
  assert.match(qa,/duplicate next-upgrade scene badge still exists/);
  assert.match(qa,/ready Ruf panel is still nested inside service card/);
  assert.match(qa,/stale choose-order hero survived/);
  assert.match(qa,/meta chrome pushes workbench too small/);
  assert.match(qa,/screenshots:8/);
  assert.match(qa,/390x844/);
  assert.match(qa,/390x720/);
});