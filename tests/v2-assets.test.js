import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CUSTOMER_ASSETS } from '../src/v2-customers.js';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
test('premium V2 embeds production hero, atlas and three customer portraits',async()=>{const html=await read('index.html');const hero=await read('src/v2-hero-asset.css');const atlas=await read('src/v2-atlas-asset.css');assert.match(html,/v2-hero-asset\.css/);assert.match(html,/v2-atlas-asset\.css/);assert.match(hero,/data:image\/webp;base64,/);assert.match(atlas,/data:image\/webp;base64,/);assert.equal(CUSTOMER_ASSETS.length,3);for(const src of CUSTOMER_ASSETS)assert.match(src,/^data:image\/webp;base64,/);});
