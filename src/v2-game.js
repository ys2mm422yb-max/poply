export const BOARD_COLS = 7;
export const BOARD_ROWS = 7;
export const BOARD_SIZE = BOARD_COLS * BOARD_ROWS;
export const SAVE_VERSION = 2;

export const ITEM_FAMILIES = {
  coffee: {
    key: 'coffee', label: 'Getränke',
    stages: ['Kaffeebohnen', 'Kaffeetasse', 'Eiskaffee', 'Poply Mocha', 'Küsten-Mokka', 'Goldene Kanne'],
    art: ['coffee-1','coffee-2','coffee-3','coffee-4','coffee-5','coffee-6'],
  },
  bakery: {
    key: 'bakery', label: 'Backwaren',
    stages: ['Weizen', 'Mehl', 'Teig', 'Croissant', 'Küstenbrot', 'Poply Backkorb'],
    art: ['bakery-1','bakery-2','bakery-3','bakery-4','bakery-5','bakery-6'],
  },
  sweet: {
    key: 'sweet', label: 'Süßes',
    stages: ['Milch', 'Zucker', 'Creme', 'Muffin', 'Meer-Sundae', 'Poply Festtorte'],
    art: ['sweet-1','sweet-2','sweet-3','sweet-4','sweet-5','sweet-6'],
  },
  fruit: {
    key: 'fruit', label: 'Sonnenfrüchte',
    stages: ['Limette', 'Fruchtmix', 'Smoothie', 'Tropen-Drink', 'Sunset-Bowl', 'Poply Paradise'],
    art: ['fruit-1','fruit-2','fruit-3','fruit-4','fruit-5','fruit-6'],
  },
  herb: {
    key: 'herb', label: 'Dachgarten',
    stages: ['Minze', 'Kräuterbund', 'Kräutersirup', 'Garten-Spritz', 'Blüten-Glas', 'Poply Gartenfest'],
    art: ['herb-1','herb-2','herb-3','herb-4','herb-5','herb-6'],
  },
};

export const GENERATORS = {
  'coffee-gen': { key: 'coffee-gen', label: 'Kaffeemaschine', art: 'generator-coffee', families: ['coffee'], energyCost: 1 },
  'pantry-gen': { key: 'pantry-gen', label: 'Vorratskiste', art: 'generator-pantry', families: ['bakery','sweet'], energyCost: 1 },
  'sunset-gen': { key: 'sunset-gen', label: 'Tropenbar', art: 'generator-sunset', families: ['fruit'], energyCost: 1 },
  'garden-gen': { key: 'garden-gen', label: 'Gewächshaus', art: 'generator-garden', families: ['herb'], energyCost: 1, bonusEvery: 4, bonusLevel: 2, bonusLabel: 'Erntebonus' },
};

export const PLACE_01_UPGRADES = [
  { id: 'lights', label: 'Lichter', cost: 4, copy: 'Warme Lichter machen das Café abends sichtbar und einladend.' },
  { id: 'counter', label: 'Neue Theke', cost: 6, copy: 'Die alte Theke wird zum Herzstück des Cafés.' },
  { id: 'menu', label: 'Menüwand', cost: 7, copy: 'Eine neue Menüwand zeigt Gästen, was Poply besonders macht.' },
  { id: 'seating', label: 'Sitzecke', cost: 9, copy: 'Bequeme Plätze machen aus Laufkundschaft Stammgäste.' },
  { id: 'terrace', label: 'Meerterrasse', cost: 11, copy: 'Die Terrasse öffnet das Café zum Meer.' },
  { id: 'sign', label: 'Poply-Schild', cost: 14, copy: 'Das neue Schild vollendet den ersten Poply Place.' },
];

