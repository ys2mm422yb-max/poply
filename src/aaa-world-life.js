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
.world-life-layer .life-cup-shadow{fill:rgba(17,48,52,.2)}
.world-life-layer .life-cup{fill:#fff3d9;stroke:#174f61;stroke-width:.8;filter:drop-shadow(0 1px 1px rgba(0,35,44,.2))}
.world-life-layer .life-cup-coffee{fill:#a96239}
.world-life-layer .life-steam{fill:none;stroke:#fff9e9;stroke-width:1.45;stroke-linecap:round;opacity:.72;animation:poply-steam-rise 2.15s ease-in-out infinite}
.world-life-layer .coast-counter-aroma .life-steam:nth-child(2){animation-delay:-.7s}.world-life-layer .coast-counter-aroma .life-steam:nth-child(3){animation-delay:-1.35s}
.world-life-layer .life-glass{fill:#ffe085;stroke:#805048;stroke-width:.7;opacity:.9;filter:drop-shadow(0 1px 1px rgba(55,31,45,.2))}
.world-life-layer .life-glass-shine{fill:none;stroke:#fff7cf;stroke-width:.7;stroke-linecap:round;opacity:.72;animation:poply-glass-shine 2.4s ease-in-out infinite alternate}
.world-life-layer .sunset-note{fill:#ffe181;filter:drop-shadow(0 0 4px rgba(255,158,111,.48));animation:poply-note-rise 2.7s ease-out infinite}
.world-life-layer .sunset-note.note-2{animation-delay:-1.25s;fill:#f7a6d0}.world-life-layer .sunset-note.note-3{animation-delay:-2s;fill:#9bdfe3}
.world-life-layer .sunset-spark{fill:#fff1a9;opacity:.82;animation:poply-spark-twinkle 1.8s ease-in-out infinite alternate}.world-life-layer .sunset-spark.spark-2{animation-delay:-.7s}.world-life-layer .sunset-spark.spark-3{animation-delay:-1.2s}
@keyframes poply-life-wave{to{stroke-dashoffset:-46}}
@keyframes poply-lamp-warmth{from{filter:brightness(.96);opacity:.9;transform:scale(.96)}to{filter:brightness(1.18);opacity:1;transform:scale(1.06)}}
@keyframes poply-palm-sway{from{transform:rotate(-.45deg)}to{transform:rotate(.55deg)}}
@keyframes poply-fire-breathe{from{transform:scale(.94) translateY(1px);filter:brightness(.98)}to{transform:scale(1.05) translateY(-1px);filter:brightness(1.18)}}
@keyframes poply-gull-float{from{transform:translate3d(-3px,1px,0) rotate(-1deg)}to{transform:translate3d(5px,-3px,0) rotate(1deg)}}
@keyframes poply-steam-rise{0%{opacity:0;transform:translateY(4px)}35%{opacity:.74}100%{opacity:0;transform:translateY(-9px)}}
@keyframes poply-glass-shine{from{opacity:.28}to{opacity:.85}}
@keyframes poply-note-rise{0%{opacity:0;transform:translateY(7px) scale(.78)}30%{opacity:.92}100%{opacity:0;transform:translateY(-22px) scale(1.08)}}
@keyframes poply-spark-twinkle{from{opacity:.35;transform:scale(.7)}to{opacity:1;transform:scale(1.15)}}
@media(prefers-reduced-motion:reduce){.place-coast .place-scene-svg path[stroke="#8dd8dc"],.place-coast .place-scene-svg path[stroke="#d5f2ed"],.place-sunset .place-scene-svg path[stroke="#f5c492"],.place-coast .scene-upgrade.lights circle,.place-sunset .scene-upgrade.sunset-lanterns circle,.place-sunset .sunset-palms,.place-sunset .scene-upgrade.sunset-fire path,.world-life-layer *{animation:none!important}}
`;

const coffeeCup=(x,y,delay=0)=>`<g class="coast-table-cup" transform="translate(${x} ${y})"><ellipse class="life-cup-shadow" cx="4" cy="8" rx="6" ry="1.6"/><rect class="life-cup" x="0" y="0" width="8" height="7" rx="2"/><ellipse class="life-cup-coffee" cx="4" cy="1.35" rx="2.6" ry=".8"/><path class="life-steam" style="animation-delay:${delay}s" d="M2.4 0q-3-4 .5-7M5.5 0q3-4-.2-7"/></g>`;
const sunsetGlass=(x,y,delay=0)=>`<g class="sunset-table-glass" transform="translate(${x} ${y})"><path class="life-glass" d="M0 0h7l-1 7H1Z"/><path d="M3.5 7v4M1 11h5" stroke="#805048" stroke-width=".7"/><path class="life-glass-shine" style="animation-delay:${delay}s" d="M1.6 1.4h2.2"/></g>`;

const coastMarkup=stage=>`<svg class="world-life-layer" data-life-place="coast" data-life-stage="${stage}" viewBox="0 0 390 300" preserveAspectRatio="none" aria-hidden="true">
  <g class="coast-sky-life"><path class="coast-gull gull-1" d="M72 55q10-9 20 0q10-9 20 0"/><path class="coast-gull gull-2" d="M300 72q8-7 16 0q8-7 16 0"/></g>
  ${stage>=2?`<g class="coast-counter-aroma"><path class="life-steam" d="M108 164q-6-10 1-18M118 165q7-10 0-19M128 164q-5-9 1-17"/></g>`:''}
  ${stage>=4?`<g class="coast-table-service">${coffeeCup(112,170,-.4)}${coffeeCup(258,170,-1.1)}</g>`:''}
</svg>`;
const sunsetMarkup=stage=>`<svg class="world-life-layer" data-life-place="sunset" data-life-stage="${stage}" viewBox="0 0 390 300" preserveAspectRatio="none" aria-hidden="true">
  <g class="sunset-sparks"><circle class="sunset-spark" cx="64" cy="55" r="2.3"/><circle class="sunset-spark spark-2" cx="326" cy="47" r="2"/><circle class="sunset-spark spark-3" cx="352" cy="84" r="1.8"/></g>
  ${stage>=3?`<g class="sunset-table-service">${sunsetGlass(252,186,-.3)}${sunsetGlass(282,186,-1.2)}</g>`:''}
  ${stage>=5?`<g class="sunset-music"><path class="sunset-note" d="M274 184v15c-8-3-11 6-5 9 6 2 10-3 9-8v-11l12-3v10c-7-2-10 6-4 8 6 2 9-3 8-8v-20Z"/><path class="sunset-note note-2" d="M311 192v12c-6-2-9 5-4 7 5 2 8-2 7-6v-19Z"/><circle class="sunset-note note-3" cx="294" cy="205" r="3.5"/></g>`:''}
</svg>`;

export function worldLifeMarkup(place,stage=0){return place==='sunset'?sunsetMarkup(stage):place==='coast'?coastMarkup(stage):'';}
export function installWorldLife(root=document){const doc=root.ownerDocument||root;if(!doc.getElementById(STYLE_ID)){const style=doc.createElement('style');style.id=STYLE_ID;style.textContent=WORLD_LIFE_CSS;doc.head.append(style);}const decorate=()=>{const hero=root.querySelector?.('.world-hero[data-place][data-stage]');if(!hero)return;const place=hero.dataset.place,stage=Number(hero.dataset.stage)||0,signature=`${place}:${stage}`;const existing=hero.querySelector('.world-life-layer');if(existing?.dataset.lifeSignature===signature)return;existing?.remove();const markup=worldLifeMarkup(place,stage);if(!markup)return;hero.insertAdjacentHTML('beforeend',markup);const layer=hero.querySelector('.world-life-layer');if(layer)layer.dataset.lifeSignature=signature;};decorate();const observer=new MutationObserver(decorate);observer.observe(root,{childList:true,subtree:true});return()=>observer.disconnect();}
