import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyChainToObjectives,
  areGoalsComplete,
  createObjectiveState,
  progressForGoal,
  remainingGoalCount,
} from '../src/objectives.js';

test('chain results accumulate cleared colours, longest chain and power activations', () => {
  const state = createObjectiveState();
  const next = applyChainToObjectives(state, {
    before: [2, 2, 2, 3, 3],
    cleared: [0, 1, 2, 3],
    chainLength: 4,
    activations: [{ index: 1, kind: 1 }],
  });

  assert.equal(next.collected[2], 3);
  assert.equal(next.collected[3], 1);
  assert.equal(next.longestChain, 4);
  assert.equal(next.powersActivated, 1);
});

test('objective completion supports collect, chain and power goals', () => {
  const state = {
    collected: { 2: 10 },
    longestChain: 7,
    powersActivated: 2,
  };
  const goals = [
    { kind: 'collect', base: 2, target: 10 },
    { kind: 'chain', target: 6 },
    { kind: 'power', target: 1 },
  ];

  assert.equal(progressForGoal(goals[0], state).complete, true);
  assert.equal(areGoalsComplete(goals, state), true);
  assert.equal(remainingGoalCount(goals, state), 0);
});

test('incomplete goals stay incomplete without mutating state', () => {
  const state = createObjectiveState();
  const goals = [{ kind: 'chain', target: 5 }, { kind: 'power', target: 1 }];
  assert.equal(areGoalsComplete(goals, state), false);
  assert.equal(remainingGoalCount(goals, state), 2);
  assert.deepEqual(state, createObjectiveState());
});
