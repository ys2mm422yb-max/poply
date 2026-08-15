const STYLE_ID='poply-order-choice-readable-titles';

export const ORDER_CHOICE_POLISH_CSS=`
.customer-choice strong{
  min-width:0;
  overflow:hidden;
  text-overflow:clip;
  white-space:normal;
  display:-webkit-box;
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2;
  line-clamp:2;
  align-self:end;
  font-size:8.5px;
  line-height:1.05;
  letter-spacing:-.01em;
}
.customer-choice small{
  align-self:start;
  line-height:1;
}
@media(max-width:430px){
  .customer-choice{height:68px;grid-template-rows:minmax(18px,1fr) auto}
  .customer-choice strong{font-size:8.1px;line-height:1.04}
}
`;

export function installOrderChoicePolish(doc=document){
  if(doc.getElementById(STYLE_ID))return;
  const style=doc.createElement('style');
  style.id=STYLE_ID;
  style.textContent=ORDER_CHOICE_POLISH_CSS;
  doc.head.append(style);
}

if(typeof document!=='undefined')installOrderChoicePolish(document);
