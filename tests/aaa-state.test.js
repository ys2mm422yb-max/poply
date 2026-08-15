import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/v2-game.js';
import { migrateState } from '../src/aaa-state.js';
import { loadSavedState, saveGameState, freshState } from '../src/aaa-storage.js';

class MemoryStorage{
  constructor(){this.data=new Map();}
  getItem(key){return this.data.has(key)?this.data.get(key):null;}
  setItem(key,value){this.data.set(key,String(value));}
  removeItem(key){this.data.delete(key);}
}

const PRIMARY='poply-v2-state-1';
const BACKUP='poply-v2-state-1-backup';

function withStorage(run){
  const previous=globalThis.window,storage=new MemoryStorage();
  globalThis.window={localStorage:storage};
  try{return run(storage);}finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
}

test('clean domain start remains the deterministic eight-object start',()=>{
  const state=migrateState(createInitialState());
  assert.equal(state.board.filter(Boolean).length,8);
  assert.equal(state.board.filter(item=>item?.kind==='generator').length,2);
});

test('legacy starter-plus objects are removed before real progress',()=>{
  const state=createInitialState();
  for(const [index,family] of [[1,'coffee'],[5,'bakery'],[8,'sweet'],[12,'coffee'],[15,'bakery'],[19,'sweet']])state.board[index]={id:`starter-plus-${family}-${index}`,kind:'item',family,level:1};
  assert.equal(state.board.filter(Boolean).length,14);
  const migrated=migrateState(state);
  assert.equal(migrated.board.filter(Boolean).length,8);
});

test('known five-slot overmerge trap is recovered without deleting value',()=>{
  const state=createInitialState();
  state.board=Array(49).fill(null);
  state.board[0]={id:'g1',kind:'generator',generator:'coffee-gen',taps:0};
  state.board[6]={id:'g2',kind:'generator',generator:'pantry-gen',taps:0};
  state.board[9]={id:'c3',kind:'item',family:'coffee',level:3};
  state.board[16]={id:'b3',kind:'item',family:'bakery',level:3};
  state.board[23]={id:'s3',kind:'item',family:'sweet',level:3};
  state.stats={merges:9,generated:0,orders:0};
  const migrated=migrateState(state);
  assert.equal(migrated.board.filter(Boolean).length,11);
  for(const family of ['coffee','bakery','sweet']){
    assert.equal(migrated.board.filter(item=>item?.family===family&&item.level===2).length,1);
    assert.equal(migrated.board.filter(item=>item?.family===family&&item.level===1).length,2);
  }
});

test('save keeps the previous valid state as a rolling recovery backup',()=>withStorage(storage=>{
  const first=createInitialState();first.coins=111;
  saveGameState(first);
  const second=structuredClone(first);second.coins=222;
  saveGameState(second);
  assert.equal(JSON.parse(storage.getItem(PRIMARY)).coins,222);
  assert.equal(JSON.parse(storage.getItem(BACKUP)).coins,111);
}));

test('corrupt primary save recovers the last valid backup and repairs primary',()=>withStorage(storage=>{
  const first=createInitialState();first.coins=333;saveGameState(first);
  const second=structuredClone(first);second.coins=444;saveGameState(second);
  storage.setItem(PRIMARY,'{broken-json');
  const recovered=loadSavedState();
  assert.equal(recovered.coins,333);
  assert.equal(JSON.parse(storage.getItem(PRIMARY)).coins,333);
}));

test('fresh reset replaces both primary and backup so old progress cannot resurrect',()=>withStorage(storage=>{
  const old=createInitialState();old.coins=999;saveGameState(old);
  const fresh=freshState(),freshCoins=fresh.coins;
  storage.setItem(PRIMARY,'{broken-json');
  const recovered=loadSavedState();
  assert.equal(recovered.coins,freshCoins);
  assert.equal(JSON.parse(storage.getItem(BACKUP)).coins,freshCoins);
}));
