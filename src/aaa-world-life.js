const STYLE_ID='poply-world-life-style';

export const WORLD_LIFE_CSS=`
.world-life-layer{position:absolute;inset:0;z-index:2;width:100%;height:100%;overflow:visible;pointer-events:none}
.world-hero>.world-vignette,.world-hero>.world-copy,.world-hero>.world-progress{z-index:4}
.place-coast .place-scene-svg path[stroke="#8dd8dc"],.place-coast .place-scene-svg path[stroke="#d5f2ed"]{stroke-dasharray:28 22;animation:poply-life-wave 7.2s linear infinite}
.place-coast .place-scene-svg path[stroke="#d5f2ed"]{animation-duration:9s;animation-direction:reverse}
.place-sunset .place-scene-svg path[stroke="#f5c492"]{stroke-dasharray:32 24;animation:poply-life-wave 8.2s linear infinite}
.place-coast .place-scene-svg .scene-upgrade.lights circle:not([filter]){transform-box:fill-box;transform-origin:center;animation:poply-lamp-warmth 2.8s ease-in-out infinite alternate}
.place-sunset .place-scene-svg .scene-upgrade.sunset-lanterns circle:not([filter]){transform-box:fill-box;transform-origin:center;animation:poply-lamp-warmth 2.5s ease-in-out infinite alternate}
.place-sunset .place-scene-svg .sunset-palms{transform-box:fill-box;transform-origin:50% 100%;animation:poply-palm-sway 6.8s ease-in-out infinite alternate}
.place-sunset .place-scene-svg .scene-upgrade.sunset-fire path{transform-box:fill-box;transform-origin:50% 100%;animation:poply-fire-breathe 1.25s ease-in-out infinite alternate}
.world-life-layer .coast-gull{fill:none;stroke:#fffdf2;stroke-width:3;stroke-linecap:round;filter:drop-shadow(0 2px 2px rgba(16,64,83,.22));transform-box:fill-box;transform-origin:center;animation:poply-gull-float 4.4s ease-in-out infinite alternate}
.world-life-layer .coast-gull.gull-2{animation-delay:-1.5s;animation-duration:5.2s;opacity:.82}
.world-life-layer .life-shadow{fill:rgba(19,55,61,.2)}
.world-life-layer .life-guest{transform-box:fill-box;transform-origin:50% 100%;filter:drop-shadow(0 2px 2px rgba(10,44,61,.17));animation:poply-guest-breathe 3.1s ease-in-out infinite alternate}
.world-life-layer .life-guest .head{fill:#f2caa4;stroke:#fff0d7;stroke-width:.65}
.world-life-layer .life-guest .hair{fill:#493d50}
.world-life-layer .life-guest .neck{fill:#e9bd98}
.world-life-layer .life-guest .arm{fill:none;stroke:#edc39e;stroke-width:2.2;stroke-linecap:round}
.world-life-layer .life-guest .eye{fill:#234555}
.world-life-layer .life-guest .cheek{fill:#df8f83;opacity:.48}
.world-life-layer .life-chair{fill:#287c72;stroke:#d7c08e;stroke-width:.8;opacity:.92}
.world-life-layer .coast-guest .body{fill:#e98ab6;stroke:#8f567d;stroke-width:.8}
.world-life-layer .coast-guest.alt .body{fill:#edc95e;stroke:#9f7a2e}
.world-life-layer .sunset-guest .body{fill:#e88167;stroke:#844c51;stroke-width:.8}
.world-life-layer .sunset-guest.alt .body{fill:#80cfc4;stroke:#417e82}
.world-life-layer .life-cup{fill:#fff4db;stroke:#1b5267;stroke-width:1}
.world-life-layer .life-cup-coffee{fill:#bb7545}
.world-life-layer .life-steam{fill:none;stroke:#fff8df;stroke-width:1.6;stroke-linecap:round;opacity:.72;animation:poply-steam-rise 2.2s ease-in-out infinite}
.world-life-layer .life-glass{fill:#ffe18a;stroke:#81534b;stroke-width:.8;opacity:.92}
.world-life-layer .sunset-note{fill:#ffe181;filter:drop-shadow(0 0 4px rgba(255,158,111,.48));animation:poply-note-rise 2.7s ease-out infinite}
.world-life-layer .sunset-note.note-2{animation-delay:-1.25s;fill:#f7a6d0}
.world-life-layer .sunset-note.note-3{animation-delay:-2s;fill:#9bdfe3}
.world-life-layer .sunset-spark{fill:#fff1a9;opacity:.82;animation:poply-spark-twinkle 1.8s ease-in-out infinite alternate}
.world-life-layer .sunset-spark.spark-2{animation-delay:-.7s}.world-life-layer .sunset-spark.spark-3{animation-delay:-1.2s}
@keyframes poply-life-wave{to{stroke-dashoffset:-46}}
@keyframes poply-lamp-warmth{from{filter:brightness(.96);opacity:.9;transform:scale(.96)}to{filter:brightness(1.18);opacity:1;transform:scale(1.06)}}
@keyframes poply-palm-sway{from{transform:rotate(-.45deg)}to{transform:rotate(.55deg)}}
@keyframes poply-fire-breathe{from{transform:scale(.94) translateY(1px);filter:brightness(.98)}to{transform:scale(1.05) translateY(-1px);filter:brightness(1.18)}}
@keyframes poply-gull-float{from{transform:translate3d(-3px,1px,0) rotate(-1deg)}to{transform:translate3d(5px,-3px,0) rotate(1deg)}}
@keyframes poply-guest-breathe{from{transform:translateY(0) rotate(-.25deg)}to{transform:translateY(-1.5px) rotate(.3deg)}}
@keyframes poply-steam-rise{0%{opacity:0;transform:translateY(4px)}35%{opacity:.75}100%{opacity:0;transform:translateY(-9px)}}
@keyframes poply-note-rise{0%{opacity:0;transform:translateY(7px) scale(.78)}30%{opacity:.92}100%{opacity:0;transform:translateY(-22px) scale(1.08)}}
@keyframes poply-spark-twinkle{from{opacity:.35;transform:scale(.7)}to{opacity:1;transform:scale(1.15)}}
@media(prefers-reduced-motion:reduce){.place-coast .place-scene-svg path[stroke="#8dd8dc"],.place-coast .place-scene-svg path[stroke="#d5f2ed"],.place-sunset .place-scene-svg path[stroke="#f5c492"],.place-coast .scene-upgrade.lights circle,.place-sunset .scene-upgrade.sunset-lanterns circle,.place-sunset .sunset-palms,.place-sunset .scene-upgrade.sunset-fire path,.world-life-layer *{animation:none!important}}
`;

