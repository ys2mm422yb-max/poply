const root=document.documentElement;
const app=document.querySelector('.poply-app');
let raf=0;

function syncViewport(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
    const viewport=window.visualViewport;
    const height=Math.max(1,Math.round(viewport?.height||window.innerHeight||document.documentElement.clientHeight));
    const width=Math.max(1,Math.round(viewport?.width||window.innerWidth||document.documentElement.clientWidth));
    root.style.setProperty('--app-height',`${height}px`);
    const sideSpace=width<=819?16:28;
    const boardByWidth=Math.max(250,width-sideSpace);
    const boardByHeight=Math.max(250,Math.floor(height*.515));
    const boardSize=Math.min(boardByWidth,boardByHeight,width<=819?390:500);
    root.style.setProperty('--board-size',`${boardSize}px`);
    if(app)app.dataset.viewport=`${width}x${height}`;
  });
}

function focusRegion(button){
  const id=button.dataset.scroll;
  const target=id?document.getElementById(id):null;
  if(!target)return;
  document.querySelectorAll('.nav-button').forEach(item=>item.classList.toggle('active',item===button));
  target.classList.remove('section-focus');
  void target.offsetWidth;
  target.classList.add('section-focus');
  window.setTimeout(()=>target.classList.remove('section-focus'),520);
}

document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-scroll]');
  if(!button)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  focusRegion(button);
},true);

syncViewport();
window.addEventListener('resize',syncViewport,{passive:true});
window.addEventListener('orientationchange',syncViewport,{passive:true});
window.visualViewport?.addEventListener('resize',syncViewport,{passive:true});
window.visualViewport?.addEventListener('scroll',syncViewport,{passive:true});
