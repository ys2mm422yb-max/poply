const show=(stage,min,markup)=>stage>=min?markup:'';
const bulbXs=[174,246,318,390,462,534,606];
const deckLines=[0,1,2,3,4,5,6].map(i=>`<path d="M${84+i*88} 430 ${170+i*73} 286"/>`).join('');

export function placeSceneMarkup(stage=0){
  const safeStage=Math.max(0,Math.min(6,Number(stage)||0));
  const bulbs=bulbXs.map((x,i)=>`<g class="cafe-bulb" transform="translate(${x} ${i%2?81:87})"><circle r="7" fill="#ffd76e"/><circle r="24" fill="#ffd76e" opacity=".18" filter="url(#sceneGlow)"/></g>`).join('');
  return `<svg class="place-scene-svg place-scene-v2" viewBox="0 0 780 430" role="img" aria-label="Café am Meer – Ausbau ${safeStage} von 6" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sceneSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#68d7e0"/><stop offset=".54" stop-color="#c8eff0"/><stop offset="1" stop-color="#f7cf90"/></linearGradient>
    <linearGradient id="sceneSea" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2797aa"/><stop offset=".58" stop-color="#10677a"/><stop offset="1" stop-color="#073e4d"/></linearGradient>
    <linearGradient id="sceneWall" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff2cb"/><stop offset=".58" stop-color="#e7c17f"/><stop offset="1" stop-color="#b77a45"/></linearGradient>
    <linearGradient id="sceneSide" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bc7b47"/><stop offset="1" stop-color="#7a432d"/></linearGradient>
    <linearGradient id="sceneGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4b95a0"/><stop offset=".45" stop-color="#174f60"/><stop offset="1" stop-color="#072d3a"/></linearGradient>
    <linearGradient id="sceneWood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d6934f"/><stop offset=".55" stop-color="#9b5934"/><stop offset="1" stop-color="#5b3021"/></linearGradient>
    <linearGradient id="sceneDeck" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c98651"/><stop offset="1" stop-color="#72402b"/></linearGradient>
    <radialGradient id="sceneSun"><stop stop-color="#fff8bf" stop-opacity=".95"/><stop offset="1" stop-color="#ffd36c" stop-opacity="0"/></radialGradient>
    <radialGradient id="sceneWindowGlow"><stop stop-color="#ffd76c" stop-opacity=".9"/><stop offset="1" stop-color="#ef9f45" stop-opacity="0"/></radialGradient>
    <filter id="sceneShadow" x="-35%" y="-35%" width="180%" height="190%"><feDropShadow dx="0" dy="12" stdDeviation="11" flood-color="#022735" flood-opacity=".4"/></filter>
    <filter id="sceneNearShadow" x="-35%" y="-35%" width="180%" height="190%"><feDropShadow dx="0" dy="9" stdDeviation="6" flood-color="#041f27" flood-opacity=".48"/></filter>
    <filter id="sceneGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>

  <g class="scene-depth-back">
    <rect width="780" height="430" fill="url(#sceneSky)"/>
    <circle class="ambient-sun" cx="650" cy="62" r="105" fill="url(#sceneSun)"/>
    <path class="distant-island" d="M0 158c92-22 162-10 228-20 70-10 125-35 191-25 61 9 101 31 161 24 67-8 120-35 200-21v108H0Z" fill="#438c87" opacity=".28"/>
    <path d="M0 151c125-22 234 11 350-2 149-17 253-48 430-21v126H0Z" fill="url(#sceneSea)"/>
    <path class="ambient-wave wave-a" d="M0 184c98-14 166 6 244-3 108-12 190-33 307-25 77 5 143 24 229 10" fill="none" stroke="#8dd8dc" stroke-width="5" stroke-linecap="round" opacity=".62"/>
    <path class="ambient-wave wave-b" d="M0 210c102-11 173 11 258 2 123-13 213-31 337-15 69 9 122 21 185 14" fill="none" stroke="#d5f2ed" stroke-width="3" stroke-linecap="round" opacity=".48"/>
    <path class="ambient-wave wave-c" d="M34 230c82-8 145 9 218 3 83-8 150-24 235-15 82 9 147 23 252 10" fill="none" stroke="#eefcf6" stroke-width="2" stroke-linecap="round" opacity=".28"/>
  </g>

  <g class="scene-depth-ground">
    <path d="M0 245c154-35 302-13 447-18 132-5 232-32 333-22v76H0Z" fill="#d8b67b"/>
    <path d="M0 281 780 258v172H0Z" fill="#b38961"/>
    <path class="scene-ground-plane" d="M86 430 175 274h433l96 156Z" fill="#b67a4c" opacity=".38"/>
    <path d="M95 430 181 284h420l87 146" fill="none" stroke="#f1cea0" stroke-width="3" opacity=".36"/>
  </g>

  <g class="scene-depth-mid cafe-shell" filter="url(#sceneShadow)">
    <ellipse cx="390" cy="286" rx="286" ry="28" fill="#052d38" opacity=".28"/>
    <path class="cafe-side-face" d="M621 96 674 130 680 251 625 228Z" fill="url(#sceneSide)" stroke="#67402f" stroke-width="6"/>
    <path class="cafe-front-face" d="M104 244 159 91h462l55 153-49 10H120Z" fill="url(#sceneWall)" stroke="#72503a" stroke-width="7"/>
    <path class="cafe-roof-side" d="M603 50 651 79 676 99 625 92Z" fill="#092d38"/>
    <path class="cafe-roof" d="M132 94 176 49h427l49 45Z" fill="#153d48" stroke="#082b36" stroke-width="8"/>
    <path d="M151 80h480" stroke="#4c7880" stroke-width="6" opacity=".78"/>
    <path d="M158 94h464" stroke="#f3d892" stroke-width="3" opacity=".48"/>
    <rect x="154" y="113" width="190" height="112" rx="16" fill="url(#sceneGlass)" stroke="#fae8b8" stroke-width="8"/>
    <rect x="436" y="113" width="190" height="112" rx="16" fill="url(#sceneGlass)" stroke="#fae8b8" stroke-width="8"/>
    <rect x="348" y="108" width="83" height="137" rx="14" fill="url(#sceneGlass)" stroke="#e7c789" stroke-width="8"/>
    <circle cx="411" cy="178" r="6" fill="#f8c65d"/>
    <path d="M172 137h149M454 137h149" stroke="#c4ffff" stroke-width="4" opacity=".22"/>
    <path d="M174 154h145M456 154h145" stroke="#fff" stroke-width="2" opacity=".13"/>
    <path class="window-reflection" d="M177 120 235 120 176 207h-18Zm282 0h58l-58 87h-18Z" fill="#dffcff" opacity=".08"/>
    <path class="cafe-plinth-top" d="M119 247 630 247 678 235 679 254 625 270 119 270Z" fill="#e0aa68"/>
    <path class="cafe-plinth-front" d="M119 270h506v26H119Z" fill="#855137"/>
  </g>

  <g class="scene-base-plant plant-left scene-depth-front" opacity=".96">
    <ellipse cx="92" cy="302" rx="62" ry="21" fill="#65452f" opacity=".35"/>
    <path d="M58 301c9-61 18-98 49-113 18 17 22 51 8 113Z" fill="#26775f"/>
    <path d="M72 294c-7-49 10-74 26-96M92 296c8-45 25-66 42-80" stroke="#80b679" stroke-width="9" stroke-linecap="round"/>
  </g>
  <g class="scene-base-plant plant-right scene-depth-front" opacity=".96">
    <ellipse cx="704" cy="303" rx="61" ry="21" fill="#65452f" opacity=".35"/>
    <path d="M675 301c4-54 21-88 48-101 18 25 19 63 8 101Z" fill="#2d765c"/>
    <path d="M685 293c3-40 21-64 41-81M709 294c-3-37 9-60 23-79" stroke="#8fc181" stroke-width="9" stroke-linecap="round"/>
  </g>

  ${show(safeStage,1,`<g class="scene-upgrade lights scene-depth-light"><rect class="cafe-evening-wash" width="780" height="315" fill="#f1a353" opacity=".09"/><rect x="160" y="119" width="178" height="98" rx="12" fill="#ffd16f" opacity=".18"/><rect x="442" y="119" width="178" height="98" rx="12" fill="#ffd16f" opacity=".18"/><circle cx="249" cy="165" r="96" fill="url(#sceneWindowGlow)" opacity=".34"/><circle cx="531" cy="165" r="96" fill="url(#sceneWindowGlow)" opacity=".34"/><path d="M153 91c95-24 202-20 304-8 72 9 125 10 170 4" fill="none" stroke="#6c5035" stroke-width="4"/>${bulbs}<path class="under-eave-light" d="M163 101h452" stroke="#ffe4a0" stroke-width="6" stroke-linecap="round" opacity=".72"/></g>`)}

  ${show(safeStage,2,`<g class="scene-upgrade counter scene-depth-service" filter="url(#sceneNearShadow)"><path class="counter-top" d="M142 179 367 179 350 199 150 199Z" fill="#f6d28d"/><path class="counter-front" d="M151 198h199v76H151Z" fill="url(#sceneWood)"/><path class="counter-side" d="M350 198 367 179v72l-17 23Z" fill="#6b3b29"/><rect x="174" y="216" width="52" height="37" rx="7" fill="#284950"/><rect x="182" y="222" width="36" height="10" rx="3" fill="#7bd4d4" opacity=".58"/><path d="M240 217h82M240 233h62M240 249h74" stroke="#efbe78" stroke-width="6" stroke-linecap="round"/><g class="cafe-cups" fill="#fff1d7" stroke="#79533c" stroke-width="2"><path d="M267 171h20v12h-20Z"/><path d="M296 171h20v12h-20Z"/></g><g class="cafe-barista"><ellipse cx="334" cy="260" rx="24" ry="7" fill="#352b27" opacity=".22"/><circle cx="334" cy="207" r="14" fill="#d18b64"/><path d="M316 257v-34q18-14 36 0v34Z" fill="#4c9b91"/><path d="M325 197q9-13 19 0" fill="none" stroke="#3a302e" stroke-width="8" stroke-linecap="round"/></g><g class="cafe-steam" fill="none" stroke="#fff7e6" stroke-width="3" stroke-linecap="round"><path d="M274 169q-10-13 1-24"/><path d="M289 169q9-13 0-24"/><path d="M306 169q-8-12 1-22"/></g><path class="counter-floor-shadow" d="M139 277h230l-34 19H122Z" fill="#3d2b22" opacity=".22"/></g>`)}

  ${show(safeStage,3,`<g class="scene-upgrade menu scene-depth-canopy"><g filter="url(#sceneNearShadow)"><rect x="446" y="119" width="168" height="96" rx="11" fill="#15343b" stroke="#e3b969" stroke-width="6"/><path d="M468 143h54m-54 19h102m-102 19h78m31-38h13m-13 19h13m-13 19h13" stroke="#f5e2b6" stroke-width="6" stroke-linecap="round"/></g><path class="cafe-canopy-top" d="M117 98h548l-22 31H139Z" fill="#f4c75f" stroke="#76543a" stroke-width="4"/><path class="cafe-canopy-face" d="M139 129h504l-9 21H148Z" fill="#d89b3c" opacity=".9"/><path d="M146 103v23m57-23v23m57-23v23m57-23v23m57-23v23m57-23v23m57-23v23m57-23v23m57-23v23" stroke="#fff1bd" stroke-width="22" opacity=".9"/><g class="menu-spark" fill="#fff3b6"><circle cx="583" cy="138" r="4"/><circle cx="601" cy="154" r="3"/></g></g>`)}

  ${show(safeStage,5,`<g class="scene-upgrade terrace scene-depth-terrace"><path class="terrace-plane" d="M42 292h696l42 138H0Z" fill="url(#sceneDeck)"/><g class="terrace-perspective-lines" fill="none" stroke="#e7aa73" stroke-width="4" opacity=".64">${deckLines}</g><path d="M43 318h695M34 348h713M24 382h733M14 419h753" stroke="#e7aa73" stroke-width="4" opacity=".55"/><path class="terrace-rail" d="M47 295v113m686-113v113M47 313h686" fill="none" stroke="#f0d1a3" stroke-width="8"/><path class="terrace-rail-shadow" d="M49 321h682" stroke="#563a31" stroke-width="6" opacity=".32"/><g class="terrace-planters"><g transform="translate(62 314)"><path d="M0 0h69l-8 47H8Z" fill="#357b65"/><ellipse cx="35" cy="3" rx="35" ry="8" fill="#4f9676"/><path d="M17 1q9-34 19 1m0 0q13-39 22 0m-34 4q-4-27 10-40" stroke="#8ac37b" stroke-width="9" stroke-linecap="round"/></g><g transform="translate(650 314)"><path d="M0 0h69l-8 47H8Z" fill="#357b65"/><ellipse cx="35" cy="3" rx="35" ry="8" fill="#4f9676"/><path d="M17 1q9-34 19 1m0 0q13-39 22 0m-34 4q-4-27 10-40" stroke="#8ac37b" stroke-width="9" stroke-linecap="round"/></g></g><g class="terrace-service-cart" filter="url(#sceneNearShadow)" transform="translate(545 332)"><path d="M0 0h82l-10 48H8Z" fill="#f0c16e" stroke="#795034" stroke-width="4"/><circle cx="18" cy="55" r="8" fill="#274a52"/><circle cx="64" cy="55" r="8" fill="#274a52"/><path d="M13 13h54" stroke="#fff0bd" stroke-width="5"/><circle cx="22" cy="5" r="6" fill="#f2cf75"/><circle cx="42" cy="3" r="6" fill="#eb8a72"/></g></g>`)}

  ${show(safeStage,4,`<g class="scene-upgrade seating scene-depth-front" filter="url(#sceneNearShadow)"><g class="cafe-table table-left" transform="translate(130 280)"><ellipse cx="92" cy="37" rx="79" ry="22" fill="#efc177" stroke="#845331" stroke-width="5"/><ellipse cx="92" cy="32" rx="67" ry="13" fill="#f9d998" opacity=".64"/><path d="M87 55v62M28 61v52M151 61v52" stroke="#6c432c" stroke-width="10" stroke-linecap="round"/><path d="M-4 60h49v65H17V82H-4Zm143 0h49v65h-28V82h-21Z" fill="#2f877b"/><g class="cafe-guest guest-a"><ellipse cx="30" cy="120" rx="22" ry="7" fill="#283d3b" opacity=".22"/><circle cx="30" cy="35" r="16" fill="#d9956d"/><path d="M12 87V52q18-15 37 0v35Z" fill="#f1a15d"/><path d="M20 24q11-13 23 0" fill="none" stroke="#49352f" stroke-width="8" stroke-linecap="round"/></g><g class="table-cup"><rect x="84" y="22" width="13" height="12" rx="3" fill="#fff0d6"/><ellipse cx="90.5" cy="23" rx="4" ry="1.6" fill="#9c5a38"/></g></g><g class="cafe-table table-right" transform="translate(430 286)"><ellipse cx="92" cy="34" rx="79" ry="22" fill="#efc177" stroke="#845331" stroke-width="5"/><ellipse cx="92" cy="29" rx="67" ry="13" fill="#f9d998" opacity=".64"/><path d="M87 52v62M28 58v52M151 58v52" stroke="#6c432c" stroke-width="10" stroke-linecap="round"/><path d="M-4 57h49v65H17V79H-4Zm143 0h49v65h-28V79h-21Z" fill="#2f877b"/><g class="cafe-guest guest-b"><ellipse cx="154" cy="117" rx="22" ry="7" fill="#283d3b" opacity=".22"/><circle cx="154" cy="32" r="16" fill="#9b694f"/><path d="M136 84V49q18-15 37 0v35Z" fill="#67a9c7"/><path d="M144 21q11-12 23 0" fill="none" stroke="#242c32" stroke-width="8" stroke-linecap="round"/></g><g class="table-cup"><rect x="86" y="19" width="13" height="12" rx="3" fill="#fff0d6"/><ellipse cx="92.5" cy="20" rx="4" ry="1.6" fill="#9c5a38"/></g></g></g>`)}

  ${show(safeStage,6,`<g class="scene-upgrade sign scene-depth-sign" filter="url(#sceneNearShadow)"><path class="sign-back" d="M286 43q104-35 208 0l-15 74H301Z" fill="#71452c" opacity=".32" transform="translate(5 7)"/><path d="M278 39q112-31 224 0l-18 70H296Z" fill="#f3c45d" stroke="#70472a" stroke-width="6"/><path d="M294 50q96-19 192 0" fill="none" stroke="#fff0a8" stroke-width="3" opacity=".62"/><text x="390" y="84" text-anchor="middle" font-family="Arial,sans-serif" font-size="39" font-weight="900" fill="#133e48" letter-spacing="4">POPLY</text><circle cx="310" cy="72" r="6" fill="#fff0b8"/><circle cx="470" cy="72" r="6" fill="#fff0b8"/><path d="M105 68 150 51l42 21 43-18 44 18M501 72l43-18 44 20 44-19 45 14" fill="none" stroke="#f3c45d" stroke-width="4"/><g class="cafe-flags"><path d="M151 52v30l19-11Z" fill="#f08a83"/><path d="M235 54v30l19-11Z" fill="#75c7ba"/><path d="M544 54v30l19-11Z" fill="#f08a83"/><path d="M632 55v30l19-11Z" fill="#75c7ba"/></g><g class="cafe-celebration-dots" fill="#fff1a7"><circle cx="118" cy="116" r="5"/><circle cx="657" cy="120" r="5"/><circle cx="102" cy="145" r="3"/><circle cx="683" cy="151" r="4"/><circle cx="373" cy="122" r="3"/><circle cx="408" cy="128" r="4"/></g></g>`)}

  <g class="scene-depth-foreground" pointer-events="none"><path d="M0 408c123-12 217-5 324 0 147 7 269-5 456-19v41H0Z" fill="#073743" opacity=".18"/></g>
  </svg>`;
}
