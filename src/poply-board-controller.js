import { itemDefinition, generateFromSlot, moveOrMerge, canMerge } from './v2-game.js';

export function createBoardController({root,ui,copy,getState,setState,commit,rerender,toast,vibrate}){
  let drag=null;
  const ghost=()=>root.querySelector('#drag-ghost');
  const clearDrop=()=>root.querySelectorAll('.drop-merge,.drop-move,.drop-bad,.is-dragging').forEach(el=>el.classList.remove('drop-merge','drop-move','drop-bad','is-dragging'));
  const moveGhost=(x,y)=>{const g=ghost();if(g)g.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-64%)`;};

  function generate(index){
    const r=generateFromSlot(getState(),index);
    if(!r.changed){toast(r.reason==='board-full'?copy.full:r.reason==='no-energy'?copy.energy:copy.invalid,'bad');return;}
    setState(r.state);commit();vibrate(8);rerender({type:'spawn',index:r.spawnedIndex});toast(copy.generated);
  }
  function down(event){
    const cell=event.target.closest('.board-cell.has-item');if(!cell)return;
    const state=getState(),index=Number(cell.dataset.index),item=state.board[index];if(!item)return;
    drag={index,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,moved:false,item};
    cell.setPointerCapture?.(event.pointerId);cell.classList.add('is-dragging');
    const g=ghost();if(g){g.innerHTML=ui.itemArt(item);g.classList.add('is-visible');moveGhost(event.clientX,event.clientY);}
  }
  function move(event){
    if(!drag||event.pointerId!==drag.pointerId)return;
    if(Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>7)drag.moved=true;
    moveGhost(event.clientX,event.clientY);clearDrop();root.querySelector(`.board-cell[data-index="${drag.index}"]`)?.classList.add('is-dragging');
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest?.('.board-cell');if(!target||Number(target.dataset.index)===drag.index)return;
    const dest=getState().board[Number(target.dataset.index)];target.classList.add(drag.item.kind==='generator'?'drop-bad':!dest?'drop-move':canMerge(drag.item,dest)?'drop-merge':'drop-bad');
  }
  function up(event){
    if(!drag||event.pointerId!==drag.pointerId)return;
    const d=drag;drag=null;ghost()?.classList.remove('is-visible');clearDrop();const state=getState(),source=state.board[d.index];
    if(!d.moved){if(source?.kind==='generator')generate(d.index);else if(source)toast(itemDefinition(source).name);return;}
    if(source?.kind==='generator'){toast(copy.tapGenerator,'bad');return;}
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest?.('.board-cell');if(!target)return;
    const to=Number(target.dataset.index),r=moveOrMerge(state,d.index,to);if(!r.changed){if(to!==d.index)toast(copy.invalid,'bad');return;}
    setState(r.state);commit();vibrate(r.type==='merge'?[10,12,18]:5);rerender({type:r.type,index:r.type==='merge'?r.mergedIndex:to});toast(r.type==='merge'?`${copy.merge} ${itemDefinition(r.item).name}`:copy.moved);
  }
  function cancel(){drag=null;ghost()?.classList.remove('is-visible');clearDrop();}
  function bind(){root.querySelector('.merge-board')?.addEventListener('pointerdown',down);}
  return {bind,move,up,cancel};
}
