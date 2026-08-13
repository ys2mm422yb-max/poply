import {
  areAdjacent,
  attemptSwap,
  coordsOf,
  createBoard,
  hasValidMove,
  reshuffleBoard,
} from './game.js';

const SIZE = 8;
const TYPES = 6;
const LEVEL = Object.freeze({ number: 1, targetScore: 4500, moves: 20 });

const boardElement = document.querySelector('#board');
const scoreElement = document.querySelector('#score');
const targetElement = document.querySelector('#target');
const movesElement = document.querySelector('#moves');
const progressElement = document.querySelector('#progress');
const statusElement = document.querySelector('#status');
const newGameButton = document.querySelector('#new-game');

let board;
let selected;
let score;
let movesLeft;
let gameState;
let statusTimer = null;
let dragStart = null;
let suppressClick = false;

function randomTile() {
  return Math.floor(Math.random() * TYPES);
}

function render() {
  boardElement.replaceChildren();

  board.forEach((type, index) => {
    const { row, col } = coordsOf(index, SIZE);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `piece piece-${type}${selected === index ? ' selected' : ''}`;
    button.dataset.index = String(index);
    button.dataset.type = String(type);
    button.disabled = gameState !== 'playing';
    button.setAttribute('role', 'gridcell');
    button.setAttribute('aria-label', `Piece ${type + 1}, row ${row + 1}, column ${col + 1}`);
    button.addEventListener('click', () => {
      if (suppressClick) return;
      choose(index);
    });
    boardElement.append(button);
  });

  scoreElement.textContent = score.toLocaleString();
  targetElement.textContent = LEVEL.targetScore.toLocaleString();
  movesElement.textContent = String(movesLeft);
  progressElement.style.width = `${Math.min(100, (score / LEVEL.targetScore) * 100)}%`;
  newGameButton.textContent = gameState === 'playing' ? 'Restart level' : 'Play again';
}

function setStatus(message, tone = 'neutral', temporary = false) {
  if (statusTimer) clearTimeout(statusTimer);
  statusElement.textContent = message;
  statusElement.dataset.tone = tone;

  if (temporary) {
    statusTimer = setTimeout(() => {
      if (gameState === 'playing') {
        statusElement.textContent = 'Swipe a piece to match 3.';
        statusElement.dataset.tone = 'neutral';
      }
    }, 1250);
  }
}

function animateBoard(name) {
  boardElement.classList.remove('invalid', 'success', 'celebrate');
  void boardElement.offsetWidth;
  boardElement.classList.add(name);
}

function swipeTarget(index, dx, dy) {
  const { row, col } = coordsOf(index, SIZE);
  let targetRow = row;
  let targetCol = col;

  if (Math.abs(dx) > Math.abs(dy)) targetCol += dx > 0 ? 1 : -1;
  else targetRow += dy > 0 ? 1 : -1;

  if (targetRow < 0 || targetRow >= SIZE || targetCol < 0 || targetCol >= SIZE) return null;
  return targetRow * SIZE + targetCol;
}

function attemptMove(a, b) {
  if (gameState !== 'playing') return;

  const result = attemptSwap(board, a, b, SIZE, randomTile);
  selected = null;

  if (!result.valid) {
    animateBoard('invalid');
    setStatus('No match — try another swap.', 'bad', true);
    render();
    return;
  }

  board = result.board;
  score += result.score;
  movesLeft -= 1;

  let reshuffled = false;
  if (!hasValidMove(board, SIZE)) {
    board = reshuffleBoard(board, SIZE);
    reshuffled = true;
  }

  if (score >= LEVEL.targetScore) {
    gameState = 'won';
    animateBoard('celebrate');
    setStatus('Level clear! Nice run.', 'win');
  } else if (movesLeft <= 0) {
    gameState = 'lost';
    const missing = Math.max(0, LEVEL.targetScore - score);
    setStatus(`${missing.toLocaleString()} points short — give it another go.`, 'bad');
  } else if (reshuffled) {
    animateBoard('success');
    setStatus('Fresh possibilities — board reshuffled.', 'good', true);
  } else if (result.chain > 1) {
    animateBoard('success');
    setStatus(`${result.chain}× cascade · +${result.score.toLocaleString()}`, 'good', true);
  } else {
    animateBoard('success');
    setStatus(`Pop! +${result.score.toLocaleString()}`, 'good', true);
  }

  if (navigator.vibrate) navigator.vibrate(result.chain > 1 ? [10, 25, 10] : 8);
  render();
}

function choose(index) {
  if (gameState !== 'playing') return;

  if (selected === null) {
    selected = index;
    setStatus('Piece selected — choose a neighbour.');
    render();
    return;
  }

  if (selected === index) {
    selected = null;
    setStatus('Swipe a piece to match 3.');
    render();
    return;
  }

  if (!areAdjacent(selected, index, SIZE)) {
    selected = index;
    setStatus('Piece selected — choose a neighbour.');
    render();
    return;
  }

  attemptMove(selected, index);
}

function restartLevel() {
  board = createBoard(SIZE, TYPES);
  selected = null;
  score = 0;
  movesLeft = LEVEL.moves;
  gameState = 'playing';
  dragStart = null;
  setStatus('Swipe a piece to match 3.');
  render();
}

boardElement.addEventListener('pointerdown', (event) => {
  if (gameState !== 'playing') return;
  const piece = event.target.closest('.piece');
  if (!piece) return;

  dragStart = {
    index: Number(piece.dataset.index),
    x: event.clientX,
    y: event.clientY,
  };
});

boardElement.addEventListener('pointerup', (event) => {
  if (!dragStart || gameState !== 'playing') {
    dragStart = null;
    return;
  }

  const dx = event.clientX - dragStart.x;
  const dy = event.clientY - dragStart.y;
  const distance = Math.hypot(dx, dy);

  if (distance >= 18) {
    const target = swipeTarget(dragStart.index, dx, dy);
    if (target !== null) {
      suppressClick = true;
      attemptMove(dragStart.index, target);
      setTimeout(() => { suppressClick = false; }, 0);
    }
  }

  dragStart = null;
});

boardElement.addEventListener('pointercancel', () => {
  dragStart = null;
});

newGameButton.addEventListener('click', restartLevel);

restartLevel();
