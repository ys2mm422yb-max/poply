import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');

test('bottom navigation remains one safe-area dock with authored destination pedestals',async()=>{
  const css=await read('src/aaa-shell.css');
  assert.match(css,/grid-template-rows:56px minmax\(0,1fr\) 58px/);
  assert.match(css,/\.main-nav\{position:relative;isolation:isolate;/);
  assert.match(css,/env\(safe-area-inset-bottom\)/);
  assert.match(css,/\.nav-tab b\{width:29px;height:29px;display:grid;place-items:center/);
  assert.match(css,/\.nav-tab\.active\{background:transparent!important;color:#fff;box-shadow:none!important/);
  assert.match(css,/\.nav-tab\.active b\{background:radial-gradient/);
  assert.match(css,/\.nav-tab:nth-child\(1\)\{--dock-rgb:/);
  assert.match(css,/\.nav-tab:nth-child\(4\)\{--dock-rgb:/);
});

test('game dock preserves reduced-motion and touch feedback without animation dependency',async()=>{
  const css=await read('src/aaa-shell.css');
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\*,\*:before,\*:after\{animation:none!important;transition:none!important\}\}/);
  assert.match(css,/\.nav-tab:active b\{transform:scale\(\.94\)\}/);
  assert.doesNotMatch(css,/\.main-nav\{position:relative;isolation:isolate;[^}]*height:/);
});
