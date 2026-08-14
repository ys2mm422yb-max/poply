import { getState, storeAt, recycleAt, restoreAt, expandStorage } from './aaa-session.js';
import { itemMarkup } from './aaa-view.js';
import { storageUpgradeCost, recycleCoinValue, STORAGE_MAX_CAPACITY } from './aaa-inventory.js';

const coinIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5" fill="currentColor"/></svg>';
const boxIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 8.5 12 4l7.5 4.5v8L12 20l-7.5-3.5v-8Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4.8 8.5 12 12.8l7.2-4.3M12 12.8V20" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const recycleIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 7.2A7 7 0 0 1 18 9M16.8 16.8A7 7 0 0 1 6 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m18 5 .2 4.2L14 9M6 19l-.2-4.2L10 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function installStorageUI(root,ui){
  let open=false,decorating=false;
  const stateNow=()=>getState();
  const storageSlot=(item,index)=>item?`<button class="storage-slot occupied" data-storage-restore="${index}" aria-label="${item.family} Stufe ${item.level} zurück auf die Werkbank">${itemMarkup(item)}<span>${item.level}</span></button>`:`<div class="storage-slot empty" aria-hidden="true"><i></i></div>`;
  const boardChoice=(item,index)=>`<div class="storage-board-card"><button class="storage-board-choice" data-storage-store="${index}" aria-label="Item Stufe ${item.level} einlagern">${itemMarkup(item)}<span>${item.level}</span></button><button class="storage-recycle" data-storage-recycle="${index}" aria-label="Item Stufe ${item.level} recyceln für ${recycleCoinValue(item)} Coins">${recycleIcon}<b>+${recycleCoinValue(item)}</b></button></div>`;
  const signature=state=>`${open?'1':'0'}:${state.coins}:${state.storageCapacity}:${(state.storage||[]).map(item=>item?.id).join(',')}:${state.board.map(item=>item?.id||'').join(',')}`;
  const drawerMarkup=state=>{
    const storage=state.storage||[],capacity=state.storageCapacity||4,cost=storageUpgradeCost(state),boardItems=state.board.map((item,index)=>item?.kind==='item'?{item,index}:null).filter(Boolean);
    const slots=Array.from({length:capacity},(_,index)=>storageSlot(storage[index]||null,index)).join('');
    const choices=boardItems.length?boardItems.map(({item,index})=>boardChoice(item,index)).join(''):'<span class="storage-empty-copy">Keine Items auf der Werkbank.</span>';
    const upgrade=cost===null?`<span class="storage-max">MAX ${STORAGE_MAX_CAPACITY}</span>`:`<button class="storage-upgrade" data-storage-upgrade ${state.coins<cost?'disabled':''}><b>+2 Plätze</b><span><i class="storage-coin-icon">${coinIcon}</i>${cost}</span></button>`;
    return `<section class="storage-drawer" aria-label="Lager"><header><div><small>WERKBANK-LAGER</small><strong>${storage.length}/${capacity} belegt</strong></div>${upgrade}<button class="storage-close" data-storage-close aria-label="Lager schließen">×</button></header><div class="storage-slots">${slots}</div><div class="storage-source"><div><strong>Von der Werkbank</strong><small>Einlagern · für Aufträge zurück aufs Board · ↻ recyceln</small></div><div class="storage-board-items">${choices}</div></div></section>`;
  };
  const decorate=()=>{
    if(decorating)return;decorating=true;
    try{
      const board=root.querySelector('.view-board'),title=board?.querySelector('.board-title');if(!board||!title)return;
      const state=stateNow(),used=state.storage?.length||0,capacity=state.storageCapacity||4,sig=signature(state);
      let handle=title.querySelector('.storage-handle');
      if(!handle){handle=document.createElement('button');handle.className='storage-handle';handle.dataset.storageToggle='';title.append(handle);}
      const handleSig=`${open?'1':'0'}:${used}:${capacity}`;
      if(handle.dataset.signature!==handleSig){handle.dataset.signature=handleSig;handle.classList.toggle('active',open);handle.setAttribute('aria-expanded',String(open));handle.innerHTML=`<span class="storage-handle-icon">${boxIcon}</span><b>Lager</b><small>${used}/${capacity}</small>`;}
      const drawer=board.querySelector('.storage-drawer');
      if(!open){drawer?.remove();return;}
      if(drawer?.dataset.signature===sig)return;
      drawer?.remove();board.insertAdjacentHTML('beforeend',drawerMarkup(state));board.querySelector('.storage-drawer').dataset.signature=sig;
    }finally{decorating=false;}
  };
  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement;if(!target)return;
    if(target.closest('[data-storage-toggle]')){open=!open;decorate();return;}
    if(target.closest('[data-storage-close]')){open=false;decorate();return;}
    const recycle=target.closest('[data-storage-recycle]');if(recycle){
      const index=Number(recycle.dataset.storageRecycle),item=stateNow().board[index],coins=recycleCoinValue(item);
      if(!item||item.kind!=='item'){ui.message('Dieses Feld kann nicht recycelt werden.','bad');return;}
      if(!window.confirm(`Item Stufe ${item.level} wirklich recyceln? Das Item wird entfernt. +${coins} Coins.`))return;
      const result=recycleAt(index);
      if(result.changed){ui.feedback('reward');ui.message(`Recycelt  +${result.coins} ●`);ui.render();decorate();}
      else ui.message('Item konnte nicht recycelt werden.','bad');
      return;
    }
    const store=target.closest('[data-storage-store]');if(store){
      const result=storeAt(Number(store.dataset.storageStore));
      if(result.changed){ui.feedback('move');ui.message('Sicher im Lager.');ui.render();decorate();}
      else ui.message(result.reason==='storage-full'?'Lager voll – erweitern oder Item recyceln.':'Dieses Item kann nicht eingelagert werden.','bad');
      return;
    }
    const restore=target.closest('[data-storage-restore]');if(restore){
      const result=restoreAt(Number(restore.dataset.storageRestore));
      if(result.changed){ui.feedback('move');ui.message('Zurück auf der Werkbank.');ui.render();decorate();}
      else ui.message(result.reason==='board-full'?'Werkbank voll – Item recyceln oder erst Platz schaffen.':'Item konnte nicht zurückgeholt werden.','bad');
      return;
    }
    if(target.closest('[data-storage-upgrade]')){
      const result=expandStorage();
      if(result.changed){ui.feedback('reward');ui.message(`Lager erweitert: ${result.capacity} Plätze`);ui.render();decorate();}
      else ui.message(result.reason==='not-enough-coins'?`Noch ${result.cost-(stateNow().coins||0)} Coins nötig.`:'Lager ist bereits maximal erweitert.','bad');
    }
  });
  const observer=new MutationObserver(decorate);observer.observe(root,{childList:true,subtree:true});decorate();
  return {isOpen:()=>open,refresh:decorate};
}
