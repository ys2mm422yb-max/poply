import { CUSTOMER_ART, customerArtUrl } from './aaa-customers.js';
import { artMarkup } from './aaa-art.js';
import { placeSceneMarkup } from './aaa-place-art.js';
import { PLACE_UPGRADES, itemDefinition, canFulfillOrder, countRequirement, restorationStatus } from './v2-game.js';

export const ASSETS={customers:CUSTOMER_ART};

export const COPY={
  place:'Place',orders:'Aufträge',board:'Board',placeName:'Café am Meer',next:'NÄCHSTES ZIEL',build:'Bauen',complete:'Café fertig',
  restore:'Restaurierung',jobsFund:'Aufträge finanzieren den Ausbau',deliver:'Liefern',ready:'Bereit',missing:'Fehlt noch',
  boardTitle:'Werkbank',boardRule:'Gleiche Items zusammenziehen',purpose:'Merge für Kunden. Liefere Jobs. Baue dein Café.',
  progress:'Ausbau-Fortschritt',done:'Fertig',locked:'Danach',menu:'Menü',reset:'Spielstand zurücksetzen'
};

const UPGRADE_STORY={
  lights:'Abends sichtbar und einladend',
  counter:'Mehr Platz für Service und neue Bestellungen',
  menu:'Das Café bekommt seine eigene Handschrift',
  seating:'Aus Laufkundschaft werden Stammgäste',
  terrace:'Mehr Gäste, Meerblick und längere Abende',
  sign:'Der erste Poply Place ist komplett'
};

