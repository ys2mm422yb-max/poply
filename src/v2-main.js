import { HERO_IMAGE } from './v2-hero-data.js';
import { ATLAS_IMAGE } from './v2-atlas-data.js';
import { CUSTOMER_A } from './v2-customer-a.js';
import { CUSTOMER_B } from './v2-customer-b.js';
import { CUSTOMER_C } from './v2-customer-c.js';
import { ITEM_FAMILIES, createInitialState, normalizeState, itemDefinition, generateFromSlot, moveOrMerge, canMerge, canFulfillOrder, countRequirement, fulfillOrder, buildNextUpgrade, nextPlaceUpgrade } from './v2-game.js';

const CUSTOMER_ASSETS=[CUSTOMER_A,CUSTOMER_B,CUSTOMER_C];
const SAVE_KEY='poply-v2-state-1';
document.documentElement.style.setProperty('--poply-hero',`url(${HERO_IMAGE})`);
document.documentElement.style.setProperty('--poply-atlas',`url(${ATLAS_IMAGE})`);

const de=(navigator.language||'').toLowerCase().startsWith('de');
const copy=de?{
  place:'Café am Meer', placeProgress:'Ausbau', finish:'Liefern', missing:'Noch nicht fertig', build:'Bauen', complete:'Place komplett',
  tapGenerator:'Generator antippen. Gleiche Items zusammenziehen. Aufträge liefern. Place ausbauen.', move:'Item verschoben',
  noMerge:'Diese beiden Items passen nicht zusammen.', merged:'Merge!', spawned:'Neues Item erzeugt', boardFull:'Kein freier Platz. Merge zuerst ein paar Items.',
  noEnergy:'Keine Energie mehr.', orderDone:'Auftrag erledigt!', needStars:'Für den Ausbau fehlen noch Sterne.', built:'Ausbau geschafft!',
  collection:'Sammlung kommt als nächster Ausbau.', shop:'Shop kommt später – erstmal muss der Kern Spaß machen.'
}:{
  place:'Café by the Sea', placeProgress:'Build', finish:'Deliver', missing:'Not ready yet', build:'Build', complete:'Place complete',
  tapGenerator:'Tap a generator. Merge matching items. Deliver orders. Build your Place.', move:'Item moved', noMerge:'These items do not match.',
  merged:'Merge!', spawned:'New item generated', boardFull:'No free slot. Merge some items first.', noEnergy:'No energy left.', orderDone:'Order complete!',
  needStars:'You need more stars for that upgrade.', built:'Upgrade complete!', collection:'Collection is coming next.', shop:'Shop comes later — first the core must feel great.'
};
const $=selector=>document.querySelector(selector);
const els={
  board:$('#merge-board'),orders:$('#orders'),energy:$('#energy-value'),coins:$('#coins-value'),stars:$('#stars-value'),placeName:$('#place-name'),
  placeProgress:$('#place-progress'),placeProgressFill:$('#place-progress-fill'),upgradeName:$('#upgrade-name'),upgradeCost:$('#upgrade-cost'),buildButton:$('#build-button'),
  hero:$('#place-hero'),toast:$('#toast'),hint:$('#hint'),itemInfo:$('#item-info'),reset:$('#reset-button'),ghost:$('#drag-ghost'),boardUsed:$('#board-used')
};
let state=loadState(); let drag=null; let toastTimer=0; let lastFx=null;
function loadState(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?normalizeState(JSON.parse(raw)):createInitialState();}catch{return createInitialState();}}
function saveState(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{}}
function vibrate(pattern){try{navigator.vibrate?.(pattern);}catch{}}
function showToast(message,tone='good'){clearTimeout(toastTimer);els.toast.textContent=message;els.toast.dataset.tone=tone;els.toast.classList.add('show');toastTimer=setTimeout(()=>els.toast.classList.remove('show'),1300);}
const spriteClass=sprite=>`sprite-${sprite}`;
function itemMarkup(item,compact=false){const def=itemDefinition(item);return def?`<span class="item-art ${spriteClass(def.sprite)}${compact?' compact':''}" aria-hidden="true"></span>`:'';}
const itemLabel=item=>itemDefinition(item)?.name??'';
function renderResources(){els.energy.textContent=`${state.energy}/${state.maxEnergy}`;els.coins.textContent=state.coins.toLocaleString(de?'de-DE':'en-US');els.stars.textContent=state.stars.toLocaleString(de?'de-DE':'en-US');}
function renderPlace(){
  const done=state.placeUpgrades.length; els.placeName.textContent=copy.place; els.placeProgress.textContent=`${copy.placeProgress} ${done}/3`; els.placeProgressFill.style.width=`${done/3*100}%`; els.hero.dataset.stage=String(done);
  const next=nextPlaceUpgrade(state); if(!next){els.upgradeName.textContent=copy.complete;els.upgradeCost.textContent='★';els.buildButton.textContent='✓';els.buildButton.disabled=true;return;}
  els.upgradeName.textContent=next.label;els.upgradeCost.textContent=`★ ${next.cost}`;els.buildButton.textContent=copy.build;els.buildButton.disabled=state.stars<next.cost;
}
function customerAsset(order){return CUSTOMER_ASSETS[order.sequence%3];}
function renderOrders(){
  els.orders.innerHTML=state.currentOrders.map(order=>{
    const ready=canFulfillOrder(state,order);
    const requirements=order.requirements.map(req=>{const sample={kind:'item',family:req.family,level:req.level};const have=countRequirement(state,req);return `<div class="order-need ${have>=req.qty?'met':''}">${itemMarkup(sample,true)}<span>${have}/${req.qty}</span></div>`;}).join('');
    return `<article class="order-card ${ready?'ready':''}"><img class="customer-avatar" src="${customerAsset(order)}" alt="" aria-hidden="true"><div class="order-main"><strong>${order.title}</strong><div class="order-needs">${requirements}</div></div><div class="order-reward"><span>● ${order.rewards.coins}</span><span>★ ${order.rewards.stars}</span></div><button class="order-button" data-order="${order.id}" ${ready?'':'disabled'}>${copy.finish}</button></article>`;
  }).join('');
  els.orders.querySelectorAll('.order-button').forEach(button=>button.addEventListener('click',()=>{const result=fulfillOrder(state,button.dataset.order);if(!result.changed){showToast(copy.missing,'bad');return;}state=result.state;lastFx={type:'order'};saveState();vibrate([12,20,12]);showToast(`${copy.orderDone} +${result.rewards.coins} ●  +${result.rewards.stars} ★`);render();}));
}
function renderBoard(){
  els.board.innerHTML=state.board.map((item,index)=>{
    if(!item)return `<button class="merge-cell empty" data-index="${index}" aria-label="Empty slot"></button>`;
    const def=itemDefinition(item),generator=item.kind==='generator';
    return `<button class="merge-cell has-item ${generator?'generator':''}" data-index="${index}" aria-label="${def.name}">${itemMarkup(item)}${generator?'':`<span class="tier">${item.level}</span>`}${generator?'<span class="generator-bolt">⚡</span>':''}</button>`;
  }).join('');
  els.boardUsed.textContent=String(state.board.filter(Boolean).length);
  els.board.querySelectorAll('.merge-cell.has-item').forEach(cell=>{cell.addEventListener('pointerdown',onPointerDown);cell.addEventListener('click',onCellClick);});
  if(lastFx?.index!=null){const cell=els.board.querySelector(`[data-index="${lastFx.index}"]`);if(cell){requestAnimationFrame(()=>cell.classList.add(lastFx.type==='merge'?'merge-impact':'spawn-impact'));setTimeout(()=>cell.classList.remove('merge-impact','spawn-impact'),520);}lastFx=null;}
}
function onCellClick(event){const index=Number(event.currentTarget.dataset.index),item=state.board[index];if(!item)return;const def=itemDefinition(item);els.itemInfo.innerHTML=`${itemMarkup(item,true)}<span><strong>${itemLabel(item)}</strong>${item.kind==='item'?`<small>${ITEM_FAMILIES[item.family].label} · Stufe ${item.level}/${def.maxLevel}</small>`:'<small>Generator · antippen</small>'}</span>`;}
function clearDropStates(){els.board.querySelectorAll('.drop-merge,.drop-move,.drop-bad,.dragging').forEach(cell=>cell.classList.remove('drop-merge','drop-move','drop-bad','dragging'));}
function removeGhost(){els.ghost.classList.remove('show');els.ghost.innerHTML='';}
function moveGhost(x,y){els.ghost.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-58%) scale(1.03)`;}
function onPointerDown(event){const index=Number(event.currentTarget.dataset.index),item=state.board[index];if(!item)return;drag={index,x:event.clientX,y:event.clientY,moved:false,pointerId:event.pointerId};event.currentTarget.setPointerCapture?.(event.pointerId);event.currentTarget.classList.add('dragging');els.ghost.innerHTML=itemMarkup(item);els.ghost.classList.add('show');moveGhost(event.clientX,event.clientY);}
function onPointerMove(event){if(!drag||event.pointerId!==drag.pointerId)return;moveGhost(event.clientX,event.clientY);if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>8)drag.moved=true;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest?.('.merge-cell');els.board.querySelectorAll('.drop-merge,.drop-move,.drop-bad').forEach(cell=>cell.classList.remove('drop-merge','drop-move','drop-bad'));if(!target||Number(target.dataset.index)===drag.index)return;const to=Number(target.dataset.index),source=state.board[drag.index],dest=state.board[to];target.classList.add(!dest?'drop-move':canMerge(source,dest)?'drop-merge':'drop-bad');}
function onPointerUp(event){if(!drag||event.pointerId!==drag.pointerId)return;const from=drag.index,source=state.board[from],targetEl=document.elementFromPoint(event.clientX,event.clientY)?.closest?.('.merge-cell');clearDropStates();removeGhost();if(!drag.moved&&source?.kind==='generator'){const result=generateFromSlot(state,from);if(!result.changed)showToast(result.reason==='board-full'?copy.boardFull:result.reason==='no-energy'?copy.noEnergy:copy.noMerge,'bad');else{state=result.state;lastFx={type:'spawn',index:result.spawnedIndex};saveState();vibrate(8);showToast(copy.spawned);render();}drag=null;return;}if(targetEl){const to=Number(targetEl.dataset.index),result=moveOrMerge(state,from,to);if(result.changed){state=result.state;lastFx={type:result.type,index:result.type==='merge'?result.mergedIndex:to};saveState();if(result.type==='merge'){vibrate([10,12,18]);showToast(`${copy.merged} ${itemLabel(result.item)}`);}else showToast(copy.move);render();}else if(to!==from)showToast(copy.noMerge,'bad');}drag=null;}
function render(){renderResources();renderPlace();renderOrders();renderBoard();els.hint.textContent=copy.tapGenerator;}
els.buildButton.addEventListener('click',()=>{const result=buildNextUpgrade(state);if(!result.changed){showToast(copy.needStars,'bad');return;}state=result.state;saveState();vibrate([18,25,18,25,24]);els.hero.classList.add('build-impact');setTimeout(()=>els.hero.classList.remove('build-impact'),650);showToast(`${copy.built} ${result.upgrade.label}`);render();});
els.reset.addEventListener('click',()=>{if(!confirm(de?'Spielstand wirklich zurücksetzen?':'Reset progress?'))return;state=createInitialState();saveState();render();showToast(copy.tapGenerator);document.querySelector('.game-menu')?.removeAttribute('open');});
document.querySelectorAll('[data-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.scroll)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})));document.querySelector('[data-action="collection"]')?.addEventListener('click',()=>showToast(copy.collection));document.querySelector('[data-action="shop"]')?.addEventListener('click',()=>showToast(copy.shop));window.addEventListener('pointermove',onPointerMove,{passive:true});window.addEventListener('pointerup',onPointerUp);window.addEventListener('pointercancel',()=>{drag=null;clearDropStates();removeGhost();});render();
