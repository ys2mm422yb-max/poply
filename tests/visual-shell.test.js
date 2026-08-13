import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('legacy polished shell remains wired until V2 replaces it', async () => {
  const html = await read('index.html');
  const mainIndex = html.indexOf('./src/main.js');
  const polishIndex = html.indexOf('./src/polish.js');
  assert.ok(mainIndex >= 0, 'legacy runtime must remain runnable during migration');
  assert.ok(polishIndex > mainIndex, 'legacy polish runtime must remain wired during migration');
});

test('legacy visual runtime remains represented during migration', async () => {
  const css = await read('src/game-shell.css');
  assert.match(css, /Pieces: no printed placeholder symbols/);
  assert.match(css, /\.chain-glow/);
});

test('V2 visual direction requires production merge art and visible restoration', async () => {
  const direction = await read('docs/VISUAL_DIRECTION.md');
  assert.match(direction, /production-quality assets/i);
  assert.match(direction, /Valid merge targets react before release/i);
  assert.match(direction, /visible before\/after transformation/i);
  assert.match(direction, /merge board is the main working surface/i);
});

test('standing product docs mark connect-and-pop as legacy and merge V2 as active', async () => {
  const rules = await read('PROJECT_RULES.md');
  const direction = await read('docs/GAME_DIRECTION_V2.md');
  const roadmap = await read('docs/NEXT_STEPS.md');
  assert.match(rules, /historical prototype only/i);
  assert.match(rules, /merge-and-build casual game/i);
  assert.match(direction, /two identical items of the same family and tier merge into the next tier/i);
  assert.match(roadmap, /Do not drift back into the legacy connect-and-pop roadmap/i);
});
