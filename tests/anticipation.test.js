import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { anticipationForLength } from '../src/anticipation.js';

const root = new URL('../', import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('chain anticipation escalates at valid, Blast and Prism thresholds', () => {
  assert.equal(anticipationForLength(2).tier, 'building');
  assert.equal(anticipationForLength(3).tier, 'chain');
  assert.equal(anticipationForLength(5).tier, 'blast');
  assert.equal(anticipationForLength(7).tier, 'prism');
  assert.equal(anticipationForLength(12).tier, 'prism');
});

test('anticipation messages are localized without changing thresholds', () => {
  assert.equal(anticipationForLength(5, false).message, 'BLAST READY');
  assert.equal(anticipationForLength(5, true).message, 'BLAST BEREIT');
  assert.equal(anticipationForLength(7, true).message, 'PRISM BEREIT');
});

test('anticipation layers load after premium polish', async () => {
  const html = await read('index.html');
  assert.ok(html.indexOf('./src/anticipation.css') > html.indexOf('./src/premium.css'));
  assert.ok(html.indexOf('./src/anticipation.js') > html.indexOf('./src/premium.js'));

  const css = await read('src/anticipation.css');
  assert.match(css, /\.board-frame\.blast-ready/);
  assert.match(css, /\.board-frame\.prism-ready/);
  assert.match(css, /prefers-reduced-motion/);
});
