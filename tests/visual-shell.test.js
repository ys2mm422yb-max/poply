import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('polished shell loads after the base game runtime', async () => {
  const html = await read('index.html');
  const mainIndex = html.indexOf('./src/main.js');
  const polishIndex = html.indexOf('./src/polish.js');
  assert.ok(mainIndex >= 0, 'main runtime must be present');
  assert.ok(polishIndex > mainIndex, 'polish runtime must load after main runtime');
  assert.match(html, /id="chain-glow"/);
  assert.match(html, /id="chain-tail"/);
});

test('visual direction removes printed placeholder symbols from pieces', async () => {
  const css = await read('src/game-shell.css');
  assert.match(css, /Pieces: no printed placeholder symbols/);
  assert.match(css, /\.piece-3::before \{ border-radius: 50%/);
  assert.match(css, /\.chain-glow/);
  assert.match(css, /--chain-color/);
});

test('visual quality target explicitly rejects placeholder treatment', async () => {
  const direction = await read('docs/VISUAL_DIRECTION.md');
  assert.match(direction, /placeholder symbols/i);
  assert.match(direction, /thick white chain/i);
  assert.match(direction, /board is the hero/i);
});
