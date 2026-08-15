import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, createOrder } from '../src/v2-game.js';
import { LEVEL_REWARD_COINS, LEVEL_REWARD_ENERGY, BASE_MAX_ENERGY, ENERGY_CAPACITY_MILESTONES, xpNeededForLevel, playerProgress, maxEnergyForLevel, nextEnergyCapacityUpgrade, nextLevelRewardPreview, legacyXpForState, ensurePlayerProgress, xpForOrder, xpForRestoration, awardPlayerXp } from '../src/aaa-progression.js';
import { PLAYER_MILESTONES, PLAYER_TITLES, PLACE_COMPLETION_BADGES, playerMilestones, completedMilestoneCount, playerTitleProgress, placeCompletionBadges, completedPlaceBadgeCount } from '../src/aaa-milestones.js';

test('level curve grows predictably and derives progress from total XP',()=>{
  assert.equal(xpNeededForLevel(1),120);assert.equal(xpNeededForLevel(2),180);
  assert.deepEqual(playerProgress(0),{level:1,totalXp:0,current:0,next:120,ratio:0});
  const p=playerProgress(150);assert.equal(p.level,2);assert.equal(p.current,30);assert.equal(p.next,180);assert.equal(p.ratio,1/6);
});

test('Player Levels grant deterministic permanent Energy capacity milestones',()=>{
  assert.deepEqual(ENERGY_CAPACITY_MILESTONES.map(entry=>entry.level),[5,10,15]);
  assert.equal(BASE_MAX_ENERGY,40);assert.equal(maxEnergyForLevel(1),40);assert.equal(maxEnergyForLevel(4),40);assert.equal(maxEnergyForLevel(5),45);assert.equal(maxEnergyForLevel(9),45);assert.equal(maxEnergyForLevel(10),50);assert.equal(maxEnergyForLevel(15),55);assert.equal(maxEnergyForLevel(99),55);
  assert.deepEqual(nextEnergyCapacityUpgrade(800,40),{level:5,gain:5,maxEnergy:45,nextMilestoneLevel:5});
  assert.deepEqual(nextEnergyCapacityUpgrade(840,45),{level:6,gain:0,maxEnergy:45,nextMilestoneLevel:10});
  assert.deepEqual(nextEnergyCapacityUpgrade(800,60),{level:5,gain:0,maxEnergy:60,nextMilestoneLevel:5});
});

test('next-level preview exposes deterministic XP, Coin, refill and capacity rewards',()=>{
  assert.deepEqual(nextLevelRewardPreview(0),{level:2,remainingXp:120,rewardCoins:LEVEL_REWARD_COINS,rewardEnergy:LEVEL_REWARD_ENERGY,rewardMaxEnergyGain:0,rewardMaxEnergy:40,currentXp:0,requiredXp:120,ratio:0});
  const preview=nextLevelRewardPreview(150);
  assert.equal(preview.level,3);assert.equal(preview.remainingXp,150);assert.equal(preview.rewardCoins,100);assert.equal(preview.rewardEnergy,'full');assert.equal(preview.rewardMaxEnergyGain,0);assert.equal(preview.currentXp,30);assert.equal(preview.requiredXp,180);assert.equal(preview.ratio,1/6);
  const capacity=nextLevelRewardPreview(800,40);assert.equal(capacity.level,5);assert.equal(capacity.remainingXp,40);assert.equal(capacity.rewardMaxEnergyGain,5);assert.equal(capacity.rewardMaxEnergy,45);
});

test('legacy progress seeds XP without deleting existing value',()=>{
  const state=createInitialState();delete state.playerXp;state.stats.orders=4;state.placeUpgrades=['lights','counter'];state.coins=777;state.stars=9;
  const expected=legacyXpForState(state),migrated=ensurePlayerProgress(state);
  assert.equal(migrated.changed,true);assert.equal(migrated.state.playerXp,expected);assert.equal(migrated.state.coins,777);assert.equal(migrated.state.stars,9);assert.deepEqual(migrated.state.board,state.board);
});

test('existing leveled saves gain missing capacity without refill, loss or clock reset',()=>{
  const state=createInitialState();state.playerXp=840;state.energy=12;state.maxEnergy=40;state.energyUpdatedAt=12345;state.coins=777;
  const migrated=ensurePlayerProgress(state);
  assert.equal(migrated.changed,true);assert.equal(migrated.state.playerXp,840);assert.equal(migrated.state.maxEnergy,45);assert.equal(migrated.state.energy,12);assert.equal(migrated.state.energyUpdatedAt,12345);assert.equal(migrated.state.coins,777);
  assert.equal(state.maxEnergy,40,'capacity sync mutated input state');
  const custom=structuredClone(state);custom.maxEnergy=60;const preserved=ensurePlayerProgress(custom);assert.equal(preserved.changed,false);assert.equal(preserved.state.maxEnergy,60);
});

