import { getState } from './aaa-session.js';
import { PLACE_UPGRADES } from './v2-game.js';
import { purposeGoal, purposeLine, purposeRewardLine } from './aaa-purpose.js';
import { serviceCallStatus, serviceCallModeLabel } from './aaa-service-call.js';
import { placeSceneMarkup } from './aaa-place-art.js';
import { sunsetPlaceSceneMarkup } from './aaa-sunset-place.js';
import { gardenPlaceSceneMarkup } from './aaa-garden-place.js';

const sceneMarkup=(chapter,stage)=>chapter.id==='garden'?gardenPlaceSceneMarkup(stage):chapter.id==='sunset'?sunsetPlaceSceneMarkup(stage):placeSceneMarkup(stage);
const safeText=value=>String(value??'').replace(/\s+/g,' ').trim();
const upgradeById=id=>PLACE_UPGRADES.find(upgrade=>upgrade.id===id)??null;

function previewLayer(goal){
  if(goal.complete||!goal.upgrade)return null;
  const wrap=document.createElement('div');
  wrap.innerHTML=sceneMarkup(goal.chapter,Math.min(goal.step,goal.total));
  return wrap.querySelector(`.scene-upgrade.${goal.upgrade.id}`)?.cloneNode(true)??null;
}

function decorateBoard(root,goal){
  const card=root.querySelector('.mission-card.compact');if(!card)return;
  card.classList.add('purpose-card');
  const copy=card.querySelector('.mission-copy'),small=copy?.querySelector('small'),strong=copy?.querySelector('strong'),value=copy?.querySelector('span');
  if(goal.complete){
    if(small)small.textContent='DEINE POPLY-WELT';if(strong)strong.textContent='Alle Places aufgebaut';if(value)value.textContent='Alles sichtbar restauriert';
    return;
  }
  if(small)small.textContent=`NÄCHSTES ZIEL · ${goal.step}/${goal.total}`;
  if(strong)strong.textContent=goal.label;
  if(value)value.textContent=goal.ready?`★ ${goal.cost}/${goal.cost} · BEREIT`:`★ ${goal.current}/${goal.cost} · noch ${goal.missing}`;
  let after=copy?.querySelector('.purpose-after');
  if(copy&&!after){after=document.createElement('small');after.className='purpose-after purpose-board-after';copy.append(after);}
  if(after)after.textContent=`Danach: ${goal.after?.label??'weiter ausbauen'}`;
  const button=card.querySelector('button');
  if(button){
    button.disabled=false;button.removeAttribute('data-action');delete button.dataset.purposeGoPlace;delete button.dataset.purposeGoOrders;
    if(goal.ready){button.dataset.purposeGoPlace='';button.textContent='Jetzt bauen';}
    else{button.dataset.purposeGoOrders='';button.textContent=goal.current===0?'Auftrag spielen':`${goal.missing} ★ holen`;}
  }
}

function strategyLabel(order){
  if(order.opening&&order.sequence===0)return 'SCHNELLER START';
  if(order.requirements.length>=2)return 'KOMBI';
  if((Number(order.rewards?.stars)||0)>=4)return 'AUSBAU';
  return 'SCHNELL';
}

