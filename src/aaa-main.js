import { ASSETS } from './aaa-view.js';
import { createUI } from './aaa-ui.js';
import { installDrag } from './aaa-drag.js';

document.documentElement.style.setProperty('--poply-hero',`url(${ASSETS.hero})`);
document.documentElement.style.setProperty('--poply-atlas',`url(${ASSETS.atlas})`);
const root=document.querySelector('#app');
const toast=document.querySelector('#toast');
const ghost=document.querySelector('#drag-ghost');
const ui=createUI(root,toast);
installDrag({root,ghost,ui});
ui.render();
