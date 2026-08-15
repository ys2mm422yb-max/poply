import { CUSTOMER_ART, customerArtUrl } from './aaa-customers.js';
import { artMarkup } from './aaa-art.js';
import { canRenderSunsetArt, sunsetArtMarkup } from './aaa-sunset-art.js';
import { canRenderGardenArt, gardenArtMarkup } from './aaa-garden-art.js';
import { placeSceneMarkup } from './aaa-place-art.js';
import { sunsetPlaceSceneMarkup } from './aaa-sunset-place.js';
import { gardenPlaceSceneMarkup } from './aaa-garden-place.js';
import { itemDefinition, canFulfillOrder, countRequirement, restorationStatus, activePlaceChapter, currentChapterProgress, generatorProductionStatus } from './v2-game.js';

export const ASSETS={customers:CUSTOMER_ART};

export const COPY={
  place:'Place',orders:'Aufträge',board:'Board',next:'NÄCHSTES ZIEL',build:'Bauen',complete:'Place fertig',
  restore:'Restaurierung',jobsFund:'Aufträge finanzieren den Ausbau',deliver:'Liefern',ready:'Bereit',missing:'Fehlt noch',
  boardTitle:'Werkbank',boardRule:'Gleiches mergen',purpose:'Merge für Kunden. Liefere Jobs. Baue deine Places.',
  progress:'Ausbau-Fortschritt',done:'Fertig',locked:'Danach',menu:'Menü',reset:'Spielstand zurücksetzen'
};

const UPGRADE_STORY={
  lights:'Abends sichtbar und einladend',
  counter:'Mehr Platz für Service und neue Bestellungen',
  menu:'Das Café bekommt seine eigene Handschrift',
  seating:'Aus Laufkundschaft werden Stammgäste',
  terrace:'Mehr Gäste, Meerblick und längere Abende',
  sign:'Der erste Poply Place ist komplett – Sonnenkai wartet',
  'sunset-lanterns':'Der Kai bekommt seine warme Abendstimmung',
  'sunset-bar':'Die Tropenbar wird zum neuen Produktionsherz',
  'sunset-lounge':'Gäste bleiben länger und bestellen mehr',
  'sunset-fire':'Nach Sonnenuntergang entsteht ein echter Treffpunkt',
  'sunset-stage':'Musik macht aus dem Deck einen Abend-Place',
  'sunset-sign':'Sonnenkai ist komplett – der Dachgarten wartet',
  'garden-glass':'Das Gewächshaus fängt Licht und schützt die erste Ernte',
  'garden-beds':'Kräuter und Blüten geben dem Dach seine grüne Identität',
  'garden-bar':'Frische Ernte wird direkt zum neuen Gäste-Erlebnis',
  'garden-seating':'Zwischen den Beeten entstehen ruhige Plätze über der Stadt',
  'garden-lights':'Der Garten bleibt auch am Abend hell und lebendig',
  'garden-sign':'Der Dachgarten ist vollständig und über der Stadt sichtbar'
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
  const markup=canRenderGardenArt(def.art)?gardenArtMarkup(def.art):canRenderSunsetArt(def.art)?sunsetArtMarkup(def.art):artMarkup(def.art);
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
  const chapter=activePlaceChapter(state);
  return `<header class="topbar"><div class="brand">Poply<small>PLACES</small></div><div class="top-actions"><div class="resources"><span class="resource energy">${iconMarkup('energy')}<b>${state.energy}/${state.maxEnergy}</b></span><span class="resource coin">${iconMarkup('coin')}<b>${state.coins.toLocaleString('de-DE')}</b></span><span class="resource star">${iconMarkup('star')}<b>${state.stars}</b></span></div><button class="icon-button" data-action="menu" aria-label="${COPY.menu}" aria-expanded="${menuOpen}">${iconMarkup('menu')}</button></div>${menuOpen?`<div class="menu-popover"><strong>Poply Places</strong><p>Aktiv: Place 0${chapter.number} · ${chapter.label}</p><button data-action="reset">${COPY.reset}</button></div>`:''}</header>`;
}
const NAV_ITEMS=[['place','place',COPY.place],['orders','orders',COPY.orders],['board','board',COPY.board]];
export function navMarkup(view){
  return `<nav class="main-nav" aria-label="Spielbereiche">${NAV_ITEMS.map(([key,icon,label])=>`<button class="nav-tab ${view===key?'active':''}" data-view="${key}" aria-pressed="${view===key}"><b class="nav-icon">${iconMarkup(icon)}</b><span>${label}</span></button>`).join('')}</nav>`;
}

