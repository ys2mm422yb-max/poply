import { itemDefinition } from './v2-game.js';
import { artMarkup } from './aaa-art.js';
import { canRenderSunsetArt, sunsetArtMarkup } from './aaa-sunset-art.js';
import { canRenderGardenArt, gardenArtMarkup } from './aaa-garden-art.js';

const renderArt=art=>canRenderGardenArt(art)?gardenArtMarkup(art):canRenderSunsetArt(art)?sunsetArtMarkup(art):artMarkup(art);

export function installDiscoveryUI(root){
  let leaveTimer=0,removeTimer=0;
  const clearTimers=()=>{clearTimeout(leaveTimer);clearTimeout(removeTimer);};
  const show=detail=>{
    const item=detail?.item;if(item?.kind!=='item')return;
    const def=itemDefinition(item);if(!def)return;
    clearTimers();root.querySelector('.discovery-reveal')?.remove();
    const mastery=detail?.mastery?.completed?`<em class="discovery-mastery"><small>FAMILIE GEMEISTERT</small><strong>+${detail.mastery.rewardCoins} ●</strong></em>`:'';
    const node=document.createElement('div');node.className=`discovery-reveal family-${item.family}${mastery?' mastery-complete':''}`;node.setAttribute('role','status');node.setAttribute('aria-live','polite');
    node.innerHTML=`<div class="discovery-glow"></div><div class="discovery-sparks" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div><div class="discovery-item">${renderArt(def.art)}</div><div class="discovery-copy"><small>NEU ENTDECKT</small><strong>${def.name}</strong><span>Stufe ${item.level} · +${detail.progression?.gained||0} XP</span></div>${mastery}`;
    root.append(node);
    requestAnimationFrame(()=>node.classList.add('is-visible'));
    leaveTimer=setTimeout(()=>node.classList.add('is-leaving'),mastery?1550:1250);
    removeTimer=setTimeout(()=>node.remove(),mastery?1900:1580);
  };
  document.addEventListener('poply:discovery',event=>show(event.detail));
  return {show};
}
