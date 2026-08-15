import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOARD_SIZE, ITEM_FAMILIES, GENERATORS, PLACE_01_UPGRADES, PLACE_02_UPGRADES, PLACE_03_UPGRADES,
  createInitialState, normalizeState, makeItem, makeGenerator, activePlaceChapter, syncProgressionContent,
  generateFromSlot, generatorProductionStatus, orderDifficultyBand, createProgressionOrder, buildNextUpgrade
} from '../src/v2-game.js';

const ids=upgrades=>upgrades.map(upgrade=>upgrade.id);

test('Dachgarten is the third sequential Place and unlocks exactly one greenhouse',()=>{
  const state=createInitialState();
  state.placeUpgrades=[...ids(PLACE_01_UPGRADES),...ids(PLACE_02_UPGRADES)];
  syncProgressionContent(state);syncProgressionContent(state);
  assert.equal(activePlaceChapter(state).id,'garden');
  assert.equal(PLACE_03_UPGRADES.length,6);
  assert.equal(state.board.filter(item=>item?.kind==='generator'&&item.generator==='garden-gen').length,1);
});

test('finishing Sonnenkai unlocks Dachgarten and greenhouse in the same build transition',()=>{
  const state=createInitialState();
  state.placeUpgrades=[...ids(PLACE_01_UPGRADES),...ids(PLACE_02_UPGRADES.slice(0,5))];
  state.stars=999;syncProgressionContent(state);
  const result=buildNextUpgrade(state);
  assert.equal(result.changed,true);assert.equal(result.upgrade.id,'sunset-sign');assert.equal(result.unlockedPlace,'garden');
  assert.equal(activePlaceChapter(result.state).id,'garden');
  assert.equal(result.state.board.filter(item=>item?.generator==='garden-gen').length,1);
});

test('greenhouse harvest cycle is transparent and every fourth successful production yields tier 2',()=>{
  let state=createInitialState();state.board[0]=makeGenerator('garden-gen','generator-garden',0);state.energy=10;
  const levels=[],bonuses=[];
  for(let i=0;i<4;i+=1){const result=generateFromSlot(state,0);assert.equal(result.changed,true);levels.push(result.level);bonuses.push(result.bonus);state=result.state;}
  assert.deepEqual(levels,[1,1,1,2]);assert.deepEqual(bonuses,[false,false,false,true]);
  assert.equal(state.board[0].taps,4);assert.deepEqual(generatorProductionStatus(state.board[0]),{progress:0,total:4,nextStep:1,bonusNext:false,bonusLevel:2,label:'Erntebonus'});
  assert.equal(ITEM_FAMILIES.herb.stages.length,6);assert.equal(GENERATORS['garden-gen'].bonusEvery,4);
});

test('failed greenhouse production on a full board never advances harvest cycle or energy',()=>{
  const state=createInitialState();state.board=Array(BOARD_SIZE).fill(null).map((_,index)=>index===0?makeGenerator('garden-gen','generator-garden',3):makeItem('herb',1,`full-${index}`));state.energy=7;
  const result=generateFromSlot(state,0);
  assert.equal(result.changed,false);assert.equal(result.reason,'board-full');assert.equal(result.state.board[0].taps,3);assert.equal(result.state.energy,7);
});

test('legacy generators without taps normalize to a safe zero cycle',()=>{
  const legacy=createInitialState();legacy.board[0]={id:'legacy-coffee',kind:'generator',generator:'coffee-gen'};
  const state=normalizeState(legacy);assert.equal(state.board[0].taps,0);
  const result=generateFromSlot(state,0);assert.equal(result.changed,true);assert.equal(result.state.board[0].taps,1);
});

test('Dachgarten orders use restoration-progress difficulty bands and herb requirements',()=>{
  const state=createInitialState();state.placeUpgrades=[...ids(PLACE_01_UPGRADES),...ids(PLACE_02_UPGRADES)];syncProgressionContent(state);
  assert.equal(orderDifficultyBand(state,'garden').key,'starter');
  const starter=createProgressionOrder(state,0,'garden');assert.equal(starter.chapter,'garden');assert.deepEqual(starter.requirements,[{family:'herb',level:2,qty:1}]);
  state.placeUpgrades.push('garden-glass','garden-beds');assert.equal(orderDifficultyBand(state,'garden').key,'growing');
  state.placeUpgrades.push('garden-bar','garden-seating');assert.equal(orderDifficultyBand(state,'garden').key,'established');
});
