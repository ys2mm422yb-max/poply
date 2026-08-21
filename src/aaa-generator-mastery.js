import { GENERATORS } from './v2-game.js';
import { discoveryGeneratorKey, isDiscovered } from './aaa-collection.js';

export const GENERATOR_MASTERY_LEVELS=Object.freeze([
  Object.freeze({key:'new',title:'Neu',minUses:0}),
  Object.freeze({key:'familiar',title:'Vertraut',minUses:8}),
  Object.freeze({key:'skilled',title:'Geübt',minUses:24}),
  Object.freeze({key:'master',title:'Meister',minUses:50}),
]);

export function generatorUseCount(state,generatorId){
  if(!GENERATORS[generatorId])return 0;
  return (state?.board||[]).reduce((sum,item)=>sum+(item?.kind==='generator'&&item.generator===generatorId?Math.max(0,Number(item.taps)||0):0),0);
}

export function generatorMastery(state,generatorId){
  const uses=generatorUseCount(state,generatorId);
  let level=GENERATOR_MASTERY_LEVELS[0];
  for(const candidate of GENERATOR_MASTERY_LEVELS)if(uses>=candidate.minUses)level=candidate;
  const index=GENERATOR_MASTERY_LEVELS.indexOf(level),next=GENERATOR_MASTERY_LEVELS[index+1]??null;
  const span=next?Math.max(1,next.minUses-level.minUses):1;
  const progress=next?Math.max(0,Math.min(1,(uses-level.minUses)/span)):1;
  return {generatorId,uses,key:level.key,title:level.title,completed:!next,nextAt:next?.minUses??null,nextTitle:next?.title??null,progress};
}

export function generatorMasterySummary(state){
  const ids=Object.keys(GENERATORS),known=ids.filter(id=>isDiscovered(state,discoveryGeneratorKey(id)));
  const mastered=known.filter(id=>generatorMastery(state,id).completed);
  return {known:known.length,total:ids.length,mastered:mastered.length};
}
