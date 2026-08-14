import { ASSETS } from './aaa-view.js';
import { createUI } from './aaa-ui.js';
import { installDrag } from './aaa-drag.js';
import { installEnergyUI } from './aaa-energy-ui.js';
import { installPlayerUI } from './aaa-player-ui.js';
import { installDiscoveryUI } from './aaa-discovery-ui.js';
import { installStorageUI } from './aaa-storage-ui.js';
import { installDailyUI } from './aaa-daily-ui.js';
import { installPlaceMapUI } from './aaa-place-map.js';

document.documentElement.style.setProperty('--poply-hero',`url(${ASSETS.hero})`);
document.documentElement.style.setProperty('--poply-atlas',`url(${ASSETS.atlas})`);
const root=document.querySelector('#app');const toast=document.querySelector('#toast');const ghost=document.querySelector('#drag-ghost');const ui=createUI(root,toast);installDrag({root,ghost,ui});const syncViewport=()=>{const viewport=window.visualViewport;const height=viewport?viewport.height:window.innerHeight;document.documentElement.style.setProperty('--app-height',`${Math.round(height)}px`);};if(window.visualViewport)window.visualViewport.addEventListener('resize',syncViewport);window.addEventListener('resize',syncViewport);syncViewport();ui.render();installEnergyUI(root);installPlayerUI(root);installDiscoveryUI(root);installStorageUI(root,ui);installDailyUI(root,ui);installPlaceMapUI(root);
