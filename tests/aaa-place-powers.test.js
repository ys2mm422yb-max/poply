import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, createOpeningOrder, generateFromSlot } from '../src/v2-game.js';
import { ensureFlowState, flowStatus } from '../src/aaa-flow.js';
import { ensureServiceSpecials } from '../src/aaa-specials.js';
import { applyPreparationBonus, ensurePlacePowerState, placePowerStatus, recordServicePlacePowers, replaceOrderWithGuestChoice, unlockPlacePowerForUpgrade } from '../src/aaa-place-powers.js';

const completedSpecialOrder=()=>{
  const order=createOpeningOrder(1),withSpecial=ensureServiceSpecials({...createInitialState(),currentOrders:[order]}).state.currentOrders[0];
  withSpecial.special={...withSpecial.special,progress:withSpecial.special.target,completed:true};
  return withSpecial;
};

test('existing saves with Menüwand migrate to one ready Gastwahl without changing resources',()=>{
  const state=createInitialState();state.placeUpgrades=['lights','counter','menu'];state.coins=444;state.stars=9;delete state.placePowerState;
  const migrated=ensurePlacePowerState(state);
  assert.equal(migrated.changed,true);assert.equal(migrated.state.coins,444);assert.equal(migrated.state.stars,9);
  assert.deepEqual(placePowerStatus(migrated.state),{prepReady:false,menuChoiceReady:true,prepsUsed:0,rerollsUsed:0});
});

test('Lichter charges one extra Flow step only for a completed Service Special',()=>{
  let state=ensureFlowState(createInitialState()).state;state.placeUpgrades=['lights'];
  const order=completedSpecialOrder(),charged=recordServicePlacePowers(state,order);
  assert.equal(charged.effects.flowCharged,1);assert.equal(flowStatus(charged.state).charge,1);
  const incomplete={...order,special:{...order.special,completed:false,progress:0}},unchanged=recordServicePlacePowers(state,incomplete);
  assert.equal(unchanged.effects.flowCharged,0);assert.equal(flowStatus(unchanged.state).charge,0);
});

test('Abendservice never overcharges an already ready Merge Flow',()=>{
  let state=ensureFlowState(createInitialState()).state;state.placeUpgrades=['lights'];state.mergeFlow={charge:3,boostReady:true,boostsUsed:2};
  const result=recordServicePlacePowers(state,completedSpecialOrder());
  assert.equal(result.effects.flowCharged,0);assert.equal(flowStatus(result.state).charge,3);assert.equal(flowStatus(result.state).boostsUsed,2);
});

test('Neue Theke arms one preparation and the next chosen generator gains exactly one tier',()=>{
  let state=ensurePlacePowerState(createInitialState()).state;state.placeUpgrades=['lights','counter'];state=ensurePlacePowerState(state).state;
  const armed=recordServicePlacePowers(state,createOpeningOrder(0));assert.equal(armed.effects.prepArmed,true);assert.equal(placePowerStatus(armed.state).prepReady,true);
  const generated=generateFromSlot(armed.state,6);assert.equal(generated.level,1);
  const prepared=applyPreparationBonus(generated.state,generated.spawnedIndex);
  assert.equal(prepared.boosted,true);assert.equal(prepared.state.board[generated.spawnedIndex].level,2);assert.equal(placePowerStatus(prepared.state).prepReady,false);assert.equal(placePowerStatus(prepared.state).prepsUsed,1);
});

test('Vorbereitung does not stack multiple charges while already ready',()=>{
  let state=createInitialState();state.placeUpgrades=['lights','counter'];state=ensurePlacePowerState(state).state;
  const first=recordServicePlacePowers(state,createOpeningOrder(0)),second=recordServicePlacePowers(first.state,createOpeningOrder(1));
  assert.equal(first.effects.prepArmed,true);assert.equal(second.effects.prepArmed,false);assert.equal(placePowerStatus(second.state).prepReady,true);
});

test('Menüwand unlock grants a deterministic one-shot order swap and service recharges it',()=>{
  let state=createInitialState();state.placeUpgrades=['lights','counter','menu'];state=unlockPlacePowerForUpgrade(state,'menu').state;
  const beforeTitles=state.currentOrders.map(order=>order.title),target=state.currentOrders[1];
  const swapped=replaceOrderWithGuestChoice(state,target.id);
  assert.equal(swapped.changed,true);assert.notEqual(swapped.replacement.title,target.title);assert.equal(swapped.state.currentOrders.length,3);assert.equal(placePowerStatus(swapped.state).menuChoiceReady,false);assert.equal(placePowerStatus(swapped.state).rerollsUsed,1);
  assert.equal(swapped.state.coins,state.coins);assert.equal(swapped.state.stars,state.stars);assert.notDeepEqual(swapped.state.currentOrders.map(order=>order.title),beforeTitles);
  const blocked=replaceOrderWithGuestChoice(swapped.state,swapped.replacement.id);assert.equal(blocked.changed,false);assert.equal(blocked.reason,'not-ready');
  const recharged=recordServicePlacePowers(swapped.state,createOpeningOrder(0));assert.equal(recharged.effects.menuArmed,true);assert.equal(placePowerStatus(recharged.state).menuChoiceReady,true);
});
