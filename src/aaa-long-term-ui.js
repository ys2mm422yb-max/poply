import { getState } from './aaa-session.js';
import { PLACE_UPGRADES } from './v2-game.js';
import { purposeGoal } from './aaa-purpose.js';
import { totalItemDiscoveryCount } from './aaa-collection.js';
import { generatorMasterySummary } from './aaa-generator-mastery.js';

const generatorUses=state=>(state?.board||[]).reduce((sum,item)=>sum+(item?.kind==='generator'?Math.max(0,Number(item.taps)||0):0),0);

function completionMarkup(state){
  const items=totalItemDiscoveryCount(state),generators=generatorMasterySummary(state);
  return `<div class="world-complete-copy"><small>POPLY-WELT KOMPLETT</small><strong>Alle drei Places leuchten.</strong><p>Café am Meer · Sonnenkai · Dachgarten sind vollständig restauriert.</p></div><div class="world-complete-stats"><span><b>${PLACE_UPGRADES.length}/${PLACE_UPGRADES.length}</b><small>Ausbauten</small></span><span><b>${items.found}/${items.total}</b><small>Items</small></span><span><b>${generators.mastered}/${generators.known}</b><small>Generator-Meister</small></span></div><em>Dein Café bleibt offen: Sammlung vervollständigen, Generatoren meistern und tägliche Geschichten weiterspielen.</em>`;
}

export function installLongTermUI(root){
  let decorating=false,lastSignature='';
  const decorate=()=>{
    if(decorating)return;decorating=true;
    try{
      const state=getState(),goal=purposeGoal(state),view=root.querySelector('.view-place');
      if(!view){lastSignature='';return;}
      const signature=`${goal.complete?'1':'0'}|${state.discoveries?.length||0}|${generatorUses(state)}`;
      if(signature===lastSignature)return;lastSignature=signature;
      view.classList.toggle('world-complete',goal.complete);
      if(!goal.complete){view.querySelector('.world-complete-payoff')?.classList.remove('world-complete-payoff');return;}
      let card=view.querySelector('.place-current-goal');
      if(!card){card=document.createElement('section');view.querySelector('.world-hero')?.after(card);}
      card.className='place-current-goal world-complete-payoff';
      card.dataset.worldComplete='';card.setAttribute('role','status');card.setAttribute('aria-label','Poply-Welt komplett. Alle drei Places sind restauriert.');
      card.innerHTML=completionMarkup(state);
    }finally{decorating=false;}
  };
  const observer=new MutationObserver(()=>queueMicrotask(decorate));observer.observe(root,{childList:true,subtree:true});decorate();
  return {refresh:()=>{lastSignature='';decorate();},disconnect:()=>observer.disconnect()};
}
