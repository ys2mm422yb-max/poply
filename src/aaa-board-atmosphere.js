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
  height:clamp(106px,20vh,176px);
  opacity:.98;
  background:
    radial-gradient(ellipse at 10% 72%,rgba(255,190,104,.36) 0,rgba(255,190,104,.16) 22%,transparent 47%),
    radial-gradient(ellipse at 90% 68%,rgba(92,198,239,.32) 0,rgba(92,198,239,.13) 23%,transparent 48%),
    radial-gradient(ellipse at 52% 112%,rgba(111,218,164,.29) 0,rgba(111,218,164,.1) 28%,transparent 53%),
    linear-gradient(180deg,rgba(13,83,91,.02) 0,rgba(10,72,80,.24) 13%,rgba(7,52,65,.53) 48%,rgba(4,38,51,.78) 100%);
  border-top:2px solid rgba(120,224,211,.18);
  box-shadow:0 -7px 22px rgba(83,209,199,.09),inset 0 1px rgba(255,255,255,.055),inset 0 18px 28px rgba(2,27,36,.1);
}
.qa-board::after{
  height:clamp(98px,18.5vh,164px);
  opacity:.9;
  background:
    radial-gradient(circle at 14% 69%,rgba(255,196,105,.96) 0 2px,rgba(255,196,105,.22) 3px,transparent 9px),
    radial-gradient(circle at 28% 42%,rgba(100,216,208,.83) 0 1.5px,rgba(100,216,208,.16) 2.5px,transparent 8px),
    radial-gradient(circle at 52% 77%,rgba(255,255,255,.58) 0 1px,rgba(255,255,255,.1) 2px,transparent 7px),
    radial-gradient(circle at 71% 48%,rgba(143,220,103,.78) 0 1.5px,rgba(143,220,103,.14) 2.5px,transparent 8px),
    radial-gradient(circle at 88% 72%,rgba(107,188,243,.9) 0 2px,rgba(107,188,243,.17) 3px,transparent 9px),
    repeating-linear-gradient(112deg,transparent 0 32px,rgba(255,255,255,.015) 33px 34px),
    linear-gradient(90deg,transparent 0 7%,rgba(255,255,255,.035) 23%,transparent 42% 58%,rgba(255,255,255,.03) 77%,transparent 93%);
  transform:translate3d(0,0,0);
  animation:poply-board-ambient-drift 5.8s ease-in-out infinite alternate;
}
.qa-board > *{
  position:relative;
  z-index:1;
}
@keyframes poply-board-ambient-drift{
  from{transform:translate3d(-2px,2px,0);opacity:.72}
  to{transform:translate3d(2px,-2px,0);opacity:.94}
}
@media(prefers-reduced-motion:reduce){
  .qa-board::after{animation:none;transform:none;opacity:.84}
}
@media(max-height:740px){
  .qa-board::before{height:92px;opacity:.92}
  .qa-board::after{height:84px;opacity:.82}
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
