import { GENERATORS, ITEM_FAMILIES } from './v2-game.js';

const clone=value=>structuredClone(value);

export function generatorForFamily(family){
  return Object.values(GENERATORS).find(generator=>generator.families.includes(family))||null;
}

export function productionGuide(family,level=1){
  const def=ITEM_FAMILIES[family],safeLevel=Math.max(1,Math.min(6,Number(level)||1));
  if(!def)return null;
  const generator=generatorForFamily(family);
  if(!generator)return null;
  const chain=def.stages.slice(0,safeLevel).map((name,index)=>({level:index+1,name}));
  return {
    family:def.key,
    familyLabel:def.label,
    level:safeLevel,
    itemName:def.stages[safeLevel-1],
    generatorKey:generator.key,
    generatorLabel:generator.label,
    baseItem:def.stages[0],
    baseUnits:2**(safeLevel-1),
    chain,
    mergeCount:Math.max(0,safeLevel-1),
  };
}

export function generatorGuide(generatorKey,state=null){
  const generator=GENERATORS[generatorKey];
  if(!generator)return null;
  const families=generator.families.map(family=>({
    family,
    label:ITEM_FAMILIES[family].label,
    first:ITEM_FAMILIES[family].stages[0],
    stages:clone(ITEM_FAMILIES[family].stages),
  }));
  const waitingOrders=state?.currentOrders?.filter(order=>order.requirements.some(req=>generator.families.includes(req.family))).map(order=>({id:order.id,title:order.title}))||[];
  return {key:generator.key,label:generator.label,energyCost:generator.energyCost,families,waitingOrders};
}

export function explainRequirement(req){
  return productionGuide(req?.family,req?.level);
}
