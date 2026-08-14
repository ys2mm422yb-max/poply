const show=(stage,min,markup)=>stage>=min?markup:'';

export function placeSceneMarkup(stage=0){
  const safeStage=Math.max(0,Math.min(6,Number(stage)||0));
  return `<svg class="place-scene-svg" viewBox="0 0 780 430" role="img" aria-label="Café am Meer – Ausbau ${safeStage} von 6" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#79d8df"/><stop offset=".56" stop-color="#c7edf0"/><stop offset="1" stop-color="#f6d59c"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#218aa0"/><stop offset=".6" stop-color="#0d6577"/><stop offset="1" stop-color="#073d4c"/></linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff0cb"/><stop offset=".62" stop-color="#e8c98f"/><stop offset="1" stop-color="#b98451"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#397886"/><stop offset=".45" stop-color="#174f60"/><stop offset="1" stop-color="#082c3a"/></linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d38b49"/><stop offset=".5" stop-color="#9a5832"/><stop offset="1" stop-color="#66351f"/></linearGradient>
    <linearGradient id="deck" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bf7642"/><stop offset="1" stop-color="#6d3d28"/></linearGradient>
    <radialGradient id="sun"><stop stop-color="#fff9c9" stop-opacity=".95"/><stop offset="1" stop-color="#ffd36c" stop-opacity="0"/></radialGradient>
    <radialGradient id="windowGlow"><stop stop-color="#ffd972" stop-opacity=".72"/><stop offset="1" stop-color="#ef9e45" stop-opacity="0"/></radialGradient>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#032735" flood-opacity=".35"/></filter>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>
  </defs>

  <rect width="780" height="430" fill="url(#sky)"/>
  <circle cx="650" cy="74" r="92" fill="url(#sun)"/>
  <path d="M0 150C130 125 244 151 360 143c130-8 250-47 420-17v118H0Z" fill="url(#sea)"/>
  <path d="M0 184c98-14 166 6 244-3 108-12 190-33 307-25 77 5 143 24 229 10" fill="none" stroke="#8dd8dc" stroke-width="5" stroke-linecap="round" opacity=".55"/>
  <path d="M0 209c102-11 173 11 258 2 123-13 213-31 337-15 69 9 122 21 185 14" fill="none" stroke="#d5f2ed" stroke-width="3" stroke-linecap="round" opacity=".42"/>
  <path d="M0 239c167-35 311-11 461-17 130-6 224-36 319-27v99H0Z" fill="#d7b579"/>
  <path d="M0 274c129-18 239-4 345-10 145-8 270-37 435-27v193H0Z" fill="#b98c5a" opacity=".52"/>

  <g filter="url(#softShadow)">
    <path d="M104 244 159 90h462l55 154Z" fill="url(#wall)" stroke="#76543a" stroke-width="7"/>
    <path d="M133 94 177 50h426l45 44Z" fill="#153c47" stroke="#092c37" stroke-width="8"/>
    <path d="M151 83h480" stroke="#3f6970" stroke-width="5" opacity=".7"/>
    <rect x="154" y="113" width="190" height="112" rx="16" fill="url(#glass)" stroke="#f8e8bd" stroke-width="8"/>
    <rect x="436" y="113" width="190" height="112" rx="16" fill="url(#glass)" stroke="#f8e8bd" stroke-width="8"/>
    <rect x="348" y="108" width="83" height="137" rx="14" fill="url(#glass)" stroke="#e4c68e" stroke-width="8"/>
    <circle cx="411" cy="178" r="6" fill="#f6c864"/>
    <path d="M171 138h151M453 138h151" stroke="#7cc2c8" stroke-width="4" opacity=".25"/>
    <path d="M171 154h151M453 154h151" stroke="#d8fbf8" stroke-width="2" opacity=".12"/>
  </g>

  <g opacity=".9">
    <ellipse cx="103" cy="291" rx="58" ry="20" fill="#7d5a36" opacity=".35"/>
    <path d="M68 293c7-52 12-87 42-102 17 16 21 45 8 102Z" fill="#26775f"/>
    <path d="M82 286c-6-42 10-66 24-85M99 286c7-39 23-57 38-69" stroke="#77aa70" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="694" cy="291" rx="57" ry="20" fill="#7d5a36" opacity=".35"/>
    <path d="M666 292c4-46 20-77 45-89 17 23 18 55 8 89Z" fill="#2d765c"/>
    <path d="M676 284c3-34 20-56 38-70M699 284c-3-31 8-52 21-67" stroke="#84b879" stroke-width="8" stroke-linecap="round"/>
  </g>

  ${show(safeStage,1,`<g class="scene-upgrade lights"><path d="M154 94c101-22 202-20 304-7 69 9 123 9 169 3" fill="none" stroke="#725839" stroke-width="3"/><g fill="#ffd369">${[170,240,310,380,450,520,590].map((x,i)=>`<circle cx="${x}" cy="${i%2?84:89}" r="7"/><circle cx="${x}" cy="${i%2?84:89}" r="18" fill="#ffd369" opacity=".17" filter="url(#glow)"/>`).join('')}</g></g>`)}
  ${show(safeStage,2,`<g class="scene-upgrade counter" filter="url(#softShadow)"><path d="M171 191h163v60H171Z" fill="url(#wood)"/><path d="M162 184h181v16H162Z" fill="#f3c47c"/><rect x="190" y="204" width="36" height="30" rx="5" fill="#324c51"/><path d="M238 208h72M238 219h55M238 230h64" stroke="#e6b56f" stroke-width="5" stroke-linecap="round"/></g>`)}
  ${show(safeStage,3,`<g class="scene-upgrade menu" filter="url(#softShadow)"><rect x="463" y="128" width="135" height="73" rx="8" fill="#15343b" stroke="#e3b969" stroke-width="5"/><path d="M480 147h45m-45 15h85m-85 15h68m22-30h12m-22 15h12m-22 15h12" stroke="#f4e1b5" stroke-width="5" stroke-linecap="round"/></g>`)}
  ${show(safeStage,4,`<g class="scene-upgrade seating" filter="url(#softShadow)"><g transform="translate(186 260)"><ellipse cx="50" cy="10" rx="49" ry="15" fill="#efc177" stroke="#845331" stroke-width="4"/><path d="M45 24v45M8 34v42M91 34v42" stroke="#6c432c" stroke-width="8" stroke-linecap="round"/><path d="M-18 31h34v49H0V48h-18Zm102 0h34v49h-18V48H84Z" fill="#2f877b"/></g><g transform="translate(470 260)"><ellipse cx="50" cy="10" rx="49" ry="15" fill="#efc177" stroke="#845331" stroke-width="4"/><path d="M45 24v45M8 34v42M91 34v42" stroke="#6c432c" stroke-width="8" stroke-linecap="round"/><path d="M-18 31h34v49H0V48h-18Zm102 0h34v49h-18V48H84Z" fill="#2f877b"/></g></g>`)}
  ${show(safeStage,5,`<g class="scene-upgrade terrace"><path d="M45 318h690l32 112H13Z" fill="url(#deck)"/><path d="M42 338h700M35 365h716M27 393h732" stroke="#dfa06b" stroke-width="5" opacity=".72"/><path d="M54 317v91M726 317v91M54 332h672" stroke="#f1d0a0" stroke-width="7"/></g>`)}
  ${show(safeStage,6,`<g class="scene-upgrade sign" filter="url(#softShadow)"><path d="M284 49q106-28 212 0l-16 54H300Z" fill="#f3c45d" stroke="#70472a" stroke-width="6"/><text x="390" y="84" text-anchor="middle" font-family="Arial,sans-serif" font-size="36" font-weight="900" fill="#133e48" letter-spacing="4">POPLY</text><circle cx="314" cy="73" r="6" fill="#fff0b8"/><circle cx="467" cy="73" r="6" fill="#fff0b8"/></g>`)}

  <g class="scene-foreground" opacity=".36"><path d="M0 392c110-30 180 6 281-3 116-11 212-42 322-26 69 10 117 28 177 20v47H0Z" fill="#062d39"/></g>
  </svg>`;
}
