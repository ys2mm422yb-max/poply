export const BOARD_COLS = 7;
export const BOARD_ROWS = 7;
export const BOARD_SIZE = BOARD_COLS * BOARD_ROWS;
export const SAVE_VERSION = 2;

export const ITEM_FAMILIES = {
  coffee: { key: 'coffee', label: 'Getränke', stages: ['Kaffeebohnen', 'Kaffeetasse', 'Eiskaffee', 'Poply Mocha', 'Goldener Brew', 'Sunset Signature'] },
  bakery: { key: 'bakery', label: 'Backwaren', stages: ['Weizen', 'Mehl', 'Teig', 'Croissant', 'Beerentarte', 'Poply Patisserie'] },
  sweet: { key: 'sweet', label: 'Süßes', stages: ['Milch', 'Zucker', 'Creme', 'Muffin', 'Küstenkuchen', 'Dessert-Turm'] },
};

export const GENERATORS = {
  'coffee-gen': { key: 'coffee-gen', label: 'Küsten-Espresso', families: ['coffee'], energyCost: 1 },
  'pantry-gen': { key: 'pantry-gen', label: 'Poply-Vorrat', families: ['bakery','sweet'], energyCost: 1 },
};

export const PLACE_UPGRADES = [
  { id: 'lights', label: 'Lichter', cost: 4, copy: 'Warme Lichter machen das Café abends sichtbar und einladend.' },
  { id: 'counter', label: 'Neue Theke', cost: 6, copy: 'Die alte Theke wird zum Herzstück des Cafés.' },
  { id: 'menu', label: 'Menüwand', cost: 7, copy: 'Eine neue Menüwand zeigt Gästen, was Poply besonders macht.' },
  { id: 'seating', label: 'Sitzecke', cost: 9, copy: 'Bequeme Plätze machen aus Laufkundschaft Stammgäste.' },
  { id: 'terrace', label: 'Meerterrasse', cost: 11, copy: 'Die Terrasse öffnet das Café zum Meer.' },
  { id: 'sign', label: 'Poply-Schild', cost: 14, copy: 'Das neue Schild vollendet den ersten Poply Place.' },
];

const ORDER_TEMPLATES = [
  { title:'Morgenkaffee', requirements:[{family:'coffee',level:2,qty:1}], rewards:{coins:45,stars:2} },
  { title:'Frisches Gebäck', requirements:[{family:'bakery',level:2,qty:1}], rewards:{coins:50,stars:2} },
  { title:'Kleine Pause', requirements:[{family:'sweet',level:2,qty:1}], rewards:{coins:55,stars:2} },
  { title:'Eiskaffee-Date', requirements:[{family:'coffee',level:3,qty:1},{family:'bakery',level:2,qty:1}], rewards:{coins:85,stars:3} },
  { title:'Croissant & Kaffee', requirements:[{family:'bakery',level:4,qty:1},{family:'coffee',level:2,qty:1}], rewards:{coins:120,stars:4} },
  { title:'Süßer Nachmittag', requirements:[{family:'sweet',level:4,qty:1},{family:'coffee',level:3,qty:1}], rewards:{coins:145,stars:5} },
  { title:'Goldene Runde', requirements:[{family:'coffee',level:5,qty:1},{family:'bakery',level:3,qty:1}], rewards:{coins:220,stars:6} },
  { title:'Küstentisch', requirements:[{family:'bakery',level:5,qty:1},{family:'sweet',level:4,qty:1}], rewards:{coins:260,stars:7} },
  { title:'Poply Spezial', requirements:[{family:'coffee',level:6,qty:1},{family:'sweet',level:5,qty:1}], rewards:{coins:360,stars:9} },
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
  if(item.kind==='generator'){ const def=GENERATORS[item.generator]; return {...def,name:def.label}; }
  const def=ITEM_FAMILIES[item.family];
  return {...def,name:def.stages[item.level-1],maxLevel:def.stages.length};
}
export function createOrder(sequence){ const template=ORDER_TEMPLATES[sequence%ORDER_TEMPLATES.length]; return {id:`order-${sequence}`,sequence,title:template.title,requirements:clone(template.requirements),rewards:{...template.rewards}}; }

