import { COPY, headerMarkup, navMarkup, boardView, placeView, ordersView } from './aaa-view.js';
import { getState, resetSession, generateAt, deliverOrder, buildUpgrade } from './aaa-session.js';
import { playFeedback } from './aaa-feedback.js';

export function createUI(root,toast){
  let view='board',menuOpen=false,lastFx=null,toastTimer=0,selectedOrderId=null;
  const message=(text,tone='good')=>{clearTimeout(toastTimer);toast.textContent=text;toast.dataset.tone=tone;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),1400);};
  const emitProgression=(result,source)=>{if(result?.progression)document.dispatchEvent(new CustomEvent('poply:progression',{detail:{...result.progression,source}}));};
  const applyFx=fx=>{
    if(view!=='board'||!fx)return;
    requestAnimationFrame(()=>{
      const target=fx.index==null?null:root.querySelector(`[data-index="${fx.index}"]`);
      const source=fx.sourceIndex==null?null:root.querySelector(`[data-index="${fx.sourceIndex}"]`);
      if(fx.type==='merge')target?.classList.add('fx-merge','fx-tier-up');
      if(fx.type==='spawn'){source?.classList.add('fx-generator-dispense');target?.classList.add('fx-spawn','fx-dispensed-item');}
    });
  };
  const flyNode=(source,target,className,delay=0)=>{
    if(!source||!target)return;
    const from=source.getBoundingClientRect(),to=target.getBoundingClientRect();
    const node=source.cloneNode(true);node.className=`delivery-flight ${className}`;node.setAttribute('aria-hidden','true');
    const x=from.left+from.width/2,y=from.top+from.height/2;node.style.left=`${x}px`;node.style.top=`${y}px`;
    node.style.setProperty('--travel-x',`${to.left+to.width/2-x}px`);node.style.setProperty('--travel-y',`${to.top+to.height/2-y}px`);node.style.animationDelay=`${delay}ms`;
    document.body.append(node);setTimeout(()=>node.remove(),950+delay);
  };
  const playDelivery=orderElement=>{
    const target=orderElement?.querySelector('.service-avatar,.board-job-avatar,.avatar,.focus-avatar')||orderElement;
    orderElement?.classList.add('fx-order-deliver');orderElement?.querySelectorAll('.need .item-art').forEach((item,index)=>flyNode(item,target,'item-flight',index*55));
  };
  const playRewards=rewards=>requestAnimationFrame(()=>{
    playFeedback('reward');
    const origin=root.querySelector('.resource.star')||root.querySelector('.mission-card'),starTarget=root.querySelector('.mission-card,.service-goal'),coinTarget=root.querySelector('.resource.coin');
    if(origin&&coinTarget){const token=document.createElement('span');token.className='reward-token coin-token';token.textContent=`+${rewards.coins} ●`;origin.append(token);flyNode(token,coinTarget,'reward-flight coin-flight',0);token.remove();}
    if(origin&&starTarget){const token=document.createElement('span');token.className='reward-token star-token';token.textContent=`+${rewards.stars} ★`;origin.append(token);flyNode(token,starTarget,'reward-flight star-flight',90);token.remove();}
    setTimeout(()=>{coinTarget?.classList.add('fx-reward-arrive');starTarget?.classList.add('fx-reward-arrive');},620);
  });
  const playRestorationReveal=(upgrade,unlockedPlace=null)=>requestAnimationFrame(()=>{
    const scene=root.querySelector('.world-hero,.scene-card');if(!scene)return;
    scene.classList.add('fx-restoration-reveal');
    const reveal=document.createElement('div');reveal.className=`restoration-reveal${unlockedPlace?' place-unlock-reveal':''}`;reveal.setAttribute('aria-live','polite');
    reveal.innerHTML=unlockedPlace?`<span>02</span><small>NEUER PLACE FREIGESCHALTET</small><strong>Sonnenkai</strong>`:`<span>✓</span><small>AUSBAU FERTIG</small><strong>${upgrade.label}</strong>`;
    scene.append(reveal);setTimeout(()=>reveal.remove(),unlockedPlace?2200:1700);
  });
  const render=()=>{
    const state=getState();root.dataset.view=view;
    const content=view==='place'?placeView(state):view==='orders'?ordersView(state,selectedOrderId):boardView(state);
    root.innerHTML=`${headerMarkup(state,menuOpen)}${content}${navMarkup(view)}`;
    if(lastFx){const fx=lastFx;lastFx=null;applyFx(fx);}
  };
  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement;if(!target)return;
    const focused=target.closest('[data-focus-order]');if(focused){selectedOrderId=focused.dataset.focusOrder;view='orders';menuOpen=false;render();return;}
    const selected=target.closest('[data-select-order]');if(selected){selectedOrderId=selected.dataset.selectOrder;render();return;}
    const tab=target.closest('.nav-tab[data-view]');if(tab){view=tab.dataset.view;menuOpen=false;render();return;}
    const action=target.closest('[data-action]')?.dataset.action;
    if(action==='menu'){menuOpen=!menuOpen;render();return;}
    if(action==='reset'){if(window.confirm('Spielstand wirklich zurücksetzen?')){resetSession();view='board';selectedOrderId=null;menuOpen=false;render();message(COPY.purpose);}return;}
    if(action==='build'){
      const result=buildUpgrade();
      if(!result.changed){playFeedback('invalid');message('Für dieses Ziel fehlen noch Sterne.','bad');}
      else{
        playFeedback('restoration');view='place';menuOpen=false;render();playRestorationReveal(result.upgrade,result.unlockedPlace);emitProgression(result,'restoration');
        message(result.unlockedPlace==='sunset'?'Place 02 freigeschaltet: Sonnenkai':`Ausbau geschafft: ${result.upgrade.label}`);
      }
      return;
    }
    const order=target.closest('[data-order]');
    if(order){
      const card=order.closest('.service-card,.board-job,.mini-order,.focus-order'),orderId=order.dataset.order,result=deliverOrder(orderId);
      if(!result.changed){playFeedback('invalid');message('Auftrag ist noch nicht fertig.','bad');}
      else{
        playDelivery(card);playFeedback('delivery');message(`Auftrag geliefert  +${result.rewards.coins} ●  +${result.rewards.stars} ★  +${result.progression?.gained||0} XP`);
        if(selectedOrderId===orderId)selectedOrderId=null;
        setTimeout(()=>{render();playRewards(result.rewards);emitProgression(result,'order');},320);
      }
      return;
    }
    if(event.detail===0){const generator=target.closest('.board-cell.generator');if(generator)spawn(Number(generator.dataset.index));}
  });
  const spawn=index=>{
    const result=generateAt(index);
    if(!result.changed){playFeedback('invalid');message(result.reason==='board-full'?'Board voll – merge zuerst Items.':'Keine Energie.','bad');return;}
    lastFx={type:'spawn',sourceIndex:index,index:result.spawnedIndex};playFeedback('spawn');message('Neues Item');render();
  };
  return {render,message,spawn,getView:()=>view,getSelectedOrder:()=>selectedOrderId,feedback:playFeedback,setFx:fx=>{lastFx=fx;}};
}
