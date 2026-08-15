import { PLACE_CHAPTERS, activePlaceChapter, currentChapterProgress, restorationStatus } from './v2-game.js';

const PLACE_UNLOCK_DETAIL={
  sunset:'Neuer Place + Tropenbar + Sonnenfrüchte',
  garden:'Neuer Place + Gewächshaus + Dachgarten-Produkte',
};

const nextChapterAfter=chapter=>PLACE_CHAPTERS.find(entry=>entry.number===chapter.number+1)??null;

export function purposeGoal(state){
  const status=restorationStatus(state);
  const progress=currentChapterProgress(state);
  const chapter=status.chapter??progress.chapter??activePlaceChapter(state);
  const upgrade=status.upgrade;
  if(!upgrade){
    return {
      kind:'complete',complete:true,ready:true,chapter,upgrade:null,
      label:'Alle Places aufgebaut',story:'Deine aktuelle Poply-Welt ist vollständig restauriert.',
      step:chapter.upgrades.length,total:chapter.upgrades.length,current:0,cost:0,missing:0,ratio:1,
      after:null,
    };
  }
  const index=Math.max(0,chapter.upgrades.findIndex(entry=>entry.id===upgrade.id));
  const nextUpgrade=chapter.upgrades[index+1]??null;
  const nextChapter=nextChapterAfter(chapter);
  const after=nextUpgrade
    ?{kind:'upgrade',label:nextUpgrade.label,detail:nextUpgrade.copy}
    :nextChapter
      ?{kind:'place',label:`Place 0${nextChapter.number}: ${nextChapter.label}`,detail:PLACE_UNLOCK_DETAIL[nextChapter.id]??'Neuer Place und neue Inhalte'}
      :{kind:'complete',label:'Alle drei Places fertig',detail:'Deine Poply-Welt ist vollständig restauriert.'};
  return {
    kind:'restoration',complete:false,ready:status.missing===0,chapter,upgrade,
    label:upgrade.label,story:upgrade.copy,
    step:index+1,total:chapter.upgrades.length,
    current:status.current,cost:status.cost,missing:status.missing,ratio:status.ratio,
    after,
  };
}

export function purposeLine(state){
  const goal=purposeGoal(state);
  if(goal.complete)return 'Alle Places aufgebaut';
  if(goal.ready)return `${goal.label} ist bereit zum Bauen`;
  return `Noch ${goal.missing} ★ bis ${goal.label}`;
}

export function purposeRewardLine(state,gainedStars=0){
  const goal=purposeGoal(state);
  if(goal.complete)return 'Deine Poply-Welt ist vollständig restauriert';
  const earned=Math.max(0,Number(gainedStars)||0);
  if(goal.ready)return `${earned?`+${earned} ★ · `:''}${goal.label} kann jetzt gebaut werden`;
  return `${earned?`+${earned} ★ · `:''}noch ${goal.missing} ★ bis ${goal.label}`;
}
