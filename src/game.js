export const DEFAULT_SIZE = 8;
export const DEFAULT_TYPES = 6;

export function indexOf(row, col, size = DEFAULT_SIZE) {
  return row * size + col;
}

export function coordsOf(index, size = DEFAULT_SIZE) {
  return { row: Math.floor(index / size), col: index % size };
}

export function areAdjacent(a, b, size = DEFAULT_SIZE) {
  const ac = coordsOf(a, size);
  const bc = coordsOf(b, size);
  return Math.abs(ac.row - bc.row) + Math.abs(ac.col - bc.col) === 1;
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
  if (![1, 2, 3].includes(kind)) throw new Error('Invalid special kind');
  return kind * 100 + base;
}

export function swap(board, a, b) {
  const next = board.slice();
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

export function findMatchGroups(board, size = DEFAULT_SIZE) {
  const groups = [];

  for (let row = 0; row < size; row += 1) {
    let start = 0;
    for (let col = 1; col <= size; col += 1) {
      const current = col < size ? tileBase(board[indexOf(row, col, size)]) : null;
      const previous = tileBase(board[indexOf(row, col - 1, size)]);
      if (current !== previous) {
        if (col - start >= 3 && previous !== null && previous !== undefined) {
          const indices = [];
          for (let x = start; x < col; x += 1) indices.push(indexOf(row, x, size));
          groups.push({ orientation: 'row', type: previous, length: indices.length, indices });
        }
        start = col;
      }
    }
  }

  for (let col = 0; col < size; col += 1) {
    let start = 0;
    for (let row = 1; row <= size; row += 1) {
      const current = row < size ? tileBase(board[indexOf(row, col, size)]) : null;
      const previous = tileBase(board[indexOf(row - 1, col, size)]);
      if (current !== previous) {
        if (row - start >= 3 && previous !== null && previous !== undefined) {
          const indices = [];
          for (let y = start; y < row; y += 1) indices.push(indexOf(y, col, size));
          groups.push({ orientation: 'col', type: previous, length: indices.length, indices });
        }
        start = row;
      }
    }
  }

  return groups;
}

export function findMatches(board, size = DEFAULT_SIZE) {
  const matched = new Set();
  for (const group of findMatchGroups(board, size)) {
    for (const index of group.indices) matched.add(index);
  }
  return [...matched].sort((a, b) => a - b);
}

function expandedClearSet(board, groups, size) {
  const clear = new Set();
  for (const group of groups) {
    for (const index of group.indices) clear.add(index);
  }

  const activations = [];
  for (const index of [...clear]) {
    const kind = specialKind(board[index]);
    if (!kind) continue;
    activations.push({ index, kind });
    const { row, col } = coordsOf(index, size);

    if (kind === 1 || kind === 3) {
      for (let x = 0; x < size; x += 1) clear.add(indexOf(row, x, size));
    }
    if (kind === 2 || kind === 3) {
      for (let y = 0; y < size; y += 1) clear.add(indexOf(y, col, size));
    }
  }

  return { clear, activations };
}

function pickCreationIndex(group, preferredIndex) {
  if (preferredIndex !== null && preferredIndex !== undefined && group.indices.includes(preferredIndex)) {
    return preferredIndex;
  }
  return group.indices[Math.floor(group.indices.length / 2)];
}

function specialCreations(board, groups, preferredIndex, chain) {
  const creations = [];
  const reserved = new Set();

  for (const group of groups) {
    if (group.length < 4) continue;
    const index = pickCreationIndex(group, chain === 1 ? preferredIndex : null);
    if (reserved.has(index) || specialKind(board[index]) > 0) continue;

    const kind = group.length >= 5 ? 3 : group.orientation === 'row' ? 1 : 2;
    creations.push({ index, value: makeSpecial(group.type, kind), kind, type: group.type });
    reserved.add(index);
  }

  return creations;
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

export function clearMatches(board, matches) {
  const next = board.slice();
  for (const index of matches) next[index] = null;
  return next;
}

export function scoreFor(matches, chain = 1, largestGroup = 3, activations = 0) {
  if (matches <= 0) return 0;
  const base = matches * 100 * Math.max(1, chain);
  const groupBonus = Math.max(0, largestGroup - 3) * 250 * Math.max(1, chain);
  const powerBonus = Math.max(0, activations) * 400 * Math.max(1, chain);
  return base + groupBonus + powerBonus;
}

export function resolveBoard(board, size = DEFAULT_SIZE, randomTile = () => 0, preferredIndex = null) {
  let next = board.slice();
  let score = 0;
  let chain = 0;
  const steps = [];
  let groups = findMatchGroups(next, size);

  while (groups.length > 0) {
    chain += 1;
    const before = next.slice();
    const { clear, activations } = expandedClearSet(before, groups, size);
    const creations = specialCreations(before, groups, preferredIndex, chain);

    for (const creation of creations) clear.delete(creation.index);

    const matched = [...clear].sort((a, b) => a - b);
    const largestGroup = Math.max(...groups.map((group) => group.length));
    const stepScore = scoreFor(matched.length, chain, largestGroup, activations.length);

    let afterClear = clearMatches(before, matched);
    for (const creation of creations) afterClear[creation.index] = creation.value;
    const after = collapse(afterClear, size, randomTile);

    steps.push({
      board: before,
      matches: matched,
      groups,
      creations,
      activations,
      score: stepScore,
      chain,
      after,
    });

    score += stepScore;
    next = after;
    groups = findMatchGroups(next, size);
    preferredIndex = null;

    if (chain > 50) throw new Error('Resolution exceeded safe chain limit');
  }

  return { board: next, score, chain, steps };
}

export function getValidMoves(board, size = DEFAULT_SIZE) {
  const moves = [];

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const current = indexOf(row, col, size);
      if (col + 1 < size) {
        const right = indexOf(row, col + 1, size);
        if (findMatches(swap(board, current, right), size).length > 0) moves.push([current, right]);
      }
      if (row + 1 < size) {
        const below = indexOf(row + 1, col, size);
        if (findMatches(swap(board, current, below), size).length > 0) moves.push([current, below]);
      }
    }
  }

  return moves;
}

