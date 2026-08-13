import { ITEM_FAMILIES, PLACE_UPGRADES, normalizeState, restorationStatus } from './v2-game.js';

const SAVE_KEY='poply-v2-state-1';
const de=(navigator.language||'').toLowerCase().startsWith('de');
const copy=de?{
  orders:'AUFTRÄGE', purpose:'★ finanziert den Ausbau', goal:'NÄCHSTES ZIEL', complete:'CAFÉ RESTAURIERT',
  board:'★ Auftrag', pair:'◇ Merge-Paar', needed:'Wird für einen aktiven Auftrag gebraucht', ready:'Merge-Paar bereit'
}:{
  orders:'ORDERS', purpose:'★ funds restoration', goal:'NEXT GOAL', complete:'CAFÉ RESTORED',
  board:'★ Order', pair:'◇ Merge pair', needed:'Needed for an active order', ready:'Merge pair ready'
};

const readState=()=>{try{const raw=localStorage.getItem(SAVE_KEY);return raw?normalizeState(JSON.parse(raw)):null;}catch{return null;}};
const itemKey=item=>item?.kind==='item'?`${item.family}:${item.level}`:null;
const spriteFor=(family,level)=>ITEM_FAMILIES[family]?.sprites?.[level-1];
const setText=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value;};

function ensurePurposeBar(){
  const section=document.querySelector('.orders-section');
  if(!section||section.querySelector('.orders-purpose'))return;
  const bar=document.createElement('div');bar.className='orders-purpose';bar.innerHTML=`<strong>${copy.orders}</strong><span>${copy.purpose}</span>`;section.prepend(bar);
}
function ensureBoardLegend(){
  const head=document.querySelector('.board-head');
  if(!head||head.querySelector('.board-legend'))return;
  const legend=document.createElement('div');legend.className='board-legend';legend.innerHTML=`<span>${copy.board}</span><span>${copy.pair}</span>`;head.insertBefore(legend,head.querySelector('.board-capacity'));
}
function decorate(){
  const state=readState();if(!state)return;
  ensurePurposeBar();ensureBoardLegend();
  const status=restorationStatus(state),hero=document.querySelector('.place-hero'),upgrade=document.querySelector('.upgrade-cta');
  if(hero){hero.dataset.stage=String(status.completed);hero.dataset.goal=status.upgrade?.id||'complete';}
  const progress=document.querySelector('#place-progress'),fill=document.querySelector('#place-progress-fill'),name=document.querySelector('#upgrade-name'),cost=document.querySelector('#upgrade-cost');
  setText(progress,`${de?'Restaurierung':'Restoration'} ${status.completed}/${status.total}`);
  if(fill){const width=((status.completed+status.ratio)/status.total)*100;const next=`${Math.max(0,Math.min(100,width))}%`;if(fill.style.width!==next)fill.style.width=next;}
  if(status.complete){setText(name,copy.complete);setText(cost,'★');upgrade?.classList.add('mission-complete');}
  else{setText(name,status.upgrade.label);setText(cost,`★ ${status.current}/${status.cost}`);upgrade?.classList.remove('mission-complete');}
  if(upgrade){upgrade.dataset.missionLabel=status.complete?copy.complete:copy.goal;upgrade.classList.toggle('ready',status.complete||status.missing===0);}

  const required=new Set();for(const order of state.currentOrders){for(const req of order.requirements)required.add(`${req.family}:${req.level}`);}
  const counts=new Map();for(const item of state.board){const key=itemKey(item);if(key)counts.set(key,(counts.get(key)||0)+1);}
  document.querySelectorAll('.merge-cell').forEach(cell=>{
    const index=Number(cell.dataset.index),item=state.board[index],key=itemKey(item);const def=item?.kind==='item'?ITEM_FAMILIES[item.family]:null;
    const mergeReady=!!key&&(counts.get(key)||0)>1&&item.level<def.stages.length;const orderNeeded=!!key&&required.has(key);
    cell.classList.toggle('merge-ready',mergeReady);cell.classList.toggle('order-needed',orderNeeded);
    let pin=cell.querySelector('.need-pin');if(orderNeeded&&!pin){pin=document.createElement('span');pin.className='need-pin';pin.textContent='★';pin.setAttribute('aria-hidden','true');cell.append(pin);}else if(!orderNeeded&&pin)pin.remove();
    const hints=[];if(orderNeeded)hints.push(copy.needed);if(mergeReady)hints.push(copy.ready);if(hints.length)cell.title=hints.join(' · ');else cell.removeAttribute('title');
  });
  document.querySelectorAll('.order-card').forEach((card,index)=>{
    const order=state.currentOrders[index];if(!order)return;card.classList.add('mission-order');
    const reward=card.querySelector('.order-reward');if(reward&&!reward.querySelector('.purpose-tag')){const tag=document.createElement('span');tag.className='purpose-tag';tag.textContent=de?'→ Ausbau':'→ Build';reward.append(tag);}
  });
}

let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate();});};
const root=document.querySelector('.poply-app');if(root)new MutationObserver(schedule).observe(root,{subtree:true,childList:true,characterData:true});
window.addEventListener('storage',schedule);document.addEventListener('pointerup',()=>setTimeout(schedule,30),true);document.addEventListener('click',event=>{if(event.target.closest('.order-button')){const hero=document.querySelector('.place-hero');hero?.classList.add('goal-reward');setTimeout(()=>hero?.classList.remove('goal-reward'),720);}setTimeout(schedule,30);},true);
decorate();
