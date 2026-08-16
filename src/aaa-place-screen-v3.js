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
    const build=current.querySelector(':scope > button');
    if(goal.complete||!goal.upgrade){
      current.querySelector('.place-goal-status')?.remove();
      if(build){delete build.dataset.placeV4Orders;}
      return;
    }
    const signature=`${goal.upgrade.id}|${goal.current}|${goal.cost}|${goal.missing}|${goal.ready}`;
    if(signature===lastSignature&&current.querySelector('.place-goal-status'))return;
    decorating=true;lastSignature=signature;
    try{
      current.querySelector('.place-goal-status')?.remove();
      const status=document.createElement('div');
      status.className=`place-goal-status${goal.ready?' ready':''}`;
      status.id='place-build-status';
      status.innerHTML=goal.ready
        ?'<span aria-hidden="true">✓</span><strong>Baubereit</strong>'
        :`<span aria-hidden="true">★</span><strong>Noch ${goal.missing} ${starWord(goal.missing)}</strong>`;
      if(build){
        build.setAttribute('aria-describedby',status.id);
        current.insertBefore(status,build);
        if(goal.ready){
          delete build.dataset.placeV4Orders;
          build.dataset.action='build';
          build.disabled=false;
          build.textContent='Jetzt bauen';
        }else{
          build.removeAttribute('data-action');
          build.dataset.placeV4Orders='';
          build.disabled=false;
          build.textContent=goal.missing===1?'1 ★ in Aufträgen holen':`${goal.missing} ★ in Aufträgen holen`;
          build.setAttribute('aria-label',`${goal.missing} ${starWord(goal.missing)} fehlen. Zu Aufträgen wechseln.`);
        }
      }else current.append(status);
    }finally{decorating=false;}
  };
  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:null;
    if(target?.closest('[data-place-v4-orders]')){
      event.preventDefault();event.stopPropagation();navigateToOrders();
    }
  },true);
  const observer=new MutationObserver(()=>queueMicrotask(decorate));
  observer.observe(root,{childList:true,subtree:true});
  decorate();
  return {refresh:()=>{lastSignature='';decorate();},disconnect:()=>observer.disconnect()};
}
