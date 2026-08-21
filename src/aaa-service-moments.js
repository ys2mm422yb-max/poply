import { serviceCallStatus, progressServiceCallGenerator } from './aaa-service-call.js';
import { chargeFlow } from './aaa-flow.js';
import { guestForSequence, guestLoyalty } from './aaa-guests.js';
import { hasPlacePower } from './aaa-place-powers.js';

const difficultyRank={opening:0,starter:1,growing:2,established:3};
const orderDifficulty=order=>order?.opening?'opening':order?.difficulty||'starter';
const hasFamily=(order,family)=>(order?.requirements||[]).some(req=>req?.family===family);
const ordered=(entries,score)=>[...entries].sort((a,b)=>score(b)-score(a)||Number(a.sequence||0)-Number(b.sequence||0));
const clone=value=>value?structuredClone(value):value;

const momentDef=(key,order,extra={})=>({key,orderId:order?.id||null,orderTitle:order?.title||'Gast',...extra});

function momentCandidates(state){
  const orders=Array.isArray(state?.currentOrders)?state.currentOrders.filter(Boolean):[];
  if(!orders.length)return [];
  const candidates=[];

  const regulars=orders.map(order=>{
    const guest=guestForSequence(order.sequence),loyalty=guestLoyalty(state,guest.id);
    return {order,guest,loyalty};
  }).filter(entry=>entry.loyalty.visits>=5).sort((a,b)=>b.loyalty.visits-a.loyalty.visits||Number(a.order.sequence||0)-Number(b.order.sequence||0));
  if(regulars[0])candidates.push(momentDef('regular-guest',regulars[0].order,{
    label:'Stammgast kommt',tag:'STAMMGAST',mode:'direct',guestName:regulars[0].guest.name,
    copy:`${regulars[0].guest.name} zuerst bedienen und Service-Ruf mit der bestehenden Loyalität kombinieren.`,
    bonusLabel:'Loyalität + Service-Ruf',
  }));

  const coffee=orders.find(order=>hasFamily(order,'coffee'));
  if(coffee)candidates.push(momentDef('coffee-day',coffee,{
    label:'Kaffee-Tag',tag:'KAFFEE-TAG',mode:'stock',
    copy:'Nachschub wählen: Ein Kaffee-Generator zählt für diesen Ruf doppelt.',
    bonusLabel:'Kaffee-Nachschub zählt 2×',
  }));

  if(hasPlacePower(state,'evening-service')){
    const sunset=orders.find(order=>order?.special);
    if(sunset)candidates.push(momentDef('sunset-service',sunset,{
      label:'Sonnenuntergang-Service',tag:'ABEND',mode:'direct',
      copy:'Special abschließen und diesen Gast direkt bedienen: Abendservice lädt dabei FLOW.',
      bonusLabel:'Special + Abendservice + Service-Ruf',
    }));
  }

  const rush=ordered(orders,order=>(difficultyRank[orderDifficulty(order)]||0)*10+(order.requirements?.length||0))[0];
  candidates.push(momentDef('rush-hour',rush,{
    label:'Rush Hour',tag:'RUSH HOUR',mode:'direct',
    copy:'Den anspruchsvollsten Gast als Nächstes bedienen. Erfolgreicher Ruf lädt +1 FLOW.',
    bonusLabel:'+1 FLOW',
  }));
  return candidates;
}

export function serviceMomentStatus(state){
  const call=serviceCallStatus(state);
  if(!call.ready&&!call.active)return {available:false,matched:false,call};
  const candidates=momentCandidates(state);
  if(!candidates.length)return {available:false,matched:false,call};
  const cycle=Math.max(0,call.callsCompleted+call.callsExpired),moment=candidates[cycle%candidates.length];
  const matched=Boolean(call.active&&call.orderId===moment.orderId&&call.mode===moment.mode);
  return {...clone(moment),available:true,matched,call,cycle};
}

export function progressServiceMomentGenerator(source,family){
  const moment=serviceMomentStatus(source);
  if(!moment.available||!moment.matched||moment.key!=='coffee-day'||family!=='coffee')return {state:source,changed:false,extraProgress:0,moment};
  const extra=progressServiceCallGenerator(source);
  return {state:extra.state,changed:extra.changed,extraProgress:extra.gained,moment:{...moment,call:extra.status}};
}

export function applyServiceMomentDelivery(source,momentSnapshot,serviceCallResult,placePowers=null){
  const moment=momentSnapshot?.available?momentSnapshot:null;
  const completed=Boolean(moment?.matched&&serviceCallResult?.completed);
  if(!completed)return {state:source,changed:false,completed:false,flowCharged:0,moment:moment?clone(moment):null,bonusLabel:null};
  let state=source,changed=false,flowCharged=0,flowReady=false,bonusLabel=moment.bonusLabel;
  if(moment.key==='rush-hour'){
    const flow=chargeFlow(state,1);state=flow.state;changed=flow.changed;flowCharged=flow.gained;flowReady=flow.becameReady;
    bonusLabel=flow.gained?`+${flow.gained} FLOW`:'FLOW bereits bereit';
  }else if(moment.key==='sunset-service'){
    const gained=Math.max(0,Number(placePowers?.flowCharged)||0);
    bonusLabel=gained?`Abendservice +${gained} FLOW`:'Service-Ruf + Special kombiniert';
  }else if(moment.key==='coffee-day')bonusLabel='Kaffee-Nachschub 2×';
  else if(moment.key==='regular-guest')bonusLabel='Loyalität + Service-Ruf';
  return {state,changed,completed:true,flowCharged,flowReady,moment:clone(moment),bonusLabel};
}

export function serviceMomentSummary(moment){
  if(!moment?.available)return '';
  return `${moment.label} · ${moment.orderTitle} · ${moment.mode==='stock'?'Nachschub':'Direkt'} · ${moment.bonusLabel}`;
}