export const PLACE_02_UPGRADES = [
  { id: 'sunset-lanterns', label: 'Lampions', cost: 8, copy: 'Warme Lampions geben dem Sonnenkai seine Abendstimmung.' },
  { id: 'sunset-bar', label: 'Saftbar', cost: 10, copy: 'Die Tropenbar bekommt ihren festen Platz direkt am Deck.' },
  { id: 'sunset-lounge', label: 'Lounge', cost: 12, copy: 'Tiefe Sitzplätze machen aus einem Drink einen langen Abend.' },
  { id: 'sunset-fire', label: 'Feuerstelle', cost: 14, copy: 'Die Feuerstelle wird zum Treffpunkt nach Sonnenuntergang.' },
  { id: 'sunset-stage', label: 'Abendbühne', cost: 16, copy: 'Musik bringt Leben auf den Kai und neue Gäste an der Bar.' },
  { id: 'sunset-sign', label: 'Sonnenkai-Schild', cost: 18, copy: 'Das leuchtende Schild vollendet deinen zweiten Poply Place.' },
];

export const PLACE_03_UPGRADES = [
  { id: 'garden-glass', label: 'Glasdach', cost: 12, copy: 'Ein helles Glasdach macht aus der leeren Dachfläche ein echtes Gewächshaus.' },
  { id: 'garden-beds', label: 'Pflanzbeete', cost: 14, copy: 'Neue Beete bringen Minze, Kräuter und Blüten mitten in die Stadt.' },
  { id: 'garden-bar', label: 'Gartenbar', cost: 16, copy: 'Die Gartenbar macht die frische Ernte direkt für Gäste erlebbar.' },
  { id: 'garden-seating', label: 'Sitzinseln', cost: 18, copy: 'Grüne Sitzinseln geben dem Dachgarten ruhige Plätze zwischen den Beeten.' },
  { id: 'garden-lights', label: 'Lichterbogen', cost: 21, copy: 'Ein heller Lichterbogen hält den Dachgarten auch nach Sonnenuntergang lebendig.' },
  { id: 'garden-sign', label: 'Dachgarten-Schild', cost: 24, copy: 'Das neue Schild vollendet Poplys ersten Garten über den Dächern.' },
];

export const PLACE_CHAPTERS = [
  { id:'coast', number:1, label:'Café am Meer', kicker:'KÜSTE', upgrades:PLACE_01_UPGRADES },
  { id:'sunset', number:2, label:'Sonnenkai', kicker:'ABENDKÜSTE', upgrades:PLACE_02_UPGRADES },
  { id:'garden', number:3, label:'Dachgarten', kicker:'STADTGARTEN', upgrades:PLACE_03_UPGRADES },
];
export const PLACE_UPGRADES = [...PLACE_01_UPGRADES, ...PLACE_02_UPGRADES, ...PLACE_03_UPGRADES];

const COAST_ORDER_TEMPLATES = [
  { title:'Morgenkaffee', requirements:[{family:'coffee',level:2,qty:1}], rewards:{coins:45,stars:2} },
  { title:'Frisches Gebäck', requirements:[{family:'bakery',level:2,qty:1}], rewards:{coins:50,stars:2} },
  { title:'Kleine Pause', requirements:[{family:'sweet',level:2,qty:1}], rewards:{coins:55,stars:2} },
  { title:'Eiskaffee-Date', requirements:[{family:'coffee',level:3,qty:1},{family:'bakery',level:2,qty:1}], rewards:{coins:85,stars:3} },
  { title:'Croissant & Kaffee', requirements:[{family:'bakery',level:4,qty:1},{family:'coffee',level:2,qty:1}], rewards:{coins:120,stars:4} },
  { title:'Süßer Nachmittag', requirements:[{family:'sweet',level:4,qty:1},{family:'coffee',level:3,qty:1}], rewards:{coins:145,stars:5} },
  { title:'Küsten-Brunch', requirements:[{family:'bakery',level:5,qty:1},{family:'coffee',level:4,qty:1}], rewards:{coins:210,stars:6} },
  { title:'Sonnenuntergang', requirements:[{family:'sweet',level:5,qty:1},{family:'coffee',level:5,qty:1}], rewards:{coins:275,stars:7} },
  { title:'Poply Festtafel', requirements:[{family:'bakery',level:6,qty:1},{family:'sweet',level:6,qty:1}], rewards:{coins:420,stars:9} },
];

