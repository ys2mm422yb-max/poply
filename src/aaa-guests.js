export const GUEST_PROFILES=Object.freeze([
  {id:'mika',name:'Mika',portraitIndex:0},
  {id:'nora',name:'Nora',portraitIndex:1},
  {id:'sam',name:'Sam',portraitIndex:2},
]);

export const GUEST_LOYALTY_MILESTONES=Object.freeze([
  {visits:1,title:'Bekannt',rewardCoins:25},
  {visits:5,title:'Stammgast',rewardCoins:100},
  {visits:12,title:'Lieblingsgast',rewardCoins:250},
]);

const clone=value=>structuredClone(value);
const emptyVisits=()=>Object.fromEntries(GUEST_PROFILES.map(guest=>[guest.id,0]));

export function guestForSequence(sequence=0){
  const index=Math.abs(Number(sequence)||0)%GUEST_PROFILES.length;
  return GUEST_PROFILES[index];
}

export function ensureGuestState(inputState){
  const source=inputState?.guestVisits;
  const visits=emptyVisits();
  let changed=!source||typeof source!=='object'||Array.isArray(source);

  if(source&&typeof source==='object'&&!Array.isArray(source)){
    for(const guest of GUEST_PROFILES){
      const value=Number(source[guest.id]);
      const safe=Number.isInteger(value)&&value>=0?value:0;
      visits[guest.id]=safe;
      if(source[guest.id]!==safe)changed=true;
    }
    if(Object.keys(source).some(key=>!GUEST_PROFILES.some(guest=>guest.id===key)))changed=true;
  }

  if(!changed)return {state:inputState,changed:false};
  const state=clone(inputState);
  state.guestVisits=visits;
  state.updatedAt=Date.now();
  return {state,changed:true};
}

export function guestLoyalty(state,guestId){
  const guest=GUEST_PROFILES.find(entry=>entry.id===guestId)??GUEST_PROFILES[0];
  const visits=Math.max(0,Number(state?.guestVisits?.[guest.id])||0);
  const earned=[...GUEST_LOYALTY_MILESTONES].reverse().find(entry=>visits>=entry.visits)??null;
  const next=GUEST_LOYALTY_MILESTONES.find(entry=>visits<entry.visits)??null;
  return {
    guest,
    visits,
    title:earned?.title??'Neu',
    next,
    visitsUntilNext:next?Math.max(0,next.visits-visits):0,
    complete:!next,
  };
}

export function recordGuestService(inputState,sequence){
  const ensured=ensureGuestState(inputState);
  const state=clone(ensured.state);
  const guest=guestForSequence(sequence);
  const before=Math.max(0,Number(state.guestVisits[guest.id])||0);
  const visits=before+1;
  state.guestVisits[guest.id]=visits;

  const milestone=GUEST_LOYALTY_MILESTONES.find(entry=>entry.visits===visits)??null;
  const rewardCoins=milestone?.rewardCoins??0;
  if(rewardCoins)state.coins=Math.max(0,Number(state.coins)||0)+rewardCoins;
  state.updatedAt=Date.now();

  return {
    state,
    changed:true,
    guest:clone(guest),
    before,
    visits,
    milestone:milestone?clone(milestone):null,
    rewardCoins,
    loyalty:guestLoyalty(state,guest.id),
  };
}

export function totalGuestVisits(state){
  return GUEST_PROFILES.reduce((sum,guest)=>sum+Math.max(0,Number(state?.guestVisits?.[guest.id])||0),0);
}
