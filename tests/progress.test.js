import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultProgress,
  normalizeProgress,
  recordLevelWin,
  selectLevel,
  totalStars,
} from '../src/progress.js';

test('default progress starts on level one', () => {
  assert.deepEqual(defaultProgress(8), {
    version: 1,
    unlocked: 1,
    currentLevel: 1,
    stars: {},
    bestChains: {},
    levelCount: 8,
  });
});

test('winning a level records best stars and unlocks the next level', () => {
  let progress = defaultProgress(8);
  progress = recordLevelWin(progress, 1, 2, 6, 8);
  assert.equal(progress.unlocked, 2);
  assert.equal(progress.stars[1], 2);
  assert.equal(progress.bestChains[1], 6);

  progress = recordLevelWin(progress, 1, 1, 4, 8);
  assert.equal(progress.stars[1], 2);
  assert.equal(progress.bestChains[1], 6);
});

test('locked levels cannot be selected', () => {
  const progress = defaultProgress(8);
  assert.equal(selectLevel(progress, 4, 8).currentLevel, 1);
});

test('normalization clamps corrupt persisted values', () => {
  const progress = normalizeProgress({ unlocked: 999, currentLevel: -2, stars: { 1: 9 } }, 5);
  assert.equal(progress.unlocked, 5);
  assert.equal(progress.currentLevel, 1);
  assert.equal(progress.stars[1], 3);
});

test('total stars sums stored mastery', () => {
  assert.equal(totalStars({ stars: { 1: 3, 2: 2, 3: 1 } }), 6);
});
