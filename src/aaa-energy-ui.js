import { refreshEnergy } from './aaa-session.js';
import { ENERGY_REGEN_MINUTES, energyStatusLabel, energyFullRechargeLabel } from './aaa-energy.js';

export function installEnergyUI(root){
  let refillClassTimer=0,planOpen=false;
  const paint=()=>{
    const result=refreshEnergy();
    const state=result.state;
    const pill=root.querySelector('.resource.energy');
    if(!pill)return;
    pill.setAttribute('role','button');pill.setAttribute('tabindex','0');pill.setAttribute('aria-expanded',String(planOpen));pill.dataset.energyPlanToggle='';
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
    pill.setAttribute('aria-label',state.energy>=state.maxEnergy?`Energie ${state.energy} von ${state.maxEnergy}. Voll. Automatische Regeneration: eine Energie alle ${ENERGY_REGEN_MINUTES} Minuten. Tippen für Details.`:`Energie ${state.energy} von ${state.maxEnergy}. ${timer.textContent}. ${energyFullRechargeLabel(state)}. Lädt auch weiter, wenn Poply geschlossen ist. Tippen für Details.`);
    let plan=pill.querySelector('[data-energy-plan]');
    if(planOpen){
      if(!plan){plan=document.createElement('div');plan.className='energy-plan';plan.dataset.energyPlan='';plan.setAttribute('role','status');pill.append(plan);}
      plan.innerHTML=state.energy>=state.maxEnergy?`<small>ENERGIE VOLL</small><strong>${state.energy}/${state.maxEnergy}</strong><span>1 Energie alle ${ENERGY_REGEN_MINUTES} Min · auch offline</span>`:`<small>AUTOMATISCHE AUFLADUNG</small><strong>${timer.textContent}</strong><span>${energyFullRechargeLabel(state)} · auch offline</span>`;
    }else plan?.remove();
    if(result.gained>0){
      pill.classList.remove('fx-energy-refill');void pill.offsetWidth;pill.classList.add('fx-energy-refill');
      clearTimeout(refillClassTimer);refillClassTimer=setTimeout(()=>pill.classList.remove('fx-energy-refill'),650);
    }
  };
  const togglePlan=()=>{planOpen=!planOpen;paint();};
  const onClick=event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement;
    if(target?.closest?.('[data-energy-plan-toggle]')){togglePlan();return;}
    if(planOpen){planOpen=false;paint();}
  };
  const onKeydown=event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement;
    if(!target?.closest?.('[data-energy-plan-toggle]'))return;
    if(event.key==='Enter'||event.key===' '){event.preventDefault();togglePlan();}
    if(event.key==='Escape'&&planOpen){event.preventDefault();planOpen=false;paint();}
  };
  const observer=new MutationObserver(paint);
  observer.observe(root,{childList:true});
  root.addEventListener('click',onClick);root.addEventListener('keydown',onKeydown);
  const interval=window.setInterval(paint,1000);
  paint();
  return ()=>{observer.disconnect();root.removeEventListener('click',onClick);root.removeEventListener('keydown',onKeydown);window.clearInterval(interval);clearTimeout(refillClassTimer);};
}
