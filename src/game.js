export const DEFAULT_SIZE = 8;
export const DEFAULT_TYPES = 5;
export const MIN_CHAIN = 3;

export function indexOf(row, col, size = DEFAULT_SIZE) {
  return row * size + col;
}

export function coordsOf(index, size = DEFAULT_SIZE) {
  return { row: Math.floor(index / size), col: index % size };
}

export function tileBase(value) {
  if (value === null || value === undefined) return value;
  return value % 100;
}

export function specialKind(value) {
  if (value === null || value === undefined) return 0;
  return Math.floor(value / 100);
}

export function makeSpecial(base, kind) {
  if (!Number.isInteger(base) || base < 0) throw new Error('Invalid tile base');
  if (![1, 2].includes(kind)) throw new Error('Invalid special kind');
  return kind * 100 + base;
}

export function areChainNeighbours(a, b, size = DEFAULT_SIZE) {
  if (a === b) return false;
  const ac = coordsOf(a, size);
  const bc = coordsOf(b, size);
  const dr = Math.abs(ac.row - bc.row);
  const dc = Math.abs(ac.col - bc.col);
  return dr <= 1 && dc <= 1 && dr + dc > 0;
}

export function isValidChain(board, path, size = DEFAULT_SIZE, minLength = MIN_CHAIN) {
  if (!Array.isArray(path) || path.length < minLength) return false;
  if (new Set(path).size !== path.length) return false;
  const first = path[0];
  if (!Number.isInteger(first) || first < 0 || first >= board.length) return false;
  const base = tileBase(board[first]);
  if (base === null || base === undefined) return false;

  for (let i = 0; i < path.length; i += 1) {
    const index = path[i];
    if (!Number.isInteger(index) || index < 0 || index >= board.length) return false;
    if (tileBase(board[index]) !== base) return false;
    if (i > 0 && !areChainNeighbours(path[i - 1], index, size)) return false;
  }
  return true;
}

function neighboursOf(index, size) {
  const { row, col } = coordsOf(index, size);
  const result = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (nextRow < 0 || nextRow >= size || nextCol < 0 || nextCol >= size) continue;
      result.push(indexOf(nextRow, nextCol, size));
    }
  }
  return result;
}

export function findHintChain(board, size = DEFAULT_SIZE, minLength = MIN_CHAIN) {
  const visited = new Set();

  function search(path, base) {
    if (path.length >= minLength) return path.slice();
    const current = path[path.length - 1];
    for (const next of neighboursOf(current, size)) {
      if (visited.has(next)) continue;
      if (tileBase(board[next]) !== base) continue;
      visited.add(next);
      path.push(next);
      const found = search(path, base);
      if (found) return found;
      path.pop();
      visited.delete(next);
    }
    return null;
  }

  for (let start = 0; start < board.length; start += 1) {
    if (board[start] === null || board[start] === undefined) continue;
    visited.clear();
    visited.add(start);
    const found = search([start], tileBase(board[start]));
    if (found) return found;
  }
  return [];
}

export function hasValidChain(board, size = DEFAULT_SIZE, minLength = MIN_CHAIN) {
  return findHintChain(board, size, minLength).length >= minLength;
}

export function collapse(board, size = DEFAULT_SIZE, randomTile = () => 0) {
  const next = board.slice();
  for (let col = 0; col < size; col += 1) {
    const values = [];
    for (let row = size - 1; row >= 0; row -= 1) {
      const value = next[indexOf(row, col, size)];
      if (value !== null && value !== undefined) values.push(value);
    }
    for (let row = size - 1, i = 0; row >= 0; row -= 1, i += 1) {
      next[indexOf(row, col, size)] = i < values.length ? values[i] : randomTile();
    }
  }
  return next;
}

function clearIndices(board, indices) {
  const next = board.slice();
  for (const index of indices) next[index] = null;
  return next;
}

function expandSpecials(board, clear, chainBase, size) {
  const activations = [];
  const queue = [...clear];
  const seenSpecials = new Set();

  while (queue.length) {
    const index = queue.shift();
    const kind = specialKind(board[index]);
    if (!kind || seenSpecials.has(index)) continue;
    seenSpecials.add(index);
    activations.push({ index, kind });

    if (kind === 1) {
      const { row, col } = coordsOf(index, size);
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          const r = row + dr;
          const c = col + dc;
          if (r < 0 || r >= size || c < 0 || c >= size) continue;
          const target = indexOf(r, c, size);
          if (!clear.has(target)) {
            clear.add(target);
            queue.push(target);
          }
        }
      }
    }

    if (kind === 2) {
      for (let target = 0; target < board.length; target += 1) {
        if (tileBase(board[target]) !== chainBase) continue;
        if (!clear.has(target)) {
          clear.add(target);
          queue.push(target);
        }
      }
    }
  }

  return activations;
}

export function scoreForChain(chainLength, clearedCount = chainLength, activations = 0) {
  if (chainLength < MIN_CHAIN) return 0;
  const lengthBonus = Math.max(0, chainLength - MIN_CHAIN);
  return clearedCount * 100 + lengthBonus * lengthBonus * 85 + activations * 550;
}

function creationForPath(board, path) {
  if (path.length < 5) return null;
  const kind = path.length >= 7 ? 2 : 1;
  for (let i = path.length - 1; i >= 0; i -= 1) {
    const index = path[i];
    if (specialKind(board[index]) === 0) {
      return { index, kind, value: makeSpecial(tileBase(board[index]), kind) };
    }
  }
  return null;
}

export function resolveChain(board, path, size = DEFAULT_SIZE, randomTile = () => 0) {
  if (!isValidChain(board, path, size)) {
    return {
      valid: false,
      reason: path.length < MIN_CHAIN ? 'too-short' : 'invalid-chain',
      board,
      cleared: [],
      score: 0,
      creation: null,
      activations: [],
    };
  }

  const before = board.slice();
  const chainBase = tileBase(before[path[0]]);
  const clear = new Set(path);
  const activations = expandSpecials(before, clear, chainBase, size);
  const creation = creationForPath(before, path);

  if (creation) clear.delete(creation.index);

  const cleared = [...clear].sort((a, b) => a - b);
  const score = scoreForChain(path.length, cleared.length, activations.length);
  let afterClear = clearIndices(before, cleared);
  if (creation) afterClear[creation.index] = creation.value;
  const after = collapse(afterClear, size, randomTile);

  return {
    valid: true,
    reason: null,
    board: after,
    before,
    cleared,
    afterClear,
    score,
    creation,
    activations,
    chainLength: path.length,
    base: chainBase,
  };
}

function randomBoard(size, types, rng) {
  return Array.from({ length: size * size }, () => Math.floor(rng() * types));
}

export function createBoard(size = DEFAULT_SIZE, types = DEFAULT_TYPES, rng = Math.random) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const board = randomBoard(size, types, rng);
    if (hasValidChain(board, size)) return board;
  }
  throw new Error('Could not create a board with a connectable chain');
}

export function reshuffleBoard(board, size = DEFAULT_SIZE, rng = Math.random) {
  const source = board.filter((value) => value !== null && value !== undefined);
  if (source.length !== size * size) throw new Error('Cannot reshuffle an incomplete board');

  for (let attempt = 0; attempt < 180; attempt += 1) {
    const next = source.slice();
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    if (hasValidChain(next, size)) return next;
  }

  throw new Error('Could not reshuffle into a connectable board');
}
