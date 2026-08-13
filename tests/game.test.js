import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areAdjacent,
  attemptSwap,
  createBoard,
  findMatches,
  getValidMoves,
  hasValidMove,
  reshuffleBoard,
  scoreFor,
  swap,
} from '../src/game.js';

function seededRandom(seed = 123456789) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

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

test('new boards do not start with automatic matches and have a valid move', () => {
  const rng = seededRandom(42);
  for (let i = 0; i < 100; i += 1) {
    const board = createBoard(8, 6, rng);
    assert.equal(findMatches(board, 8).length, 0);
    assert.equal(hasValidMove(board, 8), true);
  }
});

test('valid move discovery returns only adjacent swaps that create matches', () => {
  const board = [
    0, 1, 0,
    2, 0, 2,
    1, 0, 1,
  ];
  const moves = getValidMoves(board, 3);
  assert.ok(moves.length > 0);
  for (const [a, b] of moves) {
    assert.equal(areAdjacent(a, b, 3), true);
    assert.ok(findMatches(swap(board, a, b), 3).length > 0);
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

test('a valid swap resolves its match and awards points', () => {
  const board = [
    0, 1, 0,
    2, 0, 2,
    1, 0, 1,
  ];
  const refills = [1, 2, 1];
  const result = attemptSwap(board, 1, 4, 3, () => refills.shift());
  assert.equal(result.valid, true);
  assert.equal(result.score, 300);
  assert.equal(result.chain, 1);
  assert.equal(findMatches(result.board, 3).length, 0);
});

test('reshuffling preserves pieces and returns a playable board without matches', () => {
  const rng = seededRandom(2026);
  const board = createBoard(8, 6, rng);
  const before = board.slice().sort((a, b) => a - b);
  const reshuffled = reshuffleBoard(board, 8, rng);
  const after = reshuffled.slice().sort((a, b) => a - b);

  assert.deepEqual(after, before);
  assert.equal(findMatches(reshuffled, 8).length, 0);
  assert.equal(hasValidMove(reshuffled, 8), true);
});