const SUNSET_ORDER_TEMPLATES = [
  { title:'Limettenpause', requirements:[{family:'fruit',level:2,qty:1}], rewards:{coins:80,stars:3} },
  { title:'Sunset Smoothie', requirements:[{family:'fruit',level:3,qty:1},{family:'sweet',level:2,qty:1}], rewards:{coins:130,stars:4} },
  { title:'Deck-Brunch', requirements:[{family:'fruit',level:4,qty:1},{family:'bakery',level:3,qty:1}], rewards:{coins:175,stars:5} },
  { title:'Tropenabend', requirements:[{family:'fruit',level:4,qty:1},{family:'coffee',level:4,qty:1}], rewards:{coins:220,stars:6} },
  { title:'Golden Hour', requirements:[{family:'fruit',level:5,qty:1},{family:'sweet',level:4,qty:1}], rewards:{coins:300,stars:7} },
  { title:'Poply Paradise', requirements:[{family:'fruit',level:6,qty:1},{family:'coffee',level:5,qty:1},{family:'bakery',level:4,qty:1}], rewards:{coins:520,stars:10} },
];

const GARDEN_ORDER_TEMPLATES = [
  { title:'Minzgruß', requirements:[{family:'herb',level:2,qty:1}], rewards:{coins:105,stars:3} },
  { title:'Grüne Pause', requirements:[{family:'herb',level:3,qty:1},{family:'bakery',level:2,qty:1}], rewards:{coins:160,stars:4} },
  { title:'Dachgarten-Spritz', requirements:[{family:'herb',level:4,qty:1},{family:'fruit',level:2,qty:1}], rewards:{coins:220,stars:5} },
  { title:'Blütenkaffee', requirements:[{family:'herb',level:4,qty:1},{family:'coffee',level:4,qty:1}], rewards:{coins:285,stars:6} },
  { title:'Gartenabend', requirements:[{family:'herb',level:5,qty:1},{family:'sweet',level:4,qty:1}], rewards:{coins:380,stars:8} },
  { title:'Poply Gartenfest', requirements:[{family:'herb',level:6,qty:1},{family:'fruit',level:5,qty:1},{family:'bakery',level:4,qty:1}], rewards:{coins:620,stars:11} },
];

const ORDER_TEMPLATES = { coast:COAST_ORDER_TEMPLATES, sunset:SUNSET_ORDER_TEMPLATES, garden:GARDEN_ORDER_TEMPLATES };
const ORDER_DIFFICULTY_BANDS = {
  coast:[
    {key:'starter',minCompleted:0,maxCompleted:1,indexes:[0,1,2]},
    {key:'growing',minCompleted:2,maxCompleted:3,indexes:[1,2,3,4,5]},
    {key:'established',minCompleted:4,maxCompleted:6,indexes:[3,4,5,6,7,8]},
  ],
  sunset:[
    {key:'starter',minCompleted:0,maxCompleted:1,indexes:[0,1]},
    {key:'growing',minCompleted:2,maxCompleted:3,indexes:[1,2,3]},
    {key:'established',minCompleted:4,maxCompleted:6,indexes:[2,3,4,5]},
  ],
  garden:[
    {key:'starter',minCompleted:0,maxCompleted:1,indexes:[0,1]},
    {key:'growing',minCompleted:2,maxCompleted:3,indexes:[1,2,3]},
    {key:'established',minCompleted:4,maxCompleted:6,indexes:[2,3,4,5]},
  ],
};

const clone = value => structuredClone(value);
function nextId(state,prefix='item'){ state.nextId += 1; return `${prefix}-${state.nextId}`; }
const completedUpgradeCount=(state,upgrades)=>upgrades.reduce((count,upgrade)=>count+(state.placeUpgrades.includes(upgrade.id)?1:0),0);

