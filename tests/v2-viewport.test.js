import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');

test('mobile V2 uses a visible-viewport single-screen contract',async()=>{
  const [html,css,runtime]=await Promise.all([read('index.html'),read('src/v2-release.css'),read('src/v2-viewport.js')]);
  assert.match(html,/v2-viewport\.js\?v=/);
  assert.match(html,/data-build="v2-(?:single-screen(?:-purpose)?|game-screen|focused-view-hotfix)-/);
  assert.match(css,/height:var\(--app-height\)!important/);
  assert.match(css,/overflow:hidden!important/);
  assert.match(css,/grid-template-rows:/);
  assert.match(css,/\.board-meta\{display:none!important\}/);
  assert.match(css,/\.bottom-bar\{position:relative!important/);
  assert.match(runtime,/window\.visualViewport/);
  assert.match(runtime,/--app-height/);
  assert.match(runtime,/--board-size/);
  assert.doesNotThrow(()=>new Function(runtime));
});

test('single-screen nav focuses regions instead of scrolling the page',async()=>{
  const runtime=await read('src/v2-viewport.js');
  assert.match(runtime,/stopImmediatePropagation\(\)/);
  assert.match(runtime,/section-focus/);
  assert.equal(runtime.includes('scrollIntoView'),false);
});
