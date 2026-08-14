import { CUSTOMER_ART, customerArtUrl } from './aaa-customers.js';
import { artMarkup } from './aaa-art.js';
import { placeSceneMarkup } from './aaa-place-art.js';
import { PLACE_UPGRADES, itemDefinition, canFulfillOrder, countRequirement, restorationStatus } from './v2-game.js';

export const ASSETS={customers:CUSTOMER_ART};

export const COPY={
  place:'Place',orders:'Aufträge',board:'Board',placeName:'Café am Meer',next:'NÄCHSTES ZIEL',build:'Bauen',complete:'Café fertig',
  restore:'Restaurierung',jobsFund:'Aufträge finanzieren den Ausbau',deliver:'Liefern',ready:'Bereit',missing:'Fehlt noch',
  boardTitle:'Werkbank',boardRule:'2 gleiche Items → nächste Stufe',purpose:'Merge für Kunden. Liefere Jobs. Baue dein Café.',
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
function missingForOrder(state,order){
  return order.requirements.reduce((sum,req)=>sum+Math.max(0,req.qty-countRequirement(state,req)),0);
}
function miniOrder(state,order){
  const ready=canFulfillOrder(state,order),missing=missingForOrder(state,order);
  return `<article class="job-ticket ${ready?'ready':''}"><div class="job-person"><img src="${customer(order)}" alt="" class="job-avatar"><i></i></div><div class="job-ticket-main"><div class="job-ticket-title"><strong>${order.title}</strong><span>★${order.rewards.stars}</span></div><div class="job-ticket-needs">${order.requirements.map(req=>requirementMarkup(state,req)).join('')}</div></div>${ready?`<button data-order="${order.id}" class="job-deliver" aria-label="${COPY.deliver}">✓</button>`:`<small class="job-missing">${missing}</small>`}</article>`;
}
function focusOrder(state,order){
  const ready=canFulfillOrder(state,order),missing=missingForOrder(state,order);
  return `<article class="quest-card ${ready?'ready':''}"><div class="quest-person"><div class="quest-avatar-ring"><img src="${customer(order)}" alt=""></div><span>${ready?'BEREIT':'KUNDE WARTET'}</span></div><div class="quest-body"><div class="quest-heading"><div><small>${ready?'Alles da':'Noch zusammenstellen'}</small><h3>${order.title}</h3></div><span class="quest-status">${ready?'✓':`${missing} fehlt`}</span></div><div class="quest-needs">${order.requirements.map(req=>requirementMarkup(state,req)).join('')}</div><div class="quest-reward"><span><i>●</i><b>${order.rewards.coins}</b> Coins</span><span><i>★</i><b>${order.rewards.stars}</b> Ausbau</span></div></div><button data-order="${order.id}" class="quest-deliver" ${ready?'':'disabled'}>${ready?'Jetzt liefern':COPY.deliver}</button></article>`;
}

function boardMarkup(state){
  const ready=mergeReadyIndexes(state);
  const cells=state.board.map((item,index)=>{
    if(!item)return `<button class="board-cell empty" data-index="${index}" aria-label="Leer"></button>`;
    const def=itemDefinition(item),generator=item.kind==='generator';
    const identity=generator?'generator':`family-${item.family} tier-${item.level}`;
    const classes=['board-cell','occupied',identity,!generator&&neededByOrders(state,item)?'order-needed':'',!generator&&ready.has(index)?'merge-ready':''].filter(Boolean).join(' ');
    return `<button class="${classes}" data-index="${index}" aria-label="${def.name}">${itemMarkup(item)}${generator?'<span class="generator-mark">⚡</span>':`<span class="tier">${item.level}</span>`}${!generator&&neededByOrders(state,item)?'<span class="job-mark">★</span>':''}</button>`;
  }).join('');
  return `<section class="board-area"><div class="board-title"><div><strong>${COPY.boardTitle}</strong><small>${COPY.boardRule}</small></div><span>${state.board.filter(Boolean).length}/49</span></div><div class="board-frame"><div id="merge-board" class="merge-board">${cells}</div></div></section>`;
}
export function boardView(state){return `<main class="game-view view-board production-board">${missionMarkup(state,true)}<section class="orders-strip production-orders-strip">${state.currentOrders.map(order=>miniOrder(state,order)).join('')}</section>${boardMarkup(state)}</main>`;}

export function placeView(state){
  const status=restorationStatus(state),stage=state.placeUpgrades.length,next=status.upgrade;
  const journey=PLACE_UPGRADES.map((upgrade,index)=>{
    const done=state.placeUpgrades.includes(upgrade.id),current=next?.id===upgrade.id;
    return `<div class="journey-step ${done?'done':current?'current':'locked'}"><span>${done?'✓':index+1}</span><small>${upgrade.label}</small></div>`;
  }).join('');
  const overall=Math.round(stage/PLACE_UPGRADES.length*100);
  const story=next?UPGRADE_STORY[next.id]||'Der nächste Schritt macht deinen Place sichtbarer.':'Dein erster Poply Place ist vollständig restauriert.';
  const goal=next?`<div class="place-current-goal"><div class="goal-copy"><small>${COPY.next}</small><strong>${next.label}</strong><p>${story}</p><span>★ ${status.current}/${status.cost}</span></div><button data-action="build" ${state.stars<next.cost?'disabled':''}>${COPY.build}</button></div>`:`<div class="place-current-goal complete"><div class="goal-copy"><small>${COPY.progress}</small><strong>${COPY.complete}</strong><p>${story}</p></div><span class="goal-complete-mark">✓</span></div>`;
  return `<main class="game-view view-place production-place"><section class="world-hero" data-stage="${stage}"><div class="world-art">${placeSceneMarkup(stage)}</div><div class="world-vignette"></div><div class="world-copy"><span class="world-kicker">POPLY PLACE 01 · KÜSTE</span><h1>${COPY.placeName}</h1><p>${stage?`${stage} von ${PLACE_UPGRADES.length} Ausbauten fertig`:'Dein erster Place wartet auf dich'}</p></div><div class="world-progress"><b>${stage}</b><span>/ ${PLACE_UPGRADES.length}</span></div></section><section class="place-command"><div class="place-progress-row"><div class="place-progress-dial" style="--progress:${overall}%"><div><b>${stage}</b><small>/6</small></div></div>${goal}</div><div class="journey-wrap"><div class="journey-head"><strong>DEIN CAFÉ WÄCHST</strong><span>${overall}%</span></div><div class="journey-line"><i style="width:${overall}%"></i></div><div class="journey-steps">${journey}</div></div></section></main>`;
}
export function ordersView(state){
  const status=restorationStatus(state),next=status.upgrade;
  return `<main class="game-view view-orders production-orders"><section class="orders-hero"><div><small>HEUTIGE JOBS</small><h2>Gäste glücklich machen</h2><p>${next?`Jeder Auftrag bringt dich näher zu „${next.label}“.`:'Dein Café ist fertig – sammle weiter Coins.'}</p></div><div class="orders-goal"><span>★</span><div><small>Ausbau</small><strong>${next?`${status.current}/${status.cost}`:'Fertig'}</strong></div></div></section><section class="quest-list">${state.currentOrders.map(order=>focusOrder(state,order)).join('')}</section><footer class="orders-footnote">Liefern → Sterne sammeln → ${next?next.label:'Place abschließen'}</footer></main>`;
}