const faceMarkup=(flip=false)=>`<circle class="head" cx="0" cy="0" r="6.2"/><path class="hair" d="M-6.2-1.2q.7-7.1 6.2-7.3 5.8.1 6.5 7.1-3.1-2.4-6.4-2.4-3.2 0-6.3 2.6Z"/><circle class="eye" cx="${flip?2:-2}" cy=".1" r=".65"/><circle class="cheek" cx="${flip?-3:3}" cy="2.2" r="1.05"/><path class="neck" d="M-2 5h4v4h-4Z"/>`;
const seatedGuest=(kind,alt=false,drink='cup')=>`<g class="${kind}-guest${alt?' alt':''}"><ellipse class="life-shadow" cx="0" cy="29" rx="12" ry="3.2"/><path class="life-chair" d="M-10 14h20v16H7v-9H-7v9h-3Z"/><g class="life-guest">${faceMarkup(alt)}<path class="body" d="M-9 10q9-7.5 18 0l3 15H-12Z"/><path class="arm" d="M${alt?'-7':'7'} 14q${alt?'-7':'7'} 4 ${alt?'-9':'9'} 10"/>${drink==='cup'?`<g transform="translate(${alt?'-14':'11'} 20)"><rect class="life-cup" x="0" y="0" width="7" height="6.5" rx="2"/><ellipse class="life-cup-coffee" cx="3.5" cy="1.2" rx="2.4" ry=".8"/><path class="life-steam" d="M2 0q-3-4 .5-7M5 0q3-4-.2-7"/></g>`:drink==='glass'?`<g transform="translate(${alt?'-13':'11'} 18)"><path class="life-glass" d="M0 0h7l-1 7H1Z"/><path d="M3.5 7v4M1 11h5" stroke="#81534b" stroke-width=".8"/></g>`:''}</g></g>`;

