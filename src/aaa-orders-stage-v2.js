import { getState } from './aaa-session.js';

const ORDER_FAMILIES=new Set(['coffee','bakery','sweet','fruit','herb']);

export function serviceStageFamilies(order){
  const families=[];
  for(const requirement of order?.requirements||[]){
    const family=requirement?.family;
    if(ORDER_FAMILIES.has(family)&&!families.includes(family))families.push(family);
  }
  const primary=families[0]||'coffee';
  return {primary,secondary:families[1]||primary,families};
}

const stageMarkup=()=>`<span class="orders-stage-lamp lamp-left"></span><span class="orders-stage-lamp lamp-right"></span><span class="orders-stage-glint glint-a"></span><span class="orders-stage-glint glint-b"></span><span class="orders-stage-glint glint-c"></span><span class="orders-stage-glint glint-d"></span>`;

export function installOrdersStageV2(root){
  let queued=false;
  const decorate=()=>{
    queued=false;
    const view=root.querySelector('.view-orders');
    if(!view)return;
    const card=view.querySelector('.service-card[data-service-order]');
    if(!card)return;
    const order=getState().currentOrders.find(entry=>entry.id===card.dataset.serviceOrder);
    if(!order)return;
    const {primary,secondary}=serviceStageFamilies(order);
    for(const node of [view,card]){
      if(node.dataset.servicePrimary!==primary)node.dataset.servicePrimary=primary;
      if(node.dataset.serviceSecondary!==secondary)node.dataset.serviceSecondary=secondary;
    }
    if(!card.querySelector(':scope > .orders-stage-set')){
      const scene=document.createElement('div');
      scene.className='orders-stage-set';
      scene.setAttribute('aria-hidden','true');
      scene.innerHTML=stageMarkup();
      card.prepend(scene);
    }
  };
  const schedule=()=>{if(queued)return;queued=true;queueMicrotask(decorate);};
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  decorate();
  return {refresh:decorate};
}
