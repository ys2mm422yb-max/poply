import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, createOrder } from '../src/v2-game.js';
import { LEVEL_REWARD_COINS, xpNeededForLevel, playerProgress, legacyXpForState, ensurePlayerProgress, xpForOrder, xpForRestoration, awardPlayerXp } from '../src/aaa-progression.js';

test('level curve grows predictably and derives progress from total XP',()=>{
  assert.equal(xpNeededForLevel(1),120);assert.equal(xpNeededForLevel(2),180);
  assert.deepEqual(playerProgress(0),{level:1,totalXp:0,current:0,next:120,ratio:0});
  const p=playerProgress(150);assert.equal(p.level,2);assert.equal(p.current,30);assert.equal(p.next,180);assert.equal(p.ratio,1/6);
});

test('legacy progress seeds XP without deleting existing value',()=>{
  const state=createInitialState();delete state.playerXp;state.stats.orders=4;state.placeUpgrades=['lights','counter'];state.coins=777;state.stars=9;
  const expected=legacyXpForState(state),migrated=ensurePlayerProgress(state);
  assert.equal(migrated.changed,true);assert.equal(migrated.state.playerXp,expected);assert.equal(migrated.state.coins,777);assert.equal(migrated.state.stars,9);assert.deepEqual(migrated.state.board,state.board);
});

test('order XP scales with requested item complexity',()=>{
  const early=createOrder(0),late=createOrder(8);
  assert.ok(xpForOrder(early)>0);assert.ok(xpForOrder(late)>xpForOrder(early));
});

test('restoration XP pays a bonus when a new Place unlocks',()=>{
  assert.equal(xpForRestoration({unlockedPlace:null}),140);
  assert.equal(xpForRestoration({unlockedPlace:'sunset'}),240);
});

test('level-up awards coins exactly once per crossed level',()=>{
  const state=createInitialState();state.playerXp=110;state.coins=100;
  const result=awardPlayerXp(state,20);
  assert.equal(result.after.level,2);assert.equal(result.levelsGained,1);assert.equal(result.bonusCoins,LEVEL_REWARD_COINS);assert.equal(result.state.coins,200);assert.equal(result.state.playerXp,130);
});

test('large XP grants can cross multiple levels and pay each reward',()=>{
  const state=createInitialState();state.playerXp=0;state.coins=0;
  const result=awardPlayerXp(state,310);
  assert.equal(result.after.level,3);assert.equal(result.levelsGained,2);assert.equal(result.state.coins,2*LEVEL_REWARD_COINS);
});
