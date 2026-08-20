import { getState, tradeBoardItemAt } from './aaa-session.js';
import { itemMarkup } from './aaa-view.js';
import { ITEM_FAMILIES } from './v2-game.js';
import { boardTradeSourceIndexes, boardTradeStatus, boardTradeTargetOptions } from './aaa-board-trade.js';

export function installBoardTradeUI(root,ui){
  let active=false,sheet=null,refreshQueued=false;

  const itemName=item=>ITEM_FAMILIES[item?.family]?.stages?.[Math.max(0,(item?.level||1)-1)]||'Item';
  const closeSheet=()=>{sheet?.remove();sheet=null;};
  const clearMode=()=>{
    active=false;closeSheet();root.classList.remove('board-trade-active');
    root.querySelectorAll('.board-trade-source').forEach(node=>node.classList.remove('board-trade-source'));
    root.querySelector('.board-trade-hint')?.remove();
  };

  const decorate=()=>{
    refreshQueued=false;
    if(root.dataset.view!=='board'){clearMode();return;}
    const state=getState(),status=boardTradeStatus(state),title=root.querySelector('.view-board .board-title');
    if(!title)return;
    let button=title.querySelector('[data-board-trade-start]');
    if(status.ready&&boardTradeSourceIndexes(state).length){
      if(!button){button=document.createElement('button');button.type='button';button.className='board-trade-ready-action';button.dataset.boardTradeStart='';button.textContent='↔ TAUSCH';button.setAttribute('aria-label','Werkbank-Tausch starten');title.append(button);}
    }else{
      button?.remove();
      if(active)clearMode();
    }
    if(active){
      root.classList.add('board-trade-active');
      const allowed=new Set(boardTradeSourceIndexes(state));
      root.querySelectorAll('.board-cell[data-index]').forEach(cell=>cell.classList.toggle('board-trade-source',allowed.has(Number(cell.dataset.index))));
      if(!root.querySelector('.board-trade-hint')){
        const hint=document.createElement('span');hint.className='board-trade-hint';hint.textContent='Item zum Tauschen wählen';root.querySelector('.board-frame')?.append(hint);
      }
    }
  };
  const schedule=()=>{if(refreshQueued)return;refreshQueued=true;queueMicrotask(decorate);};

  const openTargets=index=>{
    const state=getState(),source=state.board[index],options=boardTradeTargetOptions(state,index);if(!source||!options.length)return;
    closeSheet();sheet=document.createElement('div');sheet.className='board-trade-layer';
    sheet.innerHTML=`<button class="board-trade-backdrop" data-board-trade-close aria-label="Tausch abbrechen"></button><section class="board-trade-sheet" role="dialog" aria-modal="true" aria-label="${itemName(source)} tauschen"><header><div class="board-trade-source-art">${itemMarkup(source,true)}</div><div><small>WERKBANK-TAUSCH</small><h2>${itemName(source)}</h2><p>Stufe ${source.level} bleibt erhalten.</p></div><button class="board-trade-close" data-board-trade-close aria-label="Schließen">×</button></header><p class="board-trade-rule">Tausche 1:1 in eine bereits entdeckte Familie. Keine Energie, Coins, Sterne oder XP werden verändert.</p><div class="board-trade-targets"><small>ZIEL WÄHLEN</small>${options.map(option=>`<button class="board-trade-target" data-board-trade-source="${index}" data-board-trade-family="${option.family}">${itemMarkup(option.item,true)}<div><strong>${option.name}</strong><span>${option.label} · Stufe ${option.level}</span></div></button>`).join('')}</div></section>`;
    document.body.append(sheet);sheet.querySelector('.board-trade-target')?.focus();
  };

  const start=()=>{
    if(!boardTradeStatus(getState()).ready)return;
    active=true;decorate();ui?.message?.('Werkbank-Tausch: wähle ein Item.');
  };

  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    if(target.closest('[data-board-trade-start]')){event.preventDefault();event.stopImmediatePropagation();active?clearMode():start();return;}
    if(!active)return;
    const cell=target.closest('.board-cell.board-trade-source[data-index]');
    if(cell){event.preventDefault();event.stopImmediatePropagation();openTargets(Number(cell.dataset.index));}
  });
  root.addEventListener('keydown',event=>{
    if(!active||!['Enter',' '].includes(event.key))return;
    const target=event.target instanceof Element?event.target:null,cell=target?.closest('.board-cell.board-trade-source[data-index]');
    if(cell){event.preventDefault();event.stopImmediatePropagation();openTargets(Number(cell.dataset.index));}
  });
  document.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    if(target.closest('[data-board-trade-close]')){clearMode();decorate();return;}
    const option=target.closest('[data-board-trade-family]');if(!option)return;
    const index=Number(option.dataset.boardTradeSource),family=option.dataset.boardTradeFamily,before=getState().board[index],result=tradeBoardItemAt(index,family);
    if(!result.changed){ui?.message?.('Dieser Tausch ist nicht mehr verfügbar.','bad');clearMode();ui?.render?.();return;}
    const from=itemName(before),to=itemName(result.after);clearMode();ui?.render?.();ui?.feedback?.('reward');ui?.message?.(`${from} → ${to} · Tausch verbraucht`);
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(active||sheet)){clearMode();decorate();}});
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});decorate();
  return {start,cancel:clearMode,refresh:decorate};
}
