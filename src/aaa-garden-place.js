const show=(stage,min,markup)=>stage>=min?markup:'';

export function gardenPlaceSceneMarkup(stage=0){
  const safeStage=Math.max(0,Math.min(6,Number(stage)||0));
  return `<svg class="place-scene-svg garden-place-svg" viewBox="0 0 780 430" role="img" aria-label="Dachgarten – Ausbau ${safeStage} von 6" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gardenSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#78c9e8"/><stop offset=".56" stop-color="#cfeee1"/><stop offset="1" stop-color="#f7e8bc"/></linearGradient>
    <linearGradient id="gardenGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dff6ee" stop-opacity=".92"/><stop offset=".55" stop-color="#9ed9c5" stop-opacity=".72"/><stop offset="1" stop-color="#65a998" stop-opacity=".76"/></linearGradient>
    <linearGradient id="gardenWood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d9a36c"/><stop offset="1" stop-color="#8a5942"/></linearGradient>
    <linearGradient id="gardenLeaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9bd56e"/><stop offset="1" stop-color="#3f8e62"/></linearGradient>
    <filter id="gardenShadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#244e4a" flood-opacity=".28"/></filter>
    <filter id="gardenGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>
  </defs>
  <rect width="780" height="430" fill="url(#gardenSky)"/>
  <circle cx="646" cy="80" r="46" fill="#fff2a6" opacity=".86"/><circle cx="646" cy="80" r="78" fill="#fff1a0" opacity=".16" filter="url(#gardenGlow)"/>
  <g opacity=".34" fill="#5e8f98"><path d="M0 226h74v-52h38v52h88v-88h53v88h84v-67h47v67h74v-105h61v105h83v-58h38v58h94v204H0Z"/></g>
  <path d="M0 285h780v145H0Z" fill="#776c5c"/><path d="M0 307h780M0 351h780M0 395h780" stroke="#a99b7e" stroke-width="4" opacity=".58"/>
  <path d="M45 284h690l-28 119H70Z" fill="#708276" stroke="#425e55" stroke-width="7"/>

  <g class="garden-construction-base" opacity=".92">
    <path d="M230 258h332" stroke="#42685f" stroke-width="9" stroke-linecap="round"/>
    <path d="M247 250V154m298 96v-96M247 154l68-48h162l68 48" fill="none" stroke="#557b70" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="13 11" opacity=".72"/>
    <g transform="translate(316 235)" filter="url(#gardenShadow)"><rect width="150" height="24" rx="7" fill="#a98563"/><rect x="13" y="-16" width="124" height="17" rx="5" fill="#d7bc8c"/><path d="M27-16v17M61-16v17M95-16v17" stroke="#9b7b5e" stroke-width="3"/></g>
    <circle cx="260" cy="265" r="7" fill="#e0c76f"/><circle cx="532" cy="265" r="7" fill="#e0c76f"/>
  </g>

  <g opacity=".92"><path d="M96 286c2-35 12-59 31-72 14 16 17 39 9 71M662 287c-3-33 8-57 28-74 15 17 17 41 8 73" fill="url(#gardenLeaf)"/><path d="M112 284c-27-28-43-32-62-28 21 10 34 25 42 46M683 284c27-27 43-31 61-27-20 10-33 24-41 45" fill="#4f9d67"/></g>

  ${show(safeStage,1,`<g class="scene-upgrade garden-glass garden-greenhouse-built" filter="url(#gardenShadow)"><path d="M217 258V126l83-58h203l72 58v132Z" fill="url(#gardenGlass)" stroke="#457b70" stroke-width="8"/><path d="M300 68v190M503 68v190M219 127h354M259 97l41 30m203-59-1 190M503 98l70 29" fill="none" stroke="#5b9b89" stroke-width="5" opacity=".88"/><rect x="349" y="166" width="76" height="92" rx="9" fill="#558b77" stroke="#dff0dc" stroke-width="6"/><circle cx="410" cy="211" r="5" fill="#f3d575"/><path d="M228 131 301 80h197l65 51" fill="none" stroke="#ecfff8" stroke-width="8" opacity=".72"/><path d="M316 85v164M486 84v164" stroke="#c8efe3" stroke-width="4" opacity=".82"/><circle cx="534" cy="111" r="8" fill="#f4d86f"/></g>`)}
  ${show(safeStage,2,`<g class="scene-upgrade garden-beds" filter="url(#gardenShadow)"><g transform="translate(112 282)"><path d="M0 0h168l-15 58H17Z" fill="url(#gardenWood)"/><path d="M12 4h144l-8 13H20Z" fill="#5d4f3a"/><g fill="#70bd68"><circle cx="42" cy="1" r="16"/><circle cx="76" cy="-4" r="19"/><circle cx="111" cy="2" r="17"/><circle cx="139" cy="-3" r="14"/></g><g fill="#d898bd"><circle cx="57" cy="-8" r="5"/><circle cx="124" cy="-7" r="5"/></g></g></g>`)}
  ${show(safeStage,3,`<g class="scene-upgrade garden-bar" filter="url(#gardenShadow)"><path d="M482 273h170v65H482Z" fill="url(#gardenWood)"/><path d="M471 268h192v16H471Z" fill="#f3d783"/><rect x="502" y="291" width="44" height="30" rx="6" fill="#3e7868"/><path d="M564 295h70M564 307h58M564 319h66" stroke="#f0e2b6" stroke-width="5" stroke-linecap="round"/><circle cx="523" cy="306" r="9" fill="#8ed873"/></g>`)}
  ${show(safeStage,4,`<g class="scene-upgrade garden-seating" filter="url(#gardenShadow)"><rect x="302" y="303" width="148" height="42" rx="16" fill="#4b8170"/><rect x="317" y="282" width="50" height="34" rx="13" fill="#e1a2c2"/><rect x="382" y="284" width="52" height="32" rx="13" fill="#f0cb70"/><ellipse cx="376" cy="351" rx="62" ry="10" fill="#334f47" opacity=".34"/></g>`)}
  ${show(safeStage,5,`<g class="scene-upgrade garden-lights"><path d="M118 243c117-47 252-54 383-31 63 11 119 14 171-6" fill="none" stroke="#58735f" stroke-width="3"/><g fill="#ffe68a">${[145,220,300,382,466,548,625].map((x,i)=>`<circle cx="${x}" cy="${i%2?218:225}" r="6"/><circle cx="${x}" cy="${i%2?218:225}" r="16" fill="#ffe68a" opacity=".17" filter="url(#gardenGlow)"/>`).join('')}</g></g>`)}
  ${show(safeStage,6,`<g class="scene-upgrade garden-sign" filter="url(#gardenShadow)"><path d="M306 70q91-25 183 0l-11 52H317Z" fill="#f4dc83" stroke="#4d735c" stroke-width="6"/><text x="398" y="104" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" font-weight="900" fill="#356452" letter-spacing="2.5">DACHGARTEN</text><path d="M333 112c8-13 18-16 29-10-8 12-17 16-29 10Zm127 0c-8-13-18-16-29-10 8 12 17 16 29 10Z" fill="#73b968"/></g>`)}

  <g opacity=".18"><path d="M0 405c117-34 224-2 332-9 137-9 224-28 343-13 48 6 74 10 105 7v40H0Z" fill="#173f3d"/></g>
  </svg>`;
}