function decorateOrders(root,state,goal){
  if(goal.complete)return;
  const hero=root.querySelector('.service-hero');
  const heading=hero?.querySelector('h2'),intro=hero?.querySelector('p');
  const call=serviceCallStatus(state),activeOrder=call.active?state.currentOrders.find(order=>order.id===call.orderId):null;
  hero?.classList.toggle('is-service-call-ready-context',call.ready);
  hero?.classList.toggle('is-service-call-active-context',Boolean(call.active&&activeOrder));
  if(call.active&&activeOrder){
    if(heading)heading.textContent=call.mode==='stock'?`${activeOrder.title} vorbereiten.`:`${activeOrder.title} zuerst.`;
    if(intro)intro.textContent=call.mode==='stock'
      ?`Service-Ruf · ${serviceCallModeLabel(call.mode)} ${call.generatorProgress}/${call.generatorTarget} · dann servieren.`
      :`Service-Ruf · ${serviceCallModeLabel(call.mode)} · als nächste Lieferung servieren.`;
  }else if(call.ready){
    if(heading)heading.textContent=goal.ready?`${goal.label} ist baubereit.`:`Noch ${goal.missing} ★ bis „${goal.label}“.`;
    if(intro)intro.textContent='Service-Ruf ist optional · Gast wählen und Bonusweg festlegen.';
  }else{
    if(heading)heading.textContent=goal.ready?'Das Café ist baubereit.':'Wähle deinen nächsten Auftrag.';
    if(intro)intro.textContent=goal.ready?`„${goal.label}“ ist bereit – jetzt bauen.`:`Noch ${goal.missing} ★ bis „${goal.label}“. Kombis bringen mehr.`;
  }
  const goalNode=hero?.querySelector('.service-goal');
  if(goalNode){
    goalNode.classList.add('purpose-service-goal');delete goalNode.dataset.purposeGoOrders;goalNode.dataset.purposeGoPlace='';goalNode.setAttribute('role','button');goalNode.setAttribute('tabindex','0');goalNode.setAttribute('aria-label',`${goal.label}: ${goal.current} von ${goal.cost} Sterne. Place öffnen.`);
    const copy=goalNode.querySelector('div');if(copy){const small=copy.querySelector('small'),strong=copy.querySelector('strong');if(small)small.textContent=`Ziel ${goal.step}/${goal.total}`;if(strong)strong.textContent=goal.ready?'BAUBEREIT':`${goal.current}/${goal.cost} ★`;}
  }
  let after=hero?.querySelector('.purpose-after');
  if(hero&&!after){after=document.createElement('small');after.className='purpose-after purpose-orders-after';hero.firstElementChild?.append(after);}
  if(after)after.textContent=`Danach: ${goal.after?.label??'weiter ausbauen'}`;
  root.querySelectorAll('.service-card[data-service-order]').forEach(service=>{
    const order=state.currentOrders.find(entry=>entry.id===service.dataset.serviceOrder);if(!order)return;
    let badge=service.querySelector('.service-strategy');if(!badge){badge=document.createElement('span');badge.className='service-strategy';service.querySelector('.service-heading')?.prepend(badge);}if(badge)badge.textContent=strategyLabel(order);
    const purpose=service.querySelector('.service-purpose p');
    if(purpose){
      const stars=Number(order.rewards?.stars)||0;
      if(goal.ready){
        purpose.innerHTML=`<strong>+${stars} ★</strong> bleiben für „${goal.after?.label??'den nächsten Ausbau'}“.`;
      }else{
        const projected=Math.max(0,goal.missing-stars);
        purpose.innerHTML=projected===0
          ?`<strong>+${stars} ★</strong> macht „${goal.label}“ baubereit.`
          :`<strong>+${stars} ★</strong> für „${goal.label}“ · danach noch ${projected} ★.`;
      }
    }
  });
}

function afterLabel(goal){
  const after=goal.after;if(!after)return 'weiter ausbauen';
  if(after.kind!=='place')return after.label;
  const detail=String(after.detail||'').replace(/^Neuer Place \+ /,'').replaceAll(' + ',' · ');
  return detail?`${after.label} · ${detail}`:after.label;
}

