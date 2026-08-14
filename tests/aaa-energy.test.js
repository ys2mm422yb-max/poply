import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ENERGY_REGEN_MS, ensureEnergyClock, regenerateEnergy, recordEnergySpend, energyMsUntilNext, energyStatusLabel } from '../src/aaa-energy.js';

const base=()=>({energy:10,maxEnergy:40,updatedAt:0});
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('legacy saves get an energy clock without changing player energy',()=>{
  const now=1_000_000,state=base(),result=ensureEnergyClock(state,now);
  assert.equal(result.changed,true);assert.equal(result.state.energy,10);assert.equal(result.state.energyUpdatedAt,now);
});

test('energy regenerates one point every two minutes including offline elapsed time',()=>{
  const start=1_000_000,state={...base(),energyUpdatedAt:start};
  const early=regenerateEnergy(state,start+ENERGY_REGEN_MS-1);assert.equal(early.changed,false);assert.equal(early.state.energy,10);
  const offline=regenerateEnergy(state,start+5*60*1000);assert.equal(offline.changed,true);assert.equal(offline.gained,2);assert.equal(offline.state.energy,12);assert.equal(energyMsUntilNext(offline.state,start+5*60*1000),60*1000);
});

test('energy regeneration caps at max energy',()=>{
  const start=1_000_000,state={...base(),energy:39,energyUpdatedAt:start};
  const result=regenerateEnergy(state,start+10*ENERGY_REGEN_MS);assert.equal(result.state.energy,40);assert.equal(result.gained,1);assert.equal(energyMsUntilNext(result.state,start+10*ENERGY_REGEN_MS),0);
});

test('spending from full energy starts a fresh refill interval',()=>{
  const now=2_000_000,state={...base(),energy:39,energyUpdatedAt:500_000};
  const tracked=recordEnergySpend(state,40,now);assert.equal(tracked.energyUpdatedAt,now);assert.equal(energyMsUntilNext(tracked,now),ENERGY_REGEN_MS);
});

test('spending while already below max keeps the running refill timer',()=>{
  const now=2_000_000,anchor=now-30_000,state={...base(),energy:8,energyUpdatedAt:anchor};
  const tracked=recordEnergySpend(state,9,now);assert.equal(tracked.energyUpdatedAt,anchor);assert.equal(energyMsUntilNext(tracked,now),ENERGY_REGEN_MS-30_000);
});

test('energy status is understandable at full and while refilling',()=>{
  const now=3_000_000;
  assert.equal(energyStatusLabel({...base(),energy:40,energyUpdatedAt:now},now),'Auto · 2 Min');
  assert.equal(energyStatusLabel({...base(),energy:20,energyUpdatedAt:now-30_000},now),'+1 in 1:30');
});

test('live shell installs the energy UI and keeps the player-facing rule documented',async()=>{
  const [main,ui,session,css,docs]=await Promise.all([read('src/aaa-main.js'),read('src/aaa-energy-ui.js'),read('src/aaa-session.js'),read('src/aaa-energy.css'),read('docs/ENERGY_SYSTEM.md')]);
  assert.match(main,/installEnergyUI\(root\)/);
  assert.match(ui,/data\.energyTimer|dataset\.energyTimer/);assert.match(ui,/setInterval\(paint,1000\)/);
  assert.match(session,/regenerateEnergy/);assert.match(session,/recordEnergySpend/);
  assert.match(css,/\.energy-timer/);assert.match(css,/fx-energy-refill/);
  assert.match(docs,/1 energy every 2 minutes|1 Energie alle 2 Minuten/i);
  assert.match(docs,/closed|geschlossen/i);
});