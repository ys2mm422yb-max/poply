const show=(stage,min,markup)=>stage>=min?markup:'';

export function gardenPlaceSceneMarkup(stage=0){
  const safeStage=Math.max(0,Math.min(6,Number(stage)||0));
  return `<svg class="place-scene-svg garden-place-svg" viewBox="0 0 780 430" role="img" aria-label="Dachgarten – Ausbau ${safeStage} von 6" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gardenSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#54bde2"/><stop offset=".48" stop-color="#bfe9df"/><stop offset="1" stop-color="#f4deb0"/></linearGradient>
    <linearGradient id="gardenHaze" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#8fc8c5" stop-opacity=".08"/><stop offset=".5" stop-color="#e8f3d6" stop-opacity=".46"/><stop offset="1" stop-color="#8fc8c5" stop-opacity=".08"/></linearGradient>
    <linearGradient id="gardenGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#edfff8" stop-opacity=".86"/><stop offset=".28" stop-color="#b8eadc" stop-opacity=".6"/><stop offset=".7" stop-color="#74bea9" stop-opacity=".58"/><stop offset="1" stop-color="#3e8277" stop-opacity=".72"/></linearGradient>
    <linearGradient id="gardenGlassRoof" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7fff8" stop-opacity=".92"/><stop offset=".58" stop-color="#b7ead8" stop-opacity=".62"/><stop offset="1" stop-color="#6cb49e" stop-opacity=".5"/></linearGradient>
    <linearGradient id="gardenWood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e2ae71"/><stop offset=".5" stop-color="#b77a4f"/><stop offset="1" stop-color="#754938"/></linearGradient>
    <linearGradient id="gardenLeaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a8dd6b"/><stop offset=".52" stop-color="#5eae68"/><stop offset="1" stop-color="#2e7757"/></linearGradient>
    <linearGradient id="gardenRoof" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7f9186"/><stop offset=".6" stop-color="#61756d"/><stop offset="1" stop-color="#405a55"/></linearGradient>
    <linearGradient id="gardenParapet" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#87988b"/><stop offset="1" stop-color="#50675e"/></linearGradient>
    <pattern id="gardenRoofLines" width="40" height="22" patternUnits="userSpaceOnUse"><path d="M0 21h40M39 0v22" stroke="#dce1cd" stroke-opacity=".09" stroke-width="2"/></pattern>
    <radialGradient id="gardenSun"><stop stop-color="#fffbd2" stop-opacity=".96"/><stop offset=".42" stop-color="#ffe97c" stop-opacity=".7"/><stop offset="1" stop-color="#ffe37a" stop-opacity="0"/></radialGradient>
    <filter id="gardenShadow" x="-35%" y="-35%" width="170%" height="190%"><feDropShadow dx="0" dy="11" stdDeviation="10" flood-color="#163f3d" flood-opacity=".34"/></filter>
    <filter id="gardenSoftShadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#173c39" flood-opacity=".24"/></filter>
    <filter id="gardenGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>

  <rect width="780" height="430" fill="url(#gardenSky)"/>
  <rect y="94" width="780" height="100" fill="url(#gardenHaze)"/>
  <circle cx="646" cy="76" r="94" fill="url(#gardenSun)"/>
  <g class="garden-clouds" fill="#f5fff6" opacity=".42">
    <path d="M65 83c16-21 37-19 48-4 14-26 49-18 54 7 22-4 36 8 37 24H44c0-15 8-24 21-27Z"/>
    <path d="M510 45c12-16 31-14 40-2 11-20 36-14 40 6 17-3 29 7 29 19H494c0-11 6-19 16-23Z" opacity=".72"/>
  </g>

  <g class="garden-skyline garden-skyline-back" fill="#5f9297" opacity=".22">
    <path d="M0 213h47v-45h28v45h62v-72h37v72h49v-104h52v104h55v-54h36v54h54v-92h45v92h48v-66h36v66h67v-109h50v109h48v-56h29v56h57v67H0Z"/>
  </g>
  <g class="garden-skyline garden-skyline-front" fill="#3f7477" opacity=".26">
    <path d="M0 231h72v-64h40v64h90v-48h38v48h96v-79h54v79h73v-52h42v52h86v-68h44v68h96v-47h39v47h72v52H0Z"/>
    <g fill="#e6f4cf" opacity=".28">${[92,107,218,354,371,482,599,617,702].map((x,i)=>`<rect x="${x}" y="${i%3===0?192:206}" width="7" height="10" rx="1"/>`).join('')}</g>
  </g>

  <path d="M0 270h780v160H0Z" fill="#695f54"/>
  <path d="M0 291h780v139H0Z" fill="url(#gardenRoof)"/>
  <rect y="291" width="780" height="139" fill="url(#gardenRoofLines)"/>
  <path d="M0 292h780" stroke="#bec3a8" stroke-width="4" opacity=".25"/>
  <path d="M40 274h700l-25 129H65Z" fill="url(#gardenParapet)" stroke="#36574f" stroke-width="7"/>
  <path d="M54 286h672" stroke="#d6d8b9" stroke-width="3" opacity=".32"/>
  <path d="M70 402h645" stroke="#263f3b" stroke-width="7" opacity=".46"/>

  <g class="garden-construction-base" opacity=".98">
    <path d="M226 256h340" stroke="#345f57" stroke-width="10" stroke-linecap="round"/>
    <path d="M244 249V151m304 98v-98M244 151l70-51h167l67 51" fill="none" stroke="#507c70" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="14 11" opacity=".78"/>
    <path d="M260 258h272" stroke="#d5c377" stroke-width="3" stroke-dasharray="6 9" opacity=".8"/>
    <g transform="translate(313 232)" filter="url(#gardenSoftShadow)">
      <rect width="158" height="27" rx="7" fill="#987458"/>
      <rect x="12" y="-17" width="133" height="19" rx="5" fill="#d5b786"/>
      <path d="M25-17v19M58-17v19M91-17v19M124-17v19" stroke="#957358" stroke-width="3"/>
      <rect x="-35" y="4" width="27" height="21" rx="4" fill="#bb8f62"/><path d="M-31 9h19M-29 14h15" stroke="#e3c99b" stroke-width="2"/>
      <path d="M178-2v27m-8-20h17" stroke="#d8b969" stroke-width="5" stroke-linecap="round"/><path d="M175 25h8" stroke="#765240" stroke-width="6" stroke-linecap="round"/>
    </g>
    <g class="garden-planters-muted" opacity=".7"><rect x="99" y="260" width="88" height="26" rx="8" fill="#6a6958"/><rect x="592" y="260" width="88" height="26" rx="8" fill="#6a6958"/></g>
    <circle cx="259" cy="263" r="7" fill="#e1c86d"/><circle cx="535" cy="263" r="7" fill="#e1c86d"/>
  </g>

  <g class="garden-edge-plants" opacity=".96">
    <g transform="translate(79 249)"><path d="M21 39C10 10 21-9 38-22c10 24 3 45-17 61Z" fill="url(#gardenLeaf)"/><path d="M22 39C-1 12-18 10-34 17c21 9 34 23 43 42" fill="#4d9f66"/><path d="M28 34c14-23 31-29 49-26-15 11-24 24-29 39" fill="#78c36c"/></g>
    <g transform="translate(676 250) scale(-1 1)"><path d="M21 39C10 10 21-9 38-22c10 24 3 45-17 61Z" fill="url(#gardenLeaf)"/><path d="M22 39C-1 12-18 10-34 17c21 9 34 23 43 42" fill="#4d9f66"/><path d="M28 34c14-23 31-29 49-26-15 11-24 24-29 39" fill="#78c36c"/></g>
  </g>

  ${show(safeStage,1,`<g class="scene-upgrade garden-glass garden-greenhouse-built" filter="url(#gardenShadow)">
    <path d="M210 258V129l86-65h211l70 65v129Z" fill="url(#gardenGlass)" stroke="#326e66" stroke-width="8"/>
    <path d="M210 129 296 64h211l70 65Z" fill="url(#gardenGlassRoof)" stroke="#3d7a70" stroke-width="7"/>
    <path d="M296 64v194M507 64v194M211 130h365M258 100l38 29m211-64v193M507 100l69 29" fill="none" stroke="#4a8d7e" stroke-width="5" opacity=".9"/>
    <path d="M225 137h337M229 166h329" stroke="#ecfff6" stroke-width="3" opacity=".28"/>
    <path class="garden-glass-shimmer" d="M237 124 315 72h75L294 254h-61Z" fill="#ffffff" opacity=".16"/>
    <path class="garden-glass-shimmer shimmer-two" d="M463 70h35l-58 184h-58Z" fill="#dfffee" opacity=".12"/>
    <rect x="347" y="161" width="82" height="97" rx="10" fill="#4f8876" stroke="#e9f5dc" stroke-width="6"/>
    <rect x="358" y="173" width="59" height="73" rx="6" fill="#356d65" opacity=".38"/>
    <circle cx="412" cy="210" r="5" fill="#f2d36d"/>
    <g opacity=".42"><path d="M251 232h73M463 232h77" stroke="#80614b" stroke-width="7"/><path d="M268 231v-20m33 20v-25m178 25v-21m35 21v-27" stroke="#4d825f" stroke-width="7" stroke-linecap="round"/></g>
    <path d="M225 131 299 76h198l66 55" fill="none" stroke="#f4fff9" stroke-width="8" opacity=".64"/>
    <circle cx="534" cy="108" r="8" fill="#f3d66d"/>
  </g>`)}
  ${show(safeStage,2,`<g class="scene-upgrade garden-beds" filter="url(#gardenSoftShadow)">
    <g transform="translate(92 280)"><path d="M0 0h184l-15 61H17Z" fill="url(#gardenWood)"/><path d="M12 4h158l-9 14H21Z" fill="#594c37"/><g class="garden-bed-leaves" fill="#72be69"><circle cx="42" cy="0" r="16"/><circle cx="77" cy="-6" r="20"/><circle cx="115" cy="1" r="18"/><circle cx="148" cy="-4" r="15"/></g><g fill="#dc91bd"><circle cx="57" cy="-9" r="5"/><circle cx="126" cy="-8" r="5"/></g><g fill="#f0d56c"><circle cx="91" cy="-9" r="4"/><circle cx="158" cy="-9" r="4"/></g></g>
    <g transform="translate(512 293) scale(.72)"><path d="M0 0h184l-15 61H17Z" fill="url(#gardenWood)"/><path d="M12 4h158l-9 14H21Z" fill="#594c37"/><g class="garden-bed-leaves" fill="#63af64"><circle cx="42" cy="0" r="16"/><circle cx="77" cy="-6" r="20"/><circle cx="115" cy="1" r="18"/><circle cx="148" cy="-4" r="15"/></g></g>
  </g>`)}
  ${show(safeStage,3,`<g class="scene-upgrade garden-bar" filter="url(#gardenShadow)"><path d="M475 270h182v69H475Z" fill="url(#gardenWood)"/><path d="M463 264h205v17H463Z" fill="#f3d783"/><rect x="495" y="289" width="48" height="32" rx="6" fill="#3e7868"/><path d="M563 293h77M563 306h64M563 319h72" stroke="#f0e2b6" stroke-width="5" stroke-linecap="round"/><circle cx="519" cy="305" r="10" fill="#8ed873"/><g fill="#f8e58b"><rect x="548" y="277" width="10" height="20" rx="4"/><rect x="565" y="274" width="10" height="23" rx="4"/></g></g>`)}
  ${show(safeStage,4,`<g class="scene-upgrade garden-seating" filter="url(#gardenSoftShadow)"><rect x="296" y="304" width="160" height="44" rx="17" fill="#477b6c"/><rect x="311" y="282" width="52" height="35" rx="13" fill="#dd98bb"/><rect x="379" y="284" width="55" height="33" rx="13" fill="#f0cb70"/><ellipse cx="377" cy="351" rx="68" ry="11" fill="#263f3b" opacity=".3"/><ellipse cx="365" cy="294" rx="24" ry="7" fill="#d8ba77"/><path d="M365 299v27" stroke="#795a42" stroke-width="6"/></g>`)}
  ${show(safeStage,5,`<g class="scene-upgrade garden-lights"><path d="M102 237c121-46 260-53 394-31 69 12 128 13 181-8" fill="none" stroke="#526e5a" stroke-width="3"/><g fill="#ffe78c">${[132,208,288,370,454,540,626].map((x,i)=>`<circle class="garden-lamp" cx="${x}" cy="${i%2?212:220}" r="6"/><circle cx="${x}" cy="${i%2?212:220}" r="18" fill="#ffe78c" opacity=".18" filter="url(#gardenGlow)"/>`).join('')}</g></g>`)}
  ${show(safeStage,6,`<g class="scene-upgrade garden-sign" filter="url(#gardenShadow)"><path d="M300 66q98-28 196 0l-12 55H313Z" fill="#f4dc83" stroke="#416d58" stroke-width="6"/><text x="398" y="101" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="900" fill="#315d4d" letter-spacing="2.5">DACHGARTEN</text><path d="M329 111c9-14 20-17 32-10-9 13-19 17-32 10Zm134 0c-9-14-20-17-32-10 9 13 19 17 32 10Z" fill="#73b968"/></g>`)}

  <g class="garden-foreground" opacity=".22"><path d="M0 405c116-35 223-3 333-10 139-9 229-28 347-13 46 6 72 10 100 7v41H0Z" fill="#123a38"/></g>
  </svg>`;
}
