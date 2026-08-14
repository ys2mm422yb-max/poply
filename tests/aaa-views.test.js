import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');

test('primary navigation owns three real views',async()=>{
  const source=await read('src/aaa-view.js');
  for(const key of ["['place'","['orders'","['board'"])assert.ok(source.includes(key),key);
  for(const surface of ['merge-board','restore-track','focus-orders'])assert.ok(source.includes(surface),surface);
});

test('AAA entry owns visible Safari viewport sizing',async()=>{
  const source=await read('src/aaa-main.js');
  assert.match(source,/visualViewport/);
  assert.match(source,/--app-height/);
});

test('Place restoration has six visible authored scene steps',async()=>{
  const css=await read('src/aaa-views.css');
  assert.match(css,/data:image\/svg\+xml;base64/);
  assert.doesNotMatch(css,/var\(--poply-hero\)/);
  for(let stage=1;stage<=6;stage+=1)assert.ok(css.includes(`.scene-card.stage-${stage}`),`missing restoration stage ${stage}`);
  for(const position of ['16.6667%','33.3333%','50%','66.6667%','83.3333%','100%'])assert.ok(css.includes(position),position);
});

test('active AAA item rendering uses authored vectors instead of the legacy atlas',async()=>{
  const [view,art,board]=await Promise.all([read('src/aaa-view.js'),read('src/aaa-art.js'),read('src/aaa-board.css')]);
  assert.match(view,/aaa-art\.js/);
  assert.doesNotMatch(view,/v2-atlas-data\.js/);
  assert.doesNotMatch(view,/v2-hero-data\.js/);
  for(const family of ['coffee','bakery','sweet'])for(let level=1;level<=6;level+=1)assert.ok(art.includes(`'${family}-${level}'`),`${family}-${level}`);
  for(const generator of ['generator-coffee','generator-pantry'])assert.ok(art.includes(`'${generator}'`),generator);
  assert.match(board,/\.item-art svg/);
  assert.doesNotMatch(board,/sprite-0/);
  assert.doesNotMatch(board,/--poply-atlas/);
});
