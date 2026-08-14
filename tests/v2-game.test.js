import test from 'node:test';
import assert from 'node:assert/strict';
import { BOARD_SIZE, ITEM_FAMILIES, PLACE_01_UPGRADES, PLACE_02_UPGRADES, PLACE_03_UPGRADES, createInitialState, createOrder, makeItem, generateFromSlot, moveOrMerge, canMerge, countRequirement, canFulfillOrder, fulfillOrder, buildNextUpgrade, normalizeState, itemDefinition, activePlaceChapter, currentChapterProgress, restorationStatus, syncProgressionContent, generatorProductionStatus } from '../src/v2-game.js';

test('initial V2 board has two generators and merge-ready pairs',()=>{const s=createInitialState();assert.equal(s.board.length,BOARD_SIZE);assert.equal(s.board.filter(i=>i?.kind==='generator').length,2);assert.equal(s.board.filter(i=>i?.family==='coffee'&&i.level===1).length,2);assert.equal(s.board.filter(i=>i?.family==='bakery'&&i.level===1).length,2);});
test('identical items merge into exactly one next-tier item',()=>{const s=createInitialState(),before=s.board.filter(Boolean).length,r=moveOrMerge(s,9,10);assert.equal(r.changed,true);assert.equal(r.type,'merge');assert.equal(r.item.family,'coffee');assert.equal(r.item.level,2);assert.equal(r.state.board[9],null);assert.equal(r.state.board.filter(Boolean).length,before-1);});
test('invalid merge preserves the board',()=>{const s=createInitialState(),snapshot=structuredClone(s.board),r=moveOrMerge(s,9,16);assert.equal(r.changed,false);assert.equal(r.reason,'not-mergeable');assert.deepEqual(r.state.board,snapshot);});
test('move to empty slot preserves identity',()=>{const s=createInitialState(),id=s.board[9].id,r=moveOrMerge(s,9,8);assert.equal(r.changed,true);assert.equal(r.type,'move');assert.equal(r.state.board[8].id,id);assert.equal(r.state.board[9],null);});
test('generator consumes one energy and spawns base item',()=>{const s=createInitialState(),r=generateFromSlot(s,0);assert.equal(r.changed,true);assert.equal(r.family,'coffee');assert.equal(r.state.energy,s.energy-1);assert.equal(r.state.board[r.spawnedIndex].level,1);});
test('full board blocks generation without energy loss',()=>{const s=createInitialState(),filler=s.board[9];s.board=s.board.map((slot,i)=>slot??{...filler,id:`fill-${i}`});const r=generateFromSlot(s,0);assert.equal(r.changed,false);assert.equal(r.reason,'board-full');assert.equal(r.state.energy,s.energy);});
test('order progress and fulfillment consume exact requested tier once',()=>{let s=createInitialState();s=moveOrMerge(s,9,10).state;const order=s.currentOrders[0];assert.equal(countRequirement(s,order.requirements[0]),1);assert.equal(canFulfillOrder(s,order),true);const r=fulfillOrder(s,order.id);assert.equal(r.changed,true);assert.equal(r.state.stats.orders,1);assert.equal(r.state.coins,s.coins+order.rewards.coins);assert.equal(r.state.stars,s.stars+order.rewards.stars);assert.equal(countRequirement(r.state,order.requirements[0]),0);assert.equal(r.state.currentOrders.length,3);});
test('place upgrades cannot overspend stars',()=>{const s=createInitialState(),blocked=buildNextUpgrade(s);assert.equal(blocked.changed,false);assert.equal(blocked.reason,'not-enough-stars');const built=buildNextUpgrade({...s,stars:10});assert.equal(built.changed,true);assert.deepEqual(built.state.placeUpgrades,['lights']);assert.equal(built.state.stars,6);});
test('legacy or malformed saves reset safely to V2',()=>{const s=normalizeState({version:1,board:[]});assert.equal(s.version,2);assert.equal(s.board.length,BOARD_SIZE);});
test('all core families expose six named art-backed tiers',()=>{for(const [family,def] of Object.entries(ITEM_FAMILIES)){assert.equal(def.stages.length,6,family);assert.equal(def.art.length,6,family);for(let level=1;level<=6;level+=1){const item=makeItem(family,level,`${family}-${level}`),resolved=itemDefinition(item);assert.equal(resolved.maxLevel,6);assert.equal(resolved.art,def.art[level-1]);assert.ok(resolved.name);}}});
test('tier five merges into premium tier six and tier six is terminal',()=>{const s=createInitialState();s.board[30]=makeItem('coffee',5,'coffee-five-a');s.board[31]=makeItem('coffee',5,'coffee-five-b');const r=moveOrMerge(s,30,31);assert.equal(r.changed,true);assert.equal(r.item.level,6);assert.equal(canMerge(r.item,{...r.item,id:'other'}),false);});
test('late coast order templates use the deeper production chains',()=>{const brunch=createOrder(6),finale=createOrder(8);assert.ok(brunch.requirements.some(req=>req.level===5));assert.ok(finale.requirements.every(req=>req.level===6));assert.ok(finale.rewards.stars>brunch.rewards.stars);});

