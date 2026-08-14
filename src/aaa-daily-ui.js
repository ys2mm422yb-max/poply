import { getState, claimTodayGoal, serveDailyGuest } from './aaa-session.js';
import { canServeDailyBonus, dailyCompletedCount } from './aaa-daily.js';
import { countRequirement } from './v2-game.js';
import { itemMarkup } from './aaa-view.js';

const checkIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5.2 12.4 4.1 4.1 9.5-9.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const sunIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const coinIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="currentColor"/><circle cx="12" cy="12" r="4.8" fill="none" stroke="currentColor" stroke-opacity=".3" stroke-width="1.5"/></svg>';
const starIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 2.8Z" fill="currentColor"/></svg>';

function goalMarkup(goal){
  const complete=goal.progress>=goal.target;
  const action=goal.claimed?`<span class="daily-claimed">${checkIcon} Eingesammelt</span>`:complete?`<button data-daily-claim="${goal.id}">+${goal.reward.coins} Coins</button>`:`<span class="daily-progress-value">${goal.progress}/${goal.target}</span>`;
  return `<div class="daily-goal ${complete?'complete':''} ${goal.claimed?'claimed':''}"><span class="daily-goal-mark">${goal.claimed?checkIcon:sunIcon}</span><div class="daily-goal-copy"><strong>${goal.label}</strong><div class="daily-progress"><i style="width:${Math.round(goal.progress/goal.target*100)}%"></i></div></div>${action}</div>`;
}

function bonusMarkup(state){
  const bonus=state.daily.bonus,req=bonus.requirements[0],rawHave=countRequirement(state,req),have=Math.min(rawHave,req.qty),ready=canServeDailyBonus(state);
  if(bonus.served)return `<section class="daily-bonus served"><div class="daily-bonus-art">${checkIcon}</div><div class="daily-bonus-copy"><small>TAGESGAST</small><strong>Heute bedient</strong><p>Morgen wartet ein neuer Bonusgast.</p></div><span class="daily-bonus-done">${checkIcon}</span></section>`;
  return `<section class="daily-bonus ${ready?'ready':''}"><div class="daily-bonus-art">${itemMarkup({kind:'item',family:req.family,level:req.level},true)}</div><div class="daily-bonus-copy"><small>TAGESGAST</small><strong>${bonus.title.replace('Tagesgast · ','')}</strong><p>${have}/${req.qty} vorbereitet</p><div class="daily-bonus-reward"><span>${coinIcon}<b>${bonus.rewards.coins}</b></span><span>${starIcon}<b>${bonus.rewards.stars}</b></span></div></div><button data-daily-serve ${ready?'':'disabled'}>${ready?'Servieren':'Vorbereiten'}</button></section>`;
}

function sheetMarkup(state){
  return `<div class="daily-backdrop" data-daily-close></div><section class="daily-sheet" role="dialog" aria-modal="true" aria-label="Tagesziele"><header><div class="daily-title-icon">${sunIcon}</div><div><small>HEUTE</small><h2>Tagesziele</h2><p>Spiele wie du willst. Kein Streak, keine Strafe.</p></div><button class="daily-close" data-daily-close aria-label="Tagesziele schließen">×</button></header><div class="daily-goals">${state.daily.goals.map(goalMarkup).join('')}</div>${bonusMarkup(state)}</section>`;
}

export function installDailyUI(root,ui){
  let open=false,lastSignature='',lastSheetSignature='';
  const signature=state=>JSON.stringify({view:root.dataset.view,date:state.daily?.dateKey,goals:state.daily?.goals?.map(g=>[g.progress,g.claimed]),served:state.daily?.bonus?.served,coins:state.coins,stars:state.stars});
  const closeLayer=()=>{root.querySelector('.daily-layer')?.remove();lastSheetSignature='';};
  const decorate=()=>{
    const state=getState();
    if(root.dataset.view!=='orders'){
      open=false;root.querySelector('.daily-ribbon')?.remove();closeLayer();lastSignature='';return;
    }
    const queue=root.querySelector('.customer-queue');if(!queue)return;
    const completed=dailyCompletedCount(state),claimed=state.daily.goals.filter(goal=>goal.claimed).length,bonus=state.daily.bonus;
    let ribbon=root.querySelector('.daily-ribbon');
    if(!ribbon){ribbon=document.createElement('button');ribbon.className='daily-ribbon';ribbon.dataset.dailyToggle='';queue.before(ribbon);}
    queue.closest('.service-orders')?.classList.add('has-daily-ribbon');
    const nextSignature=signature(state);
    if(nextSignature!==lastSignature){
      ribbon.innerHTML=`<span class="daily-ribbon-icon">${sunIcon}</span><span class="daily-ribbon-copy"><small>HEUTE · ${completed}/3 ZIELE</small><strong>${claimed===3?'Ziele eingesammelt':'Tagesziele & Gast'}</strong></span><span class="daily-ribbon-reward">${bonus.served?checkIcon:`${coinIcon}<b>${bonus.rewards.coins}</b>`}</span><span class="daily-ribbon-chevron">›</span>`;
      lastSignature=nextSignature;
    }
    if(!open){closeLayer();return;}
    const sheetSignature=`${nextSignature}:open`;
    if(root.querySelector('.daily-layer')&&lastSheetSignature===sheetSignature)return;
    closeLayer();const wrap=document.createElement('div');wrap.className='daily-layer';wrap.innerHTML=sheetMarkup(state);const nav=root.querySelector('.main-nav');nav?nav.before(wrap):root.append(wrap);lastSheetSignature=sheetSignature;
  };
  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement;if(!target)return;
    if(target.closest('[data-daily-toggle]')){open=true;decorate();return;}
    if(target.closest('[data-daily-close]')){open=false;decorate();return;}
    const claim=target.closest('[data-daily-claim]');
    if(claim){const result=claimTodayGoal(claim.dataset.dailyClaim);if(result.changed)ui.message(`Tagesziel geschafft  +${result.reward.coins} Coins`);else ui.message('Dieses Tagesziel ist noch nicht fertig.','bad');ui.render();decorate();return;}
    if(target.closest('[data-daily-serve]')){const result=serveDailyGuest();if(result.changed){ui.message(`Tagesgast serviert  +${result.rewards.coins} Coins  +${result.rewards.stars} Sterne`);ui.progression(result,'daily-bonus');}else ui.message('Für den Tagesgast fehlt noch das gewünschte Item.','bad');ui.render();decorate();}
  });
  const observer=new MutationObserver(()=>queueMicrotask(decorate));observer.observe(root,{childList:true,subtree:true});
  decorate();return {refresh:decorate,disconnect:()=>observer.disconnect()};
}
