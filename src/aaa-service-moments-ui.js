import { getState } from './aaa-session.js';
import { serviceMomentStatus } from './aaa-service-moments.js';

const modeLabel=mode=>mode==='stock'?'Nachschub':'Direkt';

export function installServiceMomentsUI(root){
  let decorating=false,lastSignature='';

  const clear=()=>{
    root.querySelectorAll('.service-moment-card,.service-moment-active,.service-moment-recommendation').forEach(node=>node.remove());
    root.querySelectorAll('.service-moment-target').forEach(node=>node.classList.remove('service-moment-target'));
    root.querySelectorAll('.service-moment-recommended').forEach(node=>node.classList.remove('service-moment-recommended'));
  };

  const decorateReady=(moment,state)=>{
    const view=root.querySelector('.view-orders');if(!view)return;
    const queue=view.querySelector(':scope > .customer-queue'),panel=view.querySelector(':scope > .service-call-choice-panel.is-ready');
    if(!queue||!panel)return;
    const order=state.currentOrders?.find(entry=>entry.id===moment.orderId);if(!order)return;
    let card=view.querySelector(':scope > .service-moment-card');
    if(!card){card=document.createElement('section');card.className='service-moment-card';queue.after(card);}
    card.dataset.moment=moment.key;card.dataset.order=moment.orderId;
    card.innerHTML=`<span class="service-moment-mark" aria-hidden="true">✦</span><span class="service-moment-copy"><small>${moment.tag}</small><strong>${moment.label}</strong><em>${moment.copy}</em><b>${modeLabel(moment.mode)} · ${moment.bonusLabel}</b></span><button type="button" data-service-moment-focus="${moment.orderId}">Gast wählen</button>`;
    const choice=root.querySelector(`.customer-choice[data-select-order="${moment.orderId}"]`);choice?.classList.add('service-moment-target');
    const focused=view.querySelector(`.service-card[data-service-order="${moment.orderId}"]`);
    if(focused){
      card.classList.add('is-focused');
      card.querySelector('[data-service-moment-focus]')?.setAttribute('hidden','');
      const recommended=panel.querySelector(`[data-service-call-mode="${moment.mode}"]`);
      recommended?.classList.add('service-moment-recommended');
      if(recommended&&!recommended.querySelector('.service-moment-recommendation')){
        const badge=document.createElement('span');badge.className='service-moment-recommendation';badge.textContent='MOMENT';recommended.append(badge);
      }
    }
  };

  const decorateActive=(moment)=>{
    if(!moment.matched)return;
    const panel=root.querySelector(`.service-card[data-service-order="${moment.orderId}"] .service-call-panel.is-active`);
    if(panel){
      let active=panel.querySelector(':scope > .service-moment-active');
      if(!active){active=document.createElement('div');active.className='service-moment-active';panel.append(active);}
      active.dataset.moment=moment.key;
      active.innerHTML=`<small>${moment.tag}</small><strong>${moment.label}</strong><span>${moment.bonusLabel}</span>`;
    }
    root.querySelector(`.customer-choice[data-select-order="${moment.orderId}"]`)?.classList.add('service-moment-target');
    root.querySelector(`.board-job[data-focus-order="${moment.orderId}"]`)?.classList.add('service-moment-target');
  };

  const decorate=()=>{
    if(decorating)return;decorating=true;
    try{
      const state=getState(),moment=serviceMomentStatus(state),signature=`${root.dataset.view}|${moment.available?'1':'0'}|${moment.key||'-'}|${moment.orderId||'-'}|${moment.call?.ready?'r':'-'}|${moment.call?.active?'a':'-'}|${moment.call?.generatorProgress||0}`;
      if(signature===lastSignature)return;lastSignature=signature;clear();
      if(!moment.available)return;
      if(moment.call.ready&&root.dataset.view==='orders')decorateReady(moment,state);
      if(moment.call.active)decorateActive(moment);
    }finally{decorating=false;}
  };

  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement,button=target?.closest('[data-service-moment-focus]');if(!button)return;
    event.preventDefault();event.stopPropagation();
    root.querySelector(`.customer-choice[data-select-order="${button.dataset.serviceMomentFocus}"]`)?.click();
    lastSignature='';queueMicrotask(decorate);
  });
  const observer=new MutationObserver(()=>queueMicrotask(decorate));observer.observe(root,{childList:true,subtree:true});decorate();
  return {refresh:()=>{lastSignature='';decorate();},disconnect:()=>observer.disconnect()};
}
