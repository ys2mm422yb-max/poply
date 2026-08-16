import { PLACE_CHAPTERS, activePlaceChapter, isPlace01Complete, isPlace02Complete } from './v2-game.js';
import { getState } from './aaa-session.js';
import { placeSceneMarkup } from './aaa-place-art.js';
import { sunsetPlaceSceneMarkup } from './aaa-sunset-place.js';
import { gardenPlaceSceneMarkup } from './aaa-garden-place.js';

const completedCount=(state,chapter)=>chapter.upgrades.filter(upgrade=>(state.placeUpgrades||[]).includes(upgrade.id)).length;

export function placeMapModel(state){
  const active=activePlaceChapter(state);
  const coastComplete=isPlace01Complete(state),sunsetComplete=isPlace02Complete(state);
  return PLACE_CHAPTERS.map(chapter=>{
    const completed=completedCount(state,chapter);
    const unlocked=chapter.id==='coast'||(chapter.id==='sunset'&&coastComplete)||(chapter.id==='garden'&&sunsetComplete);
    return {id:chapter.id,number:chapter.number,label:chapter.label,kicker:chapter.kicker,completed,total:chapter.upgrades.length,ratio:completed/chapter.upgrades.length,unlocked,active:chapter.id===active.id,complete:completed===chapter.upgrades.length};
  });
}

const scene=entry=>entry.id==='garden'?gardenPlaceSceneMarkup(entry.completed):entry.id==='sunset'?sunsetPlaceSceneMarkup(entry.completed):placeSceneMarkup(entry.completed);
const statusLabel=entry=>entry.complete?'Fertig':entry.active?'Aktueller Place':entry.unlocked?'Besuchen':'Noch gesperrt';
function mapMarkup(state,selectedId){
  const places=placeMapModel(state);const selected=places.find(entry=>entry.id===selectedId&&entry.unlocked)||places.find(entry=>entry.active)||places[0];
  return `<div class="place-map-backdrop" data-place-map-close></div><section class="place-map-sheet" role="dialog" aria-modal="true" aria-label="Poply Places Karte"><header class="place-map-head"><div><small>DEINE POPLY WELT</small><h2>Places</h2><p>Schau zurück, wo du angefangen hast – und sieh, was als Nächstes wächst.</p></div><button class="place-map-close" data-place-map-close aria-label="Karte schließen">×</button></header><div class="place-map-route" aria-label="Place Auswahl">${places.map(entry=>`<button class="place-map-node ${entry.id===selected.id?'selected':''} ${entry.complete?'complete':''} ${entry.unlocked?'':'locked'}" data-map-place="${entry.id}" ${entry.unlocked?'':'disabled'}><span class="place-map-number">0${entry.number}</span><span class="place-map-node-copy"><strong>${entry.label}</strong><small>${statusLabel(entry)} · ${entry.completed}/${entry.total}</small></span><span class="place-map-progress"><i style="width:${Math.round(entry.ratio*100)}%"></i></span></button>`).join('<span class="place-map-rail" aria-hidden="true"></span>')}</div><article class="place-map-preview place-${selected.id}"><div class="place-map-scene">${scene(selected)}</div><div class="place-map-preview-copy"><small>PLACE 0${selected.number} · ${selected.kicker}</small><h3>${selected.label}</h3><p>${selected.complete?'Dieser Place ist vollständig restauriert. Du kannst ihn jederzeit wieder ansehen.':selected.active?'Hier arbeitest du gerade weiter. Board, Aufträge und Fortschritt bleiben beim Kartenbesuch unverändert.':'Dieser Place ist freigeschaltet.'}</p><div class="place-map-preview-progress"><span><b>${selected.completed}</b> / ${selected.total} Ausbauten</span><i><em style="width:${Math.round(selected.ratio*100)}%"></em></i></div></div></article><footer class="place-map-foot">Die Karte verändert keine Items, Aufträge oder Ressourcen.</footer></section>`;
}
export function installPlaceMapUI(root){
  let open=false,selectedId=null,overlay=null;const close=()=>{open=false;overlay?.remove();overlay=null;};
  const renderOverlay=()=>{if(!open)return;const state=getState();const active=activePlaceChapter(state);if(!selectedId)selectedId=active.id;overlay?.remove();overlay=document.createElement('div');overlay.className='place-map-layer';overlay.innerHTML=mapMarkup(state,selectedId);document.body.append(overlay);};
  const ensureLauncher=()=>{if(root.dataset.view!=='place')return;const hero=root.querySelector('.world-hero');if(!hero||hero.querySelector('[data-action="place-map"]'))return;const button=document.createElement('button');button.className='place-map-launch';button.dataset.action='place-map';button.setAttribute('aria-label','Places Karte öffnen');button.innerHTML='<span aria-hidden="true">⌖</span><b>Karte</b><small>Places</small>';hero.append(button);};
  root.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(target?.closest('[data-action="place-map"]')){open=true;selectedId=activePlaceChapter(getState()).id;renderOverlay();}});
  document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target||!open)return;if(target.closest('[data-place-map-close]')){close();return;}const place=target.closest('[data-map-place]');if(place&&!place.disabled){selectedId=place.dataset.mapPlace;renderOverlay();}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&open)close();});new MutationObserver(ensureLauncher).observe(root,{childList:true,subtree:true});ensureLauncher();return {close,isOpen:()=>open};
}