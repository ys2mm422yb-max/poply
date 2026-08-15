import { getState } from './aaa-session.js';
import { playerProgress, nextLevelRewardPreview } from './aaa-progression.js';
import { playerMilestones, completedMilestoneCount, playerTitleProgress } from './aaa-milestones.js';

const safeRemove=node=>{if(node?.isConnected)node.remove();};
const checkIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function installPlayerUI(root){
  let overlayTimer=0,levelDelayTimer=0,milestonesOpen=false,decorating=false;
  const milestoneData=state=>playerMilestones(state);
  const milestoneSignature=(milestones,preview,title)=>`${milestones.map(entry=>`${entry.id}:${entry.current}:${entry.complete?'1':'0'}`).join('|')}|next:${preview.level}:${preview.remainingXp}|title:${title.current.rank}`;
  const nextLevelMarkup=preview=>`<div class="next-level-preview" aria-label="Nächstes Level ${preview.level}, ${preview.remainingXp} XP fehlen, ${preview.rewardCoins} Coins Belohnung"><span class="next-level-orb">LV ${preview.level}</span><div class="next-level-copy"><small>NÄCHSTES LEVEL</small><strong>${preview.remainingXp} XP fehlen</strong><div class="next-level-track"><i style="width:${Math.round(preview.ratio*100)}%"></i></div></div><div class="next-level-reward"><small>BELOHNUNG</small><strong>+${preview.rewardCoins}</strong><span>Coins</span></div></div>`;
  const titleMarkup=title=>`<div class="player-title-line" aria-label="Spielertitel ${title.current.label}"><span>DEIN TITEL</span><strong>${title.current.label}</strong>${title.next?`<small>Nächster: ${title.next.label}</small>`:'<small>Höchster Titel erreicht</small>'}</div>`;
  const milestoneMarkup=(milestones,signature,preview,title)=>{
    const done=milestones.filter(entry=>entry.complete).length;
    return `<section class="player-progress-sheet" data-signature="${signature}" aria-label="Spielerfortschritt"><header><div><small>DEIN FORTSCHRITT</small><strong>${done}/${milestones.length} Meilensteine</strong></div><button data-player-progress-close aria-label="Fortschritt schließen">×</button></header>${titleMarkup(title)}${nextLevelMarkup(preview)}<div class="milestone-list">${milestones.map(entry=>`<article class="milestone-row ${entry.complete?'complete':''}"><span class="milestone-mark">${entry.complete?checkIcon:`${entry.current}`}</span><div class="milestone-copy"><strong>${entry.label}</strong><small>${entry.detail}</small><div class="milestone-track"><i style="width:${Math.round(entry.ratio*100)}%"></i></div></div><b>${entry.complete?'Fertig':`${entry.current}/${entry.target}`}</b></article>`).join('')}</div></section>`;
  };
  const decorate=()=>{
    if(decorating)return;decorating=true;
    try{
      const state=getState(),progress=playerProgress(state.playerXp),title=playerTitleProgress(state);
      const topbar=root.querySelector('.topbar'),brand=root.querySelector('.brand');
      if(!topbar||!brand)return;
      let badge=brand.querySelector('.player-level-badge');
      if(!badge){badge=document.createElement('button');badge.type='button';badge.className='player-level-badge';badge.dataset.playerProgress='';brand.append(badge);}
      const badgeText=`LV ${progress.level}`;
      if(badge.textContent!==badgeText)badge.textContent=badgeText;
      badge.setAttribute('aria-label',`Spielerlevel ${progress.level} · ${title.current.label} – Fortschritt öffnen`);badge.setAttribute('aria-expanded',String(milestonesOpen));
      let track=topbar.querySelector('.player-xp-track');
      if(!track){track=document.createElement('div');track.className='player-xp-track';track.innerHTML='<i></i>';topbar.append(track);}
      track.style.setProperty('--player-progress',`${Math.round(progress.ratio*100)}%`);
      track.title=`${progress.current}/${progress.next} XP bis Level ${progress.level+1}`;
      track.setAttribute('aria-label',track.title);
      const existing=root.querySelector('.player-progress-sheet');
      if(!milestonesOpen){existing?.remove();return;}
      const milestones=milestoneData(state),preview=nextLevelRewardPreview(state.playerXp),signature=milestoneSignature(milestones,preview,title);
      if(existing?.dataset.signature===signature)return;
      existing?.remove();topbar.insertAdjacentHTML('afterend',milestoneMarkup(milestones,signature,preview,title));
    }finally{decorating=false;}
  };
  const revealLevelUp=progression=>{
    clearTimeout(overlayTimer);root.querySelector('.level-up-overlay')?.remove();
    const overlay=document.createElement('div');overlay.className='level-up-overlay';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');
    overlay.innerHTML=`<span>LEVEL UP</span><strong>Level ${progression.after.level}</strong><small>+${progression.bonusCoins} Coins</small>`;
    root.append(overlay);overlayTimer=setTimeout(()=>safeRemove(overlay),1800);
  };
  const showProgression=progression=>{
    if(!progression?.gained)return;
    decorate();
    const topbar=root.querySelector('.topbar');
    if(!topbar)return;
    const chip=document.createElement('span');chip.className='xp-gain-chip';chip.textContent=`+${progression.gained} XP`;topbar.append(chip);setTimeout(()=>safeRemove(chip),1100);
    if(progressingToNewLevel(progression)){
      clearTimeout(levelDelayTimer);
      const delay=progression.source==='restoration'?1750:progression.source==='discovery'?1650:850;
      levelDelayTimer=setTimeout(()=>revealLevelUp(progression),delay);
    }
  };
  const progressingToNewLevel=progression=>Number(progression?.levelsGained||0)>0;
  root.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:event.target?.parentElement;if(!target)return;if(target.closest('[data-player-progress]')){milestonesOpen=!milestonesOpen;decorate();return;}if(target.closest('[data-player-progress-close]')){milestonesOpen=false;decorate();}});
  const observer=new MutationObserver(decorate);observer.observe(root,{childList:true,subtree:true});
  document.addEventListener('poply:progression',event=>showProgression(event.detail));
  decorate();
  return {refresh:decorate,isMilestonesOpen:()=>milestonesOpen,completedMilestones:()=>completedMilestoneCount(getState()),playerTitle:()=>playerTitleProgress(getState()).current.label};
}