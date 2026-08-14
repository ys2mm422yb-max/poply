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
  assert.equal(css,"@import './aaa-shell.css';\n@import './aaa-board.css';\n@import './aaa-views.css';\n@import './aaa-world.css';\n@import './aaa-service.css';\n@import './aaa-sunset.css';\n@import './aaa-mobile.css';\n@import './aaa-motion.css';");
  assert.doesNotMatch(css,/v2-/);
});
