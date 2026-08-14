import { refreshEnergy } from './aaa-session.js';
import { ENERGY_REGEN_MINUTES, energyStatusLabel } from './aaa-energy.js';

export function installEnergyUI(root){
  let refillClassTimer=0;
  const paint=()=>{
    const result=refreshEnergy();
    const state=result.state;
    const pill=root.querySelector('.resource.energy');
    if(!pill)return;
    const value=pill.querySelector('b');
    if(value)value.textContent=`${state.energy}/${state.maxEnergy}`;
    let timer=pill.querySelector('[data-energy-timer]');
    if(!timer){
      timer=document.createElement('small');
      timer.className='energy-timer';
      timer.dataset.energyTimer='';
      pill.append(timer);
    }
    timer.textContent=energyStatusLabel(state);
    pill.classList.toggle('energy-full',state.energy>=state.maxEnergy);
    pill.classList.toggle('energy-regenerating',state.energy<state.maxEnergy);
    pill.setAttribute('aria-label',state.energy>=state.maxEnergy?`Energie ${state.energy} von ${state.maxEnergy}. Voll. Automatische Regeneration: eine Energie alle ${ENERGY_REGEN_MINUTES} Minuten.`:`Energie ${state.energy} von ${state.maxEnergy}. ${timer.textContent}. Lädt auch weiter, wenn Poply geschlossen ist.`);
    if(result.gained>0){
      pill.classList.remove('fx-energy-refill');void pill.offsetWidth;pill.classList.add('fx-energy-refill');
      clearTimeout(refillClassTimer);refillClassTimer=setTimeout(()=>pill.classList.remove('fx-energy-refill'),650);
    }
  };
  const observer=new MutationObserver(paint);
  observer.observe(root,{childList:true});
  const interval=window.setInterval(paint,1000);
  paint();
  return ()=>{observer.disconnect();window.clearInterval(interval);clearTimeout(refillClassTimer);};
}
