import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');

test('primary navigation owns three real views',async()=>{
  const source=await read('src/aaa-view.js');
  for(const key of ["['place'","['orders'","['board'"])assert.ok(source.includes(key),key);
  for(const surface of ['merge-board','world-hero','journey-steps','quest-list'])assert.ok(source.includes(surface),surface);
});

test('AAA entry owns visible Safari viewport sizing',async()=>{
  const source=await read('src/aaa-main.js');
  assert.match(source,/visualViewport/);
  assert.match(source,/--app-height/);
});

test('Place uses layered authored scene art and six visible restoration additions',async()=>{
  const [view,art,world]=await Promise.all([read('src/aaa-view.js'),read('src/aaa-place-art.js'),read('src/aaa-world.css')]);
  assert.match(view,/aaa-place-art\.js/);
  assert.match(view,/placeSceneMarkup\(stage\)/);
  assert.match(view,/world-hero/);
  assert.match(view,/journey-steps/);
  assert.doesNotMatch(view,/scene-card/);
  assert.doesNotMatch(view,/restore-track/);
  for(let stage=1;stage<=6;stage+=1)assert.ok(art.includes(`show(safeStage,${stage}`),`missing authored scene stage ${stage}`);
  for(const layer of ['lights','counter','menu','seating','terrace','sign'])assert.ok(art.includes(`scene-upgrade ${layer}`),layer);
  for(const selector of ['.world-hero','.place-current-goal','.journey-line','.journey-step.current'])assert.ok(world.includes(selector),selector);
});

test('Orders use quest presentation rather than legacy focus cards',async()=>{
  const [view,world]=await Promise.all([read('src/aaa-view.js'),read('src/aaa-world.css')]);
  for(const marker of ['quest-card','quest-list','quest-reward','orders-hero','job-ticket'])assert.ok(view.includes(marker),marker);
  assert.doesNotMatch(view,/focus-order/);
  assert.doesNotMatch(view,/mini-order/);
  for(const selector of ['.quest-card','.quest-avatar-ring','.quest-reward','.job-ticket'])assert.ok(world.includes(selector),selector);
});

test('Board renders an authored workbench hierarchy instead of equal-weight tiles',async()=>{
  const [view,world]=await Promise.all([read('src/aaa-view.js'),read('src/aaa-world.css')]);
  assert.match(view,/boardTitle:'Werkbank'/);
  for(const marker of ['family-${item.family}','tier-${item.level}','order-needed','merge-ready'])assert.ok(view.includes(marker),marker);
  for(const selector of ['.production-board .board-cell.empty','.production-board .board-cell.occupied:before','.production-board .board-cell.family-coffee:before','.production-board .board-cell.family-bakery:before','.production-board .board-cell.family-sweet:before','.production-board .board-cell.generator:before','.production-board .board-cell.order-needed:before','.production-board .board-cell.merge-ready:before'])assert.ok(world.includes(selector),selector);
  assert.match(world,/\.production-board \.board-cell\.merge-ready\{outline:0\}/);
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
