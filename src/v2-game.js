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
};

export const GENERATORS = {
  'coffee-gen': { key: 'coffee-gen', label: 'Kaffeemaschine', art: 'generator-coffee', families: ['coffee'], energyCost: 1 },
  'pantry-gen': { key: 'pantry-gen', label: 'Vorratskiste', art: 'generator-pantry', families: ['bakery','sweet'], energyCost: 1 },
};

const COAST_UPGRADES = [
  { id: 'lights', label: 'Lichter', cost: 4, copy: 'Warme Lichter machen das Café abends sichtbar und einladend.', unlock: {type:'visual',label:'Abendstimmung'} },
  { id: 'counter', label: 'Neue Theke', cost: 6, copy: 'Die neue Theke öffnet Platz für Desserts und zusätzliche Bestellungen.', unlock: {type:'family',family:'sweet',label:'Dessertproduktion'} },
  { id: 'menu', label: 'Menüwand', cost: 7, copy: 'Die Menüwand bringt anspruchsvollere Wünsche und höherwertige Bestellungen.', unlock: {type:'orders',tier:4,label:'Erweiterte Karte'} },
  { id: 'seating', label: 'Sitzecke', cost: 9, copy: 'Mehr Sitzplätze verlängern den Betrieb und erhöhen deine Energie.', unlock: {type:'energy',amount:10,label:'+10 Energie'} },
  { id: 'terrace', label: 'Meerterrasse', cost: 11, copy: 'Die Terrasse bringt Premiumgäste und Abendbestellungen.', unlock: {type:'orders',tier:6,label:'Abendgäste'} },
  { id: 'sign', label: 'Poply-Schild', cost: 14, copy: 'Das neue Schild vollendet Café am Meer und öffnet den nächsten Poply Place.', unlock: {type:'place',place:'harbor',label:'Hafen-Pop-up'} },
];

const HARBOR_UPGRADES = [
  { id: 'awning', label: 'Neue Markise', cost: 8, copy: 'Eine kräftige Markise macht den Hafenstand von weitem sichtbar.', unlock: {type:'visual',label:'Hafen-Look'} },
  { id: 'cooler', label: 'Kühltheke', cost: 10, copy: 'Die Kühltheke macht den zweiten Place bereit für längere Services.', unlock: {type:'energy',amount:5,label:'+5 Energie'} },
  { id: 'pier-lights', label: 'Steg-Lichter', cost: 12, copy: 'Lichter am Steg bringen den Hafen-Pop-up in den Abendbetrieb.', unlock: {type:'orders',tier:6,label:'Hafen-Abendgäste'} },
];

export const PLACE_DEFINITIONS = {
  coast: { id:'coast', number:1, label:'Café am Meer', kicker:'KÜSTE', upgrades:COAST_UPGRADES },
  harbor: { id:'harbor', number:2, label:'Hafen-Pop-up', kicker:'HAFEN', upgrades:HARBOR_UPGRADES },
};

// Kept for backwards-compatible imports/tests. New code should use activePlaceDefinition(state).
export const PLACE_UPGRADES = COAST_UPGRADES;

