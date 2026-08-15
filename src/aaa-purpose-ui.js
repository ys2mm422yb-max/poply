import { getState } from './aaa-session.js';
import { purposeGoal, purposeLine, purposeRewardLine } from './aaa-purpose.js';
import { placeSceneMarkup } from './aaa-place-art.js';
import { sunsetPlaceSceneMarkup } from './aaa-sunset-place.js';
import { gardenPlaceSceneMarkup } from './aaa-garden-place.js';

const sceneMarkup=(chapter,stage)=>chapter.id==='garden'?gardenPlaceSceneMarkup(stage):chapter.id==='sunset'?sunsetPlaceSceneMarkup(stage):placeSceneMarkup(stage);
const safeText=value=>String(value??'').replace(/\s+/g,' ').trim();

function previewLayer(goal){
  if(goal.complete||!goal.upgrade)return null;
  const wrap=document.createElement('div');
  wrap.innerHTML=sceneMarkup(goal.chapter,Math.min(goal.step,goal.total));
  return wrap.querySelector(`.scene-upgrade.${goal.upgrade.id}`)?.cloneNode(true)??null;
}

function decorateBoard(root,goal){
  const card=root.querySelector('.mission-card.compact');if(!card)return;
  card.classList.add('purpose-card');
  const small=card.querySelector('.mission-copy small'),strong=card.querySelector('.mission-copy strong'),value=card.querySelector('.mission-copy span');
  if(goal.complete){
    if(small)small.textContent='DEINE POPLY-WELT';if(strong)strong.textContent='Alle Places aufgebaut';if(value)value.textContent='Alles sichtbar restauriert';
    return;
  }
  if(small)small.textContent=`NÄCHSTES ZIEL · ${goal.step}/${goal.total}`;
  if(strong)strong.textContent=goal.label;
  if(value)value.textContent=goal.ready?`★ ${goal.cost}/${goal.cost} · BEREIT`:`★ ${goal.current}/${goal.cost} · noch ${goal.missing}`;
  let after=card.querySelector('.purpose-after');
  if(!after){after=document.createElement('small');after.className='purpose-after';card.querySelector('.mission-progress')?.after(after);}
  if(after)after.textContent=`Danach: ${goal.after?.label??'weiter ausbauen'}`;
  const button=card.querySelector('button');
  if(button){button.disabled=false;button.removeAttribute('data-action');button.dataset.purposeGoPlace='';button.textContent=goal.ready?'Jetzt im Place bauen':'Zum Place';}
}

function decorateOrders(root,state,goal){
  if(goal.complete)return;
  const hero=root.querySelector('.service-hero');
  const goalNode=hero?.querySelector('.service-goal');
  if(goalNode){
    goalNode.classList.add('purpose-service-goal');goalNode.dataset.purposeGoPlace='';goalNode.setAttribute('role','button');goalNode.setAttribute('tabindex','0');goalNode.setAttribute('aria-label',`${goal.label}: ${goal.current} von ${goal.cost} Sterne. Place öffnen.`);
    const copy=goalNode.querySelector('div');if(copy){const small=copy.querySelector('small'),strong=copy.querySelector('strong');if(small)small.textContent=`Ziel ${goal.step}/${goal.total}`;if(strong)strong.textContent=goal.ready?'BAUBEREIT':`${goal.current}/${goal.cost} ★`;}
  }
  let after=hero?.querySelector('.purpose-after');
  if(hero&&!after){after=document.createElement('small');after.className='purpose-after purpose-orders-after';hero.firstElementChild?.append(after);}
  if(after)after.textContent=`Danach: ${goal.after?.label??'weiter ausbauen'}`;
  const service=root.querySelector('.service-card[data-service-order]');
  if(service){
    const order=state.currentOrders.find(entry=>entry.id===service.dataset.serviceOrder);
    const purpose=service.querySelector('.service-purpose p');
    if(order&&purpose){
      const stars=Number(order.rewards?.stars)||0,projected=Math.max(0,goal.missing-stars);
      purpose.innerHTML=projected===0
        ?`<strong>+${stars} ★</strong> macht „${goal.label}“ baubereit.`
        :`<strong>+${stars} ★</strong> für „${goal.label}“ · danach noch ${projected} ★.`;
    }
  }
}

