import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, makeItem, moveOrMerge, PLACE_01_UPGRADES, PLACE_02_UPGRADES } from '../src/v2-game.js';
import { FAMILY_MASTERY_REWARD_COINS, discoveryItemKey, discoveryGeneratorKey, discoveryPlaceKey, inferredDiscoveries, ensureCollectionState, recordItemDiscovery, isDiscovered, familyDiscoveryCount, familyMastery, totalItemDiscoveryCount, discoveryXpForItem } from '../src/aaa-collection.js';

test('fresh collection knows only content visible in the starting state',()=>{
  const state=createInitialState(),result=ensureCollectionState(state),d=result.state.discoveries;
  assert.ok(d.includes(discoveryPlaceKey('coast')));
  assert.ok(d.includes(discoveryGeneratorKey('coffee-gen')));
  assert.ok(d.includes(discoveryGeneratorKey('pantry-gen')));
  for(const family of ['coffee','bakery','sweet'])assert.ok(d.includes(discoveryItemKey(family,1)));
  assert.equal(d.includes(discoveryItemKey('coffee',2)),false);
  assert.equal(d.includes(discoveryItemKey('fruit',1)),false);
  assert.equal(d.includes(discoveryItemKey('herb',1)),false);
});

test('legacy board backfill includes reached lower tiers but never future tiers',()=>{
  const state=createInitialState();state.board[9]=makeItem('coffee',3,'legacy-coffee-3');state.board[10]=null;delete state.discoveries;
  const keys=inferredDiscoveries(state);
  assert.ok(keys.includes(discoveryItemKey('coffee',1)));assert.ok(keys.includes(discoveryItemKey('coffee',2)));assert.ok(keys.includes(discoveryItemKey('coffee',3)));
  assert.equal(keys.includes(discoveryItemKey('coffee',4)),false);
});

test('a newly merged tier is recorded once and awards discovery XP once',()=>{
  let state=ensureCollectionState(createInitialState()).state;
  const merged=moveOrMerge(state,9,10);assert.equal(merged.changed,true);assert.equal(merged.item.level,2);
  const first=recordItemDiscovery(merged.state,merged.item);assert.equal(first.changed,true);assert.equal(first.progression.gained,discoveryXpForItem(2));assert.ok(isDiscovered(first.state,discoveryItemKey('coffee',2)));
  const repeat=recordItemDiscovery(first.state,merged.item);assert.equal(repeat.changed,false);assert.equal(repeat.progression,null);assert.equal(repeat.state.playerXp,first.state.playerXp);
});

test('family mastery rank follows real discoveries without separate save state',()=>{
  const state=ensureCollectionState(createInitialState()).state;
  assert.equal(familyMastery(state,'coffee').title,'Entdecker');
  state.discoveries.push(discoveryItemKey('coffee',2));assert.equal(familyMastery(state,'coffee').title,'Kenner');
  state.discoveries.push(discoveryItemKey('coffee',3),discoveryItemKey('coffee',4));assert.equal(familyMastery(state,'coffee').title,'Profi');
  state.discoveries.push(discoveryItemKey('coffee',5),discoveryItemKey('coffee',6));
  assert.deepEqual(familyMastery(state,'coffee'),{family:'coffee',found:6,total:6,completed:true,title:'Meister',rewardCoins:FAMILY_MASTERY_REWARD_COINS,nextLevel:null});
  assert.equal('familyMastery' in state,false);
});

test('discovering the final family tier grants the mastery Coin reward exactly once',()=>{
  let state=ensureCollectionState(createInitialState()).state;
  state.discoveries=state.discoveries.filter(key=>!key.startsWith('item:coffee:'));
  for(let level=1;level<=5;level+=1)state.discoveries.push(discoveryItemKey('coffee',level));
  state.coins=123;state.playerXp=0;
  const finalItem=makeItem('coffee',6,'coffee-master');
  const first=recordItemDiscovery(state,finalItem);
  assert.equal(first.changed,true);assert.equal(first.mastery.completed,true);assert.equal(first.mastery.title,'Meister');assert.equal(first.mastery.rewardCoins,FAMILY_MASTERY_REWARD_COINS);
  assert.equal(first.state.coins,123+FAMILY_MASTERY_REWARD_COINS);assert.equal(first.progression.gained,discoveryXpForItem(6));
  const repeat=recordItemDiscovery(first.state,finalItem);
  assert.equal(repeat.changed,false);assert.equal(repeat.mastery,null);assert.equal(repeat.state.coins,first.state.coins);
});

test('completed Place 01 backfill records Sonnenkai and Tropenbar but not fruit tiers',()=>{
  const state=createInitialState();state.placeUpgrades=PLACE_01_UPGRADES.map(upgrade=>upgrade.id);delete state.discoveries;
  const result=ensureCollectionState(state).state;
  assert.ok(isDiscovered(result,discoveryPlaceKey('sunset')));assert.ok(isDiscovered(result,discoveryGeneratorKey('sunset-gen')));
  assert.equal(isDiscovered(result,discoveryItemKey('fruit',1)),false);
});

test('completed Sonnenkai backfill records Dachgarten and Gewächshaus but not herb tiers',()=>{
  const state=createInitialState();state.placeUpgrades=[...PLACE_01_UPGRADES.map(upgrade=>upgrade.id),...PLACE_02_UPGRADES.map(upgrade=>upgrade.id)];delete state.discoveries;
  const result=ensureCollectionState(state).state;
  assert.ok(isDiscovered(result,discoveryPlaceKey('garden')));assert.ok(isDiscovered(result,discoveryGeneratorKey('garden-gen')));
  assert.equal(isDiscovered(result,discoveryItemKey('herb',1)),false);
});

test('family and overall discovery counts remain deterministic',()=>{
  const state=ensureCollectionState(createInitialState()).state;
  assert.deepEqual(familyDiscoveryCount(state,'coffee'),{found:1,total:6});
  assert.deepEqual(familyDiscoveryCount(state,'fruit'),{found:0,total:6});
  assert.deepEqual(familyDiscoveryCount(state,'herb'),{found:0,total:6});
  assert.deepEqual(totalItemDiscoveryCount(state),{found:3,total:30});
});
