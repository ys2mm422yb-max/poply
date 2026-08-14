import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, createOrder } from '../src/v2-game.js';
import { LEVEL_REWARD_COINS, xpNeededForLevel, playerProgress, nextLevelRewardPreview, legacyXpForState, ensurePlayerProgress, xpForOrder, xpForRestoration, awardPlayerXp } from '../src/aaa-progression.js';
import { PLAYER_MILESTONES, PLAYER_TITLES, playerMilestones, completedMilestoneCount, playerTitleProgress } from '../src/aaa-milestones.js';

test('level curve grows predictably and derives progress from total XP',()=>{
  assert.equal(xpNeededForLevel(1),120);assert.equal(xpNeededForLevel(2),180);
  assert.deepEqual(playerProgress(0),{level:1,totalXp:0,current:0,next:120,ratio:0});
  const p=playerProgress(150);assert.equal(p.level,2);assert.equal(p.current,30);assert.equal(p.next,180);assert.equal(p.ratio,1/6);
});

test('next-level preview exposes only deterministic canonical XP progress and reward',()=>{
  assert.deepEqual(nextLevelRewardPreview(0),{level:2,remainingXp:120,rewardCoins:LEVEL_REWARD_COINS,currentXp:0,requiredXp:120,ratio:0});
  const preview=nextLevelRewardPreview(150);
  assert.equal(preview.level,3);assert.equal(preview.remainingXp,150);assert.equal(preview.rewardCoins,100);assert.equal(preview.currentXp,30);assert.equal(preview.requiredXp,180);assert.equal(preview.ratio,1/6);
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

test('milestones derive only from existing persistent player progress',()=>{
  const state=createInitialState();state.stats.orders=3;state.stats.merges=31;state.placeUpgrades=['lights','counter','menu','seating','terrace','sign'];state.playerXp=840;state.discoveries=Array.from({length:14},(_,i)=>`item:coffee:${i+1}`);
  const milestones=playerMilestones(state);
  assert.equal(milestones.length,PLAYER_MILESTONES.length);assert.equal(completedMilestoneCount(state),5);assert.ok(milestones.every(entry=>entry.complete&&entry.ratio===1));
});

test('milestone progress is capped for display without mutating raw progress',()=>{
  const state=createInitialState();state.stats.orders=0;state.stats.merges=10;state.placeUpgrades=['lights','counter'];state.playerXp=150;state.discoveries=['item:coffee:1','item:coffee:2','generator:coffee-gen'];
  const byId=Object.fromEntries(playerMilestones(state).map(entry=>[entry.id,entry]));
  assert.equal(byId['first-service'].current,0);assert.equal(byId['merge-rhythm'].current,10);assert.equal(byId['place-maker'].current,2);assert.equal(byId.discoverer.current,2);assert.equal(byId['level-five'].current,2);assert.equal(completedMilestoneCount(state),0);
});

test('player title is a cosmetic reward derived only from completed milestones',()=>{
  const fresh=createInitialState();
  assert.equal(PLAYER_TITLES.length,PLAYER_MILESTONES.length+1);
  assert.deepEqual(playerTitleProgress(fresh),{current:PLAYER_TITLES[0],next:PLAYER_TITLES[1],completed:0,total:5,remaining:5});
  fresh.stats.orders=1;fresh.stats.merges=25;
  const mid=playerTitleProgress(fresh);assert.equal(mid.current.label,'Merge-Kenner');assert.equal(mid.next.label,'Place-Macher');assert.equal(mid.completed,2);assert.equal(mid.remaining,3);
  fresh.placeUpgrades=['lights','counter','menu','seating','terrace','sign'];fresh.playerXp=840;fresh.discoveries=Array.from({length:12},(_,i)=>`item:coffee:${i+1}`);
  const max=playerTitleProgress(fresh);assert.equal(max.current.label,'Poply-Profi');assert.equal(max.next,null);assert.equal(max.completed,5);assert.equal(max.remaining,0);
});