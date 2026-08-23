import { GUEST_PROFILES, guestForSequence } from './aaa-guests.js';
import { getState } from './aaa-session.js';

const NS='http://www.w3.org/2000/svg';
const WALK_MS=3000,WAIT_IN_MS=900,ARRIVE_MS=700,STAND_MS=5000,SETTLE_MS=1400,MAX_PENDING=3,MAX_WAITING=3;
export const GUEST_LIFE_PENDING_KEY='poply-guest-life-pending-v1';
const byId=id=>GUEST_PROFILES.find(guest=>guest.id===id)??null;
const seatTargets={
  // Existing seated-pose transforms are body origins; walking figures need explicit foot/ground baselines.
  left:{kind:'seat-left',x:278,y:358,scale:1},
  right:{kind:'seat-right',x:458,y:360,scale:1},
  back:{kind:'terrace-seat',x:628,y:315,scale:.82},
};

export function guestLifeWaitingTargets(stage){
  const safeStage=Math.max(0,Math.min(6,Math.floor(Number(stage)||0)));
  if(safeStage>=2)return [
    {kind:'counter-wait',x:420,y:338,scale:.9},
    {kind:'counter-queue',x:504,y:348,scale:.81},
    {kind:'counter-queue-back',x:590,y:356,scale:.72},
  ];
  return [
    {kind:'entrance-wait',x:438,y:338,scale:.9},
    {kind:'entrance-queue',x:526,y:348,scale:.81},
    {kind:'entrance-queue-back',x:614,y:356,scale:.72},
  ];
}

export function guestLifeDestination(stage,seatSlot=null){
  const safeStage=Math.max(0,Math.min(6,Math.floor(Number(stage)||0)));
  if(safeStage>=4&&seatSlot&&seatTargets[seatSlot])return {...seatTargets[seatSlot],seated:true};
  if(safeStage>=2)return {kind:'counter',x:382,y:322,scale:1,seated:false};
  return {kind:'entrance',x:405,y:306,scale:1,seated:false};
}

export function guestLifePath(destination){
  const x=Number(destination?.x)||405,y=Number(destination?.y)||306;
  const approachY=Math.max(326,Math.min(356,y-12));
  return `M742 344 C684 344 628 342 570 338 C512 334 ${Math.min(690,x+112)} ${approachY} ${x} ${y}`;
}

export function activeOrderGuestIds(state,limit=GUEST_PROFILES.length){
  const safeLimit=Math.max(0,Math.floor(Number(limit)||0));
  const ids=[];
  for(const order of Array.isArray(state?.currentOrders)?state.currentOrders:[]){
    const guest=guestForSequence(order?.sequence);
    if(!guest||ids.includes(guest.id))continue;
    ids.push(guest.id);
    if(ids.length>=safeLimit)break;
  }
  return ids;
}

export function normalizeGuestLifePending(value){
  const source=Array.isArray(value)?value:[];
  return source.reduce((ids,id)=>{
    if(!byId(id))return ids;
    const next=ids.filter(existing=>existing!==id);next.push(id);
    return next.slice(-MAX_PENDING);
  },[]);
}

export function readGuestLifePending(storage){
  if(!storage?.getItem)return [];
  try{return normalizeGuestLifePending(JSON.parse(storage.getItem(GUEST_LIFE_PENDING_KEY)||'[]'));}catch{return [];}
}

export function writeGuestLifePending(value,storage){
  const pending=normalizeGuestLifePending(value);
  if(!storage?.setItem)return pending;
  try{
    if(pending.length)storage.setItem(GUEST_LIFE_PENDING_KEY,JSON.stringify(pending));
    else storage.removeItem?.(GUEST_LIFE_PENDING_KEY);
  }catch{}
  return pending;
}

const guestLifeStorage=()=>{try{return globalThis.localStorage??null;}catch{return null;}};
const sceneStage=svg=>svg.querySelector('.scene-upgrade.sign')?6:svg.querySelector('.scene-upgrade.terrace')?5:svg.querySelector('.scene-upgrade.seating')?4:svg.querySelector('.scene-upgrade.menu')?3:svg.querySelector('.scene-upgrade.counter')?2:svg.querySelector('.scene-upgrade.lights')?1:0;
const seatSlotFor=(svg,guestId)=>{
  const node=svg.querySelector(`.place-life-guests-v2-front [data-regular-guest="${guestId}"]`);
  if(!node)return null;
  if(node.classList.contains('guest-left'))return 'left';
  if(node.classList.contains('guest-right'))return 'right';
  if(node.classList.contains('place-life-background-guest'))return 'back';
  return null;
};
const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[char]));

