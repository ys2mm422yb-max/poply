import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createInitialState } from '../src/v2-game.js';
import { migrateState } from '../src/poply-state.js';
const root=new URL('../',import.meta.url);const read=p=>readFile(new URL(p,root),'utf8');
test('canonical shell uses one current stylesheet and one current module',async()=>{const h=await read('index.html');assert.ok(h.includes('./src/poply.css'));assert.ok(h.includes('./src/poply-app.js'));assert.equal(h.includes('./src/v2-main.js'),false);assert.equal((h.match(/<link rel="stylesheet"/g)||[]).length,1);assert.equal((h.match(/<script type="module"/g)||[]).length,1);});
test('current stylesheet owns all three primary views',async()=>{const c=await read('src/poply.css');for(const t of['.view-board','.view-orders','.view-place','.merge-board','.bottom-nav','.place-roadmap','.orders-list','.drop-merge'])assert.ok(c.includes(t));assert.ok(c.includes('--app-height'));});
test('starter migration is deterministic',()=>{const s=createInitialState();s.board[1]={id:'starter-plus-coffee-1',kind:'item',family:'coffee',level:1};const a=migrateState(s),b=migrateState(a);assert.equal(a.board.some(x=>String(x?.id||'').startsWith('starter-plus-')),false);assert.deepEqual(b.board,a.board);assert.equal(a.clientSchema,3);});
