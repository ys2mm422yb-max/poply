import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
test('canonical shell boots V2', async () => { const html = await read('index.html'); assert.ok(html.includes('v2-main.js')); assert.equal(html.includes('./src/main.js'), false); });
