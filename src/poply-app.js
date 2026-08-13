import { HERO_IMAGE } from './v2-hero-data.js';
import { ATLAS_IMAGE } from './v2-atlas-data.js';
import { CUSTOMER_A } from './v2-customer-a.js';
import { CUSTOMER_B } from './v2-customer-b.js';
import { CUSTOMER_C } from './v2-customer-c.js';
import { fulfillOrder, buildNextUpgrade } from './v2-game.js';
import { readState, writeState, resetState } from './poply-state.js';
import { createUi } from './poply-ui.js';
import { createBoardController } from './poply-board-controller.js';
import { COPY as copy } from './poply-copy.js';

export const PRIMARY_VIEWS=Object.freeze(['board','orders','place']);
export const isPrimaryView=view=>PRIMARY_VIEWS.includes(view);

const root=document.querySelector('#poply-root');
document.documentElement.style.setProperty('--poply-hero',`url(${HERO_IMAGE})`);
document.documentElement.style.setProperty('--poply-atlas',`url(${ATLAS_IMAGE})`);
const ui=createUi({copy,customers:[CUSTOMER_A,CUSTOMER_B,CUSTOMER_C]});
let state=readState(),view='board',menuOpen=false,lastImpact=null,toastTimer=0;
const save=()=>writeState(state);
const vibrate=p=>{try{navigator.vibrate?.(p);}catch{}};

function applyViewport(){document.documentElement.style.setProperty('--app-height',`${Math.round(window.visualViewport?.height||window.innerHeight||844)}px`);}
function toast(message,tone='good'){const el=root.querySelector('#toast');if(!el)return;clearTimeout(toastTimer);el.textContent=message;el.dataset.tone=tone;el.classList.add('is-visible');toastTimer=setTimeout(()=>el.classList.remove('is-visible'),1400);}
function setView(next){if(!isPrimaryView(next)||next===view)return;view=next;menuOpen=false;render();vibrate(5);}
function build(){const r=buildNextUpgrade(state);if(!r.changed){toast(copy.needStars(r.upgrade?.cost-state.stars||0),'bad');return;}state=r.state;save();vibrate([18,28,28]);render();toast(`${copy.built}: ${r.upgrade.label}`);}
function deliver(id){const r=fulfillOrder(state,id);if(!r.changed){toast(copy.working,'bad');return;}state=r.state;save();vibrate([12,18,18]);render();toast(`${copy.delivered} · +${r.rewards.coins} ● · +${r.rewards.stars} ★`);}

const board=createBoardController({
  root,ui,copy,
  getState:()=>state,
  setState:next=>{state=next;},
  commit:save,
  rerender:impact=>{lastImpact=impact;render();},
  toast,vibrate
});

function bind(){
  root.querySelectorAll('[data-view-target]').forEach(el=>el.addEventListener('click',()=>setView(el.dataset.viewTarget)));
  root.querySelectorAll('[data-order-id]').forEach(el=>el.addEventListener('click',()=>deliver(el.dataset.orderId)));
  root.querySelectorAll('[data-action="build"]').forEach(el=>el.addEventListener('click',build));
  root.querySelector('[data-action="menu"]')?.addEventListener('click',()=>{menuOpen=true;render();});
  root.querySelectorAll('[data-action="close-menu"]').forEach(el=>el.addEventListener('click',()=>{menuOpen=false;render();}));
  root.querySelector('[data-action="reset"]')?.addEventListener('click',()=>{if(!confirm(copy.resetConfirm))return;state=resetState();view='board';menuOpen=false;render();});
  board.bind();
}
function render(){
  root.innerHTML=`<div class="app-shell" data-active-view="${view}">${ui.header(state)}<main class="view-host">${ui.current(state,view)}</main>${ui.nav(view)}${ui.menu(menuOpen)}</div><div id="drag-ghost" class="drag-ghost" aria-hidden="true"></div><div id="toast" class="toast" role="status" aria-live="polite"></div>`;
  bind();applyViewport();
  if(lastImpact?.index!=null&&view==='board'){
    const cell=root.querySelector(`.board-cell[data-index="${lastImpact.index}"]`);
    if(cell){requestAnimationFrame(()=>cell.classList.add(lastImpact.type==='merge'?'impact-merge':'impact-spawn'));setTimeout(()=>cell.classList.remove('impact-merge','impact-spawn'),520);}
    lastImpact=null;
  }
}
window.addEventListener('pointermove',board.move,{passive:true});
window.addEventListener('pointerup',board.up);
window.addEventListener('pointercancel',board.cancel);
window.visualViewport?.addEventListener('resize',applyViewport);
window.addEventListener('resize',applyViewport);
render();
