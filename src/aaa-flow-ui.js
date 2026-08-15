import { getState } from './aaa-session.js';
import { flowStatus } from './aaa-flow.js';

const spark='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.2 2-7 10.1h4.5L10.1 22l7.7-11h-4.6V2Z" fill="currentColor"/></svg>';

export function installFlowUI(root){
  let decorating=false;
  const decorate=()=>{
    if(decorating)return;decorating=true;
    try{
      const board=root.querySelector('.view-board'),title=board?.querySelector('.board-title');if(!board||!title)return;
      const status=flowStatus(getState()),lead=title.querySelector(':scope > div');if(!lead)return;
      lead.querySelector(':scope > small')?.classList.add('flow-replaces-rule');
      let hud=lead.querySelector('.flow-hud');
      if(!hud){hud=document.createElement('span');hud.className='flow-hud';hud.setAttribute('role','status');lead.append(hud);}
      const signature=`${status.charge}:${status.threshold}:${status.boostReady?'1':'0'}:${status.boostsUsed}`;
      if(hud.dataset.signature!==signature){
        hud.dataset.signature=signature;hud.classList.toggle('ready',status.boostReady);
        hud.setAttribute('aria-label',status.boostReady?'Merge Flow voll. Generator für Boost wählen.':`Merge Flow ${status.charge} von ${status.threshold}.`);
        hud.innerHTML=status.boostReady
          ?`<i class="flow-icon">${spark}</i><b>BOOST</b><small>Generator wählen</small>`
          :`<b>FLOW</b><span class="flow-pips">${Array.from({length:status.threshold},(_,index)=>`<i class="${index<status.charge?'filled':''}"></i>`).join('')}</span><small>${status.charge}/${status.threshold}</small>`;
      }
      board.classList.toggle('flow-ready',status.boostReady);
      board.querySelectorAll('.board-cell.generator').forEach(cell=>{
        cell.classList.toggle('flow-boost-target',status.boostReady);
        let badge=cell.querySelector('.flow-generator-badge');
        if(status.boostReady){
          if(!badge){badge=document.createElement('span');badge.className='flow-generator-badge';badge.innerHTML=`<i>${spark}</i><b>BOOST</b>`;cell.append(badge);}
          const base=cell.getAttribute('aria-label')?.replace(/, Flow-Boost verfügbar$/,'')||'Generator';cell.setAttribute('aria-label',`${base}, Flow-Boost verfügbar`);
        }else{
          badge?.remove();
          const label=cell.getAttribute('aria-label');if(label)cell.setAttribute('aria-label',label.replace(/, Flow-Boost verfügbar$/,''));
        }
      });
    }finally{decorating=false;}
  };
  const observer=new MutationObserver(decorate);observer.observe(root,{childList:true,subtree:true});decorate();
  return {refresh:decorate};
}
