import { activePlaceChapter } from './v2-game.js';
import { dailySeed } from './aaa-daily.js';

const STORIES=Object.freeze({
  coast:Object.freeze([
    Object.freeze({key:'morning-rush',kicker:'KÜSTENMORGEN',title:'Morgenandrang',copy:'Die ersten Tische füllen sich. Heute zählt ein ruhiger, guter Start.'}),
    Object.freeze({key:'window-day',kicker:'FENSTERPLÄTZE',title:'Fensterplatz-Tag',copy:'Die Küste ist hell und die Stammplätze sind gefragt. Halte das Café in Bewegung.'}),
    Object.freeze({key:'coast-round',kicker:'CAFÉ AM MEER',title:'Küstenrunde',copy:'Viele kleine Handgriffe machen heute aus dem Café einen guten Treffpunkt.'}),
  ]),
  sunset:Object.freeze([
    Object.freeze({key:'golden-hour',kicker:'SONNENKAI',title:'Goldene Stunde',copy:'Am Kai wird es warm und voll. Frische Drinks und schnelle Wege halten den Abend leicht.'}),
    Object.freeze({key:'deck-evening',kicker:'ABENDKÜSTE',title:'Deck-Abend',copy:'Die Lampions gehen an. Heute fühlt sich jeder bediente Tisch wie ein Teil des Abends an.'}),
    Object.freeze({key:'tropical-round',kicker:'TROPENRUNDE',title:'Tropenrunde',copy:'Die Bar ist offen und die Küste bleibt lange wach. Nutze, was dein Place schon kann.'}),
  ]),
  garden:Object.freeze([
    Object.freeze({key:'garden-morning',kicker:'DACHGARTEN',title:'Gartenmorgen',copy:'Oben zwischen den Beeten startet ein frischer Tag. Ernte, Service und kleine Entdeckungen greifen ineinander.'}),
    Object.freeze({key:'harvest-day',kicker:'ERNTERUNDE',title:'Ernte-Tag',copy:'Das Gewächshaus ist heute der Mittelpunkt. Aus wenigen Handgriffen wird eine volle Gartenrunde.'}),
    Object.freeze({key:'lights-evening',kicker:'ÜBER DEN DÄCHERN',title:'Lichterabend',copy:'Der Dachgarten leuchtet. Ein guter Abschluss entsteht aus Service, Ausbau und neuen Ideen.'}),
  ]),
});

export function dailyStory(state,dateKey=state?.daily?.dateKey){
  const chapter=activePlaceChapter(state),stories=STORIES[chapter.id]??STORIES.coast,seed=dailySeed(dateKey||'poply');
  return {...stories[seed%stories.length],chapterId:chapter.id,chapterLabel:chapter.label};
}

export function dailyStoryGoalLabel(goal){
  const target=Math.max(1,Number(goal?.target)||1);
  const labels={
    merge:`${target} ${target===1?'Kombi':'Kombis'} an der Werkbank`,
    serve:`${target} ${target===1?'Gast':'Gäste'} gut durch den Tag bringen`,
    generate:`${target} frische Produkte vorbereiten`,
    discover:'Etwas Neues für die Sammlung finden',
    restore:'Ein Stück deines Place fertigbauen',
  };
  return labels[goal?.type]??goal?.label??'Heute etwas bewegen';
}