function personMarkup(profile,{x=0,y=0,scale=1,kind='',state='standing',walker=false,entering=false}={}){
  const travel=walker?`<animateMotion class="guest-life-motion" dur="${WALK_MS}ms" path="${guestLifePath({x,y})}" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".2 .7 .25 1"/>`:'';
  const waitIn=entering?`<animateMotion class="guest-life-wait-in" dur="${WAIT_IN_MS}ms" path="${guestLifePath({x,y})}" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".2 .7 .25 1"/>`:'';
  const transform=walker||entering?'':` transform="translate(${x} ${y})"`;
  const walkerAttr=walker?` data-guest-life-walker="${profile.id}"`:'';
  const waitingAttr=state==='waiting'?` data-guest-life-waiting="${profile.id}" data-guest-life-waiting-kind="${esc(kind)}"`:'';
  const nameMarkup=state==='waiting'
    ?`<g class="guest-life-name guest-life-waiting-name" transform="translate(-36 -106)"><rect width="72" height="20" rx="10"/><text x="36" y="14" text-anchor="middle">${esc(profile.name)}</text></g>`
    :`<g class="guest-life-name" transform="translate(-45 -111)"><rect width="90" height="24" rx="12"/><text x="45" y="16" text-anchor="middle">${esc(profile.name)}</text></g>`;
  return `<g class="guest-life-arrival${state==='waiting'?' guest-life-waiting':''} regular-${profile.id}"${walkerAttr}${waitingAttr} data-guest-life-state="${state}" aria-hidden="true"${transform}>${travel}${waitIn}<g class="guest-life-scale" transform="scale(${scale})"><ellipse class="guest-life-shadow" cx="0" cy="8" rx="21" ry="6"/><g class="guest-life-step"><path class="guest-life-leg guest-life-leg-a" d="M-7-12q-5 12-13 20"/><path class="guest-life-leg guest-life-leg-b" d="M7-12q6 12 15 19"/><path class="guest-life-shoe guest-life-shoe-a" d="M-24 9h15"/><path class="guest-life-shoe guest-life-shoe-b" d="M15 8h15"/><path class="guest-life-shirt" d="M-20-54q20-13 40 0l-3 43h-34Z"/><circle class="guest-life-head" cx="0" cy="-70" r="14"/><path class="guest-life-hair" d="M-13-73q4-17 18-14q10 2 12 14q-8-5-13-2q-7-6-17 8"/><path class="guest-life-arm guest-life-arm-a" d="M-15-49q-12 10-17 22"/><path class="guest-life-arm guest-life-arm-b" d="M15-48q13 9 18 21"/><circle class="guest-life-eye" cx="-5" cy="-70" r="1.2"/><circle class="guest-life-eye" cx="5" cy="-70" r="1.2"/><path class="guest-life-smile" d="M-4-64q4 3 8 0"/></g>${nameMarkup}</g></g>`;
}

function walkerMarkup(profile,destination,motion){
  return personMarkup(profile,{x:destination.x,y:destination.y,scale:destination.scale??1,kind:destination.kind,state:motion?'walking':'standing',walker:motion});
}

function parseGroup(markup){
  const holder=document.createElementNS(NS,'g');holder.innerHTML=markup;return holder.firstElementChild;
}

function insertBeforeForeground(svg,node){
  if(!node)return null;
  const foreground=svg.querySelector('.scene-depth-foreground');foreground?.parentNode?.insertBefore(node,foreground)??svg.append(node);
  return node;
}

function insertWalker(svg,profile,destination,motion){
  const walker=parseGroup(walkerMarkup(profile,destination,motion));
  if(walker)walker.dataset.guestLifeDestination=destination.kind;
  return insertBeforeForeground(svg,walker);
}

