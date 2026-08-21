export const ORDER_PRESENTATIONS=Object.freeze({
  'Morgenkaffee':{id:'coffee-break',label:'KAFFEEPAUSE',title:'Morgenkaffee',story:'Eine Kaffeetasse für den ersten ruhigen Moment am Meer.'},
  'Frisches Gebäck':{id:'breakfast-prep',label:'FRÜHSTÜCK',title:'Backstuben-Start',story:'Mehl vorbereiten – daraus entsteht das frische Gebäck für den Morgen.'},
  'Kleine Pause':{id:'sweet-prep',label:'SÜSSE PAUSE',title:'Süße Vorbereitung',story:'Zucker vorbereiten – die Basis für eine kleine süße Pause.'},
  'Eiskaffee-Date':{id:'date',label:'ZU ZWEIT',title:'Eiskaffee-Date',story:'Eiskaffee servieren und Mehl für etwas Frisches dazu vorbereiten.'},
  'Croissant & Kaffee':{id:'breakfast-prep',label:'FRÜHSTÜCK',title:'Croissant & Kaffee',story:'Ein Croissant und eine Kaffeetasse – ein klassisches Küstenfrühstück.'},
  'Süßer Nachmittag':{id:'sweet-prep',label:'SÜSSER NACHMITTAG',title:'Süßer Nachmittag',story:'Muffin und Eiskaffee machen aus der Pause einen kleinen Genussmoment.'},
  'Küsten-Brunch':{id:'brunch',label:'BRUNCH',title:'Küsten-Brunch',story:'Küstenbrot und Poply Mocha gehören zusammen auf den großen Brunch-Tisch.'},
  'Sonnenuntergang':{id:'date',label:'ABENDPAUSE',title:'Sonnenuntergang',story:'Meer-Sundae und Küsten-Mokka für einen langen Abend am Wasser.'},
  'Poply Festtafel':{id:'celebration',label:'FESTMOMENT',title:'Poply Festtafel',story:'Backkorb und Festtorte – die große Bestellung für einen besonderen Anlass.'},
  'Frühstücksduo':{id:'breakfast-prep',label:'FRÜHSTÜCK',title:'Frühstücks-Vorbereitung',story:'Kaffee servieren und Mehl für das Gebäck vorbereiten.'},
  'Milchkaffee-Pause':{id:'coffee-break',label:'KAFFEEPAUSE',title:'Kaffee mit etwas Süßem',story:'Kaffeetasse plus Zucker-Vorbereitung für eine süße Kaffeepause.'},
  'Kleine Frühstücksplatte':{id:'breakfast-prep',label:'FRÜHSTÜCK',title:'Frühstück vorbereiten',story:'Mehl und Zucker vorbereiten – daraus entsteht das kleine Frühstück.'},

  'Erster Kaffee':{id:'coffee-break',label:'ERSTER GAST',title:'Erster Kaffee',story:'Die erste Kaffeetasse eröffnet den Service und finanziert die Lichter.'},
  'Frühstück am Fenster':{id:'breakfast-prep',label:'FRÜHSTÜCK',title:'Frühstück am Fenster',story:'Kaffee servieren und Mehl für das erste Gebäck am Fenster vorbereiten.'},
  'Süße Begrüßung':{id:'sweet-prep',label:'BEGRÜSSUNG',title:'Süße Begrüßung',story:'Zucker und Mehl vorbereiten – die ersten süßen Backideen entstehen daraus.'},

  'Limettenpause':{id:'sunset',label:'SONNENKAI',title:'Fruchtmix-Pause',story:'Ein frischer Fruchtmix passt zum ersten ruhigen Moment am Sonnenkai.'},
  'Sunset Smoothie':{id:'sunset',label:'SUNSET-DRINK',title:'Sunset Smoothie',story:'Smoothie servieren und Zucker für das süße Extra vorbereiten.'},
  'Deck-Brunch':{id:'brunch',label:'DECK-BRUNCH',title:'Deck-Brunch',story:'Tropen-Drink servieren und Teig für das Gebäck auf dem Deck vorbereiten.'},
  'Tropenabend':{id:'sunset',label:'TROPENABEND',title:'Tropenabend',story:'Tropen-Drink und Poply Mocha bringen Frucht und Kaffee an einen Tisch.'},
  'Golden Hour':{id:'sunset',label:'GOLDEN HOUR',title:'Golden Hour',story:'Sunset-Bowl und Muffin sind der süße Höhepunkt vor Sonnenuntergang.'},
  'Poply Paradise':{id:'celebration',label:'PARADISE',title:'Poply Paradise',story:'Paradise, Küsten-Mokka und Croissant bilden das große Sonnenkai-Menü.'},

  'Minzgruß':{id:'garden',label:'DACHGARTEN',title:'Kräutergruß',story:'Ein frischer Kräuterbund eröffnet den Service über den Dächern.'},
  'Grüne Pause':{id:'garden',label:'GRÜNE PAUSE',title:'Grüne Pause',story:'Kräutersirup servieren und Mehl für etwas Gebackenes vorbereiten.'},
  'Dachgarten-Spritz':{id:'garden',label:'GARTEN-DRINK',title:'Dachgarten-Spritz',story:'Garten-Spritz und Fruchtmix bringen Kräuter und Frische zusammen.'},
  'Blütenkaffee':{id:'garden',label:'GARTENKAFFEE',title:'Gartenkaffee',story:'Garten-Spritz und Poply Mocha verbinden Kräutergarten und Kaffeebar.'},
  'Gartenabend':{id:'garden',label:'GARTENABEND',title:'Gartenabend',story:'Blüten-Glas und Muffin machen den Dachgarten am Abend besonders.'},
  'Poply Gartenfest':{id:'celebration',label:'GARTENFEST',title:'Poply Gartenfest',story:'Gartenfest, Sunset-Bowl und Croissant bilden das große Abschlussmenü.'},
});

