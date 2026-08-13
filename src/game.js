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

export function swap(board, a, b) {
  const next = board.slice();
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

export function findMatches(board, size = DEFAULT_SIZE) {
  const matched = new Set();

  for (let row = 0; row < size; row += 1) {
    let start = 0;
    for (let col = 1; col <= size; col += 1) {
      const current = col < size ? board[indexOf(row, col, size)] : null;
      const previous = board[indexOf(row, col - 1, size)];
      if (current !== previous) {
        if (col - start >= 3 && previous !== null && previous !== undefined) {
          for (let x = start; x < col; x += 1) matched.add(indexOf(row, x, size));
        }
        start = col;
      }
    }
  }

  for (let col = 0; col < size; col += 1) {
    let start = 0;
    for (let row = 1; row <= size; row += 1) {
      const current = row < size ? board[indexOf(row, col, size)] : null;
      const previous = board[indexOf(row - 1, col, size)];
      if (current !== previous) {
        if (row - start >= 3 && previous !== null && previous !== undefined) {
          for (let y = start; y < row; y += 1) matched.add(indexOf(y, col, size));
        }
        start = row;
      }
    }
  }

  return [...matched].sort((a, b) => a - b);
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

export function scoreFor(matches, chain = 1) {
  if (matches <= 0) return 0;
  return matches * 100 * Math.max(1, chain);
}

export function resolveBoard(board, size = DEFAULT_SIZE, randomTile = () => 0) {
  let next = board.slice();
  let score = 0;
  let chain = 0;
  let matches = findMatches(next, size);

  while (matches.length > 0) {
    chain += 1;
    score += scoreFor(matches.length, chain);
    next = collapse(clearMatches(next, matches), size, randomTile);
    matches = findMatches(next, size);
    if (chain > 50) throw new Error('Resolution exceeded safe chain limit');
  }

  return { board: next, score, chain };
}

export function attemptSwap(board, a, b, size = DEFAULT_SIZE, randomTile = () => 0) {
  if (!areAdjacent(a, b, size)) return { valid: false, board, score: 0, chain: 0 };
  const swapped = swap(board, a, b);
  if (findMatches(swapped, size).length === 0) return { valid: false, board, score: 0, chain: 0 };
  const resolved = resolveBoard(swapped, size, randomTile);
  return { valid: true, ...resolved };
}

export function createBoard(size = DEFAULT_SIZE, types = DEFAULT_TYPES, rng = Math.random) {
  const board = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const disallowed = new Set();
      if (col >= 2) {
        const a = board[indexOf(row, col - 1, size)];
        const b = board[indexOf(row, col - 2, size)];
        if (a === b) disallowed.add(a);
      }
      if (row >= 2) {
        const a = board[indexOf(row - 1, col, size)];
        const b = board[indexOf(row - 2, col, size)];
        if (a === b) disallowed.add(a);
      }
      const options = Array.from({ length: types }, (_, i) => i).filter((x) => !disallowed.has(x));
      board.push(options[Math.floor(rng() * options.length)]);
    }
  }
  return board;
}
