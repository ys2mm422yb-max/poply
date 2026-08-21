import { getState } from './aaa-session.js';
import { regularGuestsForPlace } from './aaa-guests.js';

const NS='http://www.w3.org/2000/svg';
const regularClass=entry=>entry?` regular-guest regular-${entry.guest.id}`:'';
const regularAttrs=entry=>entry?` data-regular-guest="${entry.guest.id}" data-regular-visits="${entry.loyalty.visits}"`:'';
const nameplate=entry=>entry?`<g class="regular-guest-nameplate regular-${entry.guest.id}" transform="translate(-68 91)"><rect x="0" y="0" width="136" height="29" rx="14"/><text x="68" y="19" text-anchor="middle">${entry.guest.name} · ${entry.loyalty.title}</text></g>`:'';

function guestBackMarkup(regulars=[]){
  const left=regulars[0]||null,right=regulars[1]||null;
  return `<g class="place-life-guests-v2 place-life-guest-layer" aria-hidden="true">
    <g class="place-life-person guest-left${regularClass(left)}"${regularAttrs(left)} transform="translate(278 282)">
      <ellipse class="guest-ground" cx="0" cy="84" rx="24" ry="7"/>
      <g class="guest-idle guest-idle-a">
        <path class="guest-leg" d="M-7 55q-3 18-16 27M8 56q8 16 21 22"/>
        <path class="guest-shoe" d="M-25 83h17M18 79h17"/>
        <path class="guest-body guest-coral" d="M-20 28q20-13 40 0l-3 33h-34Z"/>
      </g>
    </g>
    <g class="place-life-person guest-right${regularClass(right)}"${regularAttrs(right)} transform="translate(458 288)">
      <ellipse class="guest-ground" cx="0" cy="80" rx="24" ry="7"/>
      <g class="guest-idle guest-idle-b">
        <path class="guest-leg" d="M-8 53q-7 17-20 25M8 53q3 18 18 26"/>
        <path class="guest-shoe" d="M-31 79h17M18 80h17"/>
        <path class="guest-body guest-blue" d="M-20 27q20-13 40 0l-2 31h-36Z"/>
      </g>
    </g>
  </g>`;
}

function guestFrontMarkup(stage,regulars=[]){
  const left=regulars[0]||null,right=regulars[1]||null,back=regulars[2]||null;
  return `<g class="place-life-guests-v2-front place-life-guest-layer" aria-hidden="true">
    <g class="place-life-face guest-left${regularClass(left)}"${regularAttrs(left)} transform="translate(278 282)">
      <g class="guest-idle guest-idle-a">
        <circle class="guest-head guest-warm" cx="0" cy="10" r="14"/>
        <path class="guest-hair guest-dark" d="M-13 8q3-18 17-15q11 1 13 14q-7-5-12-2q-5-7-18 9q-8 5-18 8Z"/>
        <path class="guest-arm guest-warm-stroke" d="M-14 34q-13 4-23 15"/>
        <path class="guest-arm guest-warm-stroke guest-sip-arm" d="M13 34q-7-12-16-18"/>
        <g class="guest-cup" transform="translate(-5 15)"><rect x="-5" y="-5" width="10" height="12" rx="3"/><path d="M5-1q7 0 5 6q-2 4-6 2"/></g>
        <circle class="guest-eye" cx="-5" cy="9" r="1.3"/><circle class="guest-eye" cx="5" cy="9" r="1.3"/><path class="guest-smile" d="M-4 15q4 4 8 0"/>
      </g>${nameplate(left)}
    </g>
    <g class="place-life-face guest-right${regularClass(right)}"${regularAttrs(right)} transform="translate(458 288)">
      <g class="guest-idle guest-idle-b">
        <circle class="guest-head guest-deep" cx="0" cy="9" r="14"/>
        <path class="guest-hair guest-night" d="M-14 7q4-18 18-15q10 1 13 14q-8-4-13-2q-6-7-16 8q-8 5-16 8Z"/>
        <path class="guest-arm guest-deep-stroke" d="M-14 33q15 8 26 18"/>
        <path class="guest-arm guest-deep-stroke" d="M14 34q13 3 23 12"/>
        <circle class="guest-eye" cx="-5" cy="8" r="1.3"/><circle class="guest-eye" cx="5" cy="8" r="1.3"/><path class="guest-smile" d="M-4 14q4 3 8 0"/>
      </g>${nameplate(right)}
    </g>
    ${stage>=5?`<g class="place-life-background-guest${regularClass(back)}"${regularAttrs(back)} transform="translate(628 282)"><ellipse cx="0" cy="40" rx="14" ry="4" class="guest-ground"/><circle cx="0" cy="5" r="9" class="guest-head guest-warm"/><path d="M-12 18q12-8 24 0v23h-24Z" class="guest-body guest-mint"/><path d="M-8-1q8-9 16 0" class="guest-hair guest-dark"/>${back?`<g class="regular-guest-nameplate regular-${back.guest.id}" transform="translate(-58 48)"><rect x="0" y="0" width="116" height="25" rx="12"/><text x="58" y="17" text-anchor="middle">${back.guest.name}</text></g>`:''}</g>`:''}
  </g>`;
}

function parseGroup(markup){
  const container=document.createElementNS(NS,'g');container.innerHTML=markup;return container.firstElementChild;
}

function decorateScene(svg,regulars){
  if(!svg)return;
  const signature=regulars.map(entry=>`${entry.guest.id}:${entry.loyalty.visits}`).join('|')||'ambient';
  if(svg.dataset.regularGuestSignature===signature&&svg.querySelector('.place-life-guests-v2'))return;
  svg.querySelectorAll('.place-life-guests-v2,.place-life-guests-v2-front').forEach(node=>node.remove());
  const seating=svg.querySelector('.scene-upgrade.seating');if(!seating)return;
  const stage=svg.querySelector('.scene-upgrade.sign')?6:svg.querySelector('.scene-upgrade.terrace')?5:4;
  const back=parseGroup(guestBackMarkup(regulars)),front=parseGroup(guestFrontMarkup(stage,regulars));
  if(back)seating.parentNode.insertBefore(back,seating);
  if(front)seating.parentNode.insertBefore(front,seating.nextSibling);
  svg.dataset.regularGuestSignature=signature;
}

function decorate(root){
  const state=getState(),regulars=regularGuestsForPlace(state,3);
  const scenes=[root.querySelector('.view-place.place-coast .place-scene-svg'),...document.querySelectorAll('.place-map-preview.place-coast .place-scene-svg')];
  scenes.forEach(svg=>decorateScene(svg,regulars));
}

export function installPlaceLifeV2(root){
  let queued=false;const refresh=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorate(root);});};
  new MutationObserver(refresh).observe(document.body||root,{childList:true,subtree:true});refresh();
  return {refresh};
}