export function missionMarkup(state,compact=false){
  const status=restorationStatus(state),next=status.upgrade;
  if(!next)return `<div class="mission-card ${compact?'compact':''} complete"><div><small>${COPY.progress}</small><strong>${status.chapter.label} fertig</strong></div><span class="mission-check">${iconMarkup('check')}</span></div>`;
  return `<div class="mission-card ${compact?'compact':''}"><div class="mission-copy"><small>${COPY.next}</small><strong>${next.label}</strong><span>${iconMarkup('star')} ${status.current}/${status.cost}</span></div><div class="mission-progress"><i style="width:${Math.round(status.ratio*100)}%"></i></div><button data-action="build" ${state.stars<next.cost?'disabled':''}>${COPY.build}</button></div>`;
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
  return `<article class="service-card ${ready?'ready':''}" data-service-order="${order.id}"><div class="service-customer"><div class="service-avatar-ring"><img src="${customer(order)}" alt="" class="service-avatar"></div><span>${ready?'BEREIT ZUM SERVIEREN':'GAST WARTET'}</span></div><div class="service-content"><div class="service-heading"><small>${ready?'Alles vorbereitet':'Noch zusammenstellen'}</small><h2>${order.title}</h2><span class="service-status">${ready?iconMarkup('check'):`${missing} fehlt`}</span></div><div class="service-needs">${order.requirements.map(req=>requirementMarkup(state,req)).join('')}</div><div class="service-rewards"><span>${iconMarkup('coin')}<b>${order.rewards.coins}</b><small>Coins</small></span><span>${iconMarkup('star')}<b>${order.rewards.stars}</b><small>Ausbau</small></span></div><div class="service-purpose"><span>${iconMarkup('star')}</span><p>${next?`Dieser Auftrag finanziert <strong>${next.label}</strong>.`:'Dieser Auftrag füllt deine Place-Kasse.'}</p></div></div><button data-order="${order.id}" class="service-deliver" ${ready?'':'disabled'}>${ready?'Jetzt servieren':COPY.deliver}</button></article>`;
}
function generatorCycleMarkup(item){
  const cycle=generatorProductionStatus(item);if(!cycle)return '';
  return `<span class="generator-cycle ${cycle.bonusNext?'bonus-ready':''}" aria-hidden="true"><span class="generator-cycle-dots">${Array.from({length:cycle.total},(_,index)=>`<i class="${index<cycle.progress?'filled':''}"></i>`).join('')}</span><b>${cycle.bonusNext?'BONUS':`${cycle.nextStep}/${cycle.total}`}</b></span>`;
}

function boardMarkup(state){
  const ready=mergeReadyIndexes(state);
  const cells=state.board.map((item,index)=>{
    if(!item)return `<button class="board-cell empty calm-empty" data-index="${index}" aria-label="Leer"></button>`;
    const def=itemDefinition(item),generator=item.kind==='generator',cycle=generator?generatorProductionStatus(item):null;
    const identity=generator?`generator generator-${item.generator}`:`family-${item.family} tier-${item.level}`;
    const classes=['board-cell','occupied',identity,!generator&&neededByOrders(state,item)?'order-needed':'',!generator&&ready.has(index)?'merge-ready':'',cycle?.bonusNext?'generator-bonus-ready':''].filter(Boolean).join(' ');
    const cycleLabel=cycle?`, ${cycle.bonusNext?'Erntebonus bereit':`Erntebonus Schritt ${cycle.nextStep} von ${cycle.total}`}`:'';
    return `<button class="${classes}" data-index="${index}" aria-label="${def.name}${cycleLabel}">${itemMarkup(item)}${generator?'<span class="generator-mark">'+iconMarkup('energy')+'</span>'+generatorCycleMarkup(item):`<span class="tier">${item.level}</span>`}${!generator&&neededByOrders(state,item)?'<span class="job-mark">'+iconMarkup('star')+'</span>':''}</button>`;
  }).join('');
  return `<section class="board-area"><div class="board-title"><div><strong>${COPY.boardTitle}</strong><small>${COPY.boardRule}</small></div><span>${state.board.filter(Boolean).length}/49</span></div><div class="board-frame board-surface"><div id="merge-board" class="merge-board">${cells}</div></div></section>`;
}
export function boardView(state){
  const chapter=activePlaceChapter(state);
  return `<main class="game-view view-board production-board qa-board chapter-${chapter.id}">${missionMarkup(state,true)}<section class="board-jobs" aria-label="Aktive Aufträge">${state.currentOrders.map(order=>boardJob(state,order)).join('')}</section>${boardMarkup(state)}</main>`;
}

