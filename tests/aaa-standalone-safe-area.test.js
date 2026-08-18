import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');

test('installed iOS HUD budgets both safe areas and keeps header/dock content inside their footprints',async()=>{
  const [html,css]=await Promise.all([read('index.html'),read('src/aaa-standalone-safe-area.css')]);
  assert.match(html,/aaa-standalone-safe-area\.css\?v=/);
  assert.match(html,/viewport-fit=cover/);
  assert.match(html,/apple-mobile-web-app-status-bar-style" content="black-translucent"/);
  assert.match(css,/--poply-safe-top:env\(safe-area-inset-top,0px\)/);
  assert.match(css,/--poply-safe-bottom:env\(safe-area-inset-bottom,0px\)/);
  assert.match(css,/grid-template-rows:calc\(56px \+ var\(--poply-safe-top\)\) minmax\(0,1fr\) calc\(58px \+ var\(--poply-safe-bottom\)\)/);
  assert.match(css,/padding-top:calc\(6px \+ var\(--poply-safe-top\)\)/);
  assert.match(css,/\.main-nav\{[^}]*min-height:calc\(58px \+ var\(--poply-safe-bottom\)\)[^}]*padding-bottom:calc\(4px \+ var\(--poply-safe-bottom\)\)/);
  assert.match(css,/\.brand\{[^}]*flex:0 0 88px[^}]*padding-right:27px/);
  assert.match(css,/\.player-level-badge\{[^}]*left:auto;right:0/);
  assert.match(css,/\.top-actions\{[^}]*min-width:0/);
  assert.match(css,/\.resources\{[^}]*min-width:0/);
});

test('Browser QA explicitly reproduces non-zero iPhone standalone top and bottom safe areas at both phone heights',async()=>{
  const [workflow,qa]=await Promise.all([read('.github/workflows/browser-qa.yml'),read('scripts/standalone-safe-area-qa.mjs')]);
  assert.match(workflow,/Run installed-app safe-area WebKit QA/);
  assert.match(workflow,/node scripts\/standalone-safe-area-qa\.mjs/);
  assert.match(qa,/const SAFE_TOP=47,SAFE_BOTTOM=34/);
  assert.match(qa,/standalone 390x844/);
  assert.match(qa,/standalone 390x720/);
  assert.match(qa,/enters iOS status area/);
  assert.match(qa,/dock row did not budget bottom safe area/);
  assert.match(qa,/brand overlaps top actions/);
  assert.match(qa,/resource pills overlap menu/);
});