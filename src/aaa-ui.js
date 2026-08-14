import { COPY, headerMarkup, navMarkup, boardView, placeView, ordersView } from './aaa-view.js';
import { getState, resetSession, generateAt, deliverOrder, buildUpgrade } from './aaa-session.js';

export function createUI(root,toast){
  let view='board',menuOpen=false,lastFx=null,toastTimer=0;
  const buzz=pattern=>{try{navigator.vibrate?.(pattern);}catch{}};
  const message=(text,tone='good')=>{clearTimeout(toastTimer);toast.textContent=text;toast.dataset.tone=tone;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),1400);};
  const applyFx=fx=>{
    if(view!=='board'||!fx)return;
    requestAnimationFrame(()=>{
      const target=fx.index==null?null:root.querySelector(`[data-index="${fx.index}"]`);
      const source=fx.sourceIndex==null?null:root.querySelector(`[data-index="${fx.sourceIndex}"]`);
      if(fx.type==='merge')target?.classList.add('fx-merge','fx-tier-up');
      if(fx.type==='spawn'){
        source?.classList.add('fx-generator-dispense');
        target?.classList.add('fx-spawn','fx-dispensed-item');
      }
    });
  };
  const render=()=>{
    const state=getState();root.dataset.view=view;
    const content=view==='place'?placeView(state):view==='orders'?ordersView(state):boardView(state);
    root.innerHTML=`${headerMarkup(state,menuOpen)}${content}${navMarkup(view)}`;
    if(lastFx){const fx=lastFx;lastFx=null;applyFx(fx);}
  };
  root.addEventListener('click',event=>{
    const tab=event.target.closest('[data-view]');if(tab){view=tab.dataset.view;menuOpen=false;render();return;}
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(action==='menu'){menuOpen=!menuOpen;render();return;}
    if(action==='reset'){if(window.confirm('Spielstand wirklich zurücksetzen?')){resetSession();view='board';menuOpen=false;render();message(COPY.purpose);}return;}
    if(action==='build'){const result=buildUpgrade();if(!result.changed)message('Für dieses Ziel fehlen noch Sterne.','bad');else{buzz([16,22,20]);message(`Ausbau geschafft: ${result.upgrade.label}`);render();}return;}
    const order=event.target.closest('[data-order]');if(order){const result=deliverOrder(order.dataset.order);if(!result.changed)message('Auftrag ist noch nicht fertig.','bad');else{buzz([10,18,14]);message(`Auftrag geliefert  +${result.rewards.coins} ●  +${result.rewards.stars} ★`);render();}return;}
    if(event.detail===0){const generator=event.target.closest('.board-cell.generator');if(generator)spawn(Number(generator.dataset.index));}
  });
  const spawn=index=>{
    const result=generateAt(index);
    if(!result.changed){message(result.reason==='board-full'?'Board voll – merge zuerst Items.':'Keine Energie.','bad');return;}
    lastFx={type:'spawn',sourceIndex:index,index:result.spawnedIndex};
    buzz([5,8]);message('Neues Item');render();
  };
  return {render,message,spawn,getView:()=>view,buzz,setFx:fx=>{lastFx=fx;}};
}
