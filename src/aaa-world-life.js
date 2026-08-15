const STYLE_ID='poply-world-life-style';

export const WORLD_LIFE_CSS=`
.world-life-layer{position:absolute;inset:0;z-index:2;width:100%;height:100%;overflow:visible;pointer-events:none}
.world-hero>.world-vignette,.world-hero>.world-copy,.world-hero>.world-progress{z-index:4}
.place-coast .place-scene-svg path[stroke="#8dd8dc"],.place-coast .place-scene-svg path[stroke="#d5f2ed"]{stroke-dasharray:28 22;animation:poply-life-wave 7.2s linear infinite}
.place-coast .place-scene-svg path[stroke="#d5f2ed"]{animation-duration:9s;animation-direction:reverse}
.place-sunset .place-scene-svg path[stroke="#f5c492"]{stroke-dasharray:32 24;animation:poply-life-wave 8.2s linear infinite}
.world-life-layer .coast-gull{fill:none;stroke:#fffdf2;stroke-width:3;stroke-linecap:round;filter:drop-shadow(0 2px 2px rgba(16,64,83,.22));transform-box:fill-box;transform-origin:center;animation:poply-gull-float 4.4s ease-in-out infinite alternate}
.world-life-layer .coast-gull.gull-2{animation-delay:-1.5s;animation-duration:5.2s;opacity:.82}
.world-life-layer .life-guest{transform-box:fill-box;transform-origin:50% 100%;filter:drop-shadow(0 2px 2px rgba(10,44,61,.2));animation:poply-guest-breathe 2.8s ease-in-out infinite alternate}
.world-life-layer .life-guest .head{fill:#f6cfa6;stroke:#173e55;stroke-width:1.2}
.world-life-layer .life-guest .hair{fill:#4b3650}
.world-life-layer .life-guest .arm{fill:none;stroke:#f6cfa6;stroke-width:2.6;stroke-linecap:round}
.world-life-layer .coast-guest .body{fill:#ef8fbb;stroke:#173e55;stroke-width:1.4}
.world-life-layer .coast-guest.alt .body{fill:#f3cf62}
.world-life-layer .sunset-guest .body{fill:#ff936f;stroke:#392f55;stroke-width:1.4}
.world-life-layer .sunset-guest.alt .body{fill:#8edbcd}
.world-life-layer .life-cup{fill:#fff4db;stroke:#1b5267;stroke-width:1.2}
.world-life-layer .life-steam{fill:none;stroke:#fff8df;stroke-width:1.8;stroke-linecap:round;opacity:.72;animation:poply-steam-rise 2.2s ease-in-out infinite}
.world-life-layer .sunset-note{fill:#ffe181;filter:drop-shadow(0 0 4px rgba(255,158,111,.48));animation:poply-note-rise 2.7s ease-out infinite}
.world-life-layer .sunset-note.note-2{animation-delay:-1.25s;fill:#f7a6d0}
.world-life-layer .sunset-note.note-3{animation-delay:-2s;fill:#9bdfe3}
.world-life-layer .sunset-spark{fill:#fff1a9;opacity:.82;animation:poply-spark-twinkle 1.8s ease-in-out infinite alternate}
.world-life-layer .sunset-spark.spark-2{animation-delay:-.7s}.world-life-layer .sunset-spark.spark-3{animation-delay:-1.2s}
@keyframes poply-life-wave{to{stroke-dashoffset:-46}}
@keyframes poply-gull-float{from{transform:translate3d(-3px,1px,0) rotate(-1deg)}to{transform:translate3d(5px,-3px,0) rotate(1deg)}}
@keyframes poply-guest-breathe{from{transform:translateY(0) rotate(-.4deg)}to{transform:translateY(-2px) rotate(.5deg)}}
@keyframes poply-steam-rise{0%{opacity:0;transform:translateY(4px)}35%{opacity:.75}100%{opacity:0;transform:translateY(-9px)}}
@keyframes poply-note-rise{0%{opacity:0;transform:translateY(7px) scale(.78)}30%{opacity:.92}100%{opacity:0;transform:translateY(-22px) scale(1.08)}}
@keyframes poply-spark-twinkle{from{opacity:.35;transform:scale(.7)}to{opacity:1;transform:scale(1.15)}}
@media(prefers-reduced-motion:reduce){.place-coast .place-scene-svg path[stroke="#8dd8dc"],.place-coast .place-scene-svg path[stroke="#d5f2ed"],.place-sunset .place-scene-svg path[stroke="#f5c492"],.world-life-layer *{animation:none!important}}
`;

const coastMarkup=stage=>`<svg class="world-life-layer" data-life-place="coast" data-life-stage="${stage}" viewBox="0 0 390 300" preserveAspectRatio="none" aria-hidden="true">
  <g class="coast-sky-life"><path class="coast-gull gull-1" d="M72 55q10-9 20 0q10-9 20 0"/><path class="coast-gull gull-2" d="M300 72q8-7 16 0q8-7 16 0"/></g>
  ${stage>=4?`<g class="coast-guests"><g class="coast-guest" transform="translate(118 158)"><g class="life-guest"><circle class="head" cx="0" cy="0" r="5.8"/><path class="hair" d="M-6-1q1-7 6-7 6 0 7 7-3-2-7-2t-6 2Z"/><path class="body" d="M-9 10q9-8 18 0l4 21h-26Z"/><path class="arm" d="M7 15q7 3 9 10"/><rect class="life-cup" x="14" y="23" width="7" height="6" rx="2"/><path class="life-steam" d="M17 22q-4-5 1-9"/></g></g><g class="coast-guest alt" transform="translate(260 158)"><g class="life-guest"><circle class="head" cx="0" cy="0" r="5.5"/><path class="hair" d="M-6 0q0-7 6-7t6 7q-3-3-6-3T-6 0Z"/><path class="body" d="M-8.5 10q8.5-7 17 0l3.5 20h-24Z"/><path class="arm" d="M-6 16q-5 4-5 10"/></g></g></g>`:''}
</svg>`;

const sunsetMarkup=stage=>`<svg class="world-life-layer" data-life-place="sunset" data-life-stage="${stage}" viewBox="0 0 390 300" preserveAspectRatio="none" aria-hidden="true">
  <g class="sunset-sparks"><circle class="sunset-spark" cx="64" cy="55" r="2.3"/><circle class="sunset-spark spark-2" cx="326" cy="47" r="2"/><circle class="sunset-spark spark-3" cx="352" cy="84" r="1.8"/></g>
  ${stage>=3?`<g class="sunset-guests"><g class="sunset-guest" transform="translate(252 177)"><g class="life-guest"><circle class="head" cx="0" cy="0" r="5.8"/><path class="hair" d="M-6-1q1-7 6-7 6 0 7 7-3-2-7-2t-6 2Z"/><path class="body" d="M-9 10q9-8 18 0l4 21h-26Z"/><path class="arm" d="M7 15q7 3 9 10"/><rect class="life-cup" x="14" y="23" width="7" height="6" rx="2"/></g></g><g class="sunset-guest alt" transform="translate(283 177)"><g class="life-guest"><circle class="head" cx="0" cy="0" r="5.5"/><path class="hair" d="M-6 0q0-7 6-7t6 7q-3-3-6-3T-6 0Z"/><path class="body" d="M-8.5 10q8.5-7 17 0l3.5 20h-24Z"/></g></g></g>`:''}
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