export function isPlace01Complete(state){ return PLACE_01_UPGRADES.every(upgrade=>state.placeUpgrades.includes(upgrade.id)); }
export function isPlace02Complete(state){ return PLACE_02_UPGRADES.every(upgrade=>state.placeUpgrades.includes(upgrade.id)); }
export function isPlace03Complete(state){ return PLACE_03_UPGRADES.every(upgrade=>state.placeUpgrades.includes(upgrade.id)); }
export function activePlaceChapter(state){
  if(!isPlace01Complete(state))return PLACE_CHAPTERS[0];
  if(!isPlace02Complete(state))return PLACE_CHAPTERS[1];
  return PLACE_CHAPTERS[2];
}
export function currentChapterProgress(state){
  const chapter=activePlaceChapter(state);
  return {chapter,completed:completedUpgradeCount(state,chapter.upgrades),total:chapter.upgrades.length};
}

export function makeItem(family,level,id){
  const def=ITEM_FAMILIES[family];
  if(!def) throw new Error(`Unknown family: ${family}`);
  if(!Number.isInteger(level)||level<1||level>def.stages.length) throw new Error(`Invalid level ${level} for ${family}`);
  return {id,kind:'item',family,level};
}
export function makeGenerator(generator,id,taps=0){ if(!GENERATORS[generator]) throw new Error(`Unknown generator: ${generator}`); return {id,kind:'generator',generator,taps}; }
export function itemDefinition(item){
  if(!item) return null;
  if(item.kind==='generator'){ const def=GENERATORS[item.generator]; return {...def,name:def.label,maxLevel:1}; }
  const def=ITEM_FAMILIES[item.family];
  return {...def,name:def.stages[item.level-1],art:def.art[item.level-1],maxLevel:def.stages.length};
}
export function generatorProductionStatus(generator){
  if(!generator||generator.kind!=='generator')return null;
  const def=GENERATORS[generator.generator];
  if(!def?.bonusEvery)return null;
  const progress=((Number(generator.taps)||0)%def.bonusEvery+def.bonusEvery)%def.bonusEvery;
  const nextStep=progress+1;
  return {progress,total:def.bonusEvery,nextStep,bonusNext:nextStep===def.bonusEvery,bonusLevel:def.bonusLevel||2,label:def.bonusLabel||'Bonus'};
}
export function createOrder(sequence,chapterId='coast'){
  const templates=ORDER_TEMPLATES[chapterId]??COAST_ORDER_TEMPLATES;
  const template=templates[sequence%templates.length];
  return {id:`order-${sequence}`,sequence,chapter:chapterId,title:template.title,requirements:clone(template.requirements),rewards:{...template.rewards}};
}

export function orderDifficultyBand(state,chapterId=activePlaceChapter(state).id){
  const chapter=PLACE_CHAPTERS.find(entry=>entry.id===chapterId)??PLACE_CHAPTERS[0];
  const completed=completedUpgradeCount(state,chapter.upgrades);
  const bands=ORDER_DIFFICULTY_BANDS[chapter.id]??ORDER_DIFFICULTY_BANDS.coast;
  return bands.find(band=>completed>=band.minCompleted&&completed<=band.maxCompleted)??bands[bands.length-1];
}

export function createProgressionOrder(state,sequence=state.orderSequence,chapterId=activePlaceChapter(state).id){
  const templates=ORDER_TEMPLATES[chapterId]??COAST_ORDER_TEMPLATES;
  const band=orderDifficultyBand(state,chapterId);
  const index=band.indexes[sequence%band.indexes.length];
  const template=templates[index];
  return {id:`order-${sequence}`,sequence,chapter:chapterId,difficulty:band.key,title:template.title,requirements:clone(template.requirements),rewards:{...template.rewards}};
}

