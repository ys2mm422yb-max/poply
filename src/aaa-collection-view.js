import { ITEM_FAMILIES, GENERATORS } from './v2-game.js';
import { artMarkup } from './aaa-art.js';
import { canRenderSunsetArt, sunsetArtMarkup } from './aaa-sunset-art.js';
import { canRenderGardenArt, gardenArtMarkup } from './aaa-garden-art.js';
import { discoveryItemKey, isDiscovered, familyDiscoveryCount, totalItemDiscoveryCount } from './aaa-collection.js';

const FAMILY_ORDER=['coffee','bakery','sweet','fruit','herb'];
const FAMILY_COPY={coffee:'Getränke',bakery:'Backstube',sweet:'Süßes',fruit:'Sonnenfrüchte',herb:'Dachgarten'};
const FAMILY_TAB_COPY={...FAMILY_COPY,fruit:'Früchte'};
const collectionIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5c2.4-.5 4.7.1 7 1.7v12c-2.3-1.5-4.6-2.1-7-1.6v-12Zm14 0c-2.4-.5-4.7.1-7 1.7v12c2.3-1.5 4.6-2.1 7-1.6v-12Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const renderArt=art=>canRenderGardenArt(art)?gardenArtMarkup(art):canRenderSunsetArt(art)?sunsetArtMarkup(art):artMarkup(art);

export function navWithCollection(view,baseNav){
  const button=`<button class="nav-tab nav-collection ${view==='collection'?'active':''}" data-view="collection" aria-pressed="${view==='collection'}"><b class="nav-icon"><span class="ui-icon icon-collection">${collectionIcon}</span></b><span>Sammlung</span></button>`;
  return baseNav.replace('</nav>',`${button}</nav>`);
}

function familySelector(state,selected){
  return `<div class="collection-families" role="tablist" aria-label="Sammlungsfamilien">${FAMILY_ORDER.map(family=>{
    const count=familyDiscoveryCount(state,family),active=family===selected;
    return `<button role="tab" aria-selected="${active}" class="collection-family ${active?'active':''}" data-collection-family="${family}" aria-label="${FAMILY_COPY[family]} ${count.found} von ${count.total}"><strong>${FAMILY_TAB_COPY[family]}</strong><small>${count.found}/${count.total}</small></button>`;
  }).join('')}</div>`;
}

function tierCard(state,family,level){
  const def=ITEM_FAMILIES[family],key=discoveryItemKey(family,level),known=isDiscovered(state,key),name=def.stages[level-1],art=def.art[level-1];
  return `<article class="collection-tier ${known?'discovered':'locked'}" data-discovery-key="${key}"><div class="collection-art ${known?'':'silhouette'}">${renderArt(art)}</div><div class="collection-tier-copy"><span>STUFE ${level}</span><strong>${known?name:'???'}</strong>${known?'<small>Entdeckt</small>':'<small>Noch entdecken</small>'}</div></article>`;
}

function worldDiscoveries(state){
  const entries=[
    ['place:coast','Café am Meer','Place 01'],
    ['generator:coffee-gen',GENERATORS['coffee-gen'].label,'Generator'],
    ['generator:pantry-gen',GENERATORS['pantry-gen'].label,'Generator'],
    ['place:sunset','Sonnenkai','Place 02'],
    ['generator:sunset-gen',GENERATORS['sunset-gen'].label,'Generator'],
    ['place:garden','Dachgarten','Place 03'],
    ['generator:garden-gen',GENERATORS['garden-gen'].label,'Generator']
  ];
  return `<section class="collection-world" aria-label="Welt-Entdeckungen">${entries.map(([key,label,type])=>{const known=isDiscovered(state,key);return `<div class="world-discovery ${known?'known':'unknown'}"><span>${known?'✓':'?'}</span><div><small>${type}</small><strong>${known?label:'Unentdeckt'}</strong></div></div>`;}).join('')}</section>`;
}

export function collectionView(state,selectedFamily='coffee'){
  const family=ITEM_FAMILIES[selectedFamily]?selectedFamily:'coffee',count=familyDiscoveryCount(state,family),total=totalItemDiscoveryCount(state),percent=total.total?Math.round(total.found/total.total*100):0;
  return `<main class="game-view view-collection collection-book"><section class="collection-hero"><div><small>POPLY SAMMLUNG</small><h1>Deine Entdeckungen</h1><p>Jede neue Stufe bleibt für immer in deinem Buch.</p></div><div class="collection-total"><strong>${total.found}/${total.total}</strong><span>${percent}%</span></div></section>${familySelector(state,family)}<section class="collection-focus"><header><div><small>ITEM-FAMILIE</small><h2>${FAMILY_COPY[family]}</h2></div><strong>${count.found}/${count.total}</strong></header><div class="collection-tier-grid">${ITEM_FAMILIES[family].stages.map((_,index)=>tierCard(state,family,index+1)).join('')}</div></section>${worldDiscoveries(state)}</main>`;
}
