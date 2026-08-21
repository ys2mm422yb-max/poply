import { getState } from './aaa-session.js';
import { serviceMomentStatus } from './aaa-service-moments.js';

const modeLabel=mode=>mode==='stock'?'Nachschub':'Direkt';

export function installServiceMomentsUI(root){
  let decorating=false,lastSignature='';

  const clear=()=>{
    root.querySelectorAll('.service-moment-recommendation').forEach(node=>node.remove());
    root.querySelectorAll('.service-moment-target').forEach(node=>node.classList.remove('service-moment-target'));
    root.querySelectorAll('.service-moment-recommended').forEach(node=>node.classList.remove('service-moment-recommended'));
    root.querySelectorAll('.has-service-moment').forEach(node=>{
      node.classList.remove('has-service-moment');delete node.dataset.serviceMoment;delete node.dataset.serviceMomentOrder;
    });
  };

  const decorateReady=(moment,state)=>{
    const view=root.querySelector('.view-orders');if(!view)return;
    const panel=view.querySelector(':scope > .service-call-choice-panel.is-ready'),copy=panel?.querySelector('.service-call-choice-copy');
    if(!panel||!copy)return;
    const order=state.currentOrders?.find(entry=>entry.id===moment.orderId);if(!order)return;
    const focused=view.querySelector(`.service-card[data-service-order="${moment.orderId}"]`);
    panel.classList.add('has-service-moment');panel.dataset.serviceMoment=moment.key;panel.dataset.serviceMomentOrder=moment.orderId;
    const small=copy.querySelector('small'),strong=copy.querySelector('strong'),detail=copy.querySelector('span');
    if(small)small.textContent=`${moment.tag} · SERVICE-MOMENT`;
    if(strong)strong.textContent=`${moment.label} · ${order.title}`;
    if(detail)detail.textContent=`${modeLabel(moment.mode)} · ${moment.bonusLabel}`;
    panel.setAttribute('aria-label',`${moment.label}. ${order.title}. ${moment.copy} Empfohlen: ${modeLabel(moment.mode)}. ${moment.bonusLabel}`);
    root.querySelector(`.customer-choice[data-select-order="${moment.orderId}"]`)?.classList.add('service-moment-target');
    if(focused){
      const recommended=panel.querySelector(`[data-service-call-mode="${moment.mode}"]`);
      recommended?.classList.add('service-moment-recommended');
      if(recommended&&!recommended.querySelector('.service-moment-recommendation')){
        const badge=document.createElement('span');badge.className='service-moment-recommendation';badge.textContent='MOMENT';recommended.append(badge);
      }
    }
  };

  const decorateActive=moment=>{
    if(!moment.matched)return;
    const panel=root.querySelector(`.service-card[data-service-order="${moment.orderId}"] .service-call-panel.is-active`),copy=panel?.querySelector('.service-call-copy');
    if(panel&&copy){
      panel.classList.add('has-service-moment');panel.dataset.serviceMoment=moment.key;panel.dataset.serviceMomentOrder=moment.orderId;
      const small=copy.querySelector('small'),strong=copy.querySelector('strong');
      if(small)small.textContent=`${moment.tag} · RUF AKTIV`;
      if(strong)strong.textContent=`${moment.label} · ${strong.textContent}`;
      panel.setAttribute('aria-label',`${moment.label}. ${moment.copy} ${moment.bonusLabel}`);
    }
    root.querySelector(`.customer-choice[data-select-order="${moment.orderId}"]`)?.classList.add('service-moment-target');
    root.querySelector(`.board-job[data-focus-order="${moment.orderId}"]`)?.classList.add('service-moment-target');
  };

  const decorate=()=>{
    if(decorating)return;decorating=true;
    try{
      const state=getState(),moment=serviceMomentStatus(state),selected=root.querySelector('.view-orders .service-card[data-service-order]')?.dataset.serviceOrder||'-';
      const signature=`${root.dataset.view}|${selected}|${moment.available?'1':'0'}|${moment.key||'-'}|${moment.orderId||'-'}|${moment.call?.ready?'r':'-'}|${moment.call?.active?'a':'-'}|${moment.call?.generatorProgress||0}`;
      if(signature===lastSignature)return;lastSignature=signature;clear();
      if(!moment.available)return;
      if(moment.call.ready&&root.dataset.view==='orders')decorateReady(moment,state);
      if(moment.call.active)decorateActive(moment);
    }finally{decorating=false;}
  };

  const observer=new MutationObserver(()=>queueMicrotask(decorate));observer.observe(root,{childList:true,subtree:true});decorate();
  return {refresh:()=>{lastSignature='';decorate();},disconnect:()=>observer.disconnect()};
}
