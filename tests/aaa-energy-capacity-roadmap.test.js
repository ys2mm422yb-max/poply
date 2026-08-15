import test from 'node:test';
import assert from 'node:assert/strict';
import { energyCapacityRoadmap } from '../src/aaa-progression.js';

test('Energy capacity roadmap points fresh players to the first permanent cap increase',()=>{
  assert.deepEqual(energyCapacityRoadmap(0,40),{
    currentMaxEnergy:40,
    nextMilestoneLevel:5,
    nextMaxEnergy:45,
    gain:5,
    levelsAway:4,
    complete:false
  });
});

test('Energy capacity roadmap advances to the next unearned capacity milestone',()=>{
  assert.deepEqual(energyCapacityRoadmap(840,45),{
    currentMaxEnergy:45,
    nextMilestoneLevel:10,
    nextMaxEnergy:50,
    gain:5,
    levelsAway:5,
    complete:false
  });
});

test('Energy capacity roadmap is complete after the final milestone and respects larger legacy caps',()=>{
  const level15Xp=6600;
  assert.deepEqual(energyCapacityRoadmap(level15Xp,55),{
    currentMaxEnergy:55,
    nextMilestoneLevel:null,
    nextMaxEnergy:55,
    gain:0,
    levelsAway:0,
    complete:true
  });
  assert.deepEqual(energyCapacityRoadmap(840,60),{
    currentMaxEnergy:60,
    nextMilestoneLevel:null,
    nextMaxEnergy:60,
    gain:0,
    levelsAway:0,
    complete:true
  });
});
