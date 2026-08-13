import { itemMarkup } from './aaa-view.js';
import { getState, moveOrMergeAt } from './aaa-session.js';
import { canMerge } from './v2-game.js';

export function installDrag({root,ghost,ui}){
  let drag=null;
  const clear=()=>root.querySelectorAll('.drop-merge,.drop-move,.drop-bad,.dragging').forEach(el=>el.classList.remove('drop-merge','drop-move','drop-bad','dragging'));
  const hide=()=>{ghost.classList.remove('show');ghost.innerHTML='';};
  const move=(x,y)=>{ghost.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-60%)`;};

  root.addEventListener('pointerdown',event=>{
    if(ui.getView()!=='board')return;
    const cell=event.target.closest('.board-cell.occupied');if(!cell)return;
    const index=Number(cell.dataset.index),item=getState().board[index];if(!item)return;
    drag={index,x:event.clientX,y:event.clientY,pointerId:event.pointerId,moved:false};
    cell.setPointerCapture?.(event.pointerId);cell.classList.add('dragging');
    ghost.innerHTML=itemMarkup(item);ghost.classList.add('show');move(event.clientX,event.clientY);
  });

  window.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.pointerId||ui.getView()!=='board')return;
    move(event.clientX,event.clientY);if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>8)drag.moved=true;
    root.querySelectorAll('.drop-merge,.drop-move,.drop-bad').forEach(el=>el.classList.remove('drop-merge','drop-move','drop-bad'));
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest?.('.board-cell');if(!target)return;
    const to=Number(target.dataset.index);if(to===drag.index)return;
    const state=getState(),source=state.board[drag.index],dest=state.board[to];
    target.classList.add(!dest?'drop-move':canMerge(source,dest)?'drop-merge':'drop-bad');
  },{passive:true});

  window.addEventListener('pointerup',event=>{
    if(!drag||event.pointerId!==drag.pointerId)return;
    const from=drag.index,source=getState().board[from];
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest?.('.board-cell');
    clear();hide();
    if(!drag.moved&&source?.kind==='generator'){drag=null;ui.spawn(from);return;}
    if(target){
      const to=Number(target.dataset.index),result=moveOrMergeAt(from,to);
      if(result.changed){
        ui.setFx({type:result.type,index:result.type==='merge'?result.mergedIndex:to});
        ui.render();ui.buzz(result.type==='merge'?[8,10,16]:5);ui.message(result.type==='merge'?'Merge!':'Item verschoben');
      }else if(to!==from)ui.message('Diese Items passen nicht zusammen.','bad');
    }
    drag=null;
  });
  window.addEventListener('pointercancel',()=>{drag=null;clear();hide();});
}
