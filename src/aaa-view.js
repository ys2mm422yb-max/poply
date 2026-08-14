import { CUSTOMER_ART, customerArtUrl } from './aaa-customers.js';
import { artMarkup } from './aaa-art.js';
import { placeSceneMarkup } from './aaa-place-art.js';
import { itemDefinition, canFulfillOrder, countRequirement, restorationStatus, activePlaceDefinition, nextPlaceId, PLACE_DEFINITIONS } from './v2-game.js';

export const ASSETS={customers:CUSTOMER_ART};

export const COPY={
  place:'Place',orders:'Aufträge',board:'Board',next:'NÄCHSTES ZIEL',build:'Bauen',complete:'Place fertig',
  restore:'Restaurierung',jobsFund:'Aufträge finanzieren den Ausbau',deliver:'Liefern',ready:'Bereit',missing:'Fehlt noch',
  boardTitle:'Werkbank',boardRule:'Gleiche Items zusammenziehen',purpose:'Merge für Kunden. Liefere Jobs. Baue deinen Place.',
  progress:'Ausbau-Fortschritt',done:'Fertig',locked:'Danach',menu:'Menü',reset:'Spielstand zurücksetzen'
};

const ICONS={
  energy:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.4 1.8 5.8 13h5l-.4 9.2L18.2 11h-5.1l.3-9.2Z" fill="currentColor"/></svg>',
  coin:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="currentColor"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.6"/></svg>',
  star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.6 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 16.9l-5.7 2.9 1.1-6.2-4.5-4.4 6.3-.9L12 16.9l-5.7 2.9 1.1-6.2-4.5-4.4 6.3-.9L12 2.6Z" fill="currentColor"/></svg>',
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
const unlockLabel=upgrade=>upgrade?.unlock?.label||null;
export function missionMarkup(state,compact=false){
  const status=restorationStatus(state),next=status.upgrade,following=nextPlaceId(state);
  if(!next&&following){const target=PLACE_DEFINITIONS[following];return `<div class="mission-card ${compact?'compact':''} complete next-place-ready"><div><small>PLACE KOMPLETT</small><strong>${target.label}</strong><em>Neuer Ort freigeschaltet</em></div><button data-action="next-place">Weiter</button></div>`;}
  if(!next)return `<div class="mission-card ${compact?'compact':''} complete"><div><small>${COPY.progress}</small><strong>${COPY.complete}</strong></div><span class="mission-check">${iconMarkup('check')}</span></div>`;
  return `<div class="mission-card ${compact?'compact':''}"><div class="mission-copy"><small>${COPY.next}</small><strong>${next.label}</strong><span>${iconMarkup('star')} ${status.current}/${status.cost}</span>${unlockLabel(next)?`<em class="mission-unlock">Freischaltung · ${unlockLabel(next)}</em>`:''}</div><div class="mission-progress"><i style="width:${Math.round(status.ratio*100)}%"></i></div><button data-action="build" ${state.stars<next.cost?'disabled':''}>${COPY.build}</button></div>`;
}
function requirementMarkup(state,req){
  const have=countRequirement(state,req),sample={kind:'item',family:req.family,level:req.level};
  return `<span class="need ${have>=req.qty?'met':''}">${itemMarkup(sample,true)}<b>${have}/${req.qty}</b></span>`;
}
function missingForOrder(state,order){return order.requirements.reduce((sum,req)=>sum+Math.max(0,req.qty-countRequirement(state,req)),0);}
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
  return `<article class="service-card ${ready?'ready':''}" data-service-order="${order.id}"><div class="service-customer"><div class="service-avatar-ring"><img src="${customer(order)}" alt="" class="service-avatar"></div><span>${ready?'BEREIT ZUM SERVIEREN':'GAST WARTET'}</span></div><div class="service-content"><div class="service-heading"><small>${ready?'Alles vorbereitet':'Noch zusammenstellen'}</small><h2>${order.title}</h2><span class="service-status">${ready?iconMarkup('check'):`${missing} fehlt`}</span></div><div class="service-needs">${order.requirements.map(req=>requirementMarkup(state,req)).join('')}</div><div class="service-rewards"><span>${iconMarkup('coin')}<b>${order.rewards.coins}</b><small>Coins</small></span><span>${iconMarkup('star')}<b>${order.rewards.stars}</b><small>Ausbau</small></span></div><div class="service-purpose"><span>${iconMarkup('star')}</span><p>${next?`Dieser Auftrag finanziert <strong>${next.label}</strong>.`:'Dieser Auftrag stärkt deinen nächsten Poply Place.'}</p></div></div><button data-order="${order.id}" class="service-deliver" ${ready?'':'disabled'}>${ready?'Jetzt servieren':COPY.deliver}</button></article>`;
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
export function boardView(state){return `<main class="game-view view-board production-board qa-board" data-place="${state.currentPlace}">${missionMarkup(state,true)}<section class="board-jobs" aria-label="Aktive Aufträge">${state.currentOrders.map(order=>boardJob(state,order)).join('')}</section>${boardMarkup(state)}</main>`;}

export function placeView(state){
  const definition=activePlaceDefinition(state),upgrades=definition.upgrades,status=restorationStatus(state),stage=state.placeUpgrades.length,next=status.upgrade,following=nextPlaceId(state);
  const journey=upgrades.map((upgrade,index)=>{const done=state.placeUpgrades.includes(upgrade.id),current=next?.id===upgrade.id;return `<div class="journey-step ${done?'done':current?'current':'locked'}"><span>${done?'✓':index+1}</span><small>${upgrade.label}</small></div>`;}).join('');
  const overall=Math.round(stage/upgrades.length*100);
  let goal='';
  if(next){goal=`<div class="place-current-goal"><div class="goal-copy"><small>${COPY.next}</small><strong>${next.label}</strong><p>${next.copy}</p><span>${iconMarkup('star')} ${status.current}/${status.cost}</span>${unlockLabel(next)?`<em class="unlock-reward">FREISCHALTUNG · ${unlockLabel(next)}</em>`:''}</div><button data-action="build" ${state.stars<next.cost?'disabled':''}>${COPY.build}</button></div>`;}
  else if(following){const target=PLACE_DEFINITIONS[following];goal=`<div class="place-current-goal complete place-transition"><div class="goal-copy"><small>PLACE ${String(definition.number).padStart(2,'0')} KOMPLETT</small><strong>${target.label} freigeschaltet</strong><p>Dein Board bleibt. Neue Gäste und ein neuer Ausbau warten am Hafen.</p><em class="unlock-reward">NEUER ORT · POPLY PLACE ${String(target.number).padStart(2,'0')}</em></div><button data-action="next-place">Place öffnen</button></div>`;}
  else{goal=`<div class="place-current-goal complete"><div class="goal-copy"><small>${COPY.progress}</small><strong>${definition.label} komplett</strong><p>Dieser Poply Place ist vollständig ausgebaut.</p></div><span class="goal-complete-mark">${iconMarkup('check')}</span></div>`;}
  return `<main class="game-view view-place production-place" data-place="${definition.id}"><section class="world-hero" data-stage="${stage}" data-place="${definition.id}"><div class="world-art">${placeSceneMarkup(stage,definition.id)}</div><div class="world-vignette"></div><div class="world-copy"><span class="world-kicker">POPLY PLACE ${String(definition.number).padStart(2,'0')} · ${definition.kicker}</span><h1>${definition.label}</h1><p>${stage?`${stage} von ${upgrades.length} Ausbauten fertig`:'Ein neuer Place wartet auf dich'}</p></div><div class="world-progress"><b>${stage}</b><span>/ ${upgrades.length}</span></div></section><section class="place-command"><div class="place-progress-row"><div class="place-progress-dial" style="--progress:${overall}%"><div><b>${stage}</b><small>/${upgrades.length}</small></div></div>${goal}</div><div class="journey-wrap"><div class="journey-head"><strong>${definition.id==='coast'?'DEIN CAFÉ WÄCHST':'DEIN HAFEN-POP-UP WÄCHST'}</strong><span>${overall}%</span></div><div class="journey-line"><i style="width:${overall}%"></i></div><div class="journey-steps">${journey}</div></div></section></main>`;
}
export function resolveSelectedOrder(state,selectedOrderId){return state.currentOrders.find(order=>order.id===selectedOrderId)||state.currentOrders[0]||null;}
export function ordersView(state,selectedOrderId=null){
  const definition=activePlaceDefinition(state),status=restorationStatus(state),next=status.upgrade,selected=resolveSelectedOrder(state,selectedOrderId);
  const heading=definition.id==='coast'?'Ein Gast. Ein klares Ziel.':'Neue Gäste am Hafen.';
  return `<main class="game-view view-orders service-orders" data-place="${definition.id}"><section class="service-hero"><div><small>${definition.id==='coast'?'HEUTIGE GÄSTE':'HAFENGÄSTE'}</small><h2>${heading}</h2><p>${next?`Serviere Bestellungen und finanziere „${next.label}“.`:`${definition.label} ist komplett – sammle weiter Coins.`}</p></div><div class="service-goal">${iconMarkup('star')}<div><small>Ausbau</small><strong>${next?`${status.current}/${status.cost}`:'Fertig'}</strong></div></div></section><section class="customer-queue" aria-label="Aktive Gäste">${state.currentOrders.map(order=>orderChoice(state,order,selected?.id===order.id)).join('')}</section>${selected?serviceOrder(state,selected,next):''}<footer class="service-footnote">Board → Auftrag vorbereiten → servieren → ${next?next.label:definition.label}</footer></main>`;
}