test('finishing Place 01 unlocks Sonnenkai and exactly one Tropenbar',()=>{
  const s=createInitialState();s.placeUpgrades=PLACE_01_UPGRADES.slice(0,5).map(u=>u.id);s.stars=99;
  const result=buildNextUpgrade(s);
  assert.equal(result.changed,true);assert.equal(result.upgrade.id,'sign');assert.equal(result.unlockedPlace,'sunset');
  assert.equal(activePlaceChapter(result.state).id,'sunset');
  assert.equal(result.state.board.filter(item=>item?.kind==='generator'&&item.generator==='sunset-gen').length,1);
  const progress=currentChapterProgress(result.state);assert.equal(progress.completed,0);assert.equal(progress.total,6);
  const status=restorationStatus(result.state);assert.equal(status.upgrade.id,PLACE_02_UPGRADES[0].id);
  const synced=syncProgressionContent(structuredClone(result.state));
  assert.equal(synced.board.filter(item=>item?.kind==='generator'&&item.generator==='sunset-gen').length,1);
});

test('legacy completed Place 01 save gains Sonnenkai generator without losing value',()=>{
  const legacy=createInitialState();legacy.placeUpgrades=PLACE_01_UPGRADES.map(u=>u.id);legacy.coins=777;legacy.stars=12;legacy.stats.orders=9;
  const normalized=normalizeState(legacy);
  assert.equal(normalized.coins,777);assert.equal(normalized.stars,12);assert.equal(normalized.stats.orders,9);
  assert.equal(activePlaceChapter(normalized).id,'sunset');
  assert.equal(normalized.board.filter(item=>item?.generator==='sunset-gen').length,1);
});

test('Tropenbar produces fruit and fruit chain reaches tier six',()=>{
  const s=createInitialState();s.placeUpgrades=PLACE_01_UPGRADES.map(u=>u.id);syncProgressionContent(s);
  const generatorIndex=s.board.findIndex(item=>item?.generator==='sunset-gen');assert.ok(generatorIndex>=0);
  const spawned=generateFromSlot(s,generatorIndex);assert.equal(spawned.changed,true);assert.equal(spawned.family,'fruit');assert.equal(spawned.state.board[spawned.spawnedIndex].level,1);
  let work=spawned.state;
  for(let level=1;level<=5;level+=1){
    const empties=work.board.map((item,index)=>item?null:index).filter(index=>index!==null);
    const a=empties[0],b=empties[1];work.board[a]=makeItem('fruit',level,`fruit-${level}-a`);work.board[b]=makeItem('fruit',level,`fruit-${level}-b`);
    const merged=moveOrMerge(work,a,b);assert.equal(merged.changed,true);assert.equal(merged.item.level,level+1);work=merged.state;
  }
  assert.ok(work.board.some(item=>item?.family==='fruit'&&item.level===6));
});

test('post-unlock replacement orders enter the Sonnenkai fruit pool',()=>{
  const s=createInitialState();s.placeUpgrades=PLACE_01_UPGRADES.map(u=>u.id);syncProgressionContent(s);s.currentOrders=[createOrder(0,'coast')];s.orderSequence=3;s.board[9]=makeItem('coffee',2,'ready-coast-order');s.board[10]=null;
  const result=fulfillOrder(s,'order-0');assert.equal(result.changed,true);
  const replacement=result.state.currentOrders.find(order=>order.id==='order-3');assert.equal(replacement.chapter,'sunset');assert.ok(replacement.requirements.some(req=>req.family==='fruit'));
});

test('first Sonnenkai build spends stars and advances only second-place journey',()=>{
  const s=createInitialState();s.placeUpgrades=PLACE_01_UPGRADES.map(u=>u.id);s.stars=20;syncProgressionContent(s);
  const result=buildNextUpgrade(s);assert.equal(result.changed,true);assert.equal(result.upgrade.id,'sunset-lanterns');assert.equal(result.state.stars,12);
  assert.equal(result.state.placeUpgrades.length,7);const progress=currentChapterProgress(result.state);assert.equal(progress.chapter.id,'sunset');assert.equal(progress.completed,1);assert.equal(progress.total,6);
});

