import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('premium layers load after existing polish layers', async () => {
  const html = await read('index.html');
  assert.ok(html.indexOf('./src/premium.css') > html.indexOf('./src/game-shell.css'));
  assert.ok(html.indexOf('./src/premium.js') > html.indexOf('./src/polish.js'));
});

test('premium pass includes board feedback and impact effects', async () => {
  const css = await read('src/premium.css');
  const js = await read('src/premium.js');
  assert.ok(css.includes('.flow-hud'));
  assert.ok(css.includes('.premium-spark'));
  assert.ok(css.includes('premium-power-impact'));
  assert.ok(js.includes('createFlowHud'));
  assert.ok(js.includes('spawnPremiumBurst'));
});

test('premium pass covers phone and tablet layouts', async () => {
  const css = await read('src/premium.css');
  assert.ok(css.includes('@media (max-width:430px)'));
  assert.ok(css.includes('@media (min-width:760px) and (orientation:portrait)'));
  assert.ok(css.includes('@media (min-width:820px) and (orientation:landscape)'));
});
