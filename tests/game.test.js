import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areAdjacent,
  attemptSwap,
  createBoard,
  findMatchGroups,
  findMatches,
  getValidMoves,
  hasValidMove,
  makeSpecial,
  reshuffleBoard,
  scoreFor,
  specialKind,
  swap,
  tileBase,
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

test('match groups preserve orientation and length', () => {
  const board = [
    2, 2, 2, 2,
    0, 1, 3, 4,
    0, 1, 3, 4,
    5, 1, 0, 2,
  ];
  const groups = findMatchGroups(board, 4);
  assert.ok(groups.some((group) => group.orientation === 'row' && group.length === 4 && group.type === 2));
  assert.ok(groups.some((group) => group.orientation === 'col' && group.length === 3 && group.type === 1));
});

test('special encoding keeps its base color', () => {
  const rowSpecial = makeSpecial(4, 1);
  const burstSpecial = makeSpecial(2, 3);
  assert.equal(tileBase(rowSpecial), 4);
  assert.equal(specialKind(rowSpecial), 1);
  assert.equal(tileBase(burstSpecial), 2);
  assert.equal(specialKind(burstSpecial), 3);
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

test('invalid swaps leave the settled board unchanged', () => {
  const board = [
    0, 1, 2,
    1, 2, 0,
    2, 0, 1,
  ];
  const result = attemptSwap(board, 0, 1, 3, () => 0);
  assert.equal(result.valid, false);
  assert.equal(result.board, board);
  assert.notEqual(result.swappedBoard, board);
});

test('score rewards chain depth, larger groups and power activations', () => {
  assert.equal(scoreFor(3, 1), 300);
  assert.equal(scoreFor(3, 2), 600);
  assert.ok(scoreFor(4, 1, 4) > scoreFor(3, 1));
  assert.ok(scoreFor(3, 1, 3, 1) > scoreFor(3, 1));
});

test('a valid swap exposes animation steps and awards points', () => {
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
  assert.equal(result.steps.length, 1);
  assert.equal(result.steps[0].matches.length, 3);
  assert.equal(findMatches(result.board, 3).length, 0);
});

test('a four-match creates a persistent line special instead of clearing every matched tile', () => {
  const board = [
    0, 2, 3, 4,
    1, 1, 2, 1,
    3, 4, 1, 2,
    4, 3, 2, 0,
  ];
  const result = attemptSwap(board, 6, 10, 4, () => 5);
  assert.equal(result.valid, true);
  assert.ok(result.steps[0].creations.length >= 1);
  assert.ok(result.board.some((value) => specialKind(value) > 0));
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
