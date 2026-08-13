import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areChainNeighbours,
  createBoard,
  findHintChain,
  hasValidChain,
  isValidChain,
  makeSpecial,
  reshuffleBoard,
  resolveChain,
  scoreForChain,
  specialKind,
  tileBase,
} from '../src/game.js';

function seededRandom(seed = 123456789) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test('chains can move horizontally, vertically and diagonally', () => {
  assert.equal(areChainNeighbours(0, 1, 4), true);
  assert.equal(areChainNeighbours(0, 4, 4), true);
  assert.equal(areChainNeighbours(0, 5, 4), true);
  assert.equal(areChainNeighbours(0, 2, 4), false);
  assert.equal(areChainNeighbours(0, 0, 4), false);
});

test('a valid chain uses at least three unique matching pieces', () => {
  const board = [
    2, 2, 0,
    1, 2, 3,
    4, 0, 1,
  ];
  assert.equal(isValidChain(board, [0, 1, 4], 3), true);
  assert.equal(isValidChain(board, [0, 1], 3), false);
  assert.equal(isValidChain(board, [0, 1, 0], 3), false);
  assert.equal(isValidChain(board, [0, 1, 2], 3), false);
});

test('hint discovery returns a real same-colour chain', () => {
  const board = [
    0, 1, 2,
    1, 4, 2,
    3, 2, 2,
  ];
  const hint = findHintChain(board, 3);
  assert.equal(hint.length, 3);
  assert.equal(isValidChain(board, hint, 3), true);
});

test('new boards always contain at least one playable chain', () => {
  const rng = seededRandom(42);
  for (let i = 0; i < 100; i += 1) {
    const board = createBoard(8, 5, rng);
    assert.equal(board.length, 64);
    assert.equal(hasValidChain(board, 8), true);
  }
});

test('resolving a three-chain clears it, refills the board and awards score', () => {
  const board = [
    0, 0, 0,
    1, 2, 3,
    4, 1, 2,
  ];
  const result = resolveChain(board, [0, 1, 2], 3, () => 4);
  assert.equal(result.valid, true);
  assert.deepEqual(result.cleared, [0, 1, 2]);
  assert.equal(result.score, 300);
  assert.equal(result.board.length, 9);
  assert.equal(result.board.every((value) => value !== null), true);
});

test('longer chains score more than short chains', () => {
  assert.equal(scoreForChain(3, 3, 0), 300);
  assert.ok(scoreForChain(5, 4, 0) > scoreForChain(3, 3, 0));
  assert.ok(scoreForChain(7, 6, 0) > scoreForChain(5, 4, 0));
  assert.ok(scoreForChain(3, 9, 1) > scoreForChain(3, 3, 0));
});

test('a five-chain creates a persistent blast power piece', () => {
  const board = [
    0, 0, 1,
    0, 0, 2,
    0, 3, 4,
  ];
  const path = [0, 1, 4, 3, 6];
  const result = resolveChain(board, path, 3, () => 2);
  assert.equal(result.valid, true);
  assert.equal(result.creation?.kind, 1);
  assert.ok(result.board.some((value) => specialKind(value) === 1));
});

test('a seven-chain creates a prism power piece', () => {
  const board = [
    1, 1, 1,
    1, 1, 2,
    1, 1, 3,
  ];
  const path = [0, 1, 2, 4, 3, 6, 7];
  const result = resolveChain(board, path, 3, () => 4);
  assert.equal(result.valid, true);
  assert.equal(result.creation?.kind, 2);
  assert.ok(result.board.some((value) => specialKind(value) === 2));
});

test('including a blast in a chain clears its surrounding 3x3 area', () => {
  const board = [
    0, 0, 1,
    2, makeSpecial(0, 1), 3,
    4, 1, 2,
  ];
  const result = resolveChain(board, [0, 1, 4], 3, () => 2);
  assert.equal(result.valid, true);
  assert.equal(result.activations.length, 1);
  assert.equal(result.cleared.length, 9);
});

test('including a prism clears every piece of the connected colour', () => {
  const board = [
    makeSpecial(0, 2), 0, 1, 2,
    3, 0, 4, 1,
    2, 3, 0, 4,
    1, 2, 3, 0,
  ];
  const result = resolveChain(board, [0, 1, 5], 4, () => 2);
  assert.equal(result.valid, true);
  assert.equal(result.activations.length, 1);
  assert.ok(result.cleared.includes(10));
  assert.ok(result.cleared.includes(15));
});

test('special encoding preserves the visible base colour', () => {
  const blast = makeSpecial(4, 1);
  const prism = makeSpecial(2, 2);
  assert.equal(tileBase(blast), 4);
  assert.equal(specialKind(blast), 1);
  assert.equal(tileBase(prism), 2);
  assert.equal(specialKind(prism), 2);
});

test('reshuffling preserves pieces and returns a playable board', () => {
  const rng = seededRandom(2026);
  const board = createBoard(8, 5, rng);
  const before = board.slice().sort((a, b) => a - b);
  const reshuffled = reshuffleBoard(board, 8, rng);
  const after = reshuffled.slice().sort((a, b) => a - b);
  assert.deepEqual(after, before);
  assert.equal(hasValidChain(reshuffled, 8), true);
});
