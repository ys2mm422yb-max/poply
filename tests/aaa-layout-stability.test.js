import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');

test('layout stability layer is loaded last with explicit release key',async()=>{
  const [html,main]=await Promise.all([read('index.html'),read('src/aaa-main.js')]);
  assert.match(html,/aaa-place-powers\.css\?v=20260815-powers1[^<]*"><link rel="stylesheet" href="\.\/src\/aaa-layout-stability\.css\?v=20260818-layout1/);
  assert.match(html,/aaa-main\.js\?v=20260818-layout1/);
  assert.match(main,/installLayoutStability/);
});

test('mobile shell budgets bottom safe area and keeps the dock in its own row',async()=>{
  const css=await read('src/aaa-layout-stability.css');
  assert.match(css,/--poply-safe-bottom:env\(safe-area-inset-bottom,0px\)/);
  assert.match(css,/grid-template-rows:calc\(56px \+ var\(--poply-safe-top,0px\)\) minmax\(0,1fr\) calc\(var\(--poply-dock-base\) \+ var\(--poply-safe-bottom,0px\)\)!important/);
  assert.match(css,/\.main-nav\{[\s\S]*min-height:calc\(var\(--poply-dock-base\) \+ var\(--poply-safe-bottom,0px\)\)/);
});

test('Place action tray sizes to content and preserves dock clearance',async()=>{
  const css=await read('src/aaa-layout-stability.css');
  assert.match(css,/\.production-place\{[\s\S]*grid-template-rows:minmax\(0,1fr\) auto!important/);
  assert.match(css,/\.production-place \.place-current-goal\{[\s\S]*height:auto!important[\s\S]*min-height:112px!important/);
  assert.match(css,/padding:6px 8px var\(--poply-dock-clearance\)!important/);
});

test('Service-Ruf owns an explicit Orders row and becomes the single selected-card focus layer',async()=>{
  const [css,ui]=await Promise.all([read('src/aaa-layout-stability.css'),read('src/aaa-service-call-ui.js')]);
  assert.match(ui,/classList\.toggle\('has-service-call-strip',hasStrip\)/);
  assert.match(ui,/card\.querySelector\(':scope > \.service-content'\)/);
  assert.match(ui,/content\.after\(panel\)/);
  assert.match(css,/\.service-orders\.has-daily-ribbon\.has-service-call-strip\{\s*grid-template-rows:auto auto auto auto minmax\(0,1fr\) auto!important/);
  assert.match(css,/\.service-card\.has-service-call:before\{display:none!important\}/);
  assert.match(css,/\.service-card\.has-service-call>\.service-call-panel\{[\s\S]*grid-area:panel!important[\s\S]*z-index:2!important/);
  assert.match(css,/\.service-card\.has-service-call \.service-special-panel,[\s\S]*\.service-card\.has-service-call \.service-purpose\{display:none!important\}/);
});

test('Board square is measured from the actual remaining Board area and one pixel side owns both axes',async()=>{
  const [css,layout]=await Promise.all([read('src/aaa-layout-stability.css'),read('src/aaa-layout-stability.js')]);
  assert.match(css,/\.view-board\.has-service-call-strip\{\s*grid-template-rows:auto auto auto minmax\(0,1fr\)!important/);
  assert.match(css,/\.board-frame\{[\s\S]*box-sizing:border-box!important[\s\S]*width:var\(--board-square,320px\)!important[\s\S]*height:var\(--board-square,320px\)!important[\s\S]*max-width:none!important[\s\S]*max-height:none!important[\s\S]*aspect-ratio:1\/1!important/);
  assert.match(layout,/areaBox\.height-titleBox\.height-gap/);
  assert.match(layout,/Math\.floor\(Math\.min\(availableWidth,availableHeight\)\)/);
  assert.match(layout,/--board-square/);
  assert.doesNotMatch(layout,/--app-height/);
});

test('dedicated Browser QA covers Place Orders Board at both mobile heights with installed safe areas',async()=>{
  const [workflow,qa]=await Promise.all([read('.github/workflows/browser-qa.yml'),read('scripts/mobile-layout-stability-qa.mjs')]);
  assert.match(workflow,/Run mobile layout stability WebKit QA/);
  assert.match(workflow,/node scripts\/mobile-layout-stability-qa\.mjs/);
  assert.match(qa,/SAFE_TOP=47,SAFE_BOTTOM=34/);
  assert.match(qa,/Meerterrasse 10\/11/);
  assert.match(qa,/Service-Ruf panel is not a direct card layout row/);
  assert.match(qa,/Board workbench/);
  assert.match(qa,/390x844/);
  assert.match(qa,/390x720/);
});