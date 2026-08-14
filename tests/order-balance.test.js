import test from 'node:test';
import assert from 'node:assert/strict';
import { PLACE_01_UPGRADES, PLACE_02_UPGRADES, createInitialState, createOrder, createProgressionOrder, orderDifficultyBand, fulfillOrder, makeItem, syncProgressionContent } from '../src/v2-game.js';

const maxRequiredTier=order=>Math.max(...order.requirements.map(req=>req.level));

function readyFor(order,state){
  let cursor=30;
  for(const req of order.requirements){
    for(let count=0;count<req.qty;count+=1){
      state.board[cursor]=makeItem(req.family,req.level,`ready-${order.id}-${cursor}`);
      cursor+=1;
    }
  }
  return state;
}

test('coast replacement orders stay beginner-friendly before the second restoration',()=>{
  const state=createInitialState();
  assert.equal(orderDifficultyBand(state,'coast').key,'starter');
  for(let sequence=0;sequence<12;sequence+=1){
    const order=createProgressionOrder(state,sequence,'coast');
    assert.equal(order.difficulty,'starter');
    assert.ok(maxRequiredTier(order)<=2,`${order.title} requested tier ${maxRequiredTier(order)}`);
  }
});

test('coast order difficulty advances with visible restoration progress',()=>{
  const state=createInitialState();
  state.placeUpgrades=PLACE_01_UPGRADES.slice(0,2).map(upgrade=>upgrade.id);
  assert.equal(orderDifficultyBand(state,'coast').key,'growing');
  const mid=Array.from({length:10},(_,sequence)=>createProgressionOrder(state,sequence,'coast'));
  assert.ok(mid.some(order=>maxRequiredTier(order)>=3));
  assert.ok(mid.every(order=>maxRequiredTier(order)<=4));

  state.placeUpgrades=PLACE_01_UPGRADES.slice(0,4).map(upgrade=>upgrade.id);
  assert.equal(orderDifficultyBand(state,'coast').key,'established');
  const late=Array.from({length:12},(_,sequence)=>createProgressionOrder(state,sequence,'coast'));
  assert.ok(late.some(order=>maxRequiredTier(order)>=5));
});

test('fresh Sonnenkai cannot inherit a late coast sequence into a tier-five or tier-six wall',()=>{
  const state=createInitialState();
  state.placeUpgrades=PLACE_01_UPGRADES.map(upgrade=>upgrade.id);
  state.orderSequence=97;
  syncProgressionContent(state);
  assert.equal(orderDifficultyBand(state,'sunset').key,'starter');
  const order=createProgressionOrder(state,state.orderSequence,'sunset');
  assert.equal(order.chapter,'sunset');
  assert.equal(order.difficulty,'starter');
  assert.ok(maxRequiredTier(order)<=3);
});

test('Sonnenkai grows into higher tiers only after its own restoration advances',()=>{
  const state=createInitialState();
  state.placeUpgrades=[...PLACE_01_UPGRADES.map(upgrade=>upgrade.id),...PLACE_02_UPGRADES.slice(0,4).map(upgrade=>upgrade.id)];
  syncProgressionContent(state);
  assert.equal(orderDifficultyBand(state,'sunset').key,'established');
  const orders=Array.from({length:12},(_,sequence)=>createProgressionOrder(state,sequence+40,'sunset'));
  assert.ok(orders.some(order=>maxRequiredTier(order)>=5));
  assert.ok(orders.every(order=>order.chapter==='sunset'));
});

test('fulfilling an order uses the progression band for its replacement without changing payout or exact consumption',()=>{
  const state=createInitialState();
  state.placeUpgrades=PLACE_01_UPGRADES.map(upgrade=>upgrade.id);
  state.currentOrders=[createOrder(0,'coast')];
  state.orderSequence=88;
  state.coins=321;
  state.stars=7;
  syncProgressionContent(state);
  const active=state.currentOrders[0];
  readyFor(active,state);
  const beforeCoins=state.coins,beforeStars=state.stars;
  const result=fulfillOrder(state,active.id);
  assert.equal(result.changed,true);
  assert.equal(result.state.coins,beforeCoins+active.rewards.coins);
  assert.equal(result.state.stars,beforeStars+active.rewards.stars);
  const replacement=result.state.currentOrders[0];
  assert.equal(replacement.id,'order-88');
  assert.equal(replacement.chapter,'sunset');
  assert.equal(replacement.difficulty,'starter');
  assert.ok(maxRequiredTier(replacement)<=3);
  for(const req of active.requirements){
    const remaining=result.state.board.filter(item=>item?.kind==='item'&&item.family===req.family&&item.level===req.level).length;
    assert.equal(remaining,0);
  }
});
