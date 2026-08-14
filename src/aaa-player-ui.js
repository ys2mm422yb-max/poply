import { getState } from './aaa-session.js';
import { playerProgress } from './aaa-progression.js';

const safeRemove=node=>{if(node?.isConnected)node.remove();};

export function installPlayerUI(root){
  let overlayTimer=0;
  const decorate=()=>{
    const state=getState(),progress=playerProgress(state.playerXp);
    const topbar=root.querySelector('.topbar'),brand=root.querySelector('.brand');
    if(!topbar||!brand)return;
    let badge=brand.querySelector('.player-level-badge');
    if(!badge){badge=document.createElement('span');badge.className='player-level-badge';brand.append(badge);}
    const badgeText=`LV ${progress.level}`;
    if(badge.textContent!==badgeText)badge.textContent=badgeText;
    badge.setAttribute('aria-label',`Spielerlevel ${progress.level}`);
    let track=topbar.querySelector('.player-xp-track');
    if(!track){track=document.createElement('div');track.className='player-xp-track';track.innerHTML='<i></i>';topbar.append(track);}
    track.style.setProperty('--player-progress',`${Math.round(progress.ratio*100)}%`);
    track.title=`${progress.current}/${progress.next} XP bis Level ${progress.level+1}`;
    track.setAttribute('aria-label',track.title);
  };
  const showProgression=progression=>{
    if(!progression?.gained)return;
    decorate();
    const topbar=root.querySelector('.topbar');
    if(!topbar)return;
    const chip=document.createElement('span');chip.className='xp-gain-chip';chip.textContent=`+${progression.gained} XP`;topbar.append(chip);setTimeout(()=>safeRemove(chip),1100);
    if(progression.levelsGained>0){
      clearTimeout(overlayTimer);root.querySelector('.level-up-overlay')?.remove();
      const overlay=document.createElement('div');overlay.className='level-up-overlay';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');
      overlay.innerHTML=`<span>LEVEL UP</span><strong>Level ${progression.after.level}</strong><small>+${progression.bonusCoins} Coins</small>`;
      root.append(overlay);overlayTimer=setTimeout(()=>safeRemove(overlay),1800);
    }
  };
  const observer=new MutationObserver(decorate);observer.observe(root,{childList:true,subtree:true});
  document.addEventListener('poply:progression',event=>showProgression(event.detail));
  decorate();
  return {refresh:decorate};
}
