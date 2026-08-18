import { getState, chooseServiceCallAt } from './aaa-session.js';
import { serviceCallStatus, serviceCallReward, serviceCallModeLabel, serviceCallProgressText } from './aaa-service-call.js';

const callOrder=(state,status)=>state.currentOrders?.find(order=>order.id===status.orderId)||null;
const setText=(node,text)=>{if(node.textContent!==text)node.textContent=text;};

export function installServiceCallUI(root,ui){
  let decorating=false;
  const setMarkup=(node,signature,markup)=>{if(node.dataset.signature===signature)return;node.dataset.signature=signature;node.innerHTML=markup;};

  const upsertBoardStrip=(container,status,state)=>{
    if(!container)return;
    let strip=container.querySelector(':scope > .service-call-strip');
    if(!status.ready&&!status.active){strip?.remove();return;}
    if(!strip){strip=document.createElement('section');strip.className='service-call-strip';container.prepend(strip);}
    const order=callOrder(state,status);
    if(status.ready){
      const signature=`ready:${status.nextAt}`;
      setMarkup(strip,signature,'<span class="service-call-mark">!</span><span><small>SERVICE-RUF BEREIT</small><strong>Gast priorisieren</strong><em>Optionaler Bonus</em></span><button type="button" data-service-call-open-orders>Wählen</button>');
      strip.classList.add('is-ready');strip.classList.remove('is-active','mode-direct','mode-stock');
      return;
    }
    const signature=`active:${status.orderId}:${status.mode}:${status.generatorProgress}`;
    setMarkup(strip,signature,`<span class="service-call-mark">${status.mode==='stock'?'↻':'→'}</span><span><small>RUF · ${serviceCallModeLabel(status.mode).toUpperCase()}</small><strong>${order?.title||'Gewählter Gast'} zuerst</strong><em>${status.mode==='stock'?`${serviceCallProgressText(status)} · dann servieren`:'Als nächste Lieferung'}</em></span><b class="service-call-strip-reward">+${serviceCallReward(order,status.mode)} ●</b>`);
    strip.classList.remove('is-ready','mode-direct','mode-stock');strip.classList.add('is-active',`mode-${status.mode}`);
  };

  const upsertReadyChoice=(view,status,state)=>{
    let panel=view?.querySelector(':scope > .service-call-choice-panel');
    if(!view||!status.ready){panel?.remove();return;}
    const card=view.querySelector('.service-card[data-service-order]');
    const orderId=card?.dataset.serviceOrder;
    const order=state.currentOrders?.find(entry=>entry.id===orderId);
    if(!orderId||!order){panel?.remove();return;}
    if(!panel){
      panel=document.createElement('section');panel.className='service-call-choice-panel is-ready';
      const queue=view.querySelector(':scope > .customer-queue');
      if(queue)queue.after(panel);else card?.before(panel);
    }
    const direct=serviceCallReward(order,'direct'),stock=serviceCallReward(order,'stock');
    const signature=`ready:${orderId}:${direct}:${stock}`;
    setMarkup(panel,signature,`<div class="service-call-choice-copy"><small>OPTIONALER SERVICE-RUF</small><strong>${order.title} priorisieren?</strong><span>Bonusweg wählen</span></div><button type="button" data-service-call-mode="direct" data-service-call-order="${orderId}"><span><b>Direkt</b><small>Nächste Lieferung</small></span><strong>+${direct} ●</strong></button><button type="button" data-service-call-mode="stock" data-service-call-order="${orderId}"><span><b>Nachschub</b><small>2× Generator zuerst</small></span><strong>+${stock} ●</strong></button>`);
  };

  const upsertActivePanel=(card,status,state)=>{
    if(!card)return;
    let panel=card.querySelector(':scope > .service-call-panel');
    const orderId=card.dataset.serviceOrder,order=state.currentOrders?.find(entry=>entry.id===orderId);
    const shouldShow=status.active&&status.orderId===orderId;
    card.classList.toggle('has-service-call',shouldShow);
    if(!shouldShow){panel?.remove();return;}
    if(!panel){
      panel=document.createElement('section');panel.className='service-call-panel';
      const content=card.querySelector(':scope > .service-content');
      if(content)content.after(panel);else card.querySelector(':scope > .service-deliver')?.before(panel);
    }
    const reward=serviceCallReward(order,status.mode),signature=`active:${orderId}:${status.mode}:${status.generatorProgress}`;
    const headline=status.mode==='stock'?`Nachschub ${status.generatorProgress}/${status.generatorTarget}`:'Als Nächstes servieren';
    const detail=status.mode==='stock'
      ?status.generatorProgress>=status.generatorTarget?'Nachschub fertig · jetzt diesen Gast servieren.':`Noch ${Math.max(0,status.generatorTarget-status.generatorProgress)}× Generator, dann diesen Gast servieren.`
      :'Keinen anderen Gast vorher bedienen.';
    setMarkup(panel,signature,`<div class="service-call-copy"><small>RUF AKTIV · ${serviceCallModeLabel(status.mode).toUpperCase()}</small><strong>${headline}</strong><p>${detail}</p></div><div class="service-call-active-reward"><small>Bonus</small><strong>+${reward} ●</strong></div>`);
    panel.classList.remove('is-ready','mode-direct','mode-stock');panel.classList.add('is-active',`mode-${status.mode}`);
  };

  const decorateOrders=(status,state)=>{
    const view=root.querySelector('.view-orders');if(!view)return;
    // Orders owns no top Ruf banner. Ready is a dedicated choice row; active context lives in hero + selected card.
    view.querySelector(':scope > .service-call-strip')?.remove();
    view.classList.toggle('has-service-call-ready',status.ready);
    view.classList.toggle('has-service-call-active',status.active);
    view.classList.remove('has-service-call-strip');
    upsertReadyChoice(view,status,state);
    root.querySelectorAll('.customer-choice').forEach(node=>{
      const orderId=node.dataset.selectOrder,isActive=status.active&&status.orderId===orderId;
      node.classList.toggle('service-call-eligible',status.ready);node.classList.toggle('service-call-active',isActive);
      let badge=node.querySelector('.service-call-choice-badge');
      if(isActive){
        if(!badge){badge=document.createElement('span');badge.className='service-call-choice-badge';node.append(badge);}
        setText(badge,status.mode==='stock'?`${status.generatorProgress}/${status.generatorTarget}`:'RUF');
      }else badge?.remove();
    });
    upsertActivePanel(root.querySelector('.service-card[data-service-order]'),status,state);
  };

  const decorateBoard=(status,state)=>{
    const view=root.querySelector('.view-board');if(!view)return;
    const hasStrip=status.ready||status.active;
    view.classList.toggle('has-service-call-strip',hasStrip);
    view.classList.toggle('has-service-call-active',status.active);
    upsertBoardStrip(view,status,state);
    root.querySelectorAll('.board-job').forEach(node=>{
      const active=status.active&&node.dataset.focusOrder===status.orderId;node.classList.toggle('service-call-active',active);
      let badge=node.querySelector('.service-call-board-badge');
      if(active){
        if(!badge){badge=document.createElement('span');badge.className='service-call-board-badge';node.append(badge);}
        setText(badge,status.mode==='stock'?`${status.generatorProgress}/${status.generatorTarget}`:'RUF');
      }else badge?.remove();
    });
  };

  const decorate=()=>{
    if(decorating)return;decorating=true;
    try{
      const state=getState(),status=serviceCallStatus(state);
      decorateOrders(status,state);decorateBoard(status,state);
    }finally{decorating=false;}
  };
  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement;if(!target)return;
    const choose=target.closest('[data-service-call-mode]');
    if(choose){
      event.preventDefault();event.stopPropagation();
      const result=chooseServiceCallAt(choose.dataset.serviceCallOrder,choose.dataset.serviceCallMode);
      if(result.changed){ui.render();ui.message(`Service-Ruf: ${result.order.title} · ${serviceCallModeLabel(result.status.mode)} · +${result.rewardCoins} Coins`);}
      else ui.message('Service-Ruf ist gerade nicht verfügbar.','bad');
      return;
    }
    if(target.closest('[data-service-call-open-orders]')){
      event.preventDefault();event.stopPropagation();root.querySelector('.nav-tab[data-view="orders"]')?.click();
    }
  });
  const observer=new MutationObserver(decorate);observer.observe(root,{childList:true,subtree:true});decorate();
  return {refresh:decorate};
}
