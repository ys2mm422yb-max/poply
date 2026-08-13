import { tileBase } from './game.js';

export function createObjectiveState() {
  return {
    collected: {},
    longestChain: 0,
    powersActivated: 0,
  };
}

export function applyChainToObjectives(state, result) {
  const next = {
    collected: { ...(state?.collected || {}) },
    longestChain: Math.max(state?.longestChain || 0, result?.chainLength || 0),
    powersActivated: (state?.powersActivated || 0) + (result?.activations?.length || 0),
  };

  const before = result?.before || [];
  for (const index of result?.cleared || []) {
    const base = tileBase(before[index]);
    if (base === null || base === undefined) continue;
    next.collected[base] = (next.collected[base] || 0) + 1;
  }

  return next;
}

export function progressForGoal(goal, state) {
  if (!goal) return { current: 0, target: 0, complete: false };
  const target = Math.max(0, Number(goal.target) || 0);
  let current = 0;

  if (goal.kind === 'collect') current = state?.collected?.[goal.base] || 0;
  if (goal.kind === 'chain') current = state?.longestChain || 0;
  if (goal.kind === 'power') current = state?.powersActivated || 0;

  return {
    current,
    target,
    complete: target > 0 ? current >= target : true,
  };
}

export function areGoalsComplete(goals = [], state = createObjectiveState()) {
  return goals.every((goal) => progressForGoal(goal, state).complete);
}

export function remainingGoalCount(goals = [], state = createObjectiveState()) {
  return goals.filter((goal) => !progressForGoal(goal, state).complete).length;
}
