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
