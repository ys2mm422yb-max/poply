import { itemDefinition } from './v2-game.js';
import { artMarkup } from './aaa-art.js';
import { canRenderSunsetArt, sunsetArtMarkup } from './aaa-sunset-art.js';

const renderArt=art=>canRenderSunsetArt(art)?sunsetArtMarkup(art):artMarkup(art);

export function installDiscoveryUI(root){
  let timer=0;
  const show=detail=>{
    const item=detail?.item;if(item?.kind!=='item')return;
    const def=itemDefinition(item);if(!def)return;
    clearTimeout(timer);root.querySelector('.discovery-reveal')?.remove();
    const node=document.createElement('div');node.className='discovery-reveal';node.setAttribute('role','status');node.setAttribute('aria-live','polite');
    node.innerHTML=`<div class="discovery-glow"></div><div class="discovery-item">${renderArt(def.art)}</div><div class="discovery-copy"><small>NEU ENTDECKT</small><strong>${def.name}</strong><span>Stufe ${item.level} · +${detail.progression?.gained||0} XP</span></div>`;
    root.append(node);timer=setTimeout(()=>node.remove(),1600);
  };
  document.addEventListener('poply:discovery',event=>show(event.detail));
  return {show};
}