const placeArt=(chapter,stage)=>chapter.id==='garden'?gardenPlaceSceneMarkup(stage):chapter.id==='sunset'?sunsetPlaceSceneMarkup(stage):placeSceneMarkup(stage);
const placeIntro=(chapter,stage,total)=>stage?`${stage} von ${total} Ausbauten fertig`:chapter.id==='garden'?'Frische Ernte über den Dächern.':chapter.id==='sunset'?'Neuer Place. Neue Produkte. Neuer Abend.':'Dein erster Place wartet auf dich';
const placeGrowth=chapter=>chapter.id==='garden'?'DEIN DACHGARTEN WÄCHST':chapter.id==='sunset'?'DEIN SONNENKAI WÄCHST':'DEIN CAFÉ WÄCHST';
export function placeView(state){
  const status=restorationStatus(state),{chapter,completed:stage,total}=currentChapterProgress(state),next=status.upgrade;
  const journey=chapter.upgrades.map((upgrade,index)=>{
    const done=state.placeUpgrades.includes(upgrade.id),current=next?.id===upgrade.id;
    return `<div class="journey-step ${done?'done':current?'current':'locked'}"><span>${done?'✓':index+1}</span><small>${upgrade.label}</small></div>`;
  }).join('');
  const overall=Math.round(stage/total*100);
  const story=next?UPGRADE_STORY[next.id]||'Der nächste Schritt macht deinen Place sichtbarer.':`${chapter.label} ist vollständig restauriert.`;
  const goal=next?`<div class="place-current-goal"><div class="goal-copy"><small>${COPY.next}</small><strong>${next.label}</strong><p>${story}</p><span>${iconMarkup('star')} ${status.current}/${status.cost}</span></div><button data-action="build" ${state.stars<next.cost?'disabled':''}>${COPY.build}</button></div>`:`<div class="place-current-goal complete"><div class="goal-copy"><small>${COPY.progress}</small><strong>${chapter.label} fertig</strong><p>${story}</p></div><span class="goal-complete-mark">${iconMarkup('check')}</span></div>`;
  const art=placeArt(chapter,stage),intro=placeIntro(chapter,stage,total),growth=placeGrowth(chapter);
  return `<main class="game-view view-place production-place place-${chapter.id}"><section class="world-hero" data-stage="${stage}" data-place="${chapter.id}"><div class="world-art">${art}</div><div class="world-vignette"></div><div class="world-copy"><span class="world-kicker">POPLY PLACE 0${chapter.number} · ${chapter.kicker}</span><h1>${chapter.label}</h1><p>${intro}</p></div><div class="world-progress"><b>${stage}</b><span>/ ${total}</span></div></section><section class="place-command"><div class="place-progress-row"><div class="place-progress-dial" style="--progress:${overall}%"><div><b>${stage}</b><small>/${total}</small></div></div>${goal}</div><div class="journey-wrap"><div class="journey-head"><strong>${growth}</strong><span>${overall}%</span></div><div class="journey-line"><i style="width:${overall}%"></i></div><div class="journey-steps">${journey}</div></div></section></main>`;
}
export function resolveSelectedOrder(state,selectedOrderId){return state.currentOrders.find(order=>order.id===selectedOrderId)||state.currentOrders[0]||null;}
export function ordersView(state,selectedOrderId=null){
  const status=restorationStatus(state),next=status.upgrade,selected=resolveSelectedOrder(state,selectedOrderId),chapter=activePlaceChapter(state);
  return `<main class="game-view view-orders service-orders chapter-${chapter.id}"><section class="service-hero"><div><small>HEUTIGE GÄSTE · PLACE 0${chapter.number}</small><h2>Ein Gast. Ein klares Ziel.</h2><p>${next?`Serviere Bestellungen und finanziere „${next.label}“.`:`${chapter.label} ist fertig – sammle weiter Coins.`}</p></div><div class="service-goal">${iconMarkup('star')}<div><small>Ausbau</small><strong>${next?`${status.current}/${status.cost}`:'Fertig'}</strong></div></div></section><section class="customer-queue" aria-label="Aktive Gäste">${state.currentOrders.map(order=>orderChoice(state,order,selected?.id===order.id)).join('')}</section>${selected?serviceOrder(state,selected,next):''}<footer class="service-footnote">Board → Auftrag vorbereiten → servieren → ${next?next.label:'Coins sammeln'}</footer></main>`;
}
