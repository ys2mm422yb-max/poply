import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { anticipationForLength } from '../src/anticipation.js';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('legacy chain anticipation remains deterministic for historical regression coverage', () => {
  assert.equal(anticipationForLength(2).tier, 'building');
  assert.equal(anticipationForLength(3).tier, 'chain');
  assert.equal(anticipationForLength(5).tier, 'blast');
  assert.equal(anticipationForLength(7).tier, 'prism');
});

test('legacy anticipation is no longer loaded by the canonical V2 shell', async () => {
  const html = await read('index.html');
  assert.doesNotMatch(html, /anticipation\.js/);
  assert.match(html, /v2-main\.js/);
});
