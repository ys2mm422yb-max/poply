import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createInitialState, generateFromSlot, PLACE_01_UPGRADES, PLACE_02_UPGRADES } from '../src/v2-game.js';
import { ensureCollectionState } from '../src/aaa-collection.js';
import { generatorMastery, generatorUseCount, generatorMasterySummary } from '../src/aaa-generator-mastery.js';
import { dailyStory, dailyStoryGoalLabel } from '../src/aaa-daily-story.js';
import { createDailyState } from '../src/aaa-daily.js';
import { collectionView } from '../src/aaa-collection-view.js';

const generatorIndex=(state,id)=>state.board.findIndex(item=>item?.kind==='generator'&&item.generator===id);

test('Generator Mastery is derived only from existing generator taps and needs no new save state',()=>{
  let state=ensureCollectionState(createInitialState()).state;const index=generatorIndex(state,'coffee-gen');assert.ok(index>=0);
  for(const [uses,title,completed] of [[0,'Neu',false],[8,'Vertraut',false],[24,'Geübt',false],[50,'Meister',true]]){
    state.board[index].taps=uses;const mastery=generatorMastery(state,'coffee-gen');assert.equal(mastery.uses,uses);assert.equal(mastery.title,title);assert.equal(mastery.completed,completed);
  }
  assert.equal(state.generatorMastery,undefined);assert.equal(generatorMasterySummary(state).known>=2,true);
});

test('real generator production advances the same taps that mastery reads',()=>{
  const state=createInitialState(),index=generatorIndex(state,'coffee-gen'),before=generatorUseCount(state,'coffee-gen');
  const result=generateFromSlot(state,index);assert.equal(result.changed,true);assert.equal(generatorUseCount(result.state,'coffee-gen'),before+1);
});

test('Daily Story is deterministic for date plus active Place and does not alter Daily rewards',()=>{
  const date='2026-08-21',coast=createInitialState(),first=dailyStory(coast,date),again=dailyStory(coast,date);assert.deepEqual(first,again);assert.equal(first.chapterId,'coast');
  const sunset=structuredClone(coast);sunset.placeUpgrades=PLACE_01_UPGRADES.map(upgrade=>upgrade.id);assert.equal(dailyStory(sunset,date).chapterId,'sunset');
  const garden=structuredClone(sunset);garden.placeUpgrades.push(...PLACE_02_UPGRADES.map(upgrade=>upgrade.id));assert.equal(dailyStory(garden,date).chapterId,'garden');
  const daily=createDailyState(coast,date),before=structuredClone(daily);for(const goal of daily.goals)assert.ok(dailyStoryGoalLabel(goal).length>5);assert.deepEqual(daily,before);
});

test('unknown item silhouettes stay a Collection-only language, never an active-order placeholder',async()=>{
  const state=createInitialState();state.discoveries=[];const collection=collectionView(state,'fruit');assert.match(collection,/silhouette/);assert.match(collection,/\?\?\?/);
  const activeView=await readFile(new URL('../src/aaa-view.js',import.meta.url),'utf8');assert.doesNotMatch(activeView,/\?\?\?/);
});

test('Block 6 wiring keeps long-term motivation inside existing surfaces',async()=>{
  const [main,index,ui,css,workflow]=await Promise.all([
    readFile(new URL('../src/aaa-main.js',import.meta.url),'utf8'),readFile(new URL('../index.html',import.meta.url),'utf8'),readFile(new URL('../src/aaa-long-term-ui.js',import.meta.url),'utf8'),readFile(new URL('../src/aaa-long-term.css',import.meta.url),'utf8'),readFile(new URL('../.github/workflows/browser-qa.yml',import.meta.url),'utf8')
  ]);
  assert.match(main,/installLongTermUI\(root\)/);assert.match(index,/aaa-long-term\.css\?v=20260821-longterm1/);assert.match(ui,/world-complete-payoff/);assert.doesNotMatch(ui,/saveGameState|localStorage|coins\s*[+\-=]|stars\s*[+\-=]/);assert.match(css,/generator-discovery\.mastered/);assert.match(css,/daily-story-rule/);assert.match(css,/world-complete-payoff/);assert.match(css,/prefers-reduced-motion/);assert.match(workflow,/Run long-term motivation WebKit QA/);
});
