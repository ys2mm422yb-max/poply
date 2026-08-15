import { getState, replaceOrder } from './aaa-session.js';
import { purposeGoal } from './aaa-purpose.js';
import { placePowerForUpgrade, placePowerStatus, unlockedPlacePowers } from './aaa-place-powers.js';

const bolt='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.2 2-7 10.1h4.5L10.1 22l7.7-11h-4.6V2Z" fill="currentColor"/></svg>';
const swap='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h11l-2.6-2.6M19 17H8l2.6 2.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function decoratePlace(root,state){
  const goal=purposeGoal(state),power=placePowerForUpgrade(goal.upgrade?.id);
  root.querySelectorAll('.place-power-preview').forEach(node=>node.remove());
  if(!power)return;
  const copy=root.querySelector('.place-current-goal .goal-copy');if(!copy)return;
  const panel=document.createElement('div');panel.className='place-power-preview';panel.dataset.power=power.key;
  panel.innerHTML=`<span class="place-power-emblem">${bolt}</span><span><small>NEUE FÄHIGKEIT</small><strong>${power.label}</strong><em>${power.copy}</em></span>`;
  const after=copy.querySelector('.purpose-after');if(after)copy.insertBefore(panel,after);else copy.append(panel);
}

function decorateBoard(root,state){
  const board=root.querySelector('.view-board');if(!board)return;
  const status=placePowerStatus(state),lead=board.querySelector('.board-title>:first-child');
  board.classList.toggle('place-prep-ready',status.prepReady);
  let hud=lead?.querySelector('.place-prep-hud');
  if(status.prepReady&&lead){
    if(!hud){hud=document.createElement('span');hud.className='place-prep-hud';hud.innerHTML=`<b>THEKE</b><small>+1 nächster Drop</small>`;lead.append(hud);}
  }else hud?.remove();
  board.querySelectorAll('.board-cell.generator').forEach(cell=>{
    cell.classList.toggle('prep-boost-target',status.prepReady);
    let badge=cell.querySelector('.prep-generator-badge');
    if(status.prepReady){
      if(!badge){badge=document.createElement('span');badge.className='prep-generator-badge';badge.innerHTML='<b>+1</b><small>THEKE</small>';cell.append(badge);}
      const base=(cell.getAttribute('aria-label')||'Generator').replace(/, Vorbereitung \+1 Stufe$/,'');cell.setAttribute('aria-label',`${base}, Vorbereitung +1 Stufe`);
    }else{
      badge?.remove();const label=cell.getAttribute('aria-label');if(label)cell.setAttribute('aria-label',label.replace(/, Vorbereitung \+1 Stufe$/,''));
    }
  });
}

function decorateOrders(root,state){
  root.querySelectorAll('.place-power-reroll').forEach(node=>node.remove());
  const status=placePowerStatus(state);if(!status.menuChoiceReady)return;
  const card=root.querySelector('.service-card[data-service-order]');if(!card)return;
  const purpose=card.querySelector('.service-purpose');if(!purpose)return;
  const button=document.createElement('button');button.type='button';button.className='place-power-reroll';button.dataset.placePowerReroll=card.dataset.serviceOrder;
  button.innerHTML=`<span>${swap}</span><b>Gastwahl</b><small>tauschen</small>`;button.setAttribute('aria-label','Gastwahl bereit. Diesen Auftrag tauschen.');purpose.append(button);
  card.classList.add('guest-choice-ready');
}

export function installPlacePowersUI(root,ui){
  let decorating=false,lastSignature='';
  let knownUpgrades=new Set(getState().placeUpgrades||[]);
  let knownPreps=placePowerStatus(getState()).prepsUsed;
  const announceChanges=state=>{
    const fresh=(state.placeUpgrades||[]).filter(id=>!knownUpgrades.has(id));knownUpgrades=new Set(state.placeUpgrades||[]);
    const unlocked=fresh.map(placePowerForUpgrade).filter(Boolean).at(-1);
    if(unlocked)setTimeout(()=>ui?.message?.(`Neue Fähigkeit: ${unlocked.label} · ${unlocked.short}`),420);
    const status=placePowerStatus(state);
    if(status.prepsUsed>knownPreps)setTimeout(()=>ui?.message?.('Vorbereitung genutzt · Generator-Drop +1 Stufe'),120);
    knownPreps=status.prepsUsed;
  };
  const decorate=()=>{
    if(decorating)return;
    const state=getState(),status=placePowerStatus(state),goal=purposeGoal(state);
    const signature=`${root.dataset.view}|${state.placeUpgrades.join(',')}|${status.prepReady?'1':'0'}|${status.menuChoiceReady?'1':'0'}|${status.prepsUsed}|${status.rerollsUsed}|${state.currentOrders.map(order=>order.id).join(',')}|${goal.upgrade?.id||'-'}`;
    if(signature===lastSignature)return;lastSignature=signature;decorating=true;
    try{
      announceChanges(state);
      if(root.dataset.view==='place')decoratePlace(root,state);
      if(root.dataset.view==='board')decorateBoard(root,state);
      if(root.dataset.view==='orders')decorateOrders(root,state);
    }finally{decorating=false;}
  };
  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement,button=target?.closest('[data-place-power-reroll]');if(!button)return;
    event.preventDefault();event.stopPropagation();
    const result=replaceOrder(button.dataset.placePowerReroll);
    if(!result.changed){ui?.message?.(result.reason==='not-ready'?'Gastwahl lädt nach der nächsten Lieferung.':'Gastwahl ist noch gesperrt.','bad');return;}
    lastSignature='';ui?.render?.();ui?.message?.(`Gastwahl: „${result.previous.title}“ → „${result.replacement.title}“`);
    requestAnimationFrame(()=>root.querySelector(`.customer-choice[data-select-order="${result.replacement.id}"]`)?.click());
  });
  const observer=new MutationObserver(()=>queueMicrotask(decorate));observer.observe(root,{childList:true,subtree:true});decorate();
  return {refresh:()=>{lastSignature='';decorate();},disconnect:()=>observer.disconnect(),powers:()=>unlockedPlacePowers(getState())};
}
