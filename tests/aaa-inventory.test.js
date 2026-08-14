import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, makeItem } from '../src/v2-game.js';
import { INITIAL_STORAGE_CAPACITY, STORAGE_MAX_CAPACITY, RECYCLE_COIN_VALUES, ensureInventoryState, storageUpgradeCost, recycleCoinValue, storeBoardItem, recycleBoardItem, restoreStoredItem, upgradeStorage } from '../src/aaa-inventory.js';

test('existing saves gain four empty storage slots without losing player value',()=>{
  const state=createInitialState();state.coins=777;delete state.storage;delete state.storageCapacity;
  const result=ensureInventoryState(state);
  assert.equal(result.changed,true);assert.deepEqual(result.state.storage,[]);assert.equal(result.state.storageCapacity,INITIAL_STORAGE_CAPACITY);assert.equal(result.state.coins,777);assert.deepEqual(result.state.board,state.board);
});

test('storing an item preserves exact identity and frees exactly one board slot',()=>{
  const state=ensureInventoryState(createInitialState()).state,id=state.board[9].id,before=state.board.filter(Boolean).length;
  const result=storeBoardItem(state,9);
  assert.equal(result.changed,true);assert.equal(result.item.id,id);assert.equal(result.state.board[9],null);assert.equal(result.state.storage.length,1);assert.equal(result.state.storage[0].id,id);assert.equal(result.state.board.filter(Boolean).length,before-1);
});

test('generators can never be stored',()=>{
  const state=ensureInventoryState(createInitialState()).state,snapshot=structuredClone(state);
  const result=storeBoardItem(state,0);
  assert.equal(result.changed,false);assert.equal(result.reason,'generator-not-storable');assert.deepEqual(result.state,snapshot);
});

test('full storage rejects another item without loss',()=>{
  const state=ensureInventoryState(createInitialState()).state;state.storage=Array.from({length:4},(_,i)=>makeItem('coffee',1,`stored-${i}`));
  const boardItem=structuredClone(state.board[9]),result=storeBoardItem(state,9);
  assert.equal(result.changed,false);assert.equal(result.reason,'storage-full');assert.equal(result.state.board[9].id,boardItem.id);assert.equal(result.state.storage.length,4);
});

test('recycling uses explicit deterministic tier values',()=>{
  assert.deepEqual(RECYCLE_COIN_VALUES,{1:1,2:3,3:7,4:15,5:30,6:60});
  for(const [level,coins] of Object.entries(RECYCLE_COIN_VALUES))assert.equal(recycleCoinValue(makeItem('coffee',Number(level),`tier-${level}`)),coins);
  assert.equal(recycleCoinValue(null),0);assert.equal(recycleCoinValue({kind:'generator'}),0);
});

test('recycling removes exactly one item and returns the advertised Coins',()=>{
  const state=ensureInventoryState(createInitialState()).state,id=state.board[9].id,beforeItems=state.board.filter(item=>item?.kind==='item').length,beforeCoins=state.coins;
  const result=recycleBoardItem(state,9);
  assert.equal(result.changed,true);assert.equal(result.item.id,id);assert.equal(result.coins,1);assert.equal(result.state.board[9],null);assert.equal(result.state.coins,beforeCoins+1);assert.equal(result.state.board.filter(item=>item?.kind==='item').length,beforeItems-1);
  assert.equal(state.board[9].id,id,'input state was mutated');assert.equal(state.coins,beforeCoins,'input Coins were mutated');
});

test('generators can never be recycled',()=>{
  const state=ensureInventoryState(createInitialState()).state,snapshot=structuredClone(state),result=recycleBoardItem(state,0);
  assert.equal(result.changed,false);assert.equal(result.reason,'generator-not-recyclable');assert.deepEqual(result.state,snapshot);
});

test('full board plus full storage remains recoverable by recycling one board item',()=>{
  const state=ensureInventoryState(createInitialState()).state;state.storage=Array.from({length:4},(_,i)=>makeItem('coffee',1,`stored-${i}`));
  const filler=makeItem('sweet',1,'fill');state.board=state.board.map((item,index)=>item??{...filler,id:`fill-${index}`});
  assert.equal(state.board.every(Boolean),true);assert.equal(state.storage.length,state.storageCapacity);
  const storedIds=state.storage.map(item=>item.id),target=state.board.findIndex(item=>item?.kind==='item'),targetId=state.board[target].id;
  const result=recycleBoardItem(state,target);
  assert.equal(result.changed,true);assert.equal(result.item.id,targetId);assert.equal(result.state.board[target],null);assert.deepEqual(result.state.storage.map(item=>item.id),storedIds);assert.equal(result.state.board.filter(Boolean).length,48);
});

test('restoring a stored item uses a free board slot and preserves identity',()=>{
  let state=ensureInventoryState(createInitialState()).state;state=storeBoardItem(state,9).state;const id=state.storage[0].id;
  const result=restoreStoredItem(state,0);
  assert.equal(result.changed,true);assert.equal(result.item.id,id);assert.equal(result.state.storage.length,0);assert.ok(result.state.board.some(item=>item?.id===id));
});

test('full board blocks restore without losing the stored item',()=>{
  let state=ensureInventoryState(createInitialState()).state;state.storage=[makeItem('coffee',2,'safe-storage-item')];
  const filler=makeItem('sweet',1,'fill');state.board=state.board.map((item,index)=>item??{...filler,id:`fill-${index}`});
  const result=restoreStoredItem(state,0);
  assert.equal(result.changed,false);assert.equal(result.reason,'board-full');assert.equal(result.state.storage[0].id,'safe-storage-item');
});

test('Coins buy permanent capacity and cannot overspend or exceed max',()=>{
  let state=ensureInventoryState(createInitialState()).state;state.coins=199;
  assert.equal(storageUpgradeCost(state),200);
  const blocked=upgradeStorage(state);assert.equal(blocked.changed,false);assert.equal(blocked.reason,'not-enough-coins');assert.equal(blocked.state.coins,199);
  state.coins=700;const first=upgradeStorage(state);assert.equal(first.changed,true);assert.equal(first.cost,200);assert.equal(first.capacity,6);assert.equal(first.state.coins,500);assert.equal(storageUpgradeCost(first.state),450);
  const second=upgradeStorage(first.state);assert.equal(second.changed,true);assert.equal(second.capacity,STORAGE_MAX_CAPACITY);assert.equal(second.state.coins,50);assert.equal(storageUpgradeCost(second.state),null);
  const maxed=upgradeStorage(second.state);assert.equal(maxed.changed,false);assert.equal(maxed.reason,'max-capacity');assert.equal(maxed.state.coins,50);
});

test('inventory migration never deletes valid stored items even if capacity metadata is stale',()=>{
  const state=createInitialState();state.storage=Array.from({length:6},(_,i)=>makeItem('bakery',1,`legacy-${i}`));state.storageCapacity=4;
  const result=ensureInventoryState(state).state;assert.equal(result.storage.length,6);assert.equal(result.storageCapacity,6);
});