test('order XP scales with requested item complexity',()=>{
  const early=createOrder(0),late=createOrder(8);
  assert.ok(xpForOrder(early)>0);assert.ok(xpForOrder(late)>xpForOrder(early));
});

test('restoration XP pays a bonus when a new Place unlocks',()=>{
  assert.equal(xpForRestoration({unlockedPlace:null}),140);
  assert.equal(xpForRestoration({unlockedPlace:'sunset'}),240);
});

test('level-up awards coins and refills energy exactly once per crossed level event',()=>{
  const state=createInitialState();state.playerXp=110;state.coins=100;state.energy=7;state.maxEnergy=40;state.energyUpdatedAt=123;
  const result=awardPlayerXp(state,20,999);
  assert.equal(result.after.level,2);assert.equal(result.levelsGained,1);assert.equal(result.bonusCoins,LEVEL_REWARD_COINS);assert.equal(result.state.coins,200);assert.equal(result.state.playerXp,130);
  assert.equal(result.bonusEnergy,33);assert.equal(result.capacityGain,0);assert.equal(result.state.energy,40);assert.equal(result.state.maxEnergy,40);assert.equal(result.state.energyUpdatedAt,999);
});

test('Level 5 raises Max Energy before the level-up refill and persists the larger cap',()=>{
  const state=createInitialState();state.playerXp=800;state.coins=100;state.energy=7;state.maxEnergy=40;state.energyUpdatedAt=123;
  const result=awardPlayerXp(state,60,999);
  assert.equal(result.before.level,4);assert.equal(result.after.level,5);assert.equal(result.levelsGained,1);assert.equal(result.capacityGain,5);assert.equal(result.state.maxEnergy,45);assert.equal(result.state.energy,45);assert.equal(result.bonusEnergy,38);assert.equal(result.state.coins,200);assert.equal(result.state.energyUpdatedAt,999);
});

test('XP without a level-up does not alter energy, capacity or its regen clock',()=>{
  const state=createInitialState();state.playerXp=10;state.energy=9;state.maxEnergy=40;state.energyUpdatedAt=456;
  const result=awardPlayerXp(state,20,999);
  assert.equal(result.levelsGained,0);assert.equal(result.bonusEnergy,0);assert.equal(result.capacityGain,0);assert.equal(result.state.energy,9);assert.equal(result.state.maxEnergy,40);assert.equal(result.state.energyUpdatedAt,456);
});

test('large XP grants can cross multiple levels and pay each Coin reward while energy caps at earned max',()=>{
  const state=createInitialState();state.playerXp=0;state.coins=0;state.energy=3;state.maxEnergy=40;
  const result=awardPlayerXp(state,310,2000);
  assert.equal(result.after.level,3);assert.equal(result.levelsGained,2);assert.equal(result.state.coins,2*LEVEL_REWARD_COINS);assert.equal(result.bonusEnergy,37);assert.equal(result.capacityGain,0);assert.equal(result.state.energy,40);assert.equal(result.state.maxEnergy,40);assert.equal(result.state.energyUpdatedAt,2000);
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

test('Place badges are earned only from canonical restoration steps and never need new save state',()=>{
  const state=createInitialState();
  assert.equal(PLACE_COMPLETION_BADGES.length,2);
  let badges=placeCompletionBadges(state);
  assert.equal(completedPlaceBadgeCount(state),0);assert.equal(badges[0].unlocked,true);assert.equal(badges[0].completedSteps,0);assert.equal(badges[1].unlocked,false);
  state.placeUpgrades=['lights','counter','menu','seating','terrace','sign'];
  badges=placeCompletionBadges(state);
  assert.equal(badges[0].complete,true);assert.equal(badges[0].ratio,1);assert.equal(badges[1].unlocked,true);assert.equal(completedPlaceBadgeCount(state),1);
  state.placeUpgrades.push('sunset-lanterns','sunset-bar','sunset-lounge','sunset-fire','sunset-stage','sunset-sign');
  badges=placeCompletionBadges(state);
  assert.equal(badges[1].complete,true);assert.equal(badges[1].completedSteps,6);assert.equal(completedPlaceBadgeCount(state),2);
  assert.equal('placeBadges' in state,false);
});
