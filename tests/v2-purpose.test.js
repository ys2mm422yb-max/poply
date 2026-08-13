import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PLACE_UPGRADES, createInitialState, restorationStatus } from '../src/v2-game.js';
const root=new URL('../',import.meta.url);const read=p=>readFile(new URL(p,root),'utf8');
test('restoration exposes a six-step visible goal',()=>{const s=createInitialState();assert.equal(PLACE_UPGRADES.length,6);const status=restorationStatus({...s,stars:2});assert.equal(status.upgrade.id,'lights');assert.equal(status.current,2);assert.equal(status.cost,4);assert.equal(status.missing,2);});
test('purpose layer connects orders, requested items and merge pairs',async()=>{const [html,purpose,board]=await Promise.all([read('index.html'),read('src/v2-purpose.js'),read('src/v2-board-polish.css')]);assert.match(html,/v2-purpose\.js\?v=/);assert.match(purpose,/orders-purpose/);assert.match(purpose,/merge-ready/);assert.match(purpose,/order-needed/);assert.match(board,/\.merge-cell\.merge-ready/);assert.match(board,/\.merge-cell\.order-needed/);assert.match(board,/\.need-pin/);});
