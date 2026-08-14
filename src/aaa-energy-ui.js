import { refreshEnergy } from './aaa-session.js';
import { ENERGY_REGEN_MINUTES, energyPlan, energyStatusLabel } from './aaa-energy.js';

const durationLabel=ms=>{
  if(ms<=0)return 'jetzt';
  const minutes=Math.max(1,Math.ceil(ms/60000));
  if(minutes<60)return `${minutes} Min`;
  const hours=Math.floor(minutes/60),rest=minutes%60;
  return rest?`${hours} Std ${rest} Min`:`${hours} Std`;
};
const timeLabel=value=>new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit'}).format(new Date(value));

export function installEnergyUI(root){
  let refillClassTimer=0,open=false;
  const sheet=document.createElement('div');
  sheet.className='energy-planner-layer';sheet.dataset.energyPlanner='';sheet.hidden=true;
  document.body.append(sheet);

  const close=()=>{open=false;sheet.hidden=true;sheet.classList.remove('open');const pill=root.querySelector('.resource.energy');pill?.setAttribute('aria-expanded','false');pill?.focus?.({preventScroll:true});};
  const renderSheet=state=>{
    const now=Date.now(),plan=energyPlan(state,now),full=plan.missing===0;
    sheet.innerHTML=`<div class="energy-planner-backdrop" data-energy-close></div><section class="energy-planner-sheet" role="dialog" aria-modal="true" aria-labelledby="energy-planner-title"><div class="energy-planner-head"><div><small>ENERGIEPLAN</small><h2 id="energy-planner-title">${full?'Bereit für die nächste Runde':'Deine Energie lädt weiter'}</h2></div><button class="energy-planner-close" data-energy-close aria-label="Energieplan schließen">×</button></div><div class="energy-planner-meter" aria-label="${plan.energy} von ${plan.maxEnergy} Energie"><i style="width:${Math.round(plan.energy/plan.maxEnergy*100)}%"></i><strong>${plan.energy}/${plan.maxEnergy}</strong></div><div class="energy-planner-stats"><article><small>JETZT MÖGLICH</small><strong>${plan.actionsAvailable}</strong><span>Generator-Aktionen</span></article><article><small>NÄCHSTE ENERGIE</small><strong>${full?'Voll':durationLabel(plan.nextInMs)}</strong><span>${full?'Keine Wartezeit':`gegen ${timeLabel(plan.nextAt)}`}</span></article><article><small>KOMPLETT VOLL</small><strong>${full?'Jetzt':durationLabel(plan.fullInMs)}</strong><span>${full?'Energie ist voll':`gegen ${timeLabel(plan.fullAt)}`}</span></article></div><p class="energy-planner-note">1 Energie alle ${ENERGY_REGEN_MINUTES} Minuten. Der Timer läuft fair weiter, auch wenn Poply geschlossen ist.</p></section>`;
  };
  const paint=()=>{
    const result=refreshEnergy();
    const state=result.state;
    const pill=root.querySelector('.resource.energy');
    if(!pill)return;
    const value=pill.querySelector('b');
    if(value)value.textContent=`${state.energy}/${state.maxEnergy}`;
    let timer=pill.querySelector('[data-energy-timer]');
    if(!timer){timer=document.createElement('small');timer.className='energy-timer';timer.dataset.energyTimer='';pill.append(timer);}
    timer.textContent=energyStatusLabel(state);
    pill.classList.toggle('energy-full',state.energy>=state.maxEnergy);
    pill.classList.toggle('energy-regenerating',state.energy<state.maxEnergy);
    pill.setAttribute('role','button');pill.setAttribute('tabindex','0');pill.setAttribute('aria-controls','energy-planner-title');pill.setAttribute('aria-expanded',String(open));
    pill.setAttribute('aria-label',state.energy>=state.maxEnergy?`Energie ${state.energy} von ${state.maxEnergy}. Voll. Energieplan öffnen.`:`Energie ${state.energy} von ${state.maxEnergy}. ${timer.textContent}. Energieplan öffnen.`);
    if(open)renderSheet(state);
    if(result.gained>0){pill.classList.remove('fx-energy-refill');void pill.offsetWidth;pill.classList.add('fx-energy-refill');clearTimeout(refillClassTimer);refillClassTimer=setTimeout(()=>pill.classList.remove('fx-energy-refill'),650);}
  };
  const toggle=()=>{const state=refreshEnergy().state;open=!open;if(open){renderSheet(state);sheet.hidden=false;requestAnimationFrame(()=>sheet.classList.add('open'));root.querySelector('.resource.energy')?.setAttribute('aria-expanded','true');requestAnimationFrame(()=>sheet.querySelector('.energy-planner-close')?.focus());}else close();};
  const onRootClick=event=>{const target=event.target instanceof Element?event.target:event.target?.parentElement;if(target?.closest('.resource.energy'))toggle();};
  const onRootKey=event=>{const target=event.target instanceof Element?event.target:event.target?.parentElement;if(target?.closest('.resource.energy')&&(event.key==='Enter'||event.key===' ')){event.preventDefault();toggle();}};
  const onSheetClick=event=>{const target=event.target instanceof Element?event.target:event.target?.parentElement;if(target?.closest('[data-energy-close]'))close();};
  const onKey=event=>{if(open&&event.key==='Escape')close();};
  root.addEventListener('click',onRootClick);root.addEventListener('keydown',onRootKey);sheet.addEventListener('click',onSheetClick);document.addEventListener('keydown',onKey);
  const observer=new MutationObserver(paint);observer.observe(root,{childList:true});
  const interval=window.setInterval(paint,1000);paint();
  return ()=>{observer.disconnect();window.clearInterval(interval);clearTimeout(refillClassTimer);root.removeEventListener('click',onRootClick);root.removeEventListener('keydown',onRootKey);sheet.removeEventListener('click',onSheetClick);document.removeEventListener('keydown',onKey);sheet.remove();};
}
