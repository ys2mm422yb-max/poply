import { getState } from './aaa-session.js';
import { itemMarkup } from './aaa-view.js';
import { productionGuide, generatorGuide } from './aaa-production-guide.js';

const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

export function installItemGuidance(root,ui){
  let sheet=null,focusTimer=0,focusKey=null,refreshQueued=false;

  const close=()=>{sheet?.remove();sheet=null;};
  const requirementForNode=node=>{
    const state=getState();
    const owner=node.closest('[data-service-order],[data-focus-order]');
    const orderId=owner?.dataset.serviceOrder||owner?.dataset.focusOrder;
    const order=state.currentOrders.find(entry=>entry.id===orderId);
    if(!order)return null;
    const needs=[...owner.querySelectorAll('.need')],index=needs.indexOf(node);
    return index>=0?order.requirements[index]||null:null;
  };

  const chainMarkup=guide=>guide.chain.map((step,index)=>`<span class="guide-chain-step ${index===guide.chain.length-1?'current':''}"><b>${step.name}</b><small>Stufe ${step.level}</small></span>`).join('<i aria-hidden="true">→</i>');

  const openRequirement=(req)=>{
    const guide=productionGuide(req.family,req.level);if(!guide)return;
    close();
    sheet=document.createElement('div');sheet.className='production-guide-layer';
    sheet.innerHTML=`<button class="production-guide-backdrop" data-guide-close aria-label="Schließen"></button><section class="production-guide-sheet" role="dialog" aria-modal="true" aria-label="Produktionsweg für ${guide.itemName}"><header><div class="production-guide-item">${itemMarkup({kind:'item',family:guide.family,level:guide.level},true)}</div><div><small>WOHER KOMMT DAS?</small><h2>${guide.itemName}</h2><p><b>${guide.generatorLabel}</b> erzeugt ${guide.baseItem}.</p></div><button class="guide-close" data-guide-close aria-label="Schließen">×</button></header><div class="production-source"><span>QUELLE</span><strong>${guide.generatorLabel}</strong><small>${guide.familyLabel} · ${guide.baseUnits}× ${guide.baseItem} für Stufe ${guide.level}</small></div><div class="production-chain" aria-label="Merge-Kette">${chainMarkup(guide)}</div><p class="production-rule">Immer zwei gleiche Items mergen, bis <b>${guide.itemName}</b> entsteht.</p><button class="guide-board-action" data-guide-show-board="${guide.generatorKey}">Generator auf Board zeigen →</button></section>`;
    document.body.append(sheet);sheet.querySelector('.guide-close')?.focus();
  };

  const openGenerator=key=>{
    const guide=generatorGuide(key,getState());if(!guide)return;
    close();sheet=document.createElement('div');sheet.className='production-guide-layer';
    const outputs=guide.families.map(family=>`<div class="generator-output"><b>${family.label}</b><span>${family.stages.slice(0,3).join(' → ')}</span></div>`).join('');
    const jobs=guide.waitingOrders.length?guide.waitingOrders.map(order=>`<span>${order.title}</span>`).join(''):'<span>Kein wartender Gast braucht diese Quelle gerade.</span>';
    sheet.innerHTML=`<button class="production-guide-backdrop" data-guide-close aria-label="Schließen"></button><section class="production-guide-sheet generator-sheet" role="dialog" aria-modal="true" aria-label="${guide.label}"><header><div class="generator-symbol">⚙</div><div><small>GENERATOR</small><h2>${guide.label}</h2><p>1 Energie pro Produktion.</p></div><button class="guide-close" data-guide-close aria-label="Schließen">×</button></header><div class="generator-outputs"><small>ERZEUGT</small>${outputs}</div><div class="generator-orders"><small>GERADE GEBRAUCHT FÜR</small>${jobs}</div><p class="production-rule">Tippe den Generator normal an, um zu produzieren. Ziehe Items zusammen, um höhere Stufen zu bauen.</p></section>`;
    document.body.append(sheet);sheet.querySelector('.guide-close')?.focus();
  };

  const applyFocus=()=>{
    if(!focusKey||root.dataset.view!=='board')return;
    const nodes=[...root.querySelectorAll(`.board-cell.generator-${focusKey}`)];
    nodes.forEach(node=>node.classList.add('generator-guide-focus'));
    nodes[0]?.scrollIntoView?.({block:'center',inline:'center',behavior:'smooth'});
  };

  const showBoard=async key=>{
    close();focusKey=key;clearTimeout(focusTimer);
    const tab=root.querySelector('.nav-tab[data-view="board"]');
    if(root.dataset.view!=='board')tab?.click();
    await nextFrame();applyFocus();
    const found=root.querySelector(`.board-cell.generator-${key}`);
    if(found)ui?.message?.(`${generatorGuide(key)?.label||'Generator'} auf dem Board markiert.`);
    else ui?.message?.('Dieser Generator ist noch nicht freigeschaltet.','bad');
    focusTimer=setTimeout(()=>{root.querySelectorAll('.generator-guide-focus').forEach(node=>node.classList.remove('generator-guide-focus'));focusKey=null;},2800);
  };

  const decorate=()=>{
    refreshQueued=false;const state=getState();
    root.querySelectorAll('[data-service-order],[data-focus-order]').forEach(owner=>{
      const orderId=owner.dataset.serviceOrder||owner.dataset.focusOrder;
      const order=state.currentOrders.find(entry=>entry.id===orderId);if(!order)return;
      [...owner.querySelectorAll('.need')].forEach((node,index)=>{
        const req=order.requirements[index];if(!req)return;
        const guide=productionGuide(req.family,req.level);if(!guide)return;
        node.dataset.guideFamily=req.family;node.dataset.guideLevel=String(req.level);node.setAttribute('role','button');node.tabIndex=0;
        node.setAttribute('aria-label',`${guide.itemName}: Quelle und Merge-Weg anzeigen`);
        node.title=`${guide.itemName} · aus ${guide.generatorLabel}`;
      });
    });
    root.querySelectorAll('.board-cell.generator').forEach(cell=>{
      const index=Number(cell.dataset.index),item=state.board[index];if(!item?.generator)return;
      if(!cell.querySelector('[data-generator-info]')){
        const info=document.createElement('span');info.className='generator-guide-info';info.dataset.generatorInfo=item.generator;info.setAttribute('role','button');info.tabIndex=0;info.setAttribute('aria-label',`${generatorGuide(item.generator)?.label||'Generator'} erklären`);info.textContent='i';cell.append(info);
      }
    });
    applyFocus();
  };
  const schedule=()=>{if(refreshQueued)return;refreshQueued=true;queueMicrotask(decorate);};

  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    const info=target.closest('[data-generator-info]');if(info){event.preventDefault();event.stopPropagation();openGenerator(info.dataset.generatorInfo);return;}
    const need=target.closest('.need[data-guide-family]');if(need){event.preventDefault();event.stopPropagation();const req=requirementForNode(need)||{family:need.dataset.guideFamily,level:Number(need.dataset.guideLevel)};openRequirement(req);}
  });
  root.addEventListener('keydown',event=>{
    if(!['Enter',' '].includes(event.key))return;
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    const info=target.closest('[data-generator-info]');if(info){event.preventDefault();openGenerator(info.dataset.generatorInfo);return;}
    const need=target.closest('.need[data-guide-family]');if(need){event.preventDefault();const req=requirementForNode(need)||{family:need.dataset.guideFamily,level:Number(need.dataset.guideLevel)};openRequirement(req);}
  });
  document.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    if(target.closest('[data-guide-close]')){close();return;}
    const action=target.closest('[data-guide-show-board]');if(action){showBoard(action.dataset.guideShowBoard);}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});decorate();
  return {openRequirement,openGenerator,showBoard,refresh:decorate};
}
