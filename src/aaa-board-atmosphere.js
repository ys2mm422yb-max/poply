const STYLE_ID='poply-board-atmosphere-band';

export const BOARD_ATMOSPHERE_CSS=`
/* Screenshot-driven Board atmosphere only. Keep the 7x7 workbench geometry untouched. */
.qa-board{
  position:relative;
  isolation:isolate;
  overflow:hidden;
}
.qa-board::before,
.qa-board::after{
  content:'';
  position:absolute;
  left:0;
  right:0;
  bottom:0;
  pointer-events:none;
  z-index:0;
}
.qa-board::before{
  height:clamp(72px,17vh,150px);
  opacity:.92;
  background:
    radial-gradient(ellipse at 13% 76%,rgba(255,191,105,.22) 0,rgba(255,191,105,.09) 19%,transparent 43%),
    radial-gradient(ellipse at 87% 70%,rgba(93,198,238,.2) 0,rgba(93,198,238,.07) 20%,transparent 44%),
    radial-gradient(ellipse at 52% 112%,rgba(111,218,164,.18) 0,transparent 48%),
    linear-gradient(180deg,rgba(8,56,67,0) 0,rgba(6,47,60,.18) 25%,rgba(4,38,51,.48) 100%);
  border-top:1px solid rgba(113,210,203,.12);
  box-shadow:inset 0 9px 20px rgba(2,28,37,.1);
}
.qa-board::after{
  height:clamp(70px,16vh,142px);
  opacity:.76;
  background:
    radial-gradient(circle at 15% 72%,rgba(255,195,104,.88) 0 2px,rgba(255,195,104,.16) 3px,transparent 8px),
    radial-gradient(circle at 30% 48%,rgba(100,216,208,.68) 0 1.5px,rgba(100,216,208,.12) 2.5px,transparent 7px),
    radial-gradient(circle at 70% 55%,rgba(143,220,103,.62) 0 1.5px,rgba(143,220,103,.1) 2.5px,transparent 7px),
    radial-gradient(circle at 87% 75%,rgba(107,188,243,.72) 0 2px,rgba(107,188,243,.12) 3px,transparent 8px),
    linear-gradient(90deg,transparent 0 8%,rgba(255,255,255,.025) 24%,transparent 43% 57%,rgba(255,255,255,.02) 76%,transparent 92%);
  transform:translate3d(0,0,0);
  animation:poply-board-ambient-drift 5.8s ease-in-out infinite alternate;
}
.qa-board > *{
  position:relative;
  z-index:1;
}
@keyframes poply-board-ambient-drift{
  from{transform:translate3d(-2px,1px,0);opacity:.64}
  to{transform:translate3d(2px,-2px,0);opacity:.84}
}
@media(prefers-reduced-motion:reduce){
  .qa-board::after{animation:none;transform:none;opacity:.72}
}
@media(max-height:740px){
  .qa-board::before{height:76px;opacity:.8}
  .qa-board::after{height:72px;opacity:.68}
}
`;

export function installBoardAtmosphere(doc=document){
  if(doc.getElementById(STYLE_ID))return;
  const style=doc.createElement('style');
  style.id=STYLE_ID;
  style.textContent=BOARD_ATMOSPHERE_CSS;
  doc.head.append(style);
}

if(typeof document!=='undefined')installBoardAtmosphere(document);
