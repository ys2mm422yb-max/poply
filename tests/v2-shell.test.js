import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('canonical shell boots V2 only and does not load the legacy chain runtime', async () => {
  const html = await read('index.html');
  assert.match(html, /src\/v2\.css/);
  assert.match(html, /src\/v2-main\.js/);
  assert.doesNotMatch(html, /src\/main\.js/);
  assert.doesNotMatch(html, /anticipation\.js/);
});

test('V2 shell contains the merge, order and place progression surfaces', async () => {
  const html = await read('index.html');
  assert.match(html, /id="merge-board"/);
  assert.match(html, /id="orders"/);
  assert.match(html, /id="build-button"/);
  assert.match(html, /id="place-hero"/);
});

test('V2 visual system uses generated game art and responsive phone/tablet layouts', async () => {
  const css = await read('src/v2.css');
  assert.match(css, /poply-v2-atlas\.webp/);
  assert.match(css, /poply-place-cafe\.webp/);
  assert.match(css, /@media \(max-width:430px\)/);
  assert.match(css, /@media \(min-width:650px\)/);
  assert.match(css, /orientation:landscape/);
  assert.match(css, /prefers-reduced-motion/);
});