export function createInitialState(){
  const state={version:SAVE_VERSION,nextId:20,board:Array(BOARD_SIZE).fill(null),energy:40,maxEnergy:40,coins:100,stars:0,placeUpgrades:[],currentOrders:[createOrder(0),createOrder(1),createOrder(2)],orderSequence:3,stats:{merges:0,generated:0,orders:0},updatedAt:Date.now()};
  state.board[0]=makeGenerator('coffee-gen','generator-coffee');
  state.board[6]=makeGenerator('pantry-gen','generator-pantry');
  state.board[9]=makeItem('coffee',1,'starter-coffee-a'); state.board[10]=makeItem('coffee',1,'starter-coffee-b');
  state.board[16]=makeItem('bakery',1,'starter-bakery-a'); state.board[17]=makeItem('bakery',1,'starter-bakery-b');
  state.board[23]=makeItem('sweet',1,'starter-sweet-a'); state.board[24]=makeItem('sweet',1,'starter-sweet-b');
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
  state.stats=state.stats??{merges:0,generated:0,orders:0}; state.updatedAt=Date.now(); return state;
}

export const firstEmptySlot = state => state.board.findIndex(slot=>slot===null);
export function generateFromSlot(inputState,index){
  const state=clone(inputState); const generator=state.board[index];
  if(!generator||generator.kind!=='generator') return {state:inputState,changed:false,reason:'not-generator'};
  const def=GENERATORS[generator.generator]; if(state.energy<def.energyCost) return {state:inputState,changed:false,reason:'no-energy'};
  const empty=firstEmptySlot(state); if(empty<0) return {state:inputState,changed:false,reason:'board-full'};
  const family=def.families[generator.taps%def.families.length]; state.board[index]={...generator,taps:generator.taps+1};
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
  state.coins+=active.rewards.coins; state.stars+=active.rewards.stars; state.stats.orders+=1; state.currentOrders=state.currentOrders.filter(entry=>entry.id!==orderId); state.currentOrders.push(createOrder(state.orderSequence)); state.orderSequence+=1; state.updatedAt=Date.now();
  return {state,changed:true,reason:null,rewards:active.rewards};
}
export function nextPlaceUpgrade(state){ return PLACE_UPGRADES.find(upgrade=>!state.placeUpgrades.includes(upgrade.id))??null; }
export function restorationStatus(state){
  const upgrade=nextPlaceUpgrade(state); const total=PLACE_UPGRADES.length; const completed=state.placeUpgrades.length;
  if(!upgrade) return {complete:true,total,completed,upgrade:null,current:state.stars,cost:0,missing:0,ratio:1};
  const current=Math.min(state.stars,upgrade.cost); return {complete:false,total,completed,upgrade,current,cost:upgrade.cost,missing:Math.max(0,upgrade.cost-state.stars),ratio:upgrade.cost?current/upgrade.cost:1};
}
export function buildNextUpgrade(inputState){ const upgrade=nextPlaceUpgrade(inputState); if(!upgrade) return {state:inputState,changed:false,reason:'place-complete'}; if(inputState.stars<upgrade.cost) return {state:inputState,changed:false,reason:'not-enough-stars',upgrade}; const state=clone(inputState); state.stars-=upgrade.cost; state.placeUpgrades.push(upgrade.id); state.updatedAt=Date.now(); return {state,changed:true,reason:null,upgrade}; }
export function addEnergy(inputState,amount){ const state=clone(inputState); state.energy=Math.min(state.maxEnergy,state.energy+Math.max(0,amount)); state.updatedAt=Date.now(); return state; }
