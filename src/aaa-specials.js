const REWARDS={opening:40,starter:45,growing:60,established:80};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(value))?Number(value):min));
const uniqueFamilies=order=>[...new Set((order?.requirements||[]).map(req=>req?.family).filter(Boolean))];
const rewardFor=order=>REWARDS[order?.difficulty]??(order?.opening?REWARDS.opening:REWARDS.starter);
const familyFor=order=>{
  const families=uniqueFamilies(order);if(!families.length)return null;
  return families[Math.abs(Number(order.sequence)||0)%families.length];
};
const mergeTarget=order=>['established'].includes(order?.difficulty)?3:2;

export function serviceSpecialTemplate(order){
  if(!order||Number(order.sequence)===0)return null;
  const sequence=Math.abs(Number(order.sequence)||0),mode=sequence%3,rewardCoins=rewardFor(order);
  if(mode===1){
    const target=mergeTarget(order);
    return {key:`special-${sequence}-merge-series`,type:'merge-series',tag:'SERIE',label:'Merge-Serie',copy:`Schaffe ${target} Merges, solange dieser Gast wartet.`,family:null,target,progress:0,completed:false,rewardCoins};
  }
  const family=familyFor(order);if(!family)return null;
  if(mode===2)return {key:`special-${sequence}-fresh-${family}`,type:'fresh',tag:'FRISCH',label:'Frisch serviert',copy:'Erzeuge oder merge ein passendes Produkt nach Auftragseingang.',family,target:1,progress:0,completed:false,rewardCoins};
  return {key:`special-${sequence}-flow-${family}`,type:'flow-tip',tag:'FLOW',label:'Flow-Tipp',copy:'Setze einen Flow-Boost auf eine benötigte Produktfamilie.',family,target:1,progress:0,completed:false,rewardCoins};
}

const normalizedSpecial=(order,current)=>{
  const template=serviceSpecialTemplate(order);if(!template)return null;
  if(!current||current.key!==template.key)return template;
  const progress=clamp(current.progress,0,template.target),completed=Boolean(current.completed)||progress>=template.target;
  return {...template,progress:completed?template.target:progress,completed};
};

export function ensureServiceSpecials(source){
  if(!source||!Array.isArray(source.currentOrders))return {state:source,changed:false};
  let changed=false,state=null;
  source.currentOrders.forEach((order,index)=>{
    const next=normalizedSpecial(order,order?.special),same=JSON.stringify(order?.special??null)===JSON.stringify(next);
    if(same)return;
    if(!state)state=structuredClone(source);
    if(next)state.currentOrders[index].special=next;else delete state.currentOrders[index].special;
    changed=true;
  });
  return {state:changed?state:source,changed};
}

const matchesEvent=(special,event)=>{
  if(!special||special.completed||!event)return false;
  if(special.type==='merge-series')return event.type==='merge';
  if(special.type==='fresh')return event.type==='item-created'&&event.family===special.family;
  if(special.type==='flow-tip')return event.type==='flow-boost'&&event.family===special.family;
  return false;
};

export function progressServiceSpecials(source,event){
  const ensured=ensureServiceSpecials(source),base=ensured.state;
  let state=null;const updates=[];
  base.currentOrders.forEach((order,index)=>{
    const special=order.special;if(!matchesEvent(special,event))return;
    if(!state)state=structuredClone(base);
    const target=state.currentOrders[index].special,targetProgress=target.target;
    const before=target.progress||0,progress=Math.min(targetProgress,before+1),completed=progress>=targetProgress;
    target.progress=progress;target.completed=completed;
    updates.push({orderId:order.id,title:order.title,special:{...target},becameCompleted:completed&&!special.completed});
  });
  return {state:state||base,changed:ensured.changed||Boolean(state),updates};
}

export function awardServiceSpecialBonus(source,order){
  const special=order?.special;
  if(!special?.completed||!Number.isFinite(Number(special.rewardCoins))||Number(special.rewardCoins)<=0)return {state:source,changed:false,bonusCoins:0,special:null};
  const bonusCoins=Math.max(0,Math.floor(Number(special.rewardCoins))),state=structuredClone(source);
  state.coins=Math.max(0,Number(state.coins)||0)+bonusCoins;
  return {state,changed:true,bonusCoins,special:{...special}};
}

export function serviceSpecialProgressText(special){
  if(!special)return '';
  return special.completed?'Fertig':`${special.progress||0}/${special.target}`;
}

export function serviceSpecialUpdateText(update){
  if(!update?.special)return '';
  return update.becameCompleted?`${update.special.label} geschafft · +${update.special.rewardCoins} Coins bereit`:`${update.special.label} ${serviceSpecialProgressText(update.special)}`;
}
