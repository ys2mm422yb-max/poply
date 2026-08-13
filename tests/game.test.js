import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areAdjacent,
  attemptSwap,
  createBoard,
  findMatches,
  scoreFor,
  swap,
} from '../src/game.js';

test('adjacency only accepts orthogonal neighbours', () => {
  assert.equal(areAdjacent(0, 1, 8), true);
  assert.equal(areAdjacent(0, 8, 8), true);
  assert.equal(areAdjacent(0, 9, 8), false);
  assert.equal(areAdjacent(0, 2, 8), false);
});

test('swap does not mutate the source board', () => {
  const source = [0, 1, 2, 3];
  const next = swap(source, 0, 1);
  assert.deepEqual(source, [0, 1, 2, 3]);
  assert.deepEqual(next, [1, 0, 2, 3]);
});

test('findMatches detects horizontal and vertical runs', () => {
  const board = [
    1, 1, 1, 2,
    0, 2, 1, 3,
    0, 3, 1, 2,
    2, 0, 3, 1,
  ];
  assert.deepEqual(findMatches(board, 4), [0, 1, 2, 6, 10]);
});

test('new boards do not start with automatic matches', () => {
  for (let i = 0; i < 100; i += 1) {
    assert.equal(findMatches(createBoard(8, 6), 8).length, 0);
  }
});

test('invalid swaps leave the board unchanged', () => {
  const board = [
    0, 1, 2,
    1, 2, 0,
    2, 0, 1,
  ];
  const result = attemptSwap(board, 0, 1, 3, () => 0);
  assert.equal(result.valid, false);
  assert.equal(result.board, board);
});

test('score rewards chain depth', () => {
  assert.equal(scoreFor(3, 1), 300);
  assert.equal(scoreFor(3, 2), 600);
  assert.equal(scoreFor(4, 3), 1200);
});
