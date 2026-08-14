import { ASSETS } from './aaa-view.js';
import { createUI } from './aaa-ui.js';
import { installDrag } from './aaa-drag.js';
import { installEnergyUI } from './aaa-energy-ui.js';

document.documentElement.style.setProperty('--poply-hero',`url(${ASSETS.hero})`);
document.documentElement.style.setProperty('--poply-atlas',`url(${ASSETS.atlas})`);
const root=document.querySelector('#app');
const toast=document.querySelector('#toast');
const ghost=document.querySelector('#drag-ghost');
const ui=createUI(root,toast);
installDrag({root,ghost,ui});
const syncViewport=()=>{
  const viewport=window.visualViewport;
  const height=viewport?viewport.height:window.innerHeight;
  document.documentElement.style.setProperty('--app-height',`${Math.round(height)}px`);
};
if(window.visualViewport)window.visualViewport.addEventListener('resize',syncViewport);
window.addEventListener('resize',syncViewport);
syncViewport();
ui.render();
installEnergyUI(root);