function decoratePlace(root,goal){
  const hero=root.querySelector('.world-hero'),svg=hero?.querySelector('.place-scene-svg');
  if(!hero||!svg)return;
  root.querySelectorAll('.purpose-blueprint-tag').forEach(node=>node.remove());
  svg.querySelectorAll('.scene-upgrade-preview').forEach(node=>node.remove());
  if(goal.complete)return;
  const layer=previewLayer(goal);
  if(layer){layer.classList.add('scene-upgrade-preview');layer.dataset.previewUpgrade=goal.upgrade.id;svg.append(layer);}
  const tag=document.createElement('div');tag.className='purpose-blueprint-tag';tag.innerHTML=`<small>ALS NÄCHSTES</small><strong>${goal.label}</strong>`;hero.append(tag);
  const current=root.querySelector('.place-current-goal');
  if(current){
    current.classList.add('purpose-place-goal');
    const small=current.querySelector('.goal-copy > small');if(small)small.textContent=`NÄCHSTES ZIEL · SCHRITT ${goal.step}/${goal.total}`;
    let after=current.querySelector('.purpose-after');if(!after){after=document.createElement('div');after.className='purpose-after purpose-place-after';current.querySelector('.goal-copy')?.append(after);}
    if(after)after.innerHTML=`<span>DANACH</span><strong>${goal.after?.label??'weiter ausbauen'}</strong><small>${goal.after?.detail??''}</small>`;
  }
}

export function installPurposeUI(root,ui){
  let decorating=false,pulseTimer=0,lastViewNode=null,lastSignature='';
  let knownUpgrades=new Set(getState().placeUpgrades);
  const navigateToPlace=()=>root.querySelector('.nav-tab[data-view="place"]')?.click();
  const pulse=(text,tone='progress')=>{
    clearTimeout(pulseTimer);root.querySelector('.purpose-reward-link')?.remove();
    const target=root.querySelector('.purpose-card,.purpose-service-goal,.purpose-place-goal');if(!target)return;
    const node=document.createElement('div');node.className=`purpose-reward-link ${tone}`;node.setAttribute('role','status');node.textContent=text;target.append(node);pulseTimer=setTimeout(()=>node.remove(),1800);
  };
  const highlightNewBuild=state=>{
    const fresh=state.placeUpgrades.filter(id=>!knownUpgrades.has(id));
    knownUpgrades=new Set(state.placeUpgrades);
    if(!fresh.length||root.dataset.view!=='place')return;
    const id=fresh.at(-1),layer=root.querySelector(`.scene-upgrade.${id}:not(.scene-upgrade-preview)`);
    if(layer){layer.classList.add('fx-purpose-built');setTimeout(()=>layer.classList.remove('fx-purpose-built'),1900);}
  };
  const decorate=()=>{
    if(decorating)return;
    const state=getState(),viewNode=root.querySelector('.game-view');
    const signature=`${root.dataset.view}|${state.stars}|${state.placeUpgrades.join(',')}|${state.currentOrders.map(order=>order.id).join(',')}`;
    if(viewNode===lastViewNode&&signature===lastSignature)return;
    decorating=true;lastViewNode=viewNode;lastSignature=signature;
    try{
      const goal=purposeGoal(state);
      if(root.dataset.view==='board')decorateBoard(root,goal);
      if(root.dataset.view==='orders')decorateOrders(root,state,goal);
      if(root.dataset.view==='place')decoratePlace(root,goal);
      highlightNewBuild(state);
    }finally{decorating=false;}
  };
  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement;if(!target)return;
    if(target.closest('[data-purpose-go-place]')){event.preventDefault();event.stopPropagation();navigateToPlace();}
  },true);
  root.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ')&&event.target instanceof Element&&event.target.closest('[data-purpose-go-place]')){event.preventDefault();navigateToPlace();}
  });
  document.addEventListener('poply:progression',event=>{
    const detail=event.detail??{},source=detail.source;
    if(source==='order'||source==='daily-bonus'){
      const toast=safeText(document.querySelector('#toast')?.textContent),match=toast.match(/\+(\d+)\s*(?:★|Sterne)/i),stars=Number(match?.[1]||0);
      setTimeout(()=>{lastSignature='';decorate();pulse(purposeRewardLine(getState(),stars));},360);
    }
    if(Number(detail.levelsGained||0)>0)setTimeout(()=>{lastSignature='';decorate();pulse(`Level ${detail.after?.level??''} · ${purposeLine(getState())}`,'level');},950);
  });
  const observer=new MutationObserver(()=>queueMicrotask(decorate));observer.observe(root,{childList:true,subtree:true});
  decorate();
  return {refresh:()=>{lastSignature='';decorate();},disconnect:()=>observer.disconnect()};
}