export function orderPresentation(input){
  const source=typeof input==='string'?input:input?.title;
  return source?ORDER_PRESENTATIONS[source]??null:null;
}

export function thematicOrderMarkup(input){
  const presentation=typeof input==='object'&&input?.story?input:orderPresentation(input);
  if(!presentation)return '';
  return `<div class="service-order-theme" data-order-theme="${presentation.id}"><span>${presentation.label}</span><p>${presentation.story}</p></div>`;
}

function decorateChoice(choice){
  const title=choice.querySelector('strong');
  if(!title)return;
  const source=choice.dataset.orderSourceTitle||title.textContent.trim();
  const presentation=orderPresentation(source);
  if(!presentation)return;
  choice.dataset.orderSourceTitle=source;
  choice.dataset.orderTheme=presentation.id;
  if(title.textContent!==presentation.title)title.textContent=presentation.title;
}

function decorateBoardJob(job){
  const source=job.dataset.orderSourceTitle||job.getAttribute('title')||'';
  const presentation=orderPresentation(source);
  if(!presentation)return;
  job.dataset.orderSourceTitle=source;
  job.dataset.orderTheme=presentation.id;
  job.setAttribute('title',presentation.title);
  job.setAttribute('aria-label',`Auftrag ${presentation.title} öffnen`);
}

function decorateServiceCard(card){
  const heading=card.querySelector('.service-heading');
  const title=heading?.querySelector('h2');
  if(!heading||!title)return;
  const source=card.dataset.orderSourceTitle||title.textContent.trim();
  const presentation=orderPresentation(source);
  if(!presentation)return;
  card.dataset.orderSourceTitle=source;
  card.dataset.orderTheme=presentation.id;
  if(title.textContent!==presentation.title)title.textContent=presentation.title;
  let theme=card.querySelector(':scope .service-order-theme');
  if(!theme){
    heading.insertAdjacentHTML('afterend',thematicOrderMarkup(presentation));
    theme=card.querySelector(':scope .service-order-theme');
  }
  if(theme?.dataset.orderTheme!==presentation.id||theme?.querySelector('p')?.textContent!==presentation.story){
    theme?.remove();
    heading.insertAdjacentHTML('afterend',thematicOrderMarkup(presentation));
  }
}

export function decorateOrderThemes(root){
  root.querySelectorAll('.customer-choice').forEach(decorateChoice);
  root.querySelectorAll('.board-job').forEach(decorateBoardJob);
  root.querySelectorAll('.service-card[data-service-order]').forEach(decorateServiceCard);
}

export function installOrderThemes(root){
  let scheduled=false;
  const sync=()=>{
    scheduled=false;
    decorateOrderThemes(root);
  };
  const requestSync=()=>{
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(sync);
  };
  const observer=new MutationObserver(requestSync);
  observer.observe(root,{childList:true,subtree:true});
  sync();
  return ()=>observer.disconnect();
}
