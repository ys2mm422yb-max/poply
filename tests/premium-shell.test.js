import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url); const read=p=>readFile(new URL(p,root),'utf8');
test('V2 replaced legacy premium shell',async()=>{const html=await read('index.html');const css=await read('src/v2.css');assert.equal(html.includes('premium.css'),false);assert.equal(html.includes('premium.js'),false);assert.ok(css.includes('poply-v2-atlas.webp'));});