const coastMarkup=stage=>`<svg class="world-life-layer" data-life-place="coast" data-life-stage="${stage}" viewBox="0 0 390 300" preserveAspectRatio="none" aria-hidden="true">
  <g class="coast-sky-life"><path class="coast-gull gull-1" d="M72 55q10-9 20 0q10-9 20 0"/><path class="coast-gull gull-2" d="M300 72q8-7 16 0q8-7 16 0"/></g>
  ${stage>=4?`<g class="coast-guests"><g transform="translate(118 158)">${seatedGuest('coast',false,'cup')}</g><g transform="translate(260 158)">${seatedGuest('coast',true,'')}</g></g>`:''}
</svg>`;

const sunsetMarkup=stage=>`<svg class="world-life-layer" data-life-place="sunset" data-life-stage="${stage}" viewBox="0 0 390 300" preserveAspectRatio="none" aria-hidden="true">
  <g class="sunset-sparks"><circle class="sunset-spark" cx="64" cy="55" r="2.3"/><circle class="sunset-spark spark-2" cx="326" cy="47" r="2"/><circle class="sunset-spark spark-3" cx="352" cy="84" r="1.8"/></g>
  ${stage>=3?`<g class="sunset-guests"><g transform="translate(250 177)">${seatedGuest('sunset',false,'glass')}</g><g transform="translate(282 177)">${seatedGuest('sunset',true,'glass')}</g></g>`:''}
  ${stage>=5?`<g class="sunset-music"><path class="sunset-note" d="M274 184v15c-8-3-11 6-5 9 6 2 10-3 9-8v-11l12-3v10c-7-2-10 6-4 8 6 2 9-3 8-8v-20Z"/><path class="sunset-note note-2" d="M311 192v12c-6-2-9 5-4 7 5 2 8-2 7-6v-19Z"/><circle class="sunset-note note-3" cx="294" cy="205" r="3.5"/></g>`:''}
</svg>`;

export function worldLifeMarkup(place,stage=0){return place==='sunset'?sunsetMarkup(stage):place==='coast'?coastMarkup(stage):'';}

export function installWorldLife(root=document){
  const doc=root.ownerDocument||root;
  if(!doc.getElementById(STYLE_ID)){const style=doc.createElement('style');style.id=STYLE_ID;style.textContent=WORLD_LIFE_CSS;doc.head.append(style);}
  const decorate=()=>{
    const hero=root.querySelector?.('.world-hero[data-place][data-stage]');if(!hero)return;
    const place=hero.dataset.place,stage=Number(hero.dataset.stage)||0,signature=`${place}:${stage}`;
    const existing=hero.querySelector('.world-life-layer');if(existing?.dataset.lifeSignature===signature)return;
    existing?.remove();const markup=worldLifeMarkup(place,stage);if(!markup)return;
    hero.insertAdjacentHTML('beforeend',markup);const layer=hero.querySelector('.world-life-layer');if(layer)layer.dataset.lifeSignature=signature;
  };
  decorate();const observer=new MutationObserver(decorate);observer.observe(root,{childList:true,subtree:true});return ()=>observer.disconnect();
}
