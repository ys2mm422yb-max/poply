import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, createProgressionOrder, PLACE_01_UPGRADES, PLACE_02_UPGRADES, PLACE_03_UPGRADES } from '../src/v2-game.js';
import { placeUpgradeBenefit } from '../src/aaa-place-benefits.js';
import { purposeGoal, purposeLine, purposeRewardLine } from '../src/aaa-purpose.js';

test('purpose model exposes the first meaningful restoration goal and its real gameplay benefit',()=>{
  const state=createInitialState();
  const goal=purposeGoal(state);
  assert.equal(goal.kind,'restoration');
  assert.equal(goal.chapter.id,'coast');
  assert.equal(goal.label,'Lichter');
  assert.equal(goal.step,1);
  assert.equal(goal.total,6);
  assert.equal(goal.cost,4);
  assert.equal(goal.missing,4);
  assert.equal(goal.benefit.label,'Abendservice');
  assert.equal(goal.benefit.detail,'Special geschafft → +1 FLOW');
  assert.equal(goal.story,'Abendservice: Special geschafft → +1 FLOW');
  assert.equal(goal.after.label,'Neue Theke');
  assert.equal(goal.after.benefit.label,'Vorbereitung');
  assert.equal(purposeLine(state),'Noch 4 ★ bis Lichter');
});

test('purpose model makes build readiness explicit without adding a new currency',()=>{
  const state=createInitialState();state.stars=4;
  const goal=purposeGoal(state);
  assert.equal(goal.ready,true);
  assert.equal(goal.missing,0);
  assert.equal(purposeLine(state),'Lichter ist bereit zum Bauen');
  assert.equal(purposeRewardLine(state,2),'+2 ★ · Lichter kann jetzt gebaut werden');
});

test('all Coast upgrades expose only benefits backed by existing gameplay',()=>{
  const expected=[
    ['lights','Abendservice','Special geschafft → +1 FLOW'],
    ['counter','Vorbereitung','Nächster Generator → +1 Stufe'],
    ['menu','Gastwahl','1 Auftrag tauschen'],
    ['seating','Neue Küstenaufträge','Aufträge bis Tier 5'],
    ['terrace','Premium-Service','Aufträge bis Tier 6'],
    ['sign','Sonnenkai + Tropenbar','Neuer Place + Sonnenfrüchte'],
  ];
  for(const [id,label,detail] of expected){
    const upgrade=PLACE_01_UPGRADES.find(entry=>entry.id===id),benefit=placeUpgradeBenefit(upgrade);
    assert.equal(benefit.label,label,`${id} benefit label drifted`);
    assert.equal(benefit.detail,detail,`${id} benefit detail drifted`);
  }
});

test('Coast order-pool progression really reaches the tiers promised by seating and terrace',()=>{
  const maxRequiredLevel=completed=>{
    const state=createInitialState();state.placeUpgrades=PLACE_01_UPGRADES.slice(0,completed).map(entry=>entry.id);state.currentOrders=[];
    let max=0;
    for(let sequence=0;sequence<24;sequence+=1){
      const order=createProgressionOrder(state,sequence,'coast');
      max=Math.max(max,...order.requirements.map(req=>req.level));
    }
    return max;
  };
  assert.equal(maxRequiredLevel(4),5,'Sitzecke must unlock Coast orders through tier 5');
  assert.equal(maxRequiredLevel(5),6,'Meerterrasse must unlock Coast orders through tier 6');
});

test('final chapter step promises the next Place and its gameplay unlock',()=>{
  const state=createInitialState();
  state.placeUpgrades=PLACE_01_UPGRADES.slice(0,5).map(entry=>entry.id);
  const coastFinal=purposeGoal(state);
  assert.equal(coastFinal.label,'Poply-Schild');
  assert.equal(coastFinal.benefit.label,'Sonnenkai + Tropenbar');
  assert.match(coastFinal.benefit.detail,/Sonnenfrüchte/);
  assert.equal(coastFinal.after.kind,'place');
  assert.equal(coastFinal.after.label,'Place 02: Sonnenkai');
  assert.match(coastFinal.after.detail,/Tropenbar/);

  state.placeUpgrades=[...PLACE_01_UPGRADES.map(entry=>entry.id),...PLACE_02_UPGRADES.slice(0,5).map(entry=>entry.id)];
  const sunsetFinal=purposeGoal(state);
  assert.equal(sunsetFinal.label,'Sonnenkai-Schild');
  assert.equal(sunsetFinal.after.label,'Place 03: Dachgarten');
  assert.match(sunsetFinal.after.detail,/Gewächshaus/);
});

test('purpose model resolves complete world state deterministically',()=>{
  const state=createInitialState();
  state.placeUpgrades=[...PLACE_01_UPGRADES,...PLACE_02_UPGRADES,...PLACE_03_UPGRADES].map(entry=>entry.id);
  const goal=purposeGoal(state);
  assert.equal(goal.complete,true);
  assert.equal(goal.label,'Alle Places aufgebaut');
  assert.equal(goal.benefit,null);
  assert.equal(goal.after,null);
  assert.equal(purposeLine(state),'Alle Places aufgebaut');
});
