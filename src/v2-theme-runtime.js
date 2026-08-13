const set=(el,styles)=>{if(el)Object.assign(el.style,styles);};
function applyTheme(){
  set(document.querySelector('.poply-app'),{background:'linear-gradient(180deg,#153d47 0 23%,#e7eee8 23.1% 100%)'});
  set(document.querySelector('.place-hero'),{filter:'saturate(.94) contrast(1.03)',boxShadow:'0 7px 18px rgba(3,24,31,.30)'});
  for(const el of document.querySelectorAll('.place-card,.upgrade-cta'))set(el,{color:'#f7fbf7',background:'linear-gradient(150deg,rgba(8,35,44,.92),rgba(18,66,72,.88))',borderColor:'rgba(255,255,255,.22)',boxShadow:'0 5px 14px rgba(3,20,27,.30)'});
  set(document.querySelector('.place-card small'),{color:'#bed5d4'});set(document.querySelector('.place-progress'),{background:'rgba(255,255,255,.14)'});set(document.querySelector('.place-progress span'),{background:'linear-gradient(90deg,#f5c85d,#67dc58)'});
  set(document.querySelector('.upgrade-copy span'),{color:'#fff'});set(document.querySelector('.upgrade-copy small'),{color:'#ffd96a'});
  const orders=document.querySelector('.orders-section');set(orders,{position:'relative',paddingTop:'15px',background:'linear-gradient(180deg,#0d3540,#174d55)',borderBottomColor:'rgba(255,255,255,.09)'});set(orders?.querySelector('.section-head'),{display:'none'});
  const purpose=document.querySelector('.orders-purpose');set(purpose,{position:'absolute',top:'2px',left:'9px',right:'9px',height:'11px',display:'flex',alignItems:'center',justifyContent:'space-between',color:'#d9eef0',fontSize:'.36rem',fontWeight:'850',letterSpacing:'.04em'});set(purpose?.querySelector('strong'),{color:'#fff'});set(purpose?.querySelector('span'),{color:'#f3cd6e'});
  for(const card of document.querySelectorAll('.order-card'))set(card,{color:'#173844',background:card.classList.contains('ready')?'linear-gradient(155deg,#f5ffe8,#dcf6c9)':'linear-gradient(155deg,#fff8e9,#f2dfbd)',boxShadow:'0 3px 8px rgba(2,21,29,.20), inset 0 1px 0 #fff'});
  for(const title of document.querySelectorAll('.order-main strong'))set(title,{color:'#173844'});for(const tag of document.querySelectorAll('.purpose-tag'))set(tag,{color:'#356c63',background:'rgba(61,139,125,.11)',borderRadius:'999px',padding:'1px 3px'});
  set(document.querySelector('.board-wrap'),{background:'linear-gradient(180deg,#e7eee8,#dce8e1)'});set(document.querySelector('.bottom-bar'),{background:'linear-gradient(180deg,#0c303c,#071f2a)'});
  for(const nav of document.querySelectorAll('.nav-button'))set(nav,{color:nav.classList.contains('active')?'#fff':'#bcd5d7',background:nav.classList.contains('active')?'rgba(61,139,125,.32)':'transparent'});
}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;applyTheme();});};
const app=document.querySelector('.poply-app');if(app)new MutationObserver(schedule).observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});applyTheme();
