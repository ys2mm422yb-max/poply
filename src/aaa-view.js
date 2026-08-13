import { HERO_IMAGE } from './v2-hero-data.js';
import { ATLAS_IMAGE } from './v2-atlas-data.js';
import { CUSTOMER_A } from './v2-customer-a.js';
import { CUSTOMER_B } from './v2-customer-b.js';
import { CUSTOMER_C } from './v2-customer-c.js';
import { PLACE_UPGRADES, itemDefinition, canFulfillOrder, countRequirement, restorationStatus } from './v2-game.js';

export const ASSETS={hero:HERO_IMAGE,atlas:ATLAS_IMAGE,customers:[CUSTOMER_A,CUSTOMER_B,CUSTOMER_C]};

export const COPY={
  place:'Place',orders:'Aufträge',board:'Board',placeName:'Café am Meer',next:'NÄCHSTES ZIEL',build:'Bauen',complete:'Café fertig',
  restore:'Restaurierung',jobsFund:'Aufträge finanzieren den Ausbau',deliver:'Liefern',ready:'Bereit',missing:'Fehlt noch',
  boardTitle:'Merge-Board',boardRule:'2 gleiche Items → nächste Stufe',purpose:'Merge für Kunden. Liefere Jobs. Baue dein Café.',
  progress:'Ausbau-Fortschritt',done:'Fertig',locked:'Danach',menu:'Menü',reset:'Spielstand zurücksetzen'
};

