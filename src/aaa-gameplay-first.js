import { getState } from './aaa-session.js';
import { canFulfillOrder, countRequirement, itemDefinition } from './v2-game.js';

function firstMissingRequirement(state,order){
  return order?.requirements?.find(req=>countRequirement(state,req)<req.qty)??null;
}

function missingLabel(req){
  if(!req)return 'Item';
  const def=itemDefinition({kind:'item',family:req.family,level:req.level});
  return def?.name||'Item';
}

function decorateOrders(root,state){
  if(root.dataset.view!=='orders')return;
  root.querySelectorAll('.service-card[data-service-order]').forEach(card=>{
    const order=state.currentOrders.find(entry=>entry.id===card.dataset.serviceOrder);if(!order)return;
    const ready=canFulfillOrder(state,order),button=card.querySelector(':scope > .service-deliver');if(!button)return;
    if(ready){card.classList.remove('has-missing-action');return;}
    const req=firstMissingRequirement(state,order),label=missingLabel(req);
    card.classList.add('has-missing-action');
    button.disabled=false;
    button.removeAttribute('data-order');
    button.dataset.gameplayBoard=order.id;
    button.classList.add('service-missing-action');
    const desired=`<span>${label} fehlt</span><strong>Auf dem Board herstellen →</strong>`;
    if(button.innerHTML!==desired)button.innerHTML=desired;
    const heading=card.querySelector('.service-heading>small');
    if(heading&&heading.textContent!=='Nächster Schritt')heading.textContent='Nächster Schritt';
    const status=card.querySelector('.service-status');
    if(status&&status.textContent?.trim()!=='Fehlt')status.textContent='Fehlt';
  });
}

function decoratePlace(root){
  if(root.dataset.view!=='place')return;
  const label=root.querySelector('.place-current-goal .goal-copy>small');
  if(label&&label.textContent!=='NÄCHSTER AUSBAU')label.textContent='NÄCHSTER AUSBAU';
}

export function installGameplayFirst(root){
  let scheduled=false;
  const decorate=()=>{
    scheduled=false;
    const state=getState();
    decorateOrders(root,state);
    decoratePlace(root);
  };
  const schedule=()=>{if(scheduled)return;scheduled=true;queueMicrotask(decorate);};
  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement;if(!target)return;
    const action=target.closest('[data-gameplay-board]');if(!action)return;
    event.preventDefault();event.stopPropagation();
    root.querySelector('.nav-tab[data-view="board"]')?.click();
  },true);
  const observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true});
  schedule();
  return {refresh:schedule,disconnect:()=>observer.disconnect()};
}
