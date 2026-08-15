import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url),read=path=>readFile(new URL(path,root),'utf8');

test('Storage remains part of the Board instead of becoming a fifth main tab',async()=>{
  const source=await read('src/aaa-storage-ui.js');
  assert.match(source,/storage-handle/);assert.match(source,/storage-drawer/);assert.doesNotMatch(source,/data-view=["']storage/);
  const collection=await read('src/aaa-collection-view.js');assert.doesNotMatch(collection,/data-view="storage"/);
});

test('Storage Board selector explicitly excludes generators',async()=>{
  const source=await read('src/aaa-storage-ui.js');
  assert.match(source,/item\?\.kind==='item'/);assert.match(source,/data-storage-store/);assert.match(source,/data-storage-restore/);
});

test('Storage UI exposes a permanent Coin upgrade and explains parked order behavior',async()=>{
  const source=await read('src/aaa-storage-ui.js');
  assert.match(source,/data-storage-upgrade/);assert.match(source,/für Aufträge zurück aufs Board/);assert.match(source,/\+2 Plätze/);
});

test('Storage presentation keeps authored warm/cool material differentiation and short-phone sizing',async()=>{
  const css=await read('src/aaa-storage-tray.css');
  assert.match(css,/--storage-gold:#ffd968/);
  assert.match(css,/--storage-aqua:#79e1d7/);
  assert.match(css,/--storage-coral:#ff9d78/);
  assert.match(css,/\.storage-drawer::before/);
  assert.match(css,/\.storage-slot\.occupied/);
  assert.match(css,/\.storage-board-choice:nth-child\(3n\+1\)/);
  assert.match(css,/@media\(max-height:740px\)/);
  assert.match(css,/min-height:158px/);
});