const ORDER_TEMPLATES = [
  { key:'morning-coffee', places:['coast'], unlockAt:0, title:'Morgenkaffee', requirements:[{family:'coffee',level:2,qty:1}], rewards:{coins:45,stars:2} },
  { key:'fresh-bakery', places:['coast'], unlockAt:0, title:'Frisches Gebäck', requirements:[{family:'bakery',level:2,qty:1}], rewards:{coins:50,stars:2} },
  { key:'coast-breakfast', places:['coast'], unlockAt:0, title:'Küstenfrühstück', requirements:[{family:'coffee',level:2,qty:1},{family:'bakery',level:2,qty:1}], rewards:{coins:70,stars:3} },
  { key:'sweet-break', places:['coast'], unlockAt:2, title:'Süße Pause', requirements:[{family:'sweet',level:2,qty:1}], rewards:{coins:65,stars:3} },
  { key:'iced-date', places:['coast'], unlockAt:2, title:'Eiskaffee-Date', requirements:[{family:'coffee',level:3,qty:1},{family:'bakery',level:2,qty:1}], rewards:{coins:85,stars:3} },
  { key:'croissant-coffee', places:['coast'], unlockAt:3, title:'Croissant & Kaffee', requirements:[{family:'bakery',level:4,qty:1},{family:'coffee',level:2,qty:1}], rewards:{coins:120,stars:4} },
  { key:'sweet-afternoon', places:['coast'], unlockAt:3, title:'Süßer Nachmittag', requirements:[{family:'sweet',level:4,qty:1},{family:'coffee',level:3,qty:1}], rewards:{coins:145,stars:5} },
  { key:'coast-brunch', places:['coast'], unlockAt:5, title:'Küsten-Brunch', requirements:[{family:'bakery',level:5,qty:1},{family:'coffee',level:4,qty:1}], rewards:{coins:210,stars:6} },
  { key:'sunset', places:['coast'], unlockAt:5, title:'Sonnenuntergang', requirements:[{family:'sweet',level:5,qty:1},{family:'coffee',level:5,qty:1}], rewards:{coins:275,stars:7} },
  { key:'festival-table', places:['coast'], unlockAt:5, title:'Poply Festtafel', requirements:[{family:'bakery',level:6,qty:1},{family:'sweet',level:6,qty:1}], rewards:{coins:420,stars:9} },

  { key:'harbor-start', places:['harbor'], unlockAt:0, title:'Hafenstart', requirements:[{family:'coffee',level:3,qty:1},{family:'bakery',level:3,qty:1}], rewards:{coins:110,stars:3} },
  { key:'dock-coffee', places:['harbor'], unlockAt:0, title:'Steg-Kaffee', requirements:[{family:'coffee',level:4,qty:1}], rewards:{coins:130,stars:4} },
  { key:'market-break', places:['harbor'], unlockAt:0, title:'Marktpause', requirements:[{family:'bakery',level:4,qty:1},{family:'sweet',level:3,qty:1}], rewards:{coins:155,stars:4} },
  { key:'harbor-evening', places:['harbor'], unlockAt:2, title:'Hafenabend', requirements:[{family:'coffee',level:5,qty:1},{family:'sweet',level:5,qty:1}], rewards:{coins:290,stars:7} },
];

const clone = (value) => structuredClone(value);
function nextId(state,prefix='item'){ state.nextId += 1; return `${prefix}-${state.nextId}`; }

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

export function activePlaceDefinition(state){ return PLACE_DEFINITIONS[state?.currentPlace]??PLACE_DEFINITIONS.coast; }
export function unlockedFamilies(state){
  const unlocked=new Set(['coffee','bakery']);
  const place=state?.currentPlace??'coast';
  if(place==='harbor'||state?.completedPlaces?.includes('coast')||state?.placeUpgrades?.includes('counter'))unlocked.add('sweet');
  return [...unlocked];
}
export function progressionStage(state){ return Array.isArray(state?.placeUpgrades)?state.placeUpgrades.length:0; }
export function eligibleOrderTemplates(state){
  const place=state?.currentPlace??'coast';
  const stage=progressionStage(state);
  const families=new Set(unlockedFamilies(state));
  return ORDER_TEMPLATES.filter(template=>template.places.includes(place)&&template.unlockAt<=stage&&template.requirements.every(req=>families.has(req.family)));
}
export function createOrder(sequence){
  const template=ORDER_TEMPLATES[sequence%ORDER_TEMPLATES.length];
  return {id:`order-${sequence}`,sequence,title:template.title,requirements:clone(template.requirements),rewards:{...template.rewards},templateKey:template.key};
}
export function createProgressionOrder(state,sequence){
  const eligible=eligibleOrderTemplates(state);
  const pool=eligible.length?eligible:ORDER_TEMPLATES.filter(template=>template.places.includes('coast')&&template.unlockAt===0);
  const template=pool[Math.abs(sequence)%pool.length];
  return {id:`order-${sequence}`,sequence,title:template.title,requirements:clone(template.requirements),rewards:{...template.rewards},templateKey:template.key};
}

