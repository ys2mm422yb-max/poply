import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css=readFileSync(new URL('../src/aaa-integration.css',import.meta.url),'utf8');

test('Board guest strip has three distinct authored intent lanes without changing layout geometry',()=>{
  assert.match(css,/\.qa-board \.board-job:nth-child\(1\)\{[\s\S]*rgba\(255,186,104,\.34\)[\s\S]*#176170/);
  assert.match(css,/\.qa-board \.board-job:nth-child\(2\)\{[\s\S]*rgba\(103,205,244,\.27\)[\s\S]*#175b73/);
  assert.match(css,/\.qa-board \.board-job:nth-child\(3\)\{[\s\S]*rgba\(240,139,190,\.29\)[\s\S]*#62506b/);
});

test('Board guest strip keeps requested items bright and ready state readable',()=>{
  assert.match(css,/\.qa-board \.board-job \.need\{[\s\S]*#fffaf0[\s\S]*#f0dfbd/);
  assert.match(css,/\.qa-board \.board-job\.ready\{[\s\S]*rgba\(112,232,102,\.72\)/);
  assert.match(css,/\.qa-board \.board-job-reward\{filter:drop-shadow/);
});
