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
  height:clamp(132px,26vh,220px);
  opacity:.98;
  background:
    radial-gradient(ellipse at 10% 68%,rgba(255,190,104,.37) 0,rgba(255,190,104,.16) 23%,transparent 48%),
    radial-gradient(ellipse at 90% 65%,rgba(92,198,239,.33) 0,rgba(92,198,239,.13) 24%,transparent 49%),
    radial-gradient(ellipse at 52% 105%,rgba(111,218,164,.3) 0,rgba(111,218,164,.11) 29%,transparent 54%),
    linear-gradient(180deg,rgba(13,83,91,.02) 0,rgba(10,72,80,.25) 14%,rgba(7,52,65,.54) 49%,rgba(4,38,51,.79) 100%);
  border-top:2px solid rgba(120,224,211,.2);
  box-shadow:0 -7px 24px rgba(83,209,199,.1),inset 0 1px rgba(255,255,255,.06),inset 0 20px 30px rgba(2,27,36,.1);
}
.qa-board::after{
  height:clamp(122px,24vh,204px);
  opacity:.91;
  background:
    radial-gradient(circle at 14% 66%,rgba(255,196,105,.96) 0 2px,rgba(255,196,105,.22) 3px,transparent 9px),
    radial-gradient(circle at 28% 39%,rgba(100,216,208,.83) 0 1.5px,rgba(100,216,208,.16) 2.5px,transparent 8px),
    radial-gradient(circle at 52% 74%,rgba(255,255,255,.58) 0 1px,rgba(255,255,255,.1) 2px,transparent 7px),
    radial-gradient(circle at 71% 45%,rgba(143,220,103,.78) 0 1.5px,rgba(143,220,103,.14) 2.5px,transparent 8px),
    radial-gradient(circle at 88% 68%,rgba(107,188,243,.9) 0 2px,rgba(107,188,243,.17) 3px,transparent 9px),
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
  from{transform:translate3d(-2px,2px,0);opacity:.73}
  to{transform:translate3d(2px,-2px,0);opacity:.95}
}
@media(prefers-reduced-motion:reduce){
  .qa-board::after{animation:none;transform:none;opacity:.85}
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
