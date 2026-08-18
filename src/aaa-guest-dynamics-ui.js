import { getState } from './aaa-session.js';
import { dailyServiceCondition, dynamicServiceBonus, guestTraitForOrder, guestTraitQualifies, isDynamicServiceUnlocked } from './aaa-guest-dynamics.js';

const familyLabel={coffee:'Getränke',bakery:'Backwaren',sweet:'Süßes',fruit:'Sonnenfrüchte',herb:'Dachgarten'};

export function installGuestDynamicsUI(root){
  let queued=false;
  const decorate=()=>{
    queued=false;const state=getState(),unlocked=isDynamicServiceUnlocked(state),condition=dailyServiceCondition(state);
    root.querySelectorAll('[data-select-order]').forEach(choice=>{
      const order=state.currentOrders.find(entry=>entry.id===choice.dataset.selectOrder);if(!order)return;
      const {trait}=guestTraitForOrder(order);choice.dataset.guestTrait=trait.id;
      const title=unlocked?`${trait.label}: ${trait.copy}`:'';
      if(choice.title!==title)choice.title=title;
    });
    root.querySelectorAll('.service-card[data-service-order]').forEach(card=>{
      const heading=card.querySelector('.service-heading');if(!heading)return;
      if(!unlocked){heading.querySelector('.guest-dynamic-line')?.remove();return;}
      const order=state.currentOrders.find(entry=>entry.id===card.dataset.serviceOrder);if(!order)return;
      const bonus=dynamicServiceBonus(state,order),traitOn=guestTraitQualifies(order,bonus.trait.id),dailyOn=order.requirements.some(req=>req.family===condition.family);
      const markup=`<span class="guest-trait ${traitOn?'is-earned':''}"><b>${bonus.guest.name}</b> · ${bonus.trait.label}${traitOn?` <strong>+${bonus.trait.bonusCoins} ●</strong>`:''}</span><span class="daily-condition ${dailyOn?'is-earned':''}">Heute: ${condition.label} · +${condition.bonusCoins} ● bei ${familyLabel[condition.family]||condition.family}</span>`;
      let line=heading.querySelector('.guest-dynamic-line');
      if(!line){line=document.createElement('div');line.className='guest-dynamic-line';line.innerHTML=markup;heading.append(line);return;}
      if(line.innerHTML!==markup)line.innerHTML=markup;
    });
  };
  const schedule=()=>{if(queued)return;queued=true;queueMicrotask(decorate);};
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});decorate();
  return {refresh:decorate};
}