export function hasValidMove(board, size = DEFAULT_SIZE) {
  return getValidMoves(board, size).length > 0;
}

export function reshuffleBoard(board, size = DEFAULT_SIZE, rng = Math.random) {
  const source = board.filter((value) => value !== null && value !== undefined);
  if (source.length !== size * size) throw new Error('Cannot reshuffle an incomplete board');

  for (let attempt = 0; attempt < 150; attempt += 1) {
    const next = source.slice();
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    if (findMatches(next, size).length === 0 && hasValidMove(next, size)) return next;
  }

  throw new Error('Could not reshuffle into a playable board');
}

export function attemptSwap(board, a, b, size = DEFAULT_SIZE, randomTile = () => 0) {
  if (!areAdjacent(a, b, size)) {
    return { valid: false, reason: 'not-adjacent', board, swappedBoard: board, score: 0, chain: 0, steps: [] };
  }

  if (tileBase(board[a]) === tileBase(board[b])) {
    return { valid: false, reason: 'same-color', board, swappedBoard: board, score: 0, chain: 0, steps: [] };
  }

  const swapped = swap(board, a, b);
  if (findMatches(swapped, size).length === 0) {
    return { valid: false, reason: 'no-match', board, swappedBoard: swapped, score: 0, chain: 0, steps: [] };
  }

  const resolved = resolveBoard(swapped, size, randomTile, b);
  return { valid: true, reason: null, swappedBoard: swapped, ...resolved };
}

function createCandidateBoard(size, types, rng) {
  const board = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const disallowed = new Set();
      if (col >= 2) {
        const a = tileBase(board[indexOf(row, col - 1, size)]);
        const b = tileBase(board[indexOf(row, col - 2, size)]);
        if (a === b) disallowed.add(a);
      }
      if (row >= 2) {
        const a = tileBase(board[indexOf(row - 1, col, size)]);
        const b = tileBase(board[indexOf(row - 2, col, size)]);
        if (a === b) disallowed.add(a);
      }
      const options = Array.from({ length: types }, (_, i) => i).filter((x) => !disallowed.has(x));
      board.push(options[Math.floor(rng() * options.length)]);
    }
  }
  return board;
}

export function createBoard(size = DEFAULT_SIZE, types = DEFAULT_TYPES, rng = Math.random) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const board = createCandidateBoard(size, types, rng);
    if (hasValidMove(board, size)) return board;
  }
  throw new Error('Could not create a playable board');
}
