export const SERVICE_CALL_INTERVAL=3;
export const SERVICE_CALL_STOCK_TARGET=2;

const REWARDS={
  direct:{opening:30,starter:35,growing:45,established:60},
  stock:{opening:50,starter:55,growing:70,established:90},
};
const MODES=new Set(['direct','stock']);
const count=value=>Math.max(0,Number.isInteger(Number(value))?Number(value):0);
const positive=(value,fallback)=>Number.isInteger(Number(value))&&Number(value)>0?Number(value):fallback;
const served=state=>count(state?.stats?.orders);
const defaultNextAt=state=>Math.max(SERVICE_CALL_INTERVAL,served(state));
const validOrder=(state,orderId)=>Array.isArray(state?.currentOrders)&&state.currentOrders.some(order=>order?.id===orderId);
const difficulty=order=>order?.opening?'opening':(['starter','growing','established'].includes(order?.difficulty)?order.difficulty:'starter');

export function serviceCallReward(order,mode){
  if(!MODES.has(mode))return 0;
  return REWARDS[mode][difficulty(order)]??0;
}

export function serviceCallStatus(state){
  const raw=state?.serviceCallState||{},nextAt=positive(raw.nextAt,defaultNextAt(state));
  const mode=MODES.has(raw.mode)?raw.mode:null,orderId=typeof raw.orderId==='string'&&raw.orderId?raw.orderId:null;
  const active=Boolean(mode&&orderId&&validOrder(state,orderId)),generatorProgress=active&&mode==='stock'?Math.min(SERVICE_CALL_STOCK_TARGET,count(raw.generatorProgress)):0;
  const ordersServed=served(state),ready=!active&&ordersServed>=nextAt;
  return {
    nextAt,ordersServed,ready,active,orderId:active?orderId:null,mode:active?mode:null,generatorProgress,
    generatorTarget:SERVICE_CALL_STOCK_TARGET,untilReady:ready||active?0:Math.max(0,nextAt-ordersServed),
    callsCompleted:count(raw.callsCompleted),callsExpired:count(raw.callsExpired),
  };
}

export function ensureServiceCallState(source){
  if(!source)return {state:source,changed:false,status:serviceCallStatus(source)};
  const raw=source.serviceCallState||{},rawMode=MODES.has(raw.mode)?raw.mode:null,rawOrderId=typeof raw.orderId==='string'&&raw.orderId?raw.orderId:null;
  const active=Boolean(rawMode&&rawOrderId&&validOrder(source,rawOrderId));
  const canonical={
    nextAt:positive(raw.nextAt,defaultNextAt(source)),
    orderId:active?rawOrderId:null,
    mode:active?rawMode:null,
    generatorProgress:active&&rawMode==='stock'?Math.min(SERVICE_CALL_STOCK_TARGET,count(raw.generatorProgress)):0,
    callsCompleted:count(raw.callsCompleted),
    callsExpired:count(raw.callsExpired),
  };
  const changed=!source.serviceCallState||Object.keys(canonical).some(key=>source.serviceCallState[key]!==canonical[key]);
  if(!changed)return {state:source,changed:false,status:serviceCallStatus(source)};
  const state=structuredClone(source);state.serviceCallState=canonical;
  return {state,changed:true,status:serviceCallStatus(state)};
}

export function chooseServiceCall(source,orderId,mode){
  const ensured=ensureServiceCallState(source),status=ensured.status;
  if(!status.ready)return {state:ensured.state,changed:ensured.changed,reason:status.active?'already-active':'not-ready',status};
  if(!MODES.has(mode))return {state:ensured.state,changed:ensured.changed,reason:'invalid-mode',status};
  const order=ensured.state.currentOrders?.find(entry=>entry.id===orderId);
  if(!order)return {state:ensured.state,changed:ensured.changed,reason:'unknown-order',status};
  const state=structuredClone(ensured.state);
  state.serviceCallState={...state.serviceCallState,orderId:order.id,mode,generatorProgress:0};
  return {state,changed:true,reason:null,order:structuredClone(order),rewardCoins:serviceCallReward(order,mode),status:serviceCallStatus(state)};
}

export function progressServiceCallGenerator(source){
  const ensured=ensureServiceCallState(source),status=ensured.status;
  if(!status.active||status.mode!=='stock'||status.generatorProgress>=SERVICE_CALL_STOCK_TARGET)return {state:ensured.state,changed:ensured.changed,gained:0,becameReady:false,status};
  const state=structuredClone(ensured.state),before=status.generatorProgress,progress=Math.min(SERVICE_CALL_STOCK_TARGET,before+1);
  state.serviceCallState.generatorProgress=progress;
  return {state,changed:true,gained:progress-before,becameReady:progress>=SERVICE_CALL_STOCK_TARGET&&before<SERVICE_CALL_STOCK_TARGET,status:serviceCallStatus(state)};
}

export function recordServiceCallDelivery(source,orderId){
  const ensured=ensureServiceCallState(source),status=ensured.status;
  if(!status.active)return {state:ensured.state,changed:ensured.changed,completed:false,expired:false,bonusCoins:0,reason:null,status};
  const target=ensured.state.currentOrders?.find(order=>order.id===status.orderId),isTarget=orderId===status.orderId;
  const stocked=status.mode!=='stock'||status.generatorProgress>=SERVICE_CALL_STOCK_TARGET;
  const completed=Boolean(isTarget&&stocked),expired=!completed,reason=completed?null:(isTarget?'stock-incomplete':'other-order');
  const bonusCoins=completed?serviceCallReward(target,status.mode):0,state=structuredClone(ensured.state);
  if(bonusCoins)state.coins=Math.max(0,Number(state.coins)||0)+bonusCoins;
  state.serviceCallState={
    nextAt:served(ensured.state)+1+SERVICE_CALL_INTERVAL,
    orderId:null,mode:null,generatorProgress:0,
    callsCompleted:status.callsCompleted+(completed?1:0),
    callsExpired:status.callsExpired+(expired?1:0),
  };
  return {state,changed:true,completed,expired,bonusCoins,reason,mode:status.mode,orderId:status.orderId,status:serviceCallStatus(state)};
}

export function serviceCallModeLabel(mode){return mode==='stock'?'Nachschub':'Direkt';}
export function serviceCallProgressText(status){
  if(!status?.active)return '';
  return status.mode==='stock'?`${status.generatorProgress}/${status.generatorTarget} Nachschub`:'Nächste Lieferung';
}
