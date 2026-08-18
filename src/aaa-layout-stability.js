const px=value=>Number.parseFloat(value)||0;

export function installLayoutStability(root){
  let observedArea=null;
  let scheduled=false;
  const resizeObserver=new ResizeObserver(()=>schedule());

  const measureBoard=()=>{
    const area=root.querySelector('.view-board .board-area');
    if(area!==observedArea){
      if(observedArea)resizeObserver.unobserve(observedArea);
      observedArea=area;
      if(observedArea)resizeObserver.observe(observedArea);
    }
    if(!area)return;
    const title=area.querySelector(':scope > .board-title');
    const frame=area.querySelector(':scope > .board-frame');
    if(!title||!frame)return;
    const areaBox=area.getBoundingClientRect();
    const titleBox=title.getBoundingClientRect();
    const style=getComputedStyle(area);
    const gap=px(style.rowGap||style.gap);
    const availableHeight=Math.max(0,areaBox.height-titleBox.height-gap-px(style.paddingTop)-px(style.paddingBottom));
    const availableWidth=Math.max(0,areaBox.width-px(style.paddingLeft)-px(style.paddingRight));
    const side=Math.floor(Math.min(availableWidth,availableHeight));
    if(side<120)return;
    const next=`${side}px`;
    if(frame.style.getPropertyValue('--board-square')!==next)frame.style.setProperty('--board-square',next);
  };

  const run=()=>{scheduled=false;measureBoard();};
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run);}

  const observer=new MutationObserver(schedule);
  observer.observe(root,{childList:true,subtree:true});
  window.addEventListener('resize',schedule);
  window.visualViewport?.addEventListener('resize',schedule);
  schedule();

  return {refresh:schedule,disconnect:()=>{
    observer.disconnect();resizeObserver.disconnect();window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);
  }};
}