const ICONS={
  energy:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.4 1.8 5.8 13h5l-.4 9.2L18.2 11h-5.1l.3-9.2Z" fill="currentColor"/></svg>',
  coin:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="currentColor"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.6"/></svg>',
  star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.6 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 16.9l-5.7 2.9 1.1-6.2-4.5-4.4 6.3-.9L12 2.6Z" fill="currentColor"/></svg>',
  menu:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  place:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 11.2 12 4.8l7.5 6.4v8H5v-8Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M9.5 19.2v-5.4h5v5.4" fill="none" stroke="currentColor" stroke-width="1.9"/></svg>',
  orders:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4.5" width="14" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="m8.2 9.8 1.6 1.6 3-3M8.2 15h7.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  board:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.5 5v14M14.5 5v14M5 9.5h14M5 14.5h14" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".78"/></svg>',
  check:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5.2 12.4 4.1 4.1 9.5-9.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
const iconMarkup=name=>`<span class="ui-icon icon-${name}">${ICONS[name]||''}</span>`;

export function itemMarkup(item,compact=false){
  const def=itemDefinition(item);
  if(!def)return '';
  const markup=artMarkup(def.art);
  return compact?markup.replace('class="item-art ','class="item-art compact '):markup;
}
const customer=order=>customerArtUrl(order.sequence);
const neededByOrders=(state,item)=>item?.kind==='item'&&state.currentOrders.some(order=>order.requirements.some(req=>req.family===item.family&&req.level===item.level));
function mergeReadyIndexes(state){
  const groups=new Map();
  state.board.forEach((item,index)=>{if(item?.kind!=='item')return;const key=`${item.family}:${item.level}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(index);});
  const ready=new Set();for(const indexes of groups.values())if(indexes.length>1)indexes.forEach(index=>ready.add(index));return ready;
}

export function headerMarkup(state,menuOpen){
  return `<header class="topbar"><div class="brand">Poply<small>PLACES</small></div><div class="top-actions"><div class="resources"><span class="resource energy">${iconMarkup('energy')}<b>${state.energy}/${state.maxEnergy}</b></span><span class="resource coin">${iconMarkup('coin')}<b>${state.coins.toLocaleString('de-DE')}</b></span><span class="resource star">${iconMarkup('star')}<b>${state.stars}</b></span></div><button class="icon-button" data-action="menu" aria-label="${COPY.menu}" aria-expanded="${menuOpen}">${iconMarkup('menu')}</button></div>${menuOpen?`<div class="menu-popover"><strong>Poply Places</strong><p>${COPY.purpose}</p><button data-action="reset">${COPY.reset}</button></div>`:''}</header>`;
}
const NAV_ITEMS=[['place','place',COPY.place],['orders','orders',COPY.orders],['board','board',COPY.board]];
export function navMarkup(view){
  return `<nav class="main-nav" aria-label="Spielbereiche">${NAV_ITEMS.map(([key,icon,label])=>`<button class="nav-tab ${view===key?'active':''}" data-view="${key}" aria-pressed="${view===key}"><b class="nav-icon">${iconMarkup(icon)}</b><span>${label}</span></button>`).join('')}</nav>`;
}

export function missionMarkup(state,compact=false){
  const status=restorationStatus(state),next=status.upgrade;
  if(!next)return `<div class="mission-card ${compact?'compact':''} complete"><div><small>${COPY.progress}</small><strong>${COPY.complete}</strong></div><span class="mission-check">${iconMarkup('check')}</span></div>`;
  return `<div class="mission-card ${compact?'compact':''}"><div class="mission-copy"><small>${COPY.next}</small><strong>${next.label}</strong><span>${iconMarkup('star')} ${status.current}/${status.cost}</span></div><div class="mission-progress"><i style="width:${Math.round(status.ratio*100)}%"></i></div><button data-action="build" ${state.stars<next.cost?'disabled':''}>${COPY.build}</button></div>`;
}
function requirementMarkup(state,req){
  const have=countRequirement(state,req),sample={kind:'item',family:req.family,level:req.level};
  return `<span class="need ${have>=req.qty?'met':''}">${itemMarkup(sample,true)}<b>${have}/${req.qty}</b></span>`;
}
function missingForOrder(state,order){
  return order.requirements.reduce((sum,req)=>sum+Math.max(0,req.qty-countRequirement(state,req)),0);
}
function boardJob(state,order){
  const ready=canFulfillOrder(state,order),missing=missingForOrder(state,order);
  return `<button class="board-job ${ready?'ready':''}" data-focus-order="${order.id}" aria-label="Auftrag ${order.title} öffnen" title="${order.title}"><span class="board-job-person"><img src="${customer(order)}" alt="" class="board-job-avatar"><i></i></span><span class="board-job-needs">${order.requirements.map(req=>requirementMarkup(state,req)).join('')}</span><span class="board-job-reward">${iconMarkup('star')}<b>${order.rewards.stars}</b></span><span class="board-job-status">${ready?iconMarkup('check'):missing}</span></button>`;
}
function orderChoice(state,order,selected){
  const ready=canFulfillOrder(state,order),missing=missingForOrder(state,order);
  return `<button class="customer-choice ${selected?'selected':''} ${ready?'ready':''}" data-select-order="${order.id}" aria-pressed="${selected}"><span class="choice-avatar"><img src="${customer(order)}" alt=""><i></i></span><strong>${order.title}</strong><small>${ready?'Bereit':`${missing} fehlt`}</small></button>`;
}
function serviceOrder(state,order,next){
  const ready=canFulfillOrder(state,order),missing=missingForOrder(state,order);
  return `<article class="service-card ${ready?'ready':''}" data-service-order="${order.id}"><div class="service-customer"><div class="service-avatar-ring"><img src="${customer(order)}" alt="" class="service-avatar"></div><span>${ready?'BEREIT ZUM SERVIEREN':'GAST WARTET'}</span></div><div class="service-content"><div class="service-heading"><small>${ready?'Alles vorbereitet':'Noch zusammenstellen'}</small><h2>${order.title}</h2><span class="service-status">${ready?iconMarkup('check'):`${missing} fehlt`}</span></div><div class="service-needs">${order.requirements.map(req=>requirementMarkup(state,req)).join('')}</div><div class="service-rewards"><span>${iconMarkup('coin')}<b>${order.rewards.coins}</b><small>Coins</small></span><span>${iconMarkup('star')}<b>${order.rewards.stars}</b><small>Ausbau</small></span></div><div class="service-purpose"><span>${iconMarkup('star')}</span><p>${next?`Dieser Auftrag finanziert <strong>${next.label}</strong>.`:'Dieser Auftrag füllt deine Café-Kasse.'}</p></div></div><button data-order="${order.id}" class="service-deliver" ${ready?'':'disabled'}>${ready?'Jetzt servieren':COPY.deliver}</button></article>`;
}

function boardMarkup(state){
  const ready=mergeReadyIndexes(state);
  const cells=state.board.map((item,index)=>{
    if(!item)return `<button class="board-cell empty calm-empty" data-index="${index}" aria-label="Leer"></button>`;
    const def=itemDefinition(item),generator=item.kind==='generator';
    const identity=generator?'generator':`family-${item.family} tier-${item.level}`;
    const classes=['board-cell','occupied',identity,!generator&&neededByOrders(state,item)?'order-needed':'',!generator&&ready.has(index)?'merge-ready':''].filter(Boolean).join(' ');
    return `<button class="${classes}" data-index="${index}" aria-label="${def.name}">${itemMarkup(item)}${generator?'<span class="generator-mark">'+iconMarkup('energy')+'</span>':`<span class="tier">${item.level}</span>`}${!generator&&neededByOrders(state,item)?'<span class="job-mark">'+iconMarkup('star')+'</span>':''}</button>`;
  }).join('');
  return `<section class="board-area"><div class="board-title"><div><strong>${COPY.boardTitle}</strong><small>${COPY.boardRule}</small></div><span>${state.board.filter(Boolean).length}/49</span></div><div class="board-frame board-surface"><div id="merge-board" class="merge-board">${cells}</div></div></section>`;
}
export function boardView(state){return `<main class="game-view view-board production-board qa-board">${missionMarkup(state,true)}<section class="board-jobs" aria-label="Aktive Aufträge">${state.currentOrders.map(order=>boardJob(state,order)).join('')}</section>${boardMarkup(state)}</main>`;}

export function placeView(state){
  const status=restorationStatus(state),stage=state.placeUpgrades.length,next=status.upgrade;
  const journey=PLACE_UPGRADES.map((upgrade,index)=>{
    const done=state.placeUpgrades.includes(upgrade.id),current=next?.id===upgrade.id;
    return `<div class="journey-step ${done?'done':current?'current':'locked'}"><span>${done?'✓':index+1}</span><small>${upgrade.label}</small></div>`;
  }).join('');
  const overall=Math.round(stage/PLACE_UPGRADES.length*100);
  const story=next?UPGRADE_STORY[next.id]||'Der nächste Schritt macht deinen Place sichtbarer.':'Dein erster Poply Place ist vollständig restauriert.';
  const goal=next?`<div class="place-current-goal"><div class="goal-copy"><small>${COPY.next}</small><strong>${next.label}</strong><p>${story}</p><span>${iconMarkup('star')} ${status.current}/${status.cost}</span></div><button data-action="build" ${state.stars<next.cost?'disabled':''}>${COPY.build}</button></div>`:`<div class="place-current-goal complete"><div class="goal-copy"><small>${COPY.progress}</small><strong>${COPY.complete}</strong><p>${story}</p></div><span class="goal-complete-mark">${iconMarkup('check')}</span></div>`;
  return `<main class="game-view view-place production-place"><section class="world-hero" data-stage="${stage}"><div class="world-art">${placeSceneMarkup(stage)}</div><div class="world-vignette"></div><div class="world-copy"><span class="world-kicker">POPLY PLACE 01 · KÜSTE</span><h1>${COPY.placeName}</h1><p>${stage?`${stage} von ${PLACE_UPGRADES.length} Ausbauten fertig`:'Dein erster Place wartet auf dich'}</p></div><div class="world-progress"><b>${stage}</b><span>/ ${PLACE_UPGRADES.length}</span></div></section><section class="place-command"><div class="place-progress-row"><div class="place-progress-dial" style="--progress:${overall}%"><div><b>${stage}</b><small>/6</small></div></div>${goal}</div><div class="journey-wrap"><div class="journey-head"><strong>DEIN CAFÉ WÄCHST</strong><span>${overall}%</span></div><div class="journey-line"><i style="width:${overall}%"></i></div><div class="journey-steps">${journey}</div></div></section></main>`;
}
export function resolveSelectedOrder(state,selectedOrderId){
  return state.currentOrders.find(order=>order.id===selectedOrderId)||state.currentOrders[0]||null;
}
export function ordersView(state,selectedOrderId=null){
  const status=restorationStatus(state),next=status.upgrade,selected=resolveSelectedOrder(state,selectedOrderId);
  return `<main class="game-view view-orders service-orders"><section class="service-hero"><div><small>HEUTIGE GÄSTE</small><h2>Ein Gast. Ein klares Ziel.</h2><p>${next?`Serviere Bestellungen und finanziere „${next.label}“.`:'Dein Café ist fertig – sammle weiter Coins.'}</p></div><div class="service-goal">${iconMarkup('star')}<div><small>Ausbau</small><strong>${next?`${status.current}/${status.cost}`:'Fertig'}</strong></div></div></section><section class="customer-queue" aria-label="Aktive Gäste">${state.currentOrders.map(order=>orderChoice(state,order,selected?.id===order.id)).join('')}</section>${selected?serviceOrder(state,selected,next):''}<footer class="service-footnote">Board → Auftrag vorbereiten → servieren → ${next?next.label:'Coins sammeln'}</footer></main>`;
}
