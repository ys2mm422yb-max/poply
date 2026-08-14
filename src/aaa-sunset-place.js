const show=(stage,min,markup)=>stage>=min?markup:'';

export function sunsetPlaceSceneMarkup(stage=0){
  const safeStage=Math.max(0,Math.min(6,Number(stage)||0));
  return `<svg class="place-scene-svg sunset-place-svg" viewBox="0 0 780 430" role="img" aria-label="Sonnenkai – Ausbau ${safeStage} von 6" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#574f88"/><stop offset=".42" stop-color="#e57d78"/><stop offset=".73" stop-color="#f5b867"/><stop offset="1" stop-color="#ffd596"/></linearGradient>
    <linearGradient id="sunsetSea" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1d7890"/><stop offset=".55" stop-color="#15576d"/><stop offset="1" stop-color="#092f43"/></linearGradient>
    <linearGradient id="sunsetWood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d98c53"/><stop offset=".52" stop-color="#9b5439"/><stop offset="1" stop-color="#593229"/></linearGradient>
    <linearGradient id="sunsetGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#286a79"/><stop offset="1" stop-color="#0d3547"/></linearGradient>
    <radialGradient id="settingSun"><stop stop-color="#fff8c7"/><stop offset=".45" stop-color="#ffd26f"/><stop offset="1" stop-color="#f08a66" stop-opacity="0"/></radialGradient>
    <filter id="sunsetShadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#071f32" flood-opacity=".42"/></filter>
    <filter id="sunsetGlow" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="780" height="430" fill="url(#sunsetSky)"/>
  <circle cx="612" cy="122" r="88" fill="url(#settingSun)"/>
  <path d="M0 176c125-26 223 2 338-6 129-9 240-50 442-10v130H0Z" fill="url(#sunsetSea)"/>
  <path d="M0 205c125-8 226 18 344 5 143-16 263-34 436-11" fill="none" stroke="#f5c492" stroke-width="4" opacity=".45"/>
  <path d="M0 254c143-20 270-4 397-13 133-9 239-29 383-8v197H0Z" fill="#8e654d" opacity=".65"/>
  <path d="M0 300h780v130H0Z" fill="#7a452f"/>
  <path d="M0 322h780M0 355h780M0 390h780" stroke="#c8794c" stroke-width="5" opacity=".66"/>

  <g filter="url(#sunsetShadow)">
    <path d="M130 250 171 132h439l43 118Z" fill="#e8c28b" stroke="#6f4535" stroke-width="7"/>
    <path d="M151 138 191 90h402l42 48Z" fill="#173d4c" stroke="#092b3a" stroke-width="8"/>
    <rect x="176" y="157" width="168" height="75" rx="13" fill="url(#sunsetGlass)" stroke="#f2d69e" stroke-width="7"/>
    <rect x="432" y="157" width="168" height="75" rx="13" fill="url(#sunsetGlass)" stroke="#f2d69e" stroke-width="7"/>
    <rect x="350" y="149" width="75" height="101" rx="13" fill="url(#sunsetGlass)" stroke="#e9c17e" stroke-width="7"/>
    <circle cx="407" cy="201" r="6" fill="#f1b75e"/>
  </g>

  <g class="sunset-palms" opacity=".95">
    <path d="M84 307c7-54 15-83 32-111M697 309c-4-49 8-83 31-116" stroke="#355b4b" stroke-width="12" stroke-linecap="round"/>
    <path d="M109 202c-28-20-49-19-67-11 18 5 31 14 43 30M112 204c18-27 37-33 57-32-12 12-20 24-27 40M718 199c-26-21-48-21-66-13 18 7 31 17 42 31M720 199c16-26 34-34 55-34-11 13-19 25-25 41" fill="#2d7a61"/>
  </g>

  ${show(safeStage,1,`<g class="scene-upgrade sunset-lanterns"><path d="M164 132c101-22 211-20 320-5 56 8 100 8 139 3" fill="none" stroke="#6f503b" stroke-width="3"/><g fill="#ffd56c">${[180,245,310,375,440,505,570].map((x,i)=>`<circle cx="${x}" cy="${i%2?124:129}" r="7"/><circle cx="${x}" cy="${i%2?124:129}" r="19" fill="#ffd56c" opacity=".18" filter="url(#sunsetGlow)"/>`).join('')}</g></g>`)}
  ${show(safeStage,2,`<g class="scene-upgrade sunset-bar" filter="url(#sunsetShadow)"><path d="M180 220h173v61H180Z" fill="url(#sunsetWood)"/><path d="M170 214h193v15H170Z" fill="#f2c46d"/><rect x="198" y="235" width="42" height="28" rx="5" fill="#194b58"/><circle cx="219" cy="249" r="9" fill="#80c957"/><path d="M255 239h78M255 250h63M255 261h72" stroke="#f1d39a" stroke-width="5" stroke-linecap="round"/></g>`)}
  ${show(safeStage,3,`<g class="scene-upgrade sunset-lounge" filter="url(#sunsetShadow)"><g transform="translate(462 272)"><rect x="0" y="0" width="144" height="44" rx="16" fill="#245f66"/><rect x="12" y="-20" width="52" height="34" rx="13" fill="#e77b69"/><rect x="78" y="-18" width="52" height="32" rx="13" fill="#edb65c"/><ellipse cx="72" cy="48" rx="54" ry="10" fill="#522f28" opacity=".5"/></g></g>`)}
  ${show(safeStage,4,`<g class="scene-upgrade sunset-fire"><ellipse cx="174" cy="346" rx="76" ry="24" fill="#4a2c29" opacity=".68"/><circle cx="174" cy="334" r="34" fill="#633a31" stroke="#c27b4d" stroke-width="6"/><path d="M173 348c-20-19-9-37 3-52 21 17 26 36 8 53-4 4-8 4-11-1Z" fill="#ffca58"/><path d="M174 344c-8-11-4-21 3-29 10 10 11 20 3 30Z" fill="#ef704f"/><circle cx="174" cy="332" r="55" fill="#ffbd59" opacity=".11" filter="url(#sunsetGlow)"/></g>`)}
  ${show(safeStage,5,`<g class="scene-upgrade sunset-stage" filter="url(#sunsetShadow)"><path d="M468 315h192l-8 54H476Z" fill="#193b49"/><path d="M484 305h158" stroke="#efbd63" stroke-width="7" stroke-linecap="round"/><path d="M500 320v35M628 320v35" stroke="#5a3440" stroke-width="8"/><circle cx="530" cy="334" r="12" fill="#df796b"/><circle cx="594" cy="334" r="12" fill="#f1c15c"/><path d="M530 347v14M594 347v14" stroke="#e4d6bd" stroke-width="4"/></g>`)}
  ${show(safeStage,6,`<g class="scene-upgrade sunset-sign" filter="url(#sunsetShadow)"><path d="M282 89q107-31 216 0l-14 53H297Z" fill="#f1b95e" stroke="#68402e" stroke-width="6"/><text x="390" y="124" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="900" fill="#153e4b" letter-spacing="3">SONNENKAI</text><circle cx="313" cy="112" r="5" fill="#fff1ba"/><circle cx="466" cy="112" r="5" fill="#fff1ba"/></g>`)}

  <g opacity=".28"><path d="M0 402c119-34 205 3 306-6 130-12 210-38 318-26 70 8 112 24 166 18v42H0Z" fill="#061e31"/></g>
  </svg>`;
}