function decoratePlace(root,goal){
  const hero=root.querySelector('.world-hero'),svg=hero?.querySelector('.place-scene-svg');
  if(!hero||!svg)return;
  // The objective tray is the single next-upgrade message; no duplicate scene badge.
  root.querySelectorAll('.purpose-blueprint-tag').forEach(node=>node.remove());
  svg.querySelectorAll('.scene-upgrade-preview').forEach(node=>node.remove());
  if(goal.complete)return;
  const layer=previewLayer(goal);
  if(layer){layer.classList.add('scene-upgrade-preview');layer.dataset.previewUpgrade=goal.upgrade.id;svg.append(layer);}
  const current=root.querySelector('.place-current-goal');
  if(current){
    current.classList.add('purpose-place-goal');
    const copy=current.querySelector('.goal-copy');
    const small=copy?.querySelector(':scope > small');if(small)small.textContent=`NÄCHSTES ZIEL · SCHRITT ${goal.step}/${goal.total}`;
    let unlock=current.querySelector('.purpose-place-unlock');if(goal.upgrade?.unlock&&!unlock){unlock=document.createElement('div');unlock.className='purpose-place-unlock';copy?.append(unlock);}if(unlock)unlock.innerHTML=`<span>🔓</span><strong>Schaltet frei: ${goal.upgrade.unlock}</strong>`;
    let after=current.querySelector('.purpose-after');if(!after){after=document.createElement('div');after.className='purpose-after purpose-place-after';copy?.append(after);}
    if(after){
      after.classList.toggle('is-next-place',goal.after?.kind==='place');
      after.innerHTML=`<span>DANACH</span><strong>${afterLabel(goal)}</strong>`;
    }
  }
}

export function installPurposeUI(root,ui){
  let decorating=false,pulseTimer=0,lastViewNode=null,lastSignature='';
  let knownUpgrades=new Set(getState().placeUpgrades);
  const navigateToPlace=()=>root.querySelector('.nav-tab[data-view="place"]')?.click();
  const navigateToOrders=()=>root.querySelector('.nav-tab[data-view="orders"]')?.click();
  const pulse=(text,tone='progress')=>{
    clearTimeout(pulseTimer);root.querySelector('.purpose-reward-link')?.remove();
    const target=root.querySelector('.purpose-card,.purpose-service-goal,.purpose-place-goal');if(!target)return;
    const node=document.createElement('div');node.className=`purpose-reward-link ${tone}`;node.setAttribute('role','status');node.textContent=text;target.append(node);pulseTimer=setTimeout(()=>node.remove(),1800);
  };
  const highlightNewBuild=state=>{
    const fresh=state.placeUpgrades.filter(id=>!knownUpgrades.has(id));
    knownUpgrades=new Set(state.placeUpgrades);
    if(!fresh.length||root.dataset.view!=='place')return;
    const id=fresh.at(-1),layer=root.querySelector(`.scene-upgrade.${id}:not(.scene-upgrade-preview)`),upgrade=upgradeById(id);
    if(layer){layer.classList.add('fx-purpose-built');setTimeout(()=>layer.classList.remove('fx-purpose-built'),1900);}
    if(upgrade?.unlock)setTimeout(()=>pulse(`Freigeschaltet: ${upgrade.unlock}`,'level'),260);
  };
  const decorate=()=>{
    if(decorating)return;
    const state=getState(),viewNode=root.querySelector('.game-view'),call=serviceCallStatus(state);
    const signature=`${root.dataset.view}|${state.stars}|${state.placeUpgrades.join(',')}|${state.currentOrders.map(order=>`${order.id}:${order.title}`).join(',')}|${call.ready}:${call.active}:${call.orderId??''}:${call.mode??''}:${call.generatorProgress??0}`;
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
    if(target.closest('[data-purpose-go-orders]')){event.preventDefault();event.stopPropagation();navigateToOrders();return;}
    if(target.closest('[data-purpose-go-place]')){event.preventDefault();event.stopPropagation();navigateToPlace();}
  },true);
  root.addEventListener('keydown',event=>{
    if(!(event.key==='Enter'||event.key===' ')||!(event.target instanceof Element))return;
    if(event.target.closest('[data-purpose-go-orders]')){event.preventDefault();navigateToOrders();return;}
    if(event.target.closest('[data-purpose-go-place]')){event.preventDefault();navigateToPlace();}
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