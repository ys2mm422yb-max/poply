import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');

test('live shell has one AAA entry and no legacy V2 layer stack',async()=>{
  const html=await read('index.html');
  assert.match(html,/aaa\.css\?v=/);
  assert.match(html,/aaa-main\.js\?v=/);
  assert.match(html,/data-build="aaa-foundation-/);
  for(const name of ['v2-release.css','v2-layout-polish.css','v2-board-polish.css','v2-tabs.css','v2-focus-fix.css','v2-bootstrap.js','v2-recovery.js','v2-purpose.js','v2-tabs.js','v2-viewport.js','v2-main.js'])assert.equal(html.includes(name),false,name);
});

test('AAA stylesheet entry only composes authored modules',async()=>{
  const css=(await read('src/aaa.css')).trim();
  assert.equal(css,"@import './aaa-shell.css';\n@import './aaa-player.css';\n@import './aaa-board.css';\n@import './aaa-views.css';\n@import './aaa-world.css';\n@import './aaa-service.css';\n@import './aaa-sunset.css';\n@import './aaa-energy.css';\n@import './aaa-collection.css';\n@import './aaa-discovery.css';\n@import './aaa-storage-tray.css';\n@import './aaa-daily.css';\n@import './aaa-place-map.css';\n@import './aaa-mobile.css';\n@import './aaa-motion.css';\n@import './aaa-color-fx.css';\n@import './aaa-integration.css';");
  assert.doesNotMatch(css,/v2-/);
});

test('mobile composition uses the spare viewport as game surface instead of dead space',async()=>{
  const mobile=await read('src/aaa-mobile.css'),view=await read('src/aaa-view.js');
  assert.match(mobile,/\.qa-board \.board-area\{[^}]*background:/);
  assert.match(mobile,/\.service-orders\{grid-template-rows:auto auto minmax\(0,1fr\) auto;align-content:stretch\}/);
  assert.match(mobile,/\.service-card\{[^}]*height:100%/);
  assert.match(view,/boardRule:'Gleiches mergen'/);
  assert.doesNotMatch(view,/Gleiche Items zusammenziehen/);
});