const spriteClass=sprite=>`sprite-${sprite}`;
export function itemMarkup(item,compact=false){
  const def=itemDefinition(item);
  return def?`<span class="item-art ${spriteClass(def.sprite)}${compact?' compact':''}" aria-hidden="true"></span>`:'';
}
const customer=order=>ASSETS.customers[order.sequence%ASSETS.customers.length];
const neededByOrders=(state,item)=>item?.kind==='item'&&state.currentOrders.some(order=>order.requirements.some(req=>req.family===item.family&&req.level===item.level));
function mergeReadyIndexes(state){
  const groups=new Map();
  state.board.forEach((item,index)=>{if(item?.kind!=='item')return;const key=`${item.family}:${item.level}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(index);});
  const ready=new Set();for(const indexes of groups.values())if(indexes.length>1)indexes.forEach(index=>ready.add(index));return ready;
}

export function headerMarkup(state,menuOpen){
  return `<header class="topbar"><div class="brand">Poply<small>PLACES</small></div><div class="top-actions"><div class="resources"><span class="resource energy"><i>⚡</i>${state.energy}/${state.maxEnergy}</span><span class="resource coin"><i>●</i>${state.coins.toLocaleString('de-DE')}</span><span class="resource star"><i>★</i>${state.stars}</span></div><button class="icon-button" data-action="menu" aria-label="${COPY.menu}" aria-expanded="${menuOpen}">☰</button></div>${menuOpen?`<div class="menu-popover"><strong>Poply Places</strong><p>${COPY.purpose}</p><button data-action="reset">${COPY.reset}</button></div>`:''}</header>`;
}
export function navMarkup(view){
  return `<nav class="main-nav" aria-label="Spielbereiche">${[['place','⌂',COPY.place],['orders','☑',COPY.orders],['board','▦',COPY.board]].map(([key,icon,label])=>`<button class="nav-tab ${view===key?'active':''}" data-view="${key}" aria-pressed="${view===key}"><b>${icon}</b><span>${label}</span></button>`).join('')}</nav>`;
}

export function missionMarkup(state,compact=false){
  const status=restorationStatus(state),next=status.upgrade;
  if(!next)return `<div class="mission-card ${compact?'compact':''} complete"><div><small>${COPY.progress}</small><strong>${COPY.complete}</strong></div><span class="mission-check">✓</span></div>`;
  return `<div class="mission-card ${compact?'compact':''}"><div class="mission-copy"><small>${COPY.next}</small><strong>${next.label}</strong><span>★ ${status.current}/${status.cost}</span></div><div class="mission-progress"><i style="width:${Math.round(status.ratio*100)}%"></i></div><button data-action="build" ${state.stars<next.cost?'disabled':''}>${COPY.build}</button></div>`;
}
function requirementMarkup(state,req){
  const have=countRequirement(state,req),sample={kind:'item',family:req.family,level:req.level};
  return `<span class="need ${have>=req.qty?'met':''}">${itemMarkup(sample,true)}<b>${have}/${req.qty}</b></span>`;
}
function miniOrder(state,order){
  const ready=canFulfillOrder(state,order);
  return `<article class="mini-order ${ready?'ready':''}"><img src="${customer(order)}" alt="" class="avatar"><div class="mini-order-main"><strong>${order.title}</strong><div>${order.requirements.map(req=>requirementMarkup(state,req)).join('')}</div></div><span class="mini-reward">★${order.rewards.stars}</span>${ready?`<button data-order="${order.id}" class="mini-deliver" aria-label="${COPY.deliver}">✓</button>`:''}</article>`;
}
function focusOrder(state,order){
  const ready=canFulfillOrder(state,order);
  return `<article class="focus-order ${ready?'ready':''}"><img src="${customer(order)}" alt="" class="focus-avatar"><div class="focus-order-copy"><small>${ready?COPY.ready:COPY.missing}</small><h3>${order.title}</h3><div class="focus-needs">${order.requirements.map(req=>requirementMarkup(state,req)).join('')}</div><div class="focus-reward"><span>● ${order.rewards.coins}</span><span>★ ${order.rewards.stars}</span><b>→ ${COPY.restore}</b></div></div><button data-order="${order.id}" class="deliver-button" ${ready?'':'disabled'}>${COPY.deliver}</button></article>`;
}

function boardMarkup(state){
  const ready=mergeReadyIndexes(state);
  const cells=state.board.map((item,index)=>{
    if(!item)return `<button class="board-cell empty" data-index="${index}" aria-label="Leer"></button>`;
    const def=itemDefinition(item),generator=item.kind==='generator';
    const classes=['board-cell','occupied',generator?'generator':'',!generator&&neededByOrders(state,item)?'order-needed':'',!generator&&ready.has(index)?'merge-ready':''].filter(Boolean).join(' ');
    return `<button class="${classes}" data-index="${index}" aria-label="${def.name}">${itemMarkup(item)}${generator?'<span class="generator-mark">⚡</span>':`<span class="tier">${item.level}</span>`}${!generator&&neededByOrders(state,item)?'<span class="job-mark">★</span>':''}</button>`;
  }).join('');
  return `<section class="board-area"><div class="board-title"><div><strong>${COPY.boardTitle}</strong><small>${COPY.boardRule}</small></div><span>${state.board.filter(Boolean).length}/49</span></div><div class="board-frame"><div id="merge-board" class="merge-board">${cells}</div></div></section>`;
}
export function boardView(state){return `<main class="game-view view-board">${missionMarkup(state,true)}<section class="orders-strip">${state.currentOrders.map(order=>miniOrder(state,order)).join('')}</section>${boardMarkup(state)}</main>`;}

export function placeView(state){
  const status=restorationStatus(state),stage=state.placeUpgrades.length;
  const track=PLACE_UPGRADES.map((upgrade,index)=>{const done=state.placeUpgrades.includes(upgrade.id),current=status.upgrade?.id===upgrade.id;return `<div class="restore-step ${done?'done':current?'current':''}"><span>${done?'✓':index+1}</span><div><strong>${upgrade.label}</strong><small>${done?COPY.done:current?`★ ${status.current}/${status.cost}`:COPY.locked}</small></div></div>`;}).join('');
  return `<main class="game-view view-place"><section class="scene-card stage-${stage}"><div class="scene-shade"></div><div class="scene-label"><small>POPLY PLACE 01</small><h1>${COPY.placeName}</h1><p>${COPY.purpose}</p></div></section><section class="restoration-panel"><div class="place-summary"><div><small>${COPY.progress}</small><strong>${stage}/${PLACE_UPGRADES.length} ${COPY.done}</strong></div>${missionMarkup(state,false)}</div><div class="restore-track">${track}</div></section></main>`;
}
export function ordersView(state){return `<main class="game-view view-orders"><section class="orders-purpose"><div><small>${COPY.progress}</small><strong>${COPY.jobsFund}</strong></div>${missionMarkup(state,true)}</section><section class="focus-orders">${state.currentOrders.map(order=>focusOrder(state,order)).join('')}</section></main>`;}
