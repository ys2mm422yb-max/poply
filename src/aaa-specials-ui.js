import { getState } from './aaa-session.js';
import { serviceSpecialProgressText } from './aaa-specials.js';

const coin='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="currentColor"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.6"/></svg>';
const check='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5.2 12.4 4.1 4.1 9.5-9.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const tone=special=>special?.type||'none';

export function installServiceSpecialsUI(root){
  let decorating=false;const seen=new Map();
  const pulse=(node,order)=>{
    if(!node||!order?.special)return;
    const current=Number(order.special.progress)||0,previous=seen.get(order.id);
    if(previous!=null&&current>previous){node.classList.remove('fx-special-progress');requestAnimationFrame(()=>node.classList.add('fx-special-progress'));setTimeout(()=>node.classList.remove('fx-special-progress'),650);}
    seen.set(order.id,current);
  };
  const decorateChoice=(order,special)=>{
    const node=root.querySelector(`.customer-choice[data-select-order="${order.id}"]`);if(!node)return;
    node.classList.add('has-service-special',`special-${tone(special)}`);node.classList.toggle('special-complete',special.completed);
    const line=node.querySelector(':scope > small');if(!line)return;
    if(!line.dataset.specialGuest)line.dataset.specialGuest=(line.textContent||'').split('·')[0].trim();
    line.classList.add('service-special-choice-line');
    const signature=`${special.tag}:${special.progress}:${special.target}:${special.completed}:${line.dataset.specialGuest}`;
    if(line.dataset.specialSignature!==signature){
      line.dataset.specialSignature=signature;
      line.innerHTML=`<b>${special.completed?'✓ Fertig':`${special.tag} ${serviceSpecialProgressText(special)}`}</b><span> · ${line.dataset.specialGuest}</span>`;
    }
    pulse(node,order);
  };
  const decorateBoardJob=(order,special)=>{
    const node=root.querySelector(`.board-job[data-focus-order="${order.id}"]`);if(!node)return;
    node.classList.add('has-service-special',`special-${tone(special)}`);node.classList.toggle('special-complete',special.completed);
    let badge=node.querySelector('.board-special-badge');if(!badge){badge=document.createElement('span');badge.className='board-special-badge';node.append(badge);}
    const signature=`${special.tag}:${special.progress}:${special.target}:${special.completed}`;
    if(badge.dataset.signature!==signature){badge.dataset.signature=signature;badge.innerHTML=special.completed?check:`<b>${special.tag}</b>`;}
    pulse(node,order);
  };
  const decorateServiceCard=(order,special)=>{
    const card=root.querySelector(`.service-card[data-service-order="${order.id}"]`);if(!card)return;
    card.classList.add('has-service-special',`special-${tone(special)}`);card.classList.toggle('special-complete',special.completed);
    let panel=card.querySelector('.service-special-panel');
    if(!panel){panel=document.createElement('div');panel.className='service-special-panel';card.querySelector('.service-rewards')?.before(panel);}
    if(!panel)return;
    const signature=`${special.label}:${special.copy}:${special.progress}:${special.target}:${special.completed}:${special.rewardCoins}`;
    if(panel.dataset.signature!==signature){
      panel.dataset.signature=signature;
      panel.innerHTML=`<span class="special-emblem">${special.completed?check:special.tag}</span><span class="special-copy"><small>BONUSZIEL · ${special.completed?'GESCHAFFT':serviceSpecialProgressText(special)}</small><strong>${special.label}</strong><em>${special.copy}</em></span><span class="special-reward">${coin}<b>+${special.rewardCoins}</b></span>`;
    }
    pulse(panel,order);
  };
  const decorate=()=>{
    if(decorating)return;decorating=true;
    try{
      const state=getState();
      for(const order of state.currentOrders||[]){
        if(!order.special)continue;
        decorateChoice(order,order.special);decorateBoardJob(order,order.special);decorateServiceCard(order,order.special);
      }
    }finally{decorating=false;}
  };
  const observer=new MutationObserver(decorate);observer.observe(root,{childList:true,subtree:true});decorate();
  return {refresh:decorate};
}
