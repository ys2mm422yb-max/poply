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
    const cell=event.target.closest('.board-cell.occupied');
    if(!cell)return;
    const index=Number(cell.dataset.index),item=getState().board[index];
    if(!item)return;
    drag={index,x:event.clientX,y:event.clientY,pointerId:event.pointerId,moved:false};
    cell.setPointerCapture?.(event.pointerId);
    cell.classList.add('dragging');ghost.innerHTML=itemMarkup(item);ghost.classList.add('show');move(event.clientX,event.clientY);
  });
}
