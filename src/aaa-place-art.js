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
    <linearGradient id="deck" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c77a43"/><stop offset="1" stop-color="#6d3d28"/></linearGradient>
    <radialGradient id="sun"><stop stop-color="#fff9c9" stop-opacity=".95"/><stop offset="1" stop-color="#ffd36c" stop-opacity="0"/></radialGradient>
    <radialGradient id="windowGlow"><stop stop-color="#ffd972" stop-opacity=".82"/><stop offset="1" stop-color="#ef9e45" stop-opacity="0"/></radialGradient>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#032735" flood-opacity=".35"/></filter>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>
  </defs>

  <rect width="780" height="430" fill="url(#sky)"/>
  <circle class="ambient-sun" cx="650" cy="74" r="92" fill="url(#sun)"/>
  <path d="M0 150C130 125 244 151 360 143c130-8 250-47 420-17v118H0Z" fill="url(#sea)"/>
  <path class="ambient-wave wave-a" d="M0 184c98-14 166 6 244-3 108-12 190-33 307-25 77 5 143 24 229 10" fill="none" stroke="#8dd8dc" stroke-width="5" stroke-linecap="round" opacity=".55"/>
  <path class="ambient-wave wave-b" d="M0 209c102-11 173 11 258 2 123-13 213-31 337-15 69 9 122 21 185 14" fill="none" stroke="#d5f2ed" stroke-width="3" stroke-linecap="round" opacity=".42"/>
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

  <g class="scene-base-plant plant-left" opacity=".92">
    <ellipse cx="103" cy="291" rx="58" ry="20" fill="#7d5a36" opacity=".35"/>
    <path d="M68 293c7-52 12-87 42-102 17 16 21 45 8 102Z" fill="#26775f"/>
    <path d="M82 286c-6-42 10-66 24-85M99 286c7-39 23-57 38-69" stroke="#77aa70" stroke-width="8" stroke-linecap="round"/>
  </g>
  <g class="scene-base-plant plant-right" opacity=".92">
    <ellipse cx="694" cy="291" rx="57" ry="20" fill="#7d5a36" opacity=".35"/>
    <path d="M666 292c4-46 20-77 45-89 17 23 18 55 8 89Z" fill="#2d765c"/>
    <path d="M676 284c3-34 20-56 38-70M699 284c-3-31 8-52 21-67" stroke="#84b879" stroke-width="8" stroke-linecap="round"/>
  </g>

  ${show(safeStage,1,`<g class="scene-upgrade lights"><rect class="cafe-evening-wash" width="780" height="300" fill="#f4a65b" opacity=".08"/><rect x="160" y="119" width="178" height="98" rx="12" fill="#ffcf70" opacity=".16"/><rect x="442" y="119" width="178" height="98" rx="12" fill="#ffcf70" opacity=".16"/><circle cx="248" cy="165" r="82" fill="url(#windowGlow)" opacity=".32"/><circle cx="530" cy="165" r="82" fill="url(#windowGlow)" opacity=".32"/><path d="M154 94c101-22 202-20 304-7 69 9 123 9 169 3" fill="none" stroke="#725839" stroke-width="3"/><g fill="#ffd369">${[170,240,310,380,450,520,590].map((x,i)=>`<circle class="cafe-bulb" cx="${x}" cy="${i%2?84:89}" r="8"/><circle cx="${x}" cy="${i%2?84:89}" r="23" fill="#ffd369" opacity=".2" filter="url(#glow)"/>`).join('')}</g></g>`)}
  ${show(safeStage,2,`<g class="scene-upgrade counter" filter="url(#softShadow)"><path d="M154 184h208v74H154Z" fill="url(#wood)"/><path d="M145 178h226v16H145Z" fill="#f4cc82"/><rect x="176" y="202" width="48" height="36" rx="6" fill="#294a52"/><rect x="183" y="207" width="34" height="11" rx="3" fill="#7bd4d4" opacity=".55"/><path d="M238 204h82M238 219h62M238 234h74" stroke="#efbd75" stroke-width="6" stroke-linecap="round"/><g class="cafe-cups" fill="#fff1d7" stroke="#79533c" stroke-width="2"><path d="M273 174h19v11h-19Z"/><path d="M300 174h19v11h-19Z"/></g><g class="cafe-barista"><circle cx="334" cy="206" r="13" fill="#d18b64"/><path d="M318 251v-31q16-13 32 0v31Z" fill="#4c9b91"/><path d="M326 196q8-12 18 0" fill="none" stroke="#3a302e" stroke-width="8" stroke-linecap="round"/></g><g class="cafe-steam" fill="none" stroke="#fff7e6" stroke-width="3" stroke-linecap="round"><path d="M279 170q-10-12 1-23"/><path d="M290 169q9-12 0-23"/><path d="M306 169q-8-11 1-21"/></g></g>`)}
  ${show(safeStage,3,`<g class="scene-upgrade menu"><g filter="url(#softShadow)"><rect x="448" y="121" width="164" height="92" rx="10" fill="#15343b" stroke="#e3b969" stroke-width="6"/><path d="M468 144h54m-54 18h102m-102 18h78m30-36h14m-14 18h14m-14 18h14" stroke="#f4e1b5" stroke-width="6" stroke-linecap="round"/></g><path d="M117 101h548l-21 28H138Z" fill="#f4c75f" stroke="#76543a" stroke-width="4"/><path d="M144 104v21m55-21v21m55-21v21m55-21v21m55-21v21m55-21v21m55-21v21m55-21v21m55-21v21" stroke="#fff1bd" stroke-width="22" opacity=".85"/><g class="menu-spark" fill="#fff3b6"><circle cx="584" cy="139" r="4"/><circle cx="600" cy="155" r="3"/></g></g>`)}
  ${show(safeStage,5,`<g class="scene-upgrade terrace"><path d="M45 304h690l32 126H13Z" fill="url(#deck)"/><path d="M42 326h700M35 354h716M27 383h732M20 412h746" stroke="#dfa06b" stroke-width="5" opacity=".72"/><path d="M54 304v105M726 304v105M54 321h672" stroke="#f1d0a0" stroke-width="7"/><g class="terrace-planters"><rect x="70" y="319" width="54" height="36" rx="8" fill="#337963"/><path d="M82 322q9-30 18 0m0 0q12-35 20 0" stroke="#7fbd75" stroke-width="8" stroke-linecap="round"/><rect x="654" y="319" width="54" height="36" rx="8" fill="#337963"/><path d="M666 322q9-30 18 0m0 0q12-35 20 0" stroke="#7fbd75" stroke-width="8" stroke-linecap="round"/></g></g>`)}
  ${show(safeStage,4,`<g class="scene-upgrade seating" filter="url(#softShadow)"><g transform="translate(166 278)"><ellipse cx="62" cy="23" rx="58" ry="16" fill="#efc177" stroke="#845331" stroke-width="4"/><path d="M57 38v48M15 44v44M109 44v44" stroke="#6c432c" stroke-width="8" stroke-linecap="round"/><path d="M-10 42h38v55H7V61h-17Zm106 0h38v55h-21V61H96Z" fill="#2f877b"/><g class="cafe-guest guest-a"><circle cx="12" cy="21" r="13" fill="#d9956d"/><path d="M-2 62V35q14-12 29 0v27Z" fill="#f1a15d"/><path d="M3 12q9-11 18 0" fill="none" stroke="#49352f" stroke-width="7" stroke-linecap="round"/></g></g><g transform="translate(462 278)"><ellipse cx="62" cy="23" rx="58" ry="16" fill="#efc177" stroke="#845331" stroke-width="4"/><path d="M57 38v48M15 44v44M109 44v44" stroke="#6c432c" stroke-width="8" stroke-linecap="round"/><path d="M-10 42h38v55H7V61h-17Zm106 0h38v55h-21V61H96Z" fill="#2f877b"/><g class="cafe-guest guest-b"><circle cx="112" cy="20" r="13" fill="#9b694f"/><path d="M98 62V35q14-12 29 0v27Z" fill="#67a9c7"/><path d="M103 11q9-10 18 0" fill="none" stroke="#242c32" stroke-width="7" stroke-linecap="round"/></g></g></g>`)}
  ${show(safeStage,6,`<g class="scene-upgrade sign" filter="url(#softShadow)"><path d="M278 42q112-31 224 0l-18 66H296Z" fill="#f3c45d" stroke="#70472a" stroke-width="6"/><text x="390" y="83" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" font-weight="900" fill="#133e48" letter-spacing="4">POPLY</text><circle cx="310" cy="71" r="6" fill="#fff0b8"/><circle cx="470" cy="71" r="6" fill="#fff0b8"/><path d="M105 69 150 52l42 21 43-18 44 18M501 73l43-18 44 20 44-19 45 14" fill="none" stroke="#f3c45d" stroke-width="4"/><g class="cafe-flags"><path d="M151 53v28l18-10Z" fill="#f08a83"/><path d="M235 55v28l18-10Z" fill="#75c7ba"/><path d="M544 55v28l18-10Z" fill="#f08a83"/><path d="M632 56v28l18-10Z" fill="#75c7ba"/></g><g class="cafe-celebration-dots" fill="#fff1a7"><circle cx="119" cy="118" r="5"/><circle cx="657" cy="126" r="5"/><circle cx="91" cy="151" r="3"/><circle cx="689" cy="157" r="3"/></g></g>`)}

  <g class="scene-foreground" opacity=".28"><path d="M0 392c110-30 180 6 281-3 116-11 212-42 322-26 69 10 117 28 177 20v47H0Z" fill="#062d39"/></g>
  </svg>`;
}