export function createInitialState(){
  const state={version:SAVE_VERSION,nextId:20,board:Array(BOARD_SIZE).fill(null),energy:40,maxEnergy:40,coins:100,stars:0,currentPlace:'coast',completedPlaces:[],placeUpgrades:[],currentOrders:[],orderSequence:3,stats:{merges:0,generated:0,orders:0},updatedAt:Date.now()};
  state.board[0]=makeGenerator('coffee-gen','generator-coffee');
  state.board[6]=makeGenerator('pantry-gen','generator-pantry');
  state.board[9]=makeItem('coffee',1,'starter-coffee-a'); state.board[10]=makeItem('coffee',1,'starter-coffee-b');
  state.board[16]=makeItem('bakery',1,'starter-bakery-a'); state.board[17]=makeItem('bakery',1,'starter-bakery-b');
  state.currentOrders=[createProgressionOrder(state,0),createProgressionOrder(state,1),createProgressionOrder(state,2)];
  return state;
}

export function normalizeState(input){
  if(!input||input.version!==SAVE_VERSION||!Array.isArray(input.board)||input.board.length!==BOARD_SIZE) return createInitialState();
  const state=clone(input);
  state.currentPlace=PLACE_DEFINITIONS[state.currentPlace]?state.currentPlace:'coast';
  state.completedPlaces=Array.isArray(state.completedPlaces)?state.completedPlaces.filter(id=>PLACE_DEFINITIONS[id]):[];
  state.maxEnergy=Math.max(1,Number(state.maxEnergy)||40); state.energy=Math.max(0,Math.min(state.maxEnergy,Number(state.energy)||0));
  state.coins=Math.max(0,Number(state.coins)||0); state.stars=Math.max(0,Number(state.stars)||0);
  const active=activePlaceDefinition(state);
  state.placeUpgrades=Array.isArray(state.placeUpgrades)?state.placeUpgrades.filter(id=>active.upgrades.some(u=>u.id===id)):[];
  state.orderSequence=Number.isInteger(state.orderSequence)?state.orderSequence:3; state.nextId=Number.isInteger(state.nextId)?state.nextId:20;
  state.stats=state.stats??{merges:0,generated:0,orders:0};
  state.currentOrders=Array.isArray(state.currentOrders)&&state.currentOrders.length?state.currentOrders:[createProgressionOrder(state,0),createProgressionOrder(state,1),createProgressionOrder(state,2)];
  state.updatedAt=Date.now(); return state;
}

