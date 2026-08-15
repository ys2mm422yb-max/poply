import test from 'node:test';
import assert from 'node:assert/strict';
import { PLACE_01_UPGRADES, PLACE_02_UPGRADES, createInitialState, createOrder, createProgressionOrder, orderDifficultyBand, orderPoolIndexes, fulfillOrder, makeItem, syncProgressionContent } from '../src/v2-game.js';

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

test('fresh session starts with one instant-payoff order and two real combo orders',()=>{
  const state=createInitialState();
  assert.equal(state.currentOrders.length,3);
  assert.equal(state.currentOrders[0].title,'Erster Kaffee');
  assert.equal(state.currentOrders[0].rewards.stars,4);
  assert.equal(state.currentOrders[0].requirements.length,1);
  assert.equal(state.currentOrders[1].requirements.length,2);
  assert.equal(state.currentOrders[2].requirements.length,2);
  assert.equal(new Set(state.currentOrders.map(order=>order.title)).size,3);
});

test('coast replacement orders stay beginner-friendly before the second restoration but include combinations',()=>{
  const state=createInitialState();
  assert.equal(orderDifficultyBand(state,'coast').key,'starter');
  const orders=Array.from({length:18},(_,sequence)=>createProgressionOrder({...state,currentOrders:[]},sequence,'coast'));
  assert.ok(orders.some(order=>order.requirements.length===2),'starter pool never offered a combo order');
  for(const order of orders){
    assert.equal(order.difficulty,'starter');
    assert.ok(maxRequiredTier(order)<=2,`${order.title} requested tier ${maxRequiredTier(order)}`);
  }
});

test('Place 01 upgrades progressively unlock broader order pools',()=>{
  const state=createInitialState();
  const stage0=orderPoolIndexes(state,'coast');
  state.placeUpgrades=[PLACE_01_UPGRADES[0].id];
  const stage1=orderPoolIndexes(state,'coast');
  state.placeUpgrades=PLACE_01_UPGRADES.slice(0,2).map(upgrade=>upgrade.id);
  const stage2=orderPoolIndexes(state,'coast');
  state.placeUpgrades=PLACE_01_UPGRADES.slice(0,5).map(upgrade=>upgrade.id);
  const stage5=orderPoolIndexes(state,'coast');
  assert.ok(stage1.length>stage0.length,'Lichter should unlock additional combo orders');
  assert.ok(stage2.includes(3),'Neue Theke should unlock tier-3 Eiskaffee-Date');
  assert.ok(stage5.includes(8),'Meerterrasse should unlock the premium finale pool');
});

test('replacement selection avoids both visible duplicates and the just-served title',()=>{
  const state=createInitialState();
  state.currentOrders=[createOrder(0),createOrder(1)];
  const replacement=createProgressionOrder(state,12,'coast',['Kleine Pause']);
  assert.notEqual(replacement.title,'Morgenkaffee');
  assert.notEqual(replacement.title,'Frisches Gebäck');
  assert.notEqual(replacement.title,'Kleine Pause');
});

test('coast order difficulty advances with visible restoration progress',()=>{
  const state=createInitialState();
  state.placeUpgrades=PLACE_01_UPGRADES.slice(0,2).map(upgrade=>upgrade.id);
  assert.equal(orderDifficultyBand(state,'coast').key,'growing');
  const mid=Array.from({length:10},(_,sequence)=>createProgressionOrder({...state,currentOrders:[]},sequence,'coast'));
  assert.ok(mid.some(order=>maxRequiredTier(order)>=3));
  assert.ok(mid.every(order=>maxRequiredTier(order)<=4));

  state.placeUpgrades=PLACE_01_UPGRADES.slice(0,4).map(upgrade=>upgrade.id);
  assert.equal(orderDifficultyBand(state,'coast').key,'established');
  const late=Array.from({length:12},(_,sequence)=>createProgressionOrder({...state,currentOrders:[]},sequence,'coast'));
  assert.ok(late.some(order=>maxRequiredTier(order)>=5));
});

test('fresh Sonnenkai cannot inherit a late coast sequence into a tier-five or tier-six wall',()=>{
  const state=createInitialState();
  state.placeUpgrades=PLACE_01_UPGRADES.map(upgrade=>upgrade.id);
  state.orderSequence=97;
  syncProgressionContent(state);
  assert.equal(orderDifficultyBand(state,'sunset').key,'starter');
  const order=createProgressionOrder({...state,currentOrders:[]},state.orderSequence,'sunset');
  assert.equal(order.chapter,'sunset');
  assert.equal(order.difficulty,'starter');
  assert.ok(maxRequiredTier(order)<=3);
});

test('Sonnenkai grows into higher tiers only after its own restoration advances',()=>{
  const state=createInitialState();
  state.placeUpgrades=[...PLACE_01_UPGRADES.map(upgrade=>upgrade.id),...PLACE_02_UPGRADES.slice(0,4).map(upgrade=>upgrade.id)];
  syncProgressionContent(state);
  assert.equal(orderDifficultyBand(state,'sunset').key,'established');
  const base={...state,currentOrders:[]};
  const orders=Array.from({length:12},(_,sequence)=>createProgressionOrder(base,sequence+40,'sunset'));
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
  assert.notEqual(replacement.title,active.title);
  for(const req of active.requirements){
    const remaining=result.state.board.filter(item=>item?.kind==='item'&&item.family===req.family&&item.level===req.level).length;
    assert.equal(remaining,0);
  }
});