export function createInitialState(){
  const state={version:SAVE_VERSION,nextId:20,board:Array(BOARD_SIZE).fill(null),energy:40,maxEnergy:40,coins:100,stars:0,placeUpgrades:[],currentOrders:[createOrder(0),createOrder(1),createOrder(2)],orderSequence:3,stats:{merges:0,generated:0,orders:0},updatedAt:Date.now()};
  state.board[0]=makeGenerator('coffee-gen','generator-coffee');
  state.board[6]=makeGenerator('pantry-gen','generator-pantry');
  state.board[9]=makeItem('coffee',1,'starter-coffee-a'); state.board[10]=makeItem('coffee',1,'starter-coffee-b');
  state.board[16]=makeItem('bakery',1,'starter-bakery-a'); state.board[17]=makeItem('bakery',1,'starter-bakery-b');
  state.board[23]=makeItem('sweet',1,'starter-sweet-a'); state.board[24]=makeItem('sweet',1,'starter-sweet-b');
  return state;
}

export const firstEmptySlot = state => state.board.findIndex(slot=>slot===null);
const ensureUnlockedGenerator=(state,unlocked,generator,id)=>{
  if(!unlocked||state.board.some(item=>item?.kind==='generator'&&item.generator===generator))return;
  const empty=firstEmptySlot(state);if(empty>=0)state.board[empty]=makeGenerator(generator,id);
};
export function syncProgressionContent(state){
  ensureUnlockedGenerator(state,isPlace01Complete(state),'sunset-gen','generator-sunset');
  ensureUnlockedGenerator(state,isPlace02Complete(state),'garden-gen','generator-garden');
  return state;
}

export function normalizeState(input){
  if(!input||input.version!==SAVE_VERSION||!Array.isArray(input.board)||input.board.length!==BOARD_SIZE) return createInitialState();
  const state=clone(input);
  state.maxEnergy=state.maxEnergy??40; state.energy=Math.max(0,Math.min(state.maxEnergy,Number(state.energy)||0));
  state.coins=Math.max(0,Number(state.coins)||0); state.stars=Math.max(0,Number(state.stars)||0);
  state.placeUpgrades=Array.isArray(state.placeUpgrades)?state.placeUpgrades.filter(id=>PLACE_UPGRADES.some(u=>u.id===id)):[];
  state.currentOrders=Array.isArray(state.currentOrders)&&state.currentOrders.length?state.currentOrders:[createOrder(0),createOrder(1),createOrder(2)];
  state.orderSequence=Number.isInteger(state.orderSequence)?state.orderSequence:3; state.nextId=Number.isInteger(state.nextId)?state.nextId:20;
  state.stats=state.stats??{merges:0,generated:0,orders:0};
  syncProgressionContent(state);
  state.updatedAt=Date.now(); return state;
}