export const firstEmptySlot = state => state.board.findIndex(slot=>slot===null);
export function generateFromSlot(inputState,index){
  const state=clone(inputState); const generator=state.board[index];
  if(!generator||generator.kind!=='generator') return {state:inputState,changed:false,reason:'not-generator'};
  const def=GENERATORS[generator.generator]; if(state.energy<def.energyCost) return {state:inputState,changed:false,reason:'no-energy'};
  const empty=firstEmptySlot(state); if(empty<0) return {state:inputState,changed:false,reason:'board-full'};
  const unlocked=new Set(unlockedFamilies(state));
  const families=def.families.filter(family=>unlocked.has(family));
  if(!families.length)return {state:inputState,changed:false,reason:'generator-locked'};
  const family=families[generator.taps%families.length]; state.board[index]={...generator,taps:generator.taps+1};
  state.board[empty]=makeItem(family,1,nextId(state,family)); state.energy-=def.energyCost; state.stats.generated+=1; state.updatedAt=Date.now();
  return {state,changed:true,reason:null,spawnedIndex:empty,family};
}
export function canMerge(a,b){ return !!(a&&b&&a.kind==='item'&&b.kind==='item'&&a.family===b.family&&a.level===b.level&&a.level<ITEM_FAMILIES[a.family].stages.length); }
export function moveOrMerge(inputState,from,to){
  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=BOARD_SIZE||to>=BOARD_SIZE||from===to) return {state:inputState,changed:false,reason:'invalid-target'};
  const source=inputState.board[from],target=inputState.board[to]; if(!source) return {state:inputState,changed:false,reason:'empty-source'};
  const state=clone(inputState);
  if(!target){ state.board[to]=source; state.board[from]=null; state.updatedAt=Date.now(); return {state,changed:true,reason:null,type:'move'}; }
  if(!canMerge(source,target)) return {state:inputState,changed:false,reason:'not-mergeable'};
  state.board[from]=null; state.board[to]=makeItem(source.family,source.level+1,nextId(state,source.family)); state.stats.merges+=1; state.updatedAt=Date.now();
  return {state,changed:true,reason:null,type:'merge',mergedIndex:to,item:state.board[to]};
}
export function countRequirement(state,req){ return state.board.reduce((count,item)=>count+(item?.kind==='item'&&item.family===req.family&&item.level===req.level?1:0),0); }
export function canFulfillOrder(state,order){ return order.requirements.every(req=>countRequirement(state,req)>=req.qty); }
function consumeRequirement(state,req){ let left=req.qty; for(let i=0;i<state.board.length&&left>0;i+=1){ const item=state.board[i]; if(item?.kind==='item'&&item.family===req.family&&item.level===req.level){state.board[i]=null;left-=1;} } }
export function fulfillOrder(inputState,orderId){
  const order=inputState.currentOrders.find(entry=>entry.id===orderId); if(!order) return {state:inputState,changed:false,reason:'unknown-order'};
  if(!canFulfillOrder(inputState,order)) return {state:inputState,changed:false,reason:'requirements-missing'};
  const state=clone(inputState); const active=state.currentOrders.find(entry=>entry.id===orderId); active.requirements.forEach(req=>consumeRequirement(state,req));
  state.coins+=active.rewards.coins; state.stars+=active.rewards.stars; state.stats.orders+=1; state.currentOrders=state.currentOrders.filter(entry=>entry.id!==orderId); state.currentOrders.push(createProgressionOrder(state,state.orderSequence)); state.orderSequence+=1; state.updatedAt=Date.now();
  return {state,changed:true,reason:null,rewards:active.rewards,replacement:state.currentOrders[state.currentOrders.length-1]};
}
export function nextPlaceUpgrade(state){ return activePlaceDefinition(state).upgrades.find(upgrade=>!state.placeUpgrades.includes(upgrade.id))??null; }
export function restorationStatus(state){
  const definition=activePlaceDefinition(state); const upgrade=nextPlaceUpgrade(state); const total=definition.upgrades.length; const completed=state.placeUpgrades.length;
  if(!upgrade) return {complete:true,total,completed,upgrade:null,current:state.stars,cost:0,missing:0,ratio:1};
  const current=Math.min(state.stars,upgrade.cost); return {complete:false,total,completed,upgrade,current,cost:upgrade.cost,missing:Math.max(0,upgrade.cost-state.stars),ratio:upgrade.cost?current/upgrade.cost:1};
}
export function nextPlaceId(state){
  if(state.currentPlace==='coast'&&state.completedPlaces?.includes('coast'))return 'harbor';
  return null;
}
export function buildNextUpgrade(inputState){
  const upgrade=nextPlaceUpgrade(inputState); if(!upgrade) return {state:inputState,changed:false,reason:'place-complete'};
  if(inputState.stars<upgrade.cost) return {state:inputState,changed:false,reason:'not-enough-stars',upgrade};
  const state=clone(inputState); state.stars-=upgrade.cost; state.placeUpgrades.push(upgrade.id);
  if(upgrade.unlock?.type==='energy'){
    state.maxEnergy+=upgrade.unlock.amount;
    state.energy=Math.min(state.maxEnergy,state.energy+upgrade.unlock.amount);
  }
  const definition=activePlaceDefinition(state);
  let placeCompleted=false;
  if(state.placeUpgrades.length===definition.upgrades.length){
    if(!state.completedPlaces.includes(definition.id))state.completedPlaces.push(definition.id);
    placeCompleted=true;
  }
  state.updatedAt=Date.now();
  return {state,changed:true,reason:null,upgrade,unlock:upgrade.unlock??null,placeCompleted,nextPlace:placeCompleted?nextPlaceId(state):null};
}
export function startNextPlace(inputState){
  const next=nextPlaceId(inputState);
  if(!next)return {state:inputState,changed:false,reason:'no-next-place'};
  const state=clone(inputState);
  state.currentPlace=next;
  state.placeUpgrades=[];
  state.currentOrders=[];
  for(let i=0;i<3;i+=1){state.currentOrders.push(createProgressionOrder(state,state.orderSequence));state.orderSequence+=1;}
  state.updatedAt=Date.now();
  return {state,changed:true,reason:null,place:activePlaceDefinition(state)};
}
export function addEnergy(inputState,amount){ const state=clone(inputState); state.energy=Math.min(state.maxEnergy,state.energy+Math.max(0,amount)); state.updatedAt=Date.now(); return state; }
