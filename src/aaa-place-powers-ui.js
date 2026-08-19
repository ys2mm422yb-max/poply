import { getState, replaceOrder } from './aaa-session.js';
import { purposeGoal } from './aaa-purpose.js';
import { placePowerForUpgrade, placePowerStatus, unlockedPlacePowers } from './aaa-place-powers.js';

const swap='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h11l-2.6-2.6M19 17H8l2.6 2.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const unlockToast=power=>({
  'evening-service':'Neue Fähigkeit: Abendservice · +1 FLOW',
  'counter-prep':'Vorbereitung frei · Nächster Drop +1',
  'guest-choice':'Gastwahl frei · 1 Auftrag tauschen',
}[power?.key]||`${power?.label||'Fähigkeit'} frei`);

function decoratePlace(root,state){
  const goal=purposeGoal(state),power=placePowerForUpgrade(goal.upgrade?.id),unlock=root.querySelector('.place-current-goal .purpose-place-unlock'),summary=root.querySelector('.place-current-goal .place-unlock-summary');
  root.querySelectorAll('.place-power-inline').forEach(node=>node.remove());
  root.querySelector('.place-current-goal')?.classList.toggle('has-place-power-preview',Boolean(power));
  if(!power)return;
  if(unlock){
    const strong=unlock.querySelector('strong');
    if(strong){const inline=document.createElement('em');inline.className='place-power-inline';inline.dataset.power=power.key;inline.textContent=` · Fähigkeit: ${power.label} — ${power.short}`;strong.append(inline);}
    unlock.setAttribute('aria-label',`${unlock.textContent}. Neue Fähigkeit ${power.label}: ${power.copy}`);
  }
  if(summary){
    summary.classList.add('has-place-power');summary.dataset.power=power.key;
    summary.innerHTML=`<span aria-hidden="true">◆</span><strong>${power.label}</strong><small>${power.short}</small>`;
    summary.setAttribute('aria-label',`Schaltet ${power.label} frei. ${power.copy}`);
  }
}

function decorateBoard(root,state){
  const board=root.querySelector('.view-board');if(!board)return;
  const status=placePowerStatus(state),lead=board.querySelector('.board-title>:first-child');
  board.classList.toggle('place-prep-ready',status.prepReady);
  let hud=lead?.querySelector('.place-prep-hud');
  if(status.prepReady&&lead){
    if(!hud){hud=document.createElement('span');hud.className='place-prep-hud';hud.innerHTML='<b>THEKE +1</b>';lead.append(hud);}
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
  root.querySelectorAll('.service-card.guest-choice-ready').forEach(node=>node.classList.remove('guest-choice-ready'));
  const status=placePowerStatus(state);if(!status.menuChoiceReady)return;
  const card=root.querySelector('.service-card[data-service-order]');if(!card)return;
  const purpose=card.querySelector('.service-purpose');if(!purpose)return;
  const button=document.createElement('button');button.type='button';button.className='place-power-reroll';button.dataset.placePowerReroll=card.dataset.serviceOrder;
  button.innerHTML=`<span>${swap}</span><b>Gastwahl</b><small>tauschen</small>`;button.setAttribute('aria-label','Gastwahl bereit. Diesen Auftrag tauschen.');purpose.append(button);
  card.classList.add('guest-choice-ready');
}

export function installPlacePowersUI(root,ui){
  let decorating=false,lastSignature='',lastViewNode=null;
  let knownUpgrades=new Set(getState().placeUpgrades||[]);
  let knownPreps=placePowerStatus(getState()).prepsUsed;
  const announceChanges=state=>{
    const fresh=(state.placeUpgrades||[]).filter(id=>!knownUpgrades.has(id));knownUpgrades=new Set(state.placeUpgrades||[]);
    const unlocked=fresh.map(placePowerForUpgrade).filter(Boolean).at(-1);
    if(unlocked)setTimeout(()=>ui?.message?.(unlockToast(unlocked)),420);
    const status=placePowerStatus(state);
    if(status.prepsUsed>knownPreps)setTimeout(()=>ui?.message?.('Vorbereitung genutzt · Generator-Drop +1 Stufe'),120);
    knownPreps=status.prepsUsed;
  };
  const decorate=()=>{
    if(decorating)return;
    const state=getState(),status=placePowerStatus(state),goal=purposeGoal(state),viewNode=root.querySelector('.game-view');
    const signature=`${root.dataset.view}|${state.placeUpgrades.join(',')}|${status.prepReady?'1':'0'}|${status.menuChoiceReady?'1':'0'}|${status.prepsUsed}|${status.rerollsUsed}|${state.currentOrders.map(order=>order.id).join(',')}|${goal.upgrade?.id||'-'}`;
    if(viewNode===lastViewNode&&signature===lastSignature)return;lastViewNode=viewNode;lastSignature=signature;decorating=true;
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
    lastSignature='';lastViewNode=null;ui?.render?.();ui?.message?.(`Gastwahl: „${result.previous.title}“ → „${result.replacement.title}“`);
    requestAnimationFrame(()=>root.querySelector(`.customer-choice[data-select-order="${result.replacement.id}"]`)?.click());
  });
  const observer=new MutationObserver(()=>queueMicrotask(decorate));observer.observe(root,{childList:true,subtree:true});decorate();
  return {refresh:()=>{lastSignature='';lastViewNode=null;decorate();},disconnect:()=>observer.disconnect(),powers:()=>unlockedPlacePowers(getState())};
}