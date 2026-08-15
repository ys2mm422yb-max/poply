import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, generateFromSlot, makeGenerator, moveOrMerge } from '../src/v2-game.js';
import { FLOW_THRESHOLD, ensureFlowState, flowStatus, recordMergeFlow, applyGeneratorBoost } from '../src/aaa-flow.js';
import { migrateState } from '../src/aaa-state.js';

const chargeStarterFlow=()=>{
  let state=ensureFlowState(createInitialState()).state,last=null;
  for(const [from,to] of [[9,10],[16,17],[23,24]]){
    const merged=moveOrMerge(state,from,to);assert.equal(merged.changed,true);
    last=recordMergeFlow(merged.state);state=last.state;
  }
  return {state,last};
};

test('old saves gain a safe empty Merge Flow without losing resources',()=>{
  const legacy=createInitialState();delete legacy.mergeFlow;legacy.coins=777;legacy.stars=12;
  const migrated=migrateState(legacy),status=flowStatus(migrated);
  assert.equal(migrated.coins,777);assert.equal(migrated.stars,12);
  assert.deepEqual(migrated.mergeFlow,{charge:0,boostReady:false,boostsUsed:0});
  assert.equal(status.threshold,FLOW_THRESHOLD);
});

test('three successful merges arm exactly one generator boost',()=>{
  const {state,last}=chargeStarterFlow(),status=flowStatus(state);
  assert.equal(last.becameReady,true);assert.equal(status.charge,3);assert.equal(status.boostReady,true);
  const extra=recordMergeFlow(state);assert.equal(extra.becameReady,false);assert.equal(flowStatus(extra.state).charge,3);
});

test('ready Flow lets the player choose a generator and upgrades its next drop',()=>{
  const charged=chargeStarterFlow().state,beforeEnergy=charged.energy;
  const generated=generateFromSlot(charged,6);assert.equal(generated.changed,true);assert.equal(generated.family,'bakery');assert.equal(generated.level,1);
  const boosted=applyGeneratorBoost(generated.state,generated.spawnedIndex),item=boosted.state.board[generated.spawnedIndex];
  assert.equal(boosted.boosted,true);assert.equal(item.family,'bakery');assert.equal(item.level,2);
  assert.equal(boosted.state.energy,beforeEnergy-1);assert.equal(flowStatus(boosted.state).boostReady,false);assert.equal(flowStatus(boosted.state).charge,0);assert.equal(flowStatus(boosted.state).boostsUsed,1);
});

test('normal generator drops stay unchanged while Flow is not ready',()=>{
  const state=ensureFlowState(createInitialState()).state,generated=generateFromSlot(state,0),boosted=applyGeneratorBoost(generated.state,generated.spawnedIndex);
  assert.equal(boosted.boosted,false);assert.equal(boosted.state.board[generated.spawnedIndex].level,1);assert.equal(flowStatus(boosted.state).charge,0);
});

test('Flow stacks with an authored generator bonus instead of wasting it',()=>{
  const state=ensureFlowState(createInitialState()).state;state.board[5]=makeGenerator('garden-gen','qa-garden',3);state.mergeFlow={charge:3,boostReady:true,boostsUsed:0};
  const generated=generateFromSlot(state,5);assert.equal(generated.bonus,true);assert.equal(generated.level,2);
  const boosted=applyGeneratorBoost(generated.state,generated.spawnedIndex);
  assert.equal(boosted.boosted,true);assert.equal(boosted.state.board[generated.spawnedIndex].level,3);
});
