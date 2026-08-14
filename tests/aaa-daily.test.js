import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, makeItem } from '../src/v2-game.js';
import { createDailyState, ensureDailyState, progressDailyEvent, claimDailyGoal, canServeDailyBonus, fulfillDailyBonus } from '../src/aaa-daily.js';

test('daily state always contains merge, serve and one contextual third goal',()=>{
  const state=createInitialState(),daily=createDailyState(state,'2026-08-14');
  assert.equal(daily.dateKey,'2026-08-14');assert.equal(daily.goals.length,3);
  assert.equal(daily.goals[0].type,'merge');assert.equal(daily.goals[1].type,'serve');
  assert.ok(['generate','discover','restore'].includes(daily.goals[2].type));assert.equal(daily.bonus.served,false);
});

test('daily migration and next-day reset preserve player value',()=>{
  const state=createInitialState();state.coins=777;state.stars=9;state.board[9]={...state.board[9],id:'keep-me'};
  const first=ensureDailyState(state,'2026-08-14');assert.equal(first.changed,true);assert.equal(first.reset,false);
  first.state.daily.goals[0].progress=6;first.state.daily.goals[0].claimed=true;
  const next=ensureDailyState(first.state,'2026-08-15');
  assert.equal(next.changed,true);assert.equal(next.reset,true);assert.equal(next.state.coins,777);assert.equal(next.state.stars,9);assert.equal(next.state.board[9].id,'keep-me');assert.equal(next.state.daily.goals[0].progress,0);assert.equal(next.state.daily.goals[0].claimed,false);
});

test('daily progress caps at target and claim pays exactly once',()=>{
  let state=ensureDailyState(createInitialState(),'2026-08-14').state;const before=state.coins;
  state=progressDailyEvent(state,'merge',99,'2026-08-14').state;const goal=state.daily.goals.find(entry=>entry.type==='merge');
  assert.equal(goal.progress,goal.target);
  const first=claimDailyGoal(state,goal.id,'2026-08-14');assert.equal(first.changed,true);assert.equal(first.state.coins,before+goal.reward.coins);assert.equal(first.state.daily.goals.find(entry=>entry.id===goal.id).claimed,true);
  const second=claimDailyGoal(first.state,goal.id,'2026-08-14');assert.equal(second.changed,false);assert.equal(second.reason,'already-claimed');assert.equal(second.state.coins,before+goal.reward.coins);
});

test('incomplete daily goal cannot be claimed',()=>{
  const state=ensureDailyState(createInitialState(),'2026-08-14').state,goal=state.daily.goals[0],before=state.coins;
  const result=claimDailyGoal(state,goal.id,'2026-08-14');assert.equal(result.changed,false);assert.equal(result.reason,'goal-incomplete');assert.equal(result.state.coins,before);
});

test('daily bonus guest consumes exact requirement and pays once',()=>{
  let state=ensureDailyState(createInitialState(),'2026-08-14').state;const bonus=state.daily.bonus,req=bonus.requirements[0];
  const slot=state.board.findIndex(item=>item===null);state.board[slot]=makeItem(req.family,req.level,'daily-ready-item');
  const beforeCoins=state.coins,beforeStars=state.stars,beforeOrders=state.stats.orders;
  assert.equal(canServeDailyBonus(state,'2026-08-14'),true);
  const served=fulfillDailyBonus(state,'2026-08-14');assert.equal(served.changed,true);assert.equal(served.state.board.some(item=>item?.id==='daily-ready-item'),false);assert.equal(served.state.coins,beforeCoins+bonus.rewards.coins);assert.equal(served.state.stars,beforeStars+bonus.rewards.stars);assert.equal(served.state.stats.orders,beforeOrders+1);assert.equal(served.state.daily.bonus.served,true);
  const repeat=fulfillDailyBonus(served.state,'2026-08-14');assert.equal(repeat.changed,false);assert.equal(repeat.reason,'already-served');assert.equal(repeat.state.coins,served.state.coins);assert.equal(repeat.state.stars,served.state.stars);
});