test('finishing Sonnenkai unlocks Dachgarten and exactly one Gewächshaus',()=>{
  const s=createInitialState();s.placeUpgrades=[...PLACE_01_UPGRADES.map(u=>u.id),...PLACE_02_UPGRADES.slice(0,5).map(u=>u.id)];s.stars=99;syncProgressionContent(s);
  const result=buildNextUpgrade(s);
  assert.equal(result.changed,true);assert.equal(result.upgrade.id,'sunset-sign');assert.equal(result.unlockedPlace,'garden');
  assert.equal(activePlaceChapter(result.state).id,'garden');
  assert.equal(result.state.board.filter(item=>item?.generator==='garden-gen').length,1);
  assert.equal(result.state.board.filter(item=>item?.generator==='sunset-gen').length,1);
  const progress=currentChapterProgress(result.state);assert.equal(progress.completed,0);assert.equal(progress.total,6);
  assert.equal(restorationStatus(result.state).upgrade.id,PLACE_03_UPGRADES[0].id);
  syncProgressionContent(result.state);
  assert.equal(result.state.board.filter(item=>item?.generator==='garden-gen').length,1);
});

test('legacy completed Sonnenkai save gains Gewächshaus without losing player value',()=>{
  const legacy=createInitialState();legacy.placeUpgrades=[...PLACE_01_UPGRADES.map(u=>u.id),...PLACE_02_UPGRADES.map(u=>u.id)];legacy.coins=1337;legacy.stars=17;legacy.energy=23;legacy.stats.orders=21;
  const normalized=normalizeState(legacy);
  assert.equal(normalized.coins,1337);assert.equal(normalized.stars,17);assert.equal(normalized.energy,23);assert.equal(normalized.stats.orders,21);
  assert.equal(activePlaceChapter(normalized).id,'garden');
  assert.equal(normalized.board.filter(item=>item?.generator==='sunset-gen').length,1);
  assert.equal(normalized.board.filter(item=>item?.generator==='garden-gen').length,1);
});

test('Gewächshaus has a visible deterministic four-step harvest cycle',()=>{
  let state=createInitialState();state.placeUpgrades=[...PLACE_01_UPGRADES.map(u=>u.id),...PLACE_02_UPGRADES.map(u=>u.id)];syncProgressionContent(state);
  const index=state.board.findIndex(item=>item?.generator==='garden-gen');assert.ok(index>=0);
  assert.deepEqual(generatorProductionStatus(state.board[index]),{progress:0,total:4,nextStep:1,bonusNext:false,bonusLevel:2,label:'Erntebonus'});
  const levels=[];
  for(let tap=1;tap<=4;tap+=1){const result=generateFromSlot(state,index);assert.equal(result.changed,true);assert.equal(result.family,'herb');assert.equal(result.state.energy,state.energy-1);levels.push(result.level);assert.equal(result.bonus,tap===4);state=result.state;}
  assert.deepEqual(levels,[1,1,1,2]);
  assert.equal(state.board[index].taps,4);
  assert.deepEqual(generatorProductionStatus(state.board[index]),{progress:0,total:4,nextStep:1,bonusNext:false,bonusLevel:2,label:'Erntebonus'});
});

test('full board never consumes energy or advances a ready Gewächshaus bonus',()=>{
  const s=createInitialState();s.placeUpgrades=[...PLACE_01_UPGRADES.map(u=>u.id),...PLACE_02_UPGRADES.map(u=>u.id)];syncProgressionContent(s);
  const index=s.board.findIndex(item=>item?.generator==='garden-gen');s.board[index]={...s.board[index],taps:3};
  const filler=makeItem('herb',1,'full-board-herb');s.board=s.board.map((slot,i)=>slot??{...filler,id:`full-${i}`});
  const beforeEnergy=s.energy,beforeTaps=s.board[index].taps,result=generateFromSlot(s,index);
  assert.equal(result.changed,false);assert.equal(result.reason,'board-full');assert.equal(result.state.energy,beforeEnergy);assert.equal(result.state.board[index].taps,beforeTaps);assert.equal(generatorProductionStatus(result.state.board[index]).bonusNext,true);
});

test('first Dachgarten build advances only the third-place journey',()=>{
  const s=createInitialState();s.placeUpgrades=[...PLACE_01_UPGRADES.map(u=>u.id),...PLACE_02_UPGRADES.map(u=>u.id)];s.stars=30;syncProgressionContent(s);
  const result=buildNextUpgrade(s);assert.equal(result.changed,true);assert.equal(result.upgrade.id,'garden-glass');assert.equal(result.state.stars,18);
  const progress=currentChapterProgress(result.state);assert.equal(progress.chapter.id,'garden');assert.equal(progress.completed,1);assert.equal(progress.total,6);
});

test('completed Dachgarten is terminal without inventing another Place',()=>{
  const s=createInitialState();s.placeUpgrades=[...PLACE_01_UPGRADES.map(u=>u.id),...PLACE_02_UPGRADES.map(u=>u.id),...PLACE_03_UPGRADES.map(u=>u.id)];syncProgressionContent(s);
  const status=restorationStatus(s);assert.equal(activePlaceChapter(s).id,'garden');assert.equal(status.complete,true);assert.equal(status.completed,6);
  const result=buildNextUpgrade(s);assert.equal(result.changed,false);assert.equal(result.reason,'place-complete');
});
