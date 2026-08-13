import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url); const read=p=>readFile(new URL(p,root),'utf8');
test('canonical shell boots V2 only',async()=>{const html=await read('index.html');assert.ok(html.includes('./src/v2.css'));assert.ok(html.includes('./src/v2-main.js'));assert.equal(html.includes('./src/main.js'),false);assert.equal(html.includes('anticipation.js'),false);});
test('V2 surfaces and generated art are wired',async()=>{const html=await read('index.html');const css=await read('src/v2.css');for(const id of ['merge-board','orders','build-button','place-hero'])assert.ok(html.includes(`id="${id}"`));assert.ok(css.includes('poply-v2-atlas.webp'));assert.ok(css.includes('poply-place-cafe.webp'));assert.ok(css.includes('orientation:landscape'));assert.ok(css.includes('prefers-reduced-motion'));});
