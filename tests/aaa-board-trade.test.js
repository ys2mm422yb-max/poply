import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createInitialState } from '../src/v2-game.js';
import { BOARD_TRADE_SERVICE_TARGET, ensureBoardTradeState, boardTradeStatus, recordBoardTradeService, boardTradeSourceIndexes, boardTradeTargetOptions, tradeBoardItem } from '../src/aaa-board-trade.js';

const discoveredTradeState=()=>{
  const state=createInitialState();
  state.board[9]={kind:'item',family:'coffee',level:2};
  state.discoveries=['item:coffee:1','item:coffee:2','item:bakery:1','item:bakery:2','item:sweet:1','item:sweet:2'];
  return ensureBoardTradeState(state).state;
};

test('old saves normalize with no retroactive Board trade charge',()=>{
  const legacy=createInitialState();delete legacy.boardTradeState;legacy.stats.orders=99;
  const ensured=ensureBoardTradeState(legacy);
  assert.equal(ensured.changed,true);assert.deepEqual(ensured.state.boardTradeState,{serviceProgress:0,ready:false,uses:0});
  assert.equal(boardTradeStatus(ensured.state).untilReady,BOARD_TRADE_SERVICE_TARGET);
});

test('exactly three normal service records arm one non-stacking trade',()=>{
  let state=discoveredTradeState();
  for(let index=1;index<=BOARD_TRADE_SERVICE_TARGET;index+=1){
    const result=recordBoardTradeService(state);state=result.state;
    assert.equal(result.gained,1);assert.equal(result.status.ready,index===BOARD_TRADE_SERVICE_TARGET);
    assert.equal(result.becameReady,index===BOARD_TRADE_SERVICE_TARGET);
  }
  const held=recordBoardTradeService(state);
  assert.equal(held.gained,0);assert.equal(held.status.ready,true);assert.equal(held.status.serviceProgress,BOARD_TRADE_SERVICE_TARGET);
});

test('only discovered same-tier families are legal targets',()=>{
  let state=discoveredTradeState();state.boardTradeState={serviceProgress:BOARD_TRADE_SERVICE_TARGET,ready:true,uses:0};
  const options=boardTradeTargetOptions(state,9);
  assert.deepEqual(options.map(option=>option.family).sort(),['bakery','sweet']);
  assert.equal(boardTradeTargetOptions(state,0).length,0,'generator must never be a source');
  assert.ok(boardTradeSourceIndexes(state).includes(9));
  state.discoveries=state.discoveries.filter(key=>key!=='item:sweet:2');
  assert.deepEqual(boardTradeTargetOptions(state,9).map(option=>option.family),['bakery']);
});

test('trade transforms one item 1:1 on the same tier and consumes the charge',()=>{
  let state=discoveredTradeState();state.boardTradeState={serviceProgress:3,ready:true,uses:2};state.coins=321;state.stars=17;state.energy=8;
  const before={coins:state.coins,stars:state.stars,energy:state.energy,boardCount:state.board.filter(Boolean).length};
  const result=tradeBoardItem(state,9,'bakery');
  assert.equal(result.changed,true);assert.equal(result.before.family,'coffee');assert.equal(result.after.family,'bakery');assert.equal(result.after.level,2);
  assert.equal(result.state.board[9].family,'bakery');assert.equal(result.state.board[9].level,2);
  assert.equal(result.state.boardTradeState.ready,false);assert.equal(result.state.boardTradeState.serviceProgress,0);assert.equal(result.state.boardTradeState.uses,3);
  assert.deepEqual({coins:result.state.coins,stars:result.state.stars,energy:result.state.energy,boardCount:result.state.board.filter(Boolean).length},before);
});

test('illegal targets and generator sources cannot consume a ready trade',()=>{
  let state=discoveredTradeState();state.boardTradeState={serviceProgress:3,ready:true,uses:0};
  const unknown=tradeBoardItem(state,9,'fruit');assert.equal(unknown.changed,false);assert.equal(unknown.reason,'invalid-target');assert.equal(unknown.state.boardTradeState.ready,true);
  const same=tradeBoardItem(state,9,'coffee');assert.equal(same.changed,false);assert.equal(same.reason,'invalid-target');assert.equal(same.state.boardTradeState.ready,true);
  const generator=tradeBoardItem(state,0,'bakery');assert.equal(generator.changed,false);assert.equal(generator.reason,'invalid-source');assert.equal(generator.state.boardTradeState.ready,true);
});

test('Board trade UI, CSS and mandatory WebKit gate are wired',async()=>{
  const [index,main,ui,css,workflow]=await Promise.all([
    readFile(new URL('../index.html',import.meta.url),'utf8'),
    readFile(new URL('../src/aaa-main.js',import.meta.url),'utf8'),
    readFile(new URL('../src/aaa-board-trade-ui.js',import.meta.url),'utf8'),
    readFile(new URL('../src/aaa-board-trade.css',import.meta.url),'utf8'),
    readFile(new URL('../.github/workflows/browser-qa.yml',import.meta.url),'utf8'),
  ]);
  assert.match(index,/aaa-board-trade\.css/);assert.match(main,/installBoardTradeUI\(root,ui\)/);
  assert.match(ui,/board-trade-ready-action/);assert.match(css,/board-trade-source/);
  assert.match(workflow,/Run Board trade WebKit QA/);assert.match(workflow,/node scripts\/board-trade-qa\.mjs/);
});