function renderWaitingGuests(svg,pending){
  const stage=sceneStage(svg),targets=guestLifeWaitingTargets(stage),reduce=reducedMotion();
  const regularIds=new Set([...svg.querySelectorAll('[data-regular-guest]')].map(node=>node.getAttribute('data-regular-guest')).filter(Boolean));
  const waiting=activeOrderGuestIds(getState())
    .filter(id=>!pending.includes(id)&&!regularIds.has(id))
    .slice(0,MAX_WAITING);
  const signature=`${stage}|${waiting.join('|')}`;
  const existing=svg.querySelector('.guest-life-waiting-layer');
  if(existing?.dataset.guestLifeWaitingSignature===signature)return waiting;
  existing?.remove();
  if(!waiting.length)return waiting;
  const layer=document.createElementNS(NS,'g');layer.classList.add('guest-life-waiting-layer');layer.dataset.guestLifeWaitingSignature=signature;layer.setAttribute('aria-hidden','true');
  waiting.forEach((guestId,index)=>{
    const profile=byId(guestId),target=targets[index];
    const guest=profile&&target?parseGroup(personMarkup(profile,{...target,state:'waiting',entering:!reduce})):null;
    if(guest)layer.append(guest);
  });
  insertBeforeForeground(svg,layer);
  return waiting;
}

function markSettled(svg,guestId){
  const node=svg.querySelector(`.place-life-guests-v2-front [data-regular-guest="${guestId}"]`);if(!node)return;
  node.classList.add('guest-life-settle');setTimeout(()=>node.classList.remove('guest-life-settle'),SETTLE_MS);
}

export function installGuestLife(root){
  const storage=guestLifeStorage();
  let pending=readGuestLifePending(storage),active=false,queued=false,activeTimer=0;
  const persist=()=>{pending=writeGuestLifePending(pending,storage);};
  const consume=guestId=>{pending=pending.filter(id=>id!==guestId);persist();};
  const refresh=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorate();});};
  const clearServiceSteam=svg=>svg?.classList.remove('has-guest-life-service');
  const finish=(svg,walker,guestId,destination)=>{
    clearTimeout(activeTimer);
    consume(guestId);
    if(destination.seated){clearServiceSteam(svg);walker?.remove();delete svg.dataset.guestLifeArrival;markSettled(svg,guestId);active=false;refresh();return;}
    if(walker)walker.dataset.guestLifeState='standing';
    activeTimer=setTimeout(()=>{clearServiceSteam(svg);walker?.remove();active=false;refresh();},STAND_MS);
  };
  const completeWalk=(svg,walker,guestId,destination)=>{
    if(!walker){finish(svg,walker,guestId,destination);return;}
    walker.dataset.guestLifeState='arrived';
    activeTimer=setTimeout(()=>finish(svg,walker,guestId,destination),destination.seated?ARRIVE_MS:0);
  };
  const decorate=()=>{
    if(root.dataset.view!=='place')return;
    const svg=root.querySelector('.view-place.place-coast .place-scene-svg');if(!svg)return;
    renderWaitingGuests(svg,pending);
    if(active||!pending.length)return;
    const stage=sceneStage(svg);
    if(stage>=4&&!svg.querySelector('.place-life-guests-v2-front'))return;
    const guestId=pending[0],profile=byId(guestId);if(!profile){consume(guestId);refresh();return;}
    svg.querySelector(`.guest-life-waiting[data-guest-life-waiting="${guestId}"]`)?.remove();
    const destination=guestLifeDestination(stage,seatSlotFor(svg,guestId)),reduce=reducedMotion();
    active=true;
    if(destination.kind==='counter')svg.classList.add('has-guest-life-service');else clearServiceSteam(svg);
    if(reduce&&destination.seated){consume(guestId);markSettled(svg,guestId);active=false;refresh();return;}
    const walker=insertWalker(svg,profile,destination,!reduce);if(!walker){clearServiceSteam(svg);active=false;refresh();return;}
    if(destination.seated)svg.dataset.guestLifeArrival=guestId;
    if(reduce){finish(svg,walker,guestId,destination);return;}
    activeTimer=setTimeout(()=>completeWalk(svg,walker,guestId,destination),WALK_MS);
  };
  const onServed=event=>{
    const guestId=event?.detail?.guestId;if(!byId(guestId))return;
    pending=normalizeGuestLifePending([...pending,guestId]);persist();refresh();
  };
  document.addEventListener('poply:guest-served',onServed);
  const observer=new MutationObserver(refresh);observer.observe(root,{childList:true,subtree:true});
  refresh();
  return {refresh,disconnect:()=>{observer.disconnect();document.removeEventListener('poply:guest-served',onServed);clearTimeout(activeTimer);}};
}