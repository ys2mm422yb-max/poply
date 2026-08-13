import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
test('premium V2 release wires embedded hero, atlas and three customer portraits',async()=>{const [html,release,main,hero,atlas,a,b,c]=await Promise.all([read('index.html'),read('src/v2-release.css'),read('src/v2-main.js'),read('src/v2-hero-data.js'),read('src/v2-atlas-data.js'),read('src/v2-customer-a.js'),read('src/v2-customer-b.js'),read('src/v2-customer-c.js')]);assert.match(html,/v2-release\.css\?v=/);assert.match(html,/v2-main\.js\?v=/);assert.match(html,/data-build="v2-(?:single-screen(?:-purpose)?|game-screen)-/);assert.match(release,/--poply-hero/);assert.match(release,/--poply-atlas/);assert.match(release,/position:fixed/);assert.match(main,/v2-hero-data\.js/);assert.match(main,/v2-atlas-data\.js/);for(const source of [hero,atlas,a,b,c])assert.match(source,/data:image\/webp;base64,/);});
