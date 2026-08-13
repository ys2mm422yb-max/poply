import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('legacy premium runtime stays in the repository but is inactive in V2', async () => {
  const html = await read('index.html');
  const css = await read('src/premium.css');
  const js = await read('src/premium.js');
  assert.doesNotMatch(html, /premium\.css/);
  assert.doesNotMatch(html, /premium\.js/);
  assert.match(css, /premium-spark/);
  assert.match(js, /spawnPremiumBurst/);
});

test('V2 provides its own generated-art and responsive visual layer', async () => {
  const css = await read('src/v2.css');
  assert.match(css, /poply-v2-atlas\.webp/);
  assert.match(css, /poply-place-cafe\.webp/);
  assert.match(css, /@media \(max-width:430px\)/);
  assert.match(css, /orientation:landscape/);
});
