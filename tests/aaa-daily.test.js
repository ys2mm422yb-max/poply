import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInitialState, makeItem } from '../src/v2-game.js';
import { createDailyState, dailyGoalTypes, ensureDailyState, progressDailyEvent, claimDailyGoal, canServeDailyBonus, fulfillDailyBonus } from '../src/aaa-daily.js';

test('daily state chooses three distinct contextual goals instead of two fixed slots',()=>{
  const state=createInitialState(),daily=createDailyState(state,'2026-08-14');
  assert.equal(daily.dateKey,'2026-08-14');assert.equal(daily.goals.length,3);
  assert.equal(new Set(daily.goals.map(goal=>goal.type)).size,3);
  assert.ok(daily.goals.every(goal=>['merge','serve','generate','discover','restore'].includes(goal.type)));
  assert.equal(daily.bonus.served,false);
});

test('adjacent days avoid the identical goal set when contextual alternatives exist',()=>{
  const state=createInitialState();
  const first=dailyGoalTypes(state,'2026-08-14').slice().sort().join('|');
  const second=dailyGoalTypes(state,'2026-08-15').slice().sort().join('|');
  assert.notEqual(first,second);
});

test('daily goal targets and labels vary deterministically across dates',()=>{
  const state=createInitialState();
  const days=['2026-08-14','2026-08-15','2026-08-16','2026-08-17'].map(date=>createDailyState(state,date));
  const signatures=new Set(days.map(daily=>daily.goals.map(goal=>`${goal.type}:${goal.target}`).join('|')));
  assert.ok(signatures.size>1,'daily targets never vary across dates');
  assert.deepEqual(createDailyState(state,'2026-08-15'),createDailyState(state,'2026-08-15'));
});

test('daily migration and next-day reset preserve player value',()=>{
  const state=createInitialState();state.coins=777;state.stars=9;state.board[9]={...state.board[9],id:'keep-me'};
  const first=ensureDailyState(state,'2026-08-14');assert.equal(first.changed,true);assert.equal(first.reset,false);
  first.state.daily.goals[0].progress=first.state.daily.goals[0].target;first.state.daily.goals[0].claimed=true;
  const next=ensureDailyState(first.state,'2026-08-15');
  assert.equal(next.changed,true);assert.equal(next.reset,true);assert.equal(next.state.coins,777);assert.equal(next.state.stars,9);assert.equal(next.state.board[9].id,'keep-me');assert.equal(next.state.daily.goals[0].progress,0);assert.equal(next.state.daily.goals[0].claimed,false);
});

test('daily progress caps at target and claim pays exactly once for a generated daily type',()=>{
  let state=ensureDailyState(createInitialState(),'2026-08-14').state;const before=state.coins,goal=state.daily.goals[0];
  state=progressDailyEvent(state,goal.type,99,'2026-08-14').state;const progressed=state.daily.goals.find(entry=>entry.id===goal.id);
  assert.equal(progressed.progress,progressed.target);
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

test('daily visual contract gives each goal a distinct authored reward identity',()=>{
  const css=readFileSync(new URL('../src/aaa-daily.css',import.meta.url),'utf8');
  for(const index of [1,2,3]){
    assert.match(css,new RegExp(`\\.daily-goal:nth-child\\(${index}\\)`));
  }
  assert.match(css,/\.daily-goal:nth-child\(1\)[\s\S]*#ffd45f/);
  assert.match(css,/\.daily-goal:nth-child\(2\)[\s\S]*#ff9ab2/);
  assert.match(css,/\.daily-goal:nth-child\(3\)[\s\S]*#77ece2/);
  assert.match(css,/\.daily-goal\.claimed[\s\S]*rgba\(112,226,146/);
  assert.match(css,/\.daily-bonus\{[\s\S]*radial-gradient/);
});
