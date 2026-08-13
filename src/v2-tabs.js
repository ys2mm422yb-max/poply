export const VIEW_BY_TARGET={'place-hero':'place','orders-section':'orders','board-section':'board'};
export const viewForTarget=id=>VIEW_BY_TARGET[id]||null;

if(typeof document!=='undefined'){
  const app=document.querySelector('.poply-app');
  const setView=view=>{
    if(!app)return;
    app.dataset.view=view;
    document.querySelectorAll('.nav-button[data-scroll]').forEach(button=>{
      const active=viewForTarget(button.dataset.scroll)===view;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    document.querySelector('.game-menu[open]')?.removeAttribute('open');
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('.nav-button[data-scroll]');
    if(!button)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    setView(viewForTarget(button.dataset.scroll)||'board');
  },true);
  setView('board');
}
