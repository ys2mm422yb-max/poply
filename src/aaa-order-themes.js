export const ORDER_THEMES={
  'coffee-break':{label:'KAFFEEPAUSE'},
  'breakfast-prep':{label:'FRÜHSTÜCK'},
  'sweet-prep':{label:'SÜSSE PAUSE'},
  date:{label:'ZU ZWEIT'},
  brunch:{label:'BRUNCH'},
  celebration:{label:'FESTMOMENT'},
  sunset:{label:'SONNENKAI'},
  garden:{label:'DACHGARTEN'},
};

const knownTheme=id=>ORDER_THEMES[id]??null;

export function orderTheme(order){
  const theme=knownTheme(order?.theme);
  if(!theme)return null;
  const story=String(order?.story||'').replace(/\s+/g,' ').trim();
  return story?{id:order.theme,label:theme.label,story}:null;
}

export function thematicOrderMarkup(order){
  const theme=orderTheme(order);
  if(!theme)return '';
  return `<div class="service-order-theme" data-order-theme="${theme.id}"><span>${theme.label}</span><p>${theme.story}</p></div>`;
}
