import { getState } from './aaa-session.js';
import { GUEST_PROFILES, GUEST_LOYALTY_MILESTONES, guestForSequence, guestLoyalty } from './aaa-guests.js';
import { serviceSpecialProgressText } from './aaa-specials.js';

const visitTarget=loyalty=>loyalty.next?.visits??GUEST_LOYALTY_MILESTONES.at(-1).visits;
const choiceProgress=loyalty=>`${loyalty.visits}/${visitTarget(loyalty)}`;
const specialChoiceCopy=(special,guest)=>`<b>${special.completed?'✓ Fertig':`${special.tag} ${serviceSpecialProgressText(special)}`}</b><span> · ${guest.name}</span>`;

function decorateOrders(root,state){
  root.querySelectorAll('.customer-choice[data-select-order]').forEach(choice=>{
    const order=state.currentOrders.find(entry=>entry.id===choice.dataset.selectOrder);
    if(!order)return;
    const guest=guestForSequence(order.sequence),loyalty=guestLoyalty(state,guest.id),special=order.special||null;
    choice.dataset.guestId=guest.id;
    choice.dataset.loyaltyTitle=loyalty.title;
    const specialLabel=special?`, Bonusziel ${special.label}, ${serviceSpecialProgressText(special)}, +${special.rewardCoins} Coins`:'';
    choice.setAttribute('aria-label',`${guest.name}, ${order.title}, ${loyalty.title}, ${loyalty.visits} Besuche${specialLabel}`);
    const title=choice.querySelector('strong'),status=choice.querySelector('small');
    if(title)title.textContent=order.title;
    if(status){
      if(special){status.classList.add('service-special-choice-line');status.innerHTML=specialChoiceCopy(special,guest);}
      else{status.classList.remove('service-special-choice-line');status.textContent=`${guest.name} · ${choiceProgress(loyalty)}`;}
      status.title=loyalty.next
        ?`${loyalty.title} · noch ${loyalty.visitsUntilNext} bis ${loyalty.next.title} (+${loyalty.next.rewardCoins} Coins)`
        :`${loyalty.title} · höchster Rang`;
    }
  });

  root.querySelectorAll('.service-card[data-service-order]').forEach(card=>{
    const order=state.currentOrders.find(entry=>entry.id===card.dataset.serviceOrder);
    if(!order)return;
    const guest=guestForSequence(order.sequence),loyalty=guestLoyalty(state,guest.id);
    card.dataset.guestId=guest.id;
    card.dataset.loyaltyTitle=loyalty.title;
    const label=card.querySelector('.service-customer>span');
    if(label){
      label.textContent=`${guest.name.toUpperCase()} · ${loyalty.title.toUpperCase()}`;
      label.title=loyalty.next
        ?`${loyalty.visits} Besuche · noch ${loyalty.visitsUntilNext} bis ${loyalty.next.title} (+${loyalty.next.rewardCoins} Coins)`
        :`${loyalty.visits} Besuche · höchster Rang`;
    }
  });
}

export function installGuestUI(root,ui){
  let lastSignature='',lastViewNode=null;
  let knownVisits=Object.fromEntries(GUEST_PROFILES.map(guest=>[guest.id,guestLoyalty(getState(),guest.id).visits]));

  const announceMilestones=state=>{
    for(const guest of GUEST_PROFILES){
      const before=knownVisits[guest.id]??0,now=guestLoyalty(state,guest.id).visits;
      if(now>before){
        const milestone=GUEST_LOYALTY_MILESTONES.find(entry=>entry.visits>before&&entry.visits<=now);
        if(milestone)ui?.message?.(`${guest.name}: ${milestone.title} · +${milestone.rewardCoins} Coins`);
      }
      knownVisits[guest.id]=now;
    }
  };

  const decorate=()=>{
    const state=getState(),viewNode=root.querySelector('.game-view');
    const specialSignature=state.currentOrders.map(order=>`${order.id}:${order.special?.key||'-'}:${order.special?.progress??'-'}:${order.special?.completed?'1':'0'}`).join(',');
    const signature=`${root.dataset.view}|${specialSignature}|${GUEST_PROFILES.map(guest=>state.guestVisits?.[guest.id]??0).join(',')}`;
    if(signature===lastSignature&&viewNode===lastViewNode)return;
    lastSignature=signature;lastViewNode=viewNode;
    announceMilestones(state);
    if(root.dataset.view==='orders')decorateOrders(root,state);
  };

  const observer=new MutationObserver(()=>queueMicrotask(decorate));
  observer.observe(root,{childList:true,subtree:true});
  decorate();
  return {refresh:()=>{lastSignature='';lastViewNode=null;decorate();},disconnect:()=>observer.disconnect()};
}
