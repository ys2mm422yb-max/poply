import { GUEST_PROFILES } from './aaa-guests.js';

const NS='http://www.w3.org/2000/svg';
const WALK_MS=2300,STAND_MS=3200,MAX_PENDING=3;
const byId=id=>GUEST_PROFILES.find(guest=>guest.id===id)??null;
const seatTargets={
  left:{kind:'seat-left',x:278,y:282,scale:1},
  right:{kind:'seat-right',x:458,y:288,scale:1},
  back:{kind:'terrace-seat',x:628,y:282,scale:.82},
};

export function guestLifeDestination(stage,seatSlot=null){
  const safeStage=Math.max(0,Math.min(6,Math.floor(Number(stage)||0)));
  if(safeStage>=4&&seatSlot&&seatTargets[seatSlot])return {...seatTargets[seatSlot],seated:true};
  if(safeStage>=2)return {kind:'counter',x:384,y:292,scale:1,seated:false};
  return {kind:'entrance',x:405,y:306,scale:1,seated:false};
}

export function guestLifePath(destination){
  const x=Number(destination?.x)||405,y=Number(destination?.y)||306;
  return `M742 338 C684 334 628 327 570 315 C512 303 ${Math.min(690,x+110)} ${y+24} ${x} ${y}`;
}

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
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function walkerMarkup(profile,destination,motion){
  const scale=destination.scale??1,travel=motion?`<animateMotion class="guest-life-motion" dur="${WALK_MS}ms" path="${guestLifePath(destination)}" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".2 .7 .25 1"/>`:'';
  const transform=motion?'':` transform="translate(${destination.x} ${destination.y})"`;
  return `<g class="guest-life-arrival regular-${profile.id}" data-guest-life-walker="${profile.id}" data-guest-life-destination="${destination.kind}" data-guest-life-state="${motion?'walking':'standing'}" aria-hidden="true"${transform}>${travel}<g class="guest-life-scale" transform="scale(${scale})"><ellipse class="guest-life-shadow" cx="0" cy="8" rx="21" ry="6"/><g class="guest-life-step"><path class="guest-life-leg guest-life-leg-a" d="M-7-12q-5 12-13 20"/><path class="guest-life-leg guest-life-leg-b" d="M7-12q6 12 15 19"/><path class="guest-life-shoe guest-life-shoe-a" d="M-24 9h15"/><path class="guest-life-shoe guest-life-shoe-b" d="M15 8h15"/><path class="guest-life-shirt" d="M-20-54q20-13 40 0l-3 43h-34Z"/><circle class="guest-life-head" cx="0" cy="-70" r="14"/><path class="guest-life-hair" d="M-13-73q4-17 18-14q10 2 12 14q-8-5-13-2q-7-6-17 8"/><path class="guest-life-arm guest-life-arm-a" d="M-15-49q-12 10-17 22"/><path class="guest-life-arm guest-life-arm-b" d="M15-48q13 9 18 21"/><circle class="guest-life-eye" cx="-5" cy="-70" r="1.2"/><circle class="guest-life-eye" cx="5" cy="-70" r="1.2"/><path class="guest-life-smile" d="M-4-64q4 3 8 0"/></g><g class="guest-life-name" transform="translate(-45 -111)"><rect width="90" height="24" rx="12"/><text x="45" y="16" text-anchor="middle">${esc(profile.name)}</text></g></g></g>`;
}

function parseWalker(markup){
  const holder=document.createElementNS(NS,'g');holder.innerHTML=markup;return holder.firstElementChild;
}

function insertWalker(svg,profile,destination,motion){
  const walker=parseWalker(walkerMarkup(profile,destination,motion));if(!walker)return null;
  const foreground=svg.querySelector('.scene-depth-foreground');foreground?.parentNode?.insertBefore(walker,foreground)??svg.append(walker);
  return walker;
}

function markSettled(svg,guestId){
  const node=svg.querySelector(`.place-life-guests-v2-front [data-regular-guest="${guestId}"]`);if(!node)return;
  node.classList.add('guest-life-settle');setTimeout(()=>node.classList.remove('guest-life-settle'),900);
}

export function installGuestLife(root){
  let pending=[],active=false,queued=false,activeTimer=0;
  const refresh=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorate();});};
  const finish=(svg,walker,guestId,destination)=>{
    clearTimeout(activeTimer);
    if(destination.seated){walker?.remove();delete svg.dataset.guestLifeArrival;markSettled(svg,guestId);active=false;refresh();return;}
    if(walker)walker.dataset.guestLifeState='standing';
    activeTimer=setTimeout(()=>{walker?.remove();active=false;refresh();},STAND_MS);
  };
  const decorate=()=>{
    if(active||!pending.length||root.dataset.view!=='place')return;
    const svg=root.querySelector('.view-place.place-coast .place-scene-svg');if(!svg)return;
    const stage=sceneStage(svg);
    if(stage>=4&&!svg.querySelector('.place-life-guests-v2-front'))return;
    const guestId=pending.shift(),profile=byId(guestId);if(!profile){refresh();return;}
    const destination=guestLifeDestination(stage,seatSlotFor(svg,guestId)),reduce=reducedMotion();
    active=true;
    if(reduce&&destination.seated){markSettled(svg,guestId);active=false;refresh();return;}
    const walker=insertWalker(svg,profile,destination,!reduce);if(!walker){active=false;refresh();return;}
    if(destination.seated)svg.dataset.guestLifeArrival=guestId;
    if(reduce){finish(svg,walker,guestId,destination);return;}
    activeTimer=setTimeout(()=>finish(svg,walker,guestId,destination),WALK_MS+80);
  };
  const onServed=event=>{
    const guestId=event?.detail?.guestId;if(!byId(guestId))return;
    pending=pending.filter(id=>id!==guestId);pending.push(guestId);if(pending.length>MAX_PENDING)pending=pending.slice(-MAX_PENDING);refresh();
  };
  document.addEventListener('poply:guest-served',onServed);
  const observer=new MutationObserver(refresh);observer.observe(root,{childList:true,subtree:true});
  refresh();
  return {refresh,disconnect:()=>{observer.disconnect();document.removeEventListener('poply:guest-served',onServed);clearTimeout(activeTimer);}};
}
