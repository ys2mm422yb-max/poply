import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ENERGY_REGEN_MS, ENERGY_RESERVE_CAP, ENERGY_RESERVE_MAX_CAP, energyReserveCap, regenerateEnergy, energyReserveLabel, energyStatusLabel } from '../src/aaa-energy.js';

const base=(overrides={})=>({energy:40,maxEnergy:40,energyReserve:0,energyUpdatedAt:1_000_000,updatedAt:0,...overrides});
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('full Energy banks one fair reserve point per normal regeneration interval',()=>{
  const start=1_000_000,result=regenerateEnergy(base({energyUpdatedAt:start}),start+3*ENERGY_REGEN_MS);
  assert.equal(result.changed,true);assert.equal(result.state.energy,40);assert.equal(result.state.energyReserve,3);
  assert.equal(result.reserveGained,3);assert.equal(result.gained,0);assert.equal(result.state.energyUpdatedAt,start+3*ENERGY_REGEN_MS);
});

test('base overflow reserve is capped at five and never creates unbounded hidden Energy',()=>{
  const start=1_000_000,result=regenerateEnergy(base({energyReserve:4,energyUpdatedAt:start}),start+10*ENERGY_REGEN_MS);
  assert.equal(result.state.energy,40);assert.equal(result.state.energyReserve,ENERGY_RESERVE_CAP);assert.equal(result.reserveGained,1);
  assert.equal(result.state.energyUpdatedAt,start+10*ENERGY_REGEN_MS);
});

test('earned Max Energy expands Reserve capacity in transparent one-point steps',()=>{
  assert.equal(energyReserveCap(base({maxEnergy:40})),5);
  assert.equal(energyReserveCap(base({maxEnergy:45})),6);
  assert.equal(energyReserveCap(base({maxEnergy:50})),7);
  assert.equal(energyReserveCap(base({maxEnergy:55})),8);
  assert.equal(energyReserveCap(base({maxEnergy:80})),ENERGY_RESERVE_MAX_CAP);
});

test('higher earned Reserve cap banks and persists only the allowed overflow',()=>{
  const start=1_000_000,result=regenerateEnergy(base({energy:55,maxEnergy:55,energyReserve:6,energyUpdatedAt:start}),start+10*ENERGY_REGEN_MS);
  assert.equal(result.state.energy,55);assert.equal(result.state.energyReserve,8);assert.equal(result.reserveGained,2);assert.equal(result.reserveCap,8);
});

test('stored reserve automatically tops up a spent Energy point before timed regeneration',()=>{
  const now=1_030_000,result=regenerateEnergy(base({energy:39,energyReserve:2,energyUpdatedAt:1_000_000}),now);
  assert.equal(result.state.energy,40);assert.equal(result.state.energyReserve,1);assert.equal(result.reserveUsed,1);assert.equal(result.gained,1);
  assert.equal(result.state.energyUpdatedAt,1_000_000);
});

test('reserve and elapsed regeneration combine deterministically without exceeding cap',()=>{
  const start=1_000_000,result=regenerateEnergy(base({energy:37,energyReserve:1,energyUpdatedAt:start}),start+ENERGY_REGEN_MS);
  assert.equal(result.state.energy,39);assert.equal(result.state.energyReserve,0);assert.equal(result.reserveUsed,1);assert.equal(result.gained,2);
});

test('legacy saves gain an explicit zero reserve without losing current Energy',()=>{
  const start=1_000_000,input={energy:23,maxEnergy:40,energyUpdatedAt:start,updatedAt:0};
  const result=regenerateEnergy(input,start+30_000);
  assert.equal(result.changed,true);assert.equal(result.state.energy,23);assert.equal(result.state.energyReserve,0);
});

test('player-facing labels expose earned Reserve capacity instead of hiding overflow behavior',()=>{
  const baseState=base({energyReserve:3});
  assert.equal(energyReserveLabel(baseState),'Reserve 3/5');assert.equal(energyStatusLabel(baseState,1_000_000),'Reserve 3/5');
  const advanced=base({energy:55,maxEnergy:55,energyReserve:6});
  assert.equal(energyReserveLabel(advanced),'Reserve 6/8');assert.equal(energyStatusLabel(advanced,1_000_000),'Reserve 6/8');
});

test('Energy UI and Browser QA document Reserve capacity as a visible fair Level reward',async()=>{
  const [ui,workflow,docs]=await Promise.all([read('src/aaa-energy-ui.js'),read('.github/workflows/browser-qa.yml'),read('docs/ENERGY_SYSTEM.md')]);
  assert.match(ui,/ENERGIE-RESERVE/);assert.match(ui,/automatisch zuerst genutzt/);assert.match(ui,/wächst mit Max-Energie/);
  assert.match(workflow,/energy-reserve-qa\.mjs/);
  assert.match(docs,/5 → 6 → 7 → 8/);assert.match(docs,/keine neue Währung/i);
});
