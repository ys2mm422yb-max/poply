import { refreshEnergy } from './aaa-session.js';
import { ENERGY_REGEN_MINUTES, energyReserveCap, energyStatusLabel, energyFullRechargeLabel, energyReserveLabel, energyMsUntilNext } from './aaa-energy.js';

const reserveNextLabel=(state,now=Date.now())=>{
  const reserveCap=energyReserveCap(state),reserve=Math.max(0,Math.min(reserveCap,Number(state.energyReserve)||0));
  if(reserve>=reserveCap)return 'Reserve voll';
  const seconds=Math.max(1,Math.ceil(energyMsUntilNext(state,now)/1000));
  const minutes=Math.floor(seconds/60),rest=String(seconds%60).padStart(2,'0');
  return `+1 Reserve in ${minutes}:${rest}`;
};

export function installEnergyUI(root){
  let refillClassTimer=0,planOpen=false;
  const paint=()=>{
    const result=refreshEnergy();
    const state=result.state;
    const reserveCap=energyReserveCap(state),reserve=Math.max(0,Math.min(reserveCap,Number(state.energyReserve)||0));
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
    pill.classList.toggle('energy-reserve-ready',reserve>0);
    const reserveRule=`Volle Energie puffert automatisch bis zu ${reserveCap} Reservepunkte. Die Reserve wächst mit verdienter Max-Energie.`;
    pill.setAttribute('aria-label',state.energy>=state.maxEnergy?`Energie ${state.energy} von ${state.maxEnergy}. ${energyReserveLabel(state)}. ${reserveRule} Eine Reserve entsteht alle ${ENERGY_REGEN_MINUTES} Minuten und wird automatisch zuerst genutzt. Tippen für Details.`:`Energie ${state.energy} von ${state.maxEnergy}. ${energyReserveLabel(state)}. ${timer.textContent}. ${energyFullRechargeLabel(state)}. Lädt auch weiter, wenn Poply geschlossen ist. Tippen für Details.`);
    let plan=pill.querySelector('[data-energy-plan]');
    if(planOpen){
      if(!plan){plan=document.createElement('div');plan.className='energy-plan';plan.dataset.energyPlan='';plan.setAttribute('role','status');pill.append(plan);}
      plan.innerHTML=state.energy>=state.maxEnergy?`<small>ENERGIE-RESERVE</small><strong>${reserve}/${reserveCap} gespeichert</strong><span>${reserveNextLabel(state)} · volle Energie arbeitet weiter</span><span class="energy-reserve-rule">Reserve wächst mit Max-Energie und wird beim nächsten Generator automatisch zuerst genutzt.</span>`:`<small>AUTOMATISCHE AUFLADUNG</small><strong>${timer.textContent}</strong><span>${energyFullRechargeLabel(state)} · auch offline</span><span class="energy-reserve-rule">${energyReserveLabel(state)} · gespeicherte Reserve wird zuerst genutzt.</span>`;
    }else plan?.remove();
    if(result.gained>0||result.reserveGained>0){
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