export function generateFromSlot(inputState,index){
  const state=clone(inputState); const generator=state.board[index];
  if(!generator||generator.kind!=='generator') return {state:inputState,changed:false,reason:'not-generator'};
  const def=GENERATORS[generator.generator]; if(state.energy<def.energyCost) return {state:inputState,changed:false,reason:'no-energy'};
  const empty=firstEmptySlot(state); if(empty<0) return {state:inputState,changed:false,reason:'board-full'};
  const family=def.families[generator.taps%def.families.length];
  const nextTap=generator.taps+1,bonus=!!(def.bonusEvery&&nextTap%def.bonusEvery===0),level=bonus?(def.bonusLevel||2):1;
  state.board[index]={...generator,taps:nextTap};
  state.board[empty]=makeItem(family,level,nextId(state,family)); state.energy-=def.energyCost; state.stats.generated+=1; state.updatedAt=Date.now();
  return {state,changed:true,reason:null,spawnedIndex:empty,family,level,bonus,production:generatorProductionStatus(state.board[index])};
}
export function canMerge(a,b){ return !!(a&&b&&a.kind==='item'&&b.kind==='item'&&a.family===b.family&&a.level===b.level&&a.level<ITEM_FAMILIES[a.family].stages.length); }
export function moveOrMerge(inputState,from,to){
  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=BOARD_SIZE||to>=BOARD_SIZE||from===to) return {state:inputState,changed:false,reason:'invalid-target'};
  const source=inputState.board[from],target=inputState.board[to]; if(!source) return {state:inputState,changed:false,reason:'empty-source'};
  const state=clone(inputState);
  if(!target){ state.board[to]=source; state.board[from]=null; state.updatedAt=Date.now(); return {state,changed:true,reason:null,type:'move'}; }
  if(!canMerge(source,target)) return {state:inputState,changed:false,reason:'not-mergeable'};
  state.board[from]=null; state.board[to]=makeItem(source.family,source.level+1,nextId(state,source.family)); state.stats.merges+=1; syncProgressionContent(state); state.updatedAt=Date.now();
  return {state,changed:true,reason:null,type:'merge',mergedIndex:to,item:state.board[to]};
}
export function countRequirement(state,req){ return state.board.reduce((count,item)=>count+(item?.kind==='item'&&item.family===req.family&&item.level===req.level?1:0),0); }
export function canFulfillOrder(state,order){ return order.requirements.every(req=>countRequirement(state,req)>=req.qty); }
function consumeRequirement(state,req){ let left=req.qty; for(let i=0;i<state.board.length&&left>0;i+=1){ const item=state.board[i]; if(item?.kind==='item'&&item.family===req.family&&item.level===req.level){state.board[i]=null;left-=1;} } }
export function fulfillOrder(inputState,orderId){
  const order=inputState.currentOrders.find(entry=>entry.id===orderId); if(!order) return {state:inputState,changed:false,reason:'unknown-order'};
  if(!canFulfillOrder(inputState,order)) return {state:inputState,changed:false,reason:'requirements-missing'};
  const state=clone(inputState); const active=state.currentOrders.find(entry=>entry.id===orderId); active.requirements.forEach(req=>consumeRequirement(state,req));
  state.coins+=active.rewards.coins; state.stars+=active.rewards.stars; state.stats.orders+=1; state.currentOrders=state.currentOrders.filter(entry=>entry.id!==orderId);
  syncProgressionContent(state);
  state.currentOrders.push(createProgressionOrder(state,state.orderSequence,activePlaceChapter(state).id)); state.orderSequence+=1; state.updatedAt=Date.now();
  return {state,changed:true,reason:null,rewards:active.rewards};
}
export function nextPlaceUpgrade(state){ const chapter=activePlaceChapter(state); return chapter.upgrades.find(upgrade=>!state.placeUpgrades.includes(upgrade.id))??null; }
export function restorationStatus(state){
  const chapter=activePlaceChapter(state),completed=completedUpgradeCount(state,chapter.upgrades),upgrade=nextPlaceUpgrade(state),total=chapter.upgrades.length;
  if(!upgrade) return {complete:true,total,completed,upgrade:null,current:state.stars,cost:0,missing:0,ratio:1,chapter};
  const current=Math.min(state.stars,upgrade.cost); return {complete:false,total,completed,upgrade,current,cost:upgrade.cost,missing:Math.max(0,upgrade.cost-state.stars),ratio:upgrade.cost?current/upgrade.cost:1,chapter};
}
export function buildNextUpgrade(inputState){
  const upgrade=nextPlaceUpgrade(inputState); if(!upgrade) return {state:inputState,changed:false,reason:'place-complete'};
  if(inputState.stars<upgrade.cost) return {state:inputState,changed:false,reason:'not-enough-stars',upgrade};
  const state=clone(inputState); state.stars-=upgrade.cost; state.placeUpgrades.push(upgrade.id);
  const unlockedPlace=upgrade.id==='sign'?'sunset':upgrade.id==='sunset-sign'?'garden':null; syncProgressionContent(state); state.updatedAt=Date.now();
  return {state,changed:true,reason:null,upgrade,unlockedPlace};
}
export function addEnergy(inputState,amount){ const state=clone(inputState); state.energy=Math.min(state.maxEnergy,state.energy+Math.max(0,amount)); state.updatedAt=Date.now(); return state; }
