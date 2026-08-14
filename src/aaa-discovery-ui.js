import { itemDefinition } from './v2-game.js';
import { artMarkup } from './aaa-art.js';
import { canRenderSunsetArt, sunsetArtMarkup } from './aaa-sunset-art.js';

const renderArt=art=>canRenderSunsetArt(art)?sunsetArtMarkup(art):artMarkup(art);

export function installDiscoveryUI(root){
  let leaveTimer=0,removeTimer=0;
  const clearTimers=()=>{clearTimeout(leaveTimer);clearTimeout(removeTimer);};
  const show=detail=>{
    const item=detail?.item;if(item?.kind!=='item')return;
    const def=itemDefinition(item);if(!def)return;
    clearTimers();root.querySelector('.discovery-reveal')?.remove();
    const node=document.createElement('div');node.className='discovery-reveal';node.setAttribute('role','status');node.setAttribute('aria-live','polite');
    node.innerHTML=`<div class="discovery-glow"></div><div class="discovery-item">${renderArt(def.art)}</div><div class="discovery-copy"><small>NEU ENTDECKT</small><strong>${def.name}</strong><span>Stufe ${item.level} · +${detail.progression?.gained||0} XP</span></div>`;
    root.append(node);
    /* Commit the hidden start state before the visible state. This preserves the authored transition
       without making a reward's visibility depend on one requestAnimationFrame being scheduled. */
    node.getBoundingClientRect();
    node.classList.add('is-visible');
    leaveTimer=setTimeout(()=>node.classList.add('is-leaving'),1250);
    removeTimer=setTimeout(()=>node.remove(),1580);
  };
  document.addEventListener('poply:discovery',event=>show(event.detail));
  return {show};
}
