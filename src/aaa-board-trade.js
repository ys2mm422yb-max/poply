import { ITEM_FAMILIES } from './v2-game.js';
import { discoveryItemKey, isDiscovered } from './aaa-collection.js';

export const BOARD_TRADE_SERVICE_TARGET=3;

const normalizedTradeState=state=>{
  const current=state?.boardTradeState;
  const ready=Boolean(current?.ready);
  return {
    serviceProgress:ready?BOARD_TRADE_SERVICE_TARGET:Math.max(0,Math.min(BOARD_TRADE_SERVICE_TARGET-1,Math.floor(Number(current?.serviceProgress)||0))),
    ready,
    uses:Math.max(0,Math.floor(Number(current?.uses)||0)),
  };
};

export function ensureBoardTradeState(inputState){
  const nextState=normalizedTradeState(inputState);
  const current=inputState?.boardTradeState;
  const unchanged=current&&current.serviceProgress===nextState.serviceProgress&&current.ready===nextState.ready&&current.uses===nextState.uses;
  if(unchanged)return {state:inputState,changed:false,status:boardTradeStatus(inputState)};
  const state=structuredClone(inputState);state.boardTradeState=nextState;
  return {state,changed:true,status:boardTradeStatus(state)};
}

export function boardTradeStatus(state){
  const current=normalizedTradeState(state);
  return {
    ...current,
    target:BOARD_TRADE_SERVICE_TARGET,
    untilReady:current.ready?0:Math.max(0,BOARD_TRADE_SERVICE_TARGET-current.serviceProgress),
  };
}

export function recordBoardTradeService(inputState){
  const ensured=ensureBoardTradeState(inputState),before=ensured.status;
  if(before.ready)return {state:ensured.state,changed:ensured.changed,gained:0,becameReady:false,status:before};
  const state=structuredClone(ensured.state),progress=Math.min(BOARD_TRADE_SERVICE_TARGET,before.serviceProgress+1),ready=progress>=BOARD_TRADE_SERVICE_TARGET;
  state.boardTradeState={...state.boardTradeState,serviceProgress:ready?BOARD_TRADE_SERVICE_TARGET:progress,ready};state.updatedAt=Date.now();
  return {state,changed:true,gained:1,becameReady:ready,status:boardTradeStatus(state)};
}

const sourceAt=(state,index)=>state?.board?.[Number(index)]||null;
const targetItem=(family,level)=>({kind:'item',family,level});

export function boardTradeTargetOptions(state,sourceIndex){
  const source=sourceAt(state,sourceIndex);
  if(!boardTradeStatus(state).ready||source?.kind!=='item'||!ITEM_FAMILIES[source.family])return [];
  return Object.entries(ITEM_FAMILIES).flatMap(([family,definition])=>{
    if(family===source.family||!isDiscovered(state,discoveryItemKey(family,source.level)))return [];
    const name=definition.stages[source.level-1];
    return name?[{family,level:source.level,name,label:definition.label,item:targetItem(family,source.level)}]:[];
  });
}

export function boardTradeSourceIndexes(state){
  if(!boardTradeStatus(state).ready)return [];
  const result=[];(state?.board||[]).forEach((item,index)=>{if(item?.kind==='item'&&boardTradeTargetOptions(state,index).length)result.push(index);});
  return result;
}

export function tradeBoardItem(inputState,sourceIndex,targetFamily){
  const ensured=ensureBoardTradeState(inputState),status=ensured.status,index=Number(sourceIndex),source=sourceAt(ensured.state,index);
  if(!status.ready)return {state:ensured.state,changed:false,reason:'not-ready',status};
  if(!Number.isInteger(index)||index<0||index>=(ensured.state.board||[]).length||source?.kind!=='item')return {state:ensured.state,changed:false,reason:'invalid-source',status};
  const option=boardTradeTargetOptions(ensured.state,index).find(entry=>entry.family===targetFamily);
  if(!option)return {state:ensured.state,changed:false,reason:'invalid-target',status};
  const state=structuredClone(ensured.state),before=structuredClone(source);
  state.board[index]={...state.board[index],family:option.family,level:source.level};
  state.boardTradeState={serviceProgress:0,ready:false,uses:status.uses+1};state.updatedAt=Date.now();
  return {state,changed:true,reason:null,index,before,after:structuredClone(state.board[index]),option,status:boardTradeStatus(state)};
}
