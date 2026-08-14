const svgData=svg=>`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const portrait=({skin,hair,shirt,accent,hairPath,detail=''})=>svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#173f4a"/><stop offset="1" stop-color="#0b2a35"/></linearGradient><linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shirt}"/><stop offset="1" stop-color="#173d46"/></linearGradient></defs><rect width="120" height="120" rx="30" fill="url(#bg)"/><circle cx="94" cy="24" r="20" fill="${accent}" opacity=".18"/><path d="M18 104c5-24 21-35 42-35s37 11 42 35v16H18z" fill="url(#shirt)"/><path d="M43 74c3 11 31 11 34 0l-2 19c-7 8-23 8-30 0z" fill="${skin}"/><ellipse cx="60" cy="51" rx="25" ry="29" fill="${skin}"/><path d="${hairPath}" fill="${hair}"/><ellipse cx="51" cy="52" rx="2.7" ry="3.2" fill="#173238"/><ellipse cx="70" cy="52" rx="2.7" ry="3.2" fill="#173238"/><path d="M53 64c5 4 10 4 15 0" fill="none" stroke="#9a5d55" stroke-width="2.5" stroke-linecap="round"/>${detail}<path d="M35 91c8 9 16 13 25 13s17-4 25-13" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="102" r="4" fill="#f5d887"/></svg>`);

export const CUSTOMER_ART=Object.freeze([
  portrait({skin:'#d79a78',hair:'#33292a',shirt:'#2f8b83',accent:'#f1c86b',hairPath:'M35 49c0-24 12-36 28-36 19 0 28 13 26 34-8-11-18-15-28-14-10 0-18 5-26 16z',detail:'<path d="M40 47c5-4 11-5 16-3M65 44c6-2 12-1 16 3" fill="none" stroke="#33292a" stroke-width="2.5" stroke-linecap="round"/>'}),
  portrait({skin:'#8e5f49',hair:'#171d25',shirt:'#315f82',accent:'#6ec9bc',hairPath:'M35 47c1-25 15-36 29-36 16 0 28 11 25 38-5-7-10-10-16-12-10-3-24 1-38 10z',detail:'<path d="M39 35c8-12 33-14 44 0" fill="none" stroke="#171d25" stroke-width="8" stroke-linecap="round"/><path d="M46 75c5 3 23 3 28 0" fill="none" stroke="#4e352f" stroke-width="3" stroke-linecap="round"/>'}),
  portrait({skin:'#efc2a4',hair:'#b56b42',shirt:'#8d5d7a',accent:'#efad76',hairPath:'M34 49c-1-17 8-34 27-37 19-3 31 11 29 35-8-8-15-14-22-19-8 9-20 15-34 21z',detail:'<path d="M82 26c8 4 12 12 12 24" fill="none" stroke="#b56b42" stroke-width="8" stroke-linecap="round"/><circle cx="80" cy="56" r="3" fill="#efad76"/>'})
]);

export function customerArtUrl(sequence=0){
  const index=Math.abs(Number(sequence)||0)%CUSTOMER_ART.length;
  return CUSTOMER_ART[index];
}
