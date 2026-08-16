import { getState } from './aaa-session.js';
import { purposeGoal } from './aaa-purpose.js';

const starWord=count=>count===1?'Stern':'Sterne';

export function installPlaceScreenV3(root){
  let decorating=false,lastSignature='';
  const navigateToOrders=()=>root.querySelector('.nav-tab[data-view="orders"]')?.click();
  const decorate=()=>{
    if(decorating||root.dataset.view!=='place')return;
    const current=root.querySelector('.place-current-goal');
    if(!current)return;
    const goal=purposeGoal(getState());
    if(goal.complete||!goal.upgrade){current.querySelector('.place-goal-status')?.remove();return;}
    const signature=`${goal.upgrade.id}|${goal.current}|${goal.cost}|${goal.missing}|${goal.ready}`;
    if(signature===lastSignature&&current.querySelector('.place-goal-status'))return;
    decorating=true;lastSignature=signature;
    try{
      current.querySelector('.place-goal-status')?.remove();
      const status=document.createElement('div');
      status.className=`place-goal-status${goal.ready?' ready':''}`;
      status.id='place-build-status';
      if(goal.ready){
        status.innerHTML='<span aria-hidden="true">✓</span><strong>Baubereit</strong><small>Alle Sterne sind da.</small>';
      }else{
        status.innerHTML=`<span aria-hidden="true">★</span><strong>Noch ${goal.missing} ${starWord(goal.missing)}</strong><small>Aufträge bringen Ausbau-Sterne.</small><button type="button" class="place-goal-orders" data-place-v3-orders>Zu Aufträgen →</button>`;
      }
      const build=current.querySelector(':scope > button[data-action="build"]');
      if(build){build.setAttribute('aria-describedby',status.id);current.insertBefore(status,build);}else current.append(status);
    }finally{decorating=false;}
  };
  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:null;
    if(target?.closest('[data-place-v3-orders]')){event.preventDefault();event.stopPropagation();navigateToOrders();}
  },true);
  const observer=new MutationObserver(()=>queueMicrotask(decorate));
  observer.observe(root,{childList:true,subtree:true});
  decorate();
  return {refresh:()=>{lastSignature='';decorate();},disconnect:()=>observer.disconnect()};
}