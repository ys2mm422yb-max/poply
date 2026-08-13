import {
  areAdjacent,
  attemptSwap,
  coordsOf,
  createBoard,
  getValidMoves,
  hasValidMove,
  reshuffleBoard,
  specialKind,
  tileBase,
} from './game.js';

const SIZE = 8;
const TYPES = 6;
const LEVELS = Object.freeze([
  { number: 1, targetScore: 3600, moves: 18 },
  { number: 2, targetScore: 5200, moves: 19 },
  { number: 3, targetScore: 7000, moves: 20 },
  { number: 4, targetScore: 9000, moves: 21 },
  { number: 5, targetScore: 11200, moves: 22 },
]);

const boardElement = document.querySelector('#board');
const boardFrame = document.querySelector('#board-frame');
const fxElement = document.querySelector('#fx');
const comboElement = document.querySelector('#combo');
const scoreElement = document.querySelector('#score');
const targetElement = document.querySelector('#target');
const movesElement = document.querySelector('#moves');
const bestChainElement = document.querySelector('#best-chain');
const progressElement = document.querySelector('#progress');
const levelPillElement = document.querySelector('#level-pill');
const statusElement = document.querySelector('#status');
const restartButton = document.querySelector('#restart');
const resultElement = document.querySelector('#result');
const resultTitle = document.querySelector('#result-title');
const resultCopy = document.querySelector('#result-copy');
const resultScore = document.querySelector('#result-score');
const resultAction = document.querySelector('#result-action');
const starsElement = document.querySelector('#stars');

let levelIndex = 0;
let board = [];
let selected = null;
let score = 0;
let movesLeft = 0;
let bestChain = 1;
let gameState = 'playing';
let busy = false;
let dragStart = null;
let suppressClick = false;
let hintPair = [];
let hintTimer = null;
let statusTimer = null;
let audioContext = null;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const level = () => LEVELS[levelIndex];

function randomTile() {
  return Math.floor(Math.random() * TYPES);
}

function ensureAudio() {
  if (audioContext || !('AudioContext' in window || 'webkitAudioContext' in window)) return audioContext;
  const Context = window.AudioContext || window.webkitAudioContext;
  audioContext = new Context();
  return audioContext;
}

function playTone(frequency, duration = 0.06, gain = 0.035) {
  const context = ensureAudio();
  if (!context) return;
  if (context.state === 'suspended') context.resume();
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  volume.gain.setValueAtTime(gain, context.currentTime);
  volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

function playPop(chain = 1, power = false) {
  playTone(360 + Math.min(chain, 5) * 95, power ? 0.12 : 0.07, power ? 0.05 : 0.032);
  if (power) setTimeout(() => playTone(680 + chain * 60, 0.09, 0.028), 45);
}

function render(options = {}) {
  const matched = new Set(options.matched || []);
  const created = new Set((options.created || []).map((item) => item.index));
  const hint = new Set(hintPair);

  boardElement.replaceChildren();
  board.forEach((value, index) => {
    const base = tileBase(value);
    const special = specialKind(value);
    const { row, col } = coordsOf(index, SIZE);
    const button = document.createElement('button');
    const stateClasses = [
      'piece',
      `piece-${base}`,
      special ? `special-${special}` : '',
      selected === index ? 'selected' : '',
      matched.has(index) ? 'matched' : '',
      created.has(index) ? 'created' : '',
      hint.has(index) ? 'hinted' : '',
      options.dropping ? 'dropping' : '',
    ].filter(Boolean).join(' ');

    button.type = 'button';
    button.className = stateClasses;
    button.dataset.index = String(index);
    button.dataset.value = String(value);
    button.disabled = gameState !== 'playing' || busy;
    button.setAttribute('role', 'gridcell');
    button.setAttribute('aria-label', `${special ? 'Power ' : ''}piece ${base + 1}, row ${row + 1}, column ${col + 1}`);
    button.addEventListener('click', () => {
      if (!suppressClick) choose(index);
    });
    boardElement.append(button);
  });

  const current = level();
  scoreElement.textContent = score.toLocaleString();
  targetElement.textContent = current.targetScore.toLocaleString();
  movesElement.textContent = String(movesLeft);
  bestChainElement.textContent = `${bestChain}×`;
  levelPillElement.textContent = `Level ${current.number}`;
  progressElement.style.setProperty('--progress', `${Math.min(100, (score / current.targetScore) * 100)}%`);
}

function setStatus(message, tone = 'neutral', temporary = false) {
  if (statusTimer) clearTimeout(statusTimer);
  statusElement.textContent = message;
  statusElement.dataset.tone = tone;

  if (temporary) {
    statusTimer = setTimeout(() => {
      if (gameState === 'playing') {
        statusElement.textContent = 'Swipe to match 3. Make 4+ for powers.';
        statusElement.dataset.tone = 'neutral';
      }
    }, 1450);
  }
}

function animateFrame(name) {
  boardFrame.classList.remove('invalid', 'pulse', 'power', 'shuffle');
  void boardFrame.offsetWidth;
  boardFrame.classList.add(name);
}

function showCombo(message, power = false) {
  comboElement.textContent = message;
  comboElement.className = `combo-badge show${power ? ' power' : ''}`;
  setTimeout(() => comboElement.classList.remove('show'), 620);
}

function spawnBurst(indices, scoreValue, power = false) {
  if (!indices.length) return;
  const frameRect = boardFrame.getBoundingClientRect();
  const centers = [];

  for (const index of indices.slice(0, 18)) {
    const piece = boardElement.querySelector(`[data-index="${index}"]`);
    if (!piece) continue;
    const rect = piece.getBoundingClientRect();
    const x = rect.left - frameRect.left + rect.width / 2;
    const y = rect.top - frameRect.top + rect.height / 2;
    centers.push({ x, y });

    const sparkleCount = power ? 4 : 2;
    for (let i = 0; i < sparkleCount; i += 1) {
      const particle = document.createElement('i');
      particle.className = `particle${power ? ' power-particle' : ''}`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty('--dx', `${(Math.random() - 0.5) * (power ? 92 : 54)}px`);
      particle.style.setProperty('--dy', `${(Math.random() - 0.5) * (power ? 92 : 54)}px`);
      fxElement.append(particle);
      setTimeout(() => particle.remove(), 650);
    }
  }

  if (centers.length) {
    const center = centers[Math.floor(centers.length / 2)];
    const scorePop = document.createElement('b');
    scorePop.className = 'score-pop';
    scorePop.textContent = `+${scoreValue.toLocaleString()}`;
    scorePop.style.left = `${center.x}px`;
    scorePop.style.top = `${center.y}px`;
    fxElement.append(scorePop);
    setTimeout(() => scorePop.remove(), 760);
  }
}

function clearHint() {
  hintPair = [];
  if (hintTimer) clearTimeout(hintTimer);
  hintTimer = null;
}

function scheduleHint() {
  clearHint();
  if (gameState !== 'playing' || busy) return;
  hintTimer = setTimeout(() => {
    if (gameState !== 'playing' || busy || selected !== null) return;
    const moves = getValidMoves(board, SIZE);
    if (!moves.length) return;
    hintPair = moves[Math.floor(Math.random() * moves.length)];
    render();
    setStatus('A possible move is glowing.', 'hint');
    setTimeout(() => {
      if (gameState === 'playing') {
        hintPair = [];
        render();
        setStatus('Swipe to match 3. Make 4+ for powers.');
        scheduleHint();
      }
    }, 1700);
  }, 5200);
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

async function attemptMove(a, b) {
  if (gameState !== 'playing' || busy) return;
  clearHint();
  ensureAudio();
  const settledBoard = board;
  const result = attemptSwap(board, a, b, SIZE, randomTile);
  selected = null;

  if (!result.valid) {
    busy = true;
    board = result.swappedBoard;
    render();
    await wait(90);
    animateFrame('invalid');
    playTone(180, 0.06, 0.018);
    await wait(130);
    board = settledBoard;
    busy = false;
    render();
    setStatus('That swap does not make 3 in a row.', 'bad', true);
    scheduleHint();
    return;
  }

  busy = true;
  movesLeft -= 1;
  board = result.swappedBoard;
  render();
  await wait(115);

  for (const step of result.steps) {
    board = step.board;
    const power = step.creations.length > 0 || step.activations.length > 0;
    render({ matched: step.matches, created: step.creations });
    spawnBurst(step.matches, step.score, power);
    playPop(step.chain, power);

    if (power) {
      animateFrame('power');
      showCombo(step.creations.some((item) => item.kind === 3) ? 'CROSS BLAST!' : 'POWER POP!', true);
    } else if (step.chain >= 3) {
      showCombo(`${step.chain}× MEGA CASCADE`);
    } else if (step.chain === 2) {
      showCombo('2× CASCADE');
    }

    if (navigator.vibrate) navigator.vibrate(power ? [12, 22, 12] : 8);
    await wait(power ? 285 : 225);

    board = step.after;
    score += step.score;
    bestChain = Math.max(bestChain, step.chain);
    render({ dropping: true });
    await wait(175);
  }

  if (!hasValidMove(board, SIZE)) {
    setStatus('No moves — remixing the board.', 'hint');
    animateFrame('shuffle');
    await wait(280);
    board = reshuffleBoard(board, SIZE);
    render({ dropping: true });
    await wait(190);
  }

  busy = false;
  render();

  if (score >= level().targetScore) {
    gameState = 'won';
    render();
    setStatus('Level clear!', 'win');
    animateFrame('pulse');
    playTone(620, 0.12, 0.045);
    setTimeout(() => playTone(820, 0.16, 0.045), 110);
    await wait(520);
    showResult(true);
  } else if (movesLeft <= 0) {
    gameState = 'lost';
    render();
    setStatus('Out of moves.', 'bad');
    await wait(360);
    showResult(false);
  } else {
    const last = result.steps.at(-1);
    if (last?.chain > 1) setStatus(`${last.chain}× cascade · keep it going!`, 'good', true);
    else setStatus('Nice pop.', 'good', true);
    scheduleHint();
  }
}

function choose(index) {
  if (gameState !== 'playing' || busy) return;
  clearHint();
  ensureAudio();

  if (selected === null) {
    selected = index;
    render();
    setStatus('Now choose a neighbouring piece.');
    scheduleHint();
    return;
  }

  if (selected === index) {
    selected = null;
    render();
    setStatus('Swipe to match 3. Make 4+ for powers.');
    scheduleHint();
    return;
  }

  if (!areAdjacent(selected, index, SIZE)) {
    selected = index;
    render();
    setStatus('Choose a neighbour or swipe.');
    scheduleHint();
    return;
  }

  attemptMove(selected, index);
}

function starCount() {
  const ratio = movesLeft / level().moves;
  if (ratio >= 0.42) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
}

function showResult(won) {
  resultElement.hidden = false;
  if (won) {
    const stars = starCount();
    starsElement.textContent = `${'★ '.repeat(stars)}${'☆ '.repeat(3 - stars)}`.trim();
    resultTitle.textContent = 'Level clear!';
    resultCopy.textContent = stars === 3 ? 'That was smooth.' : 'Nice run — keep the flow.';
    resultAction.textContent = levelIndex < LEVELS.length - 1 ? 'Next level' : 'Play level 1';
  } else {
    starsElement.textContent = '☆ ☆ ☆';
    resultTitle.textContent = 'So close';
    resultCopy.textContent = `${Math.max(0, level().targetScore - score).toLocaleString()} points left.`;
    resultAction.textContent = 'Try again';
  }
  resultScore.textContent = score.toLocaleString();
}

function hideResult() {
  resultElement.hidden = true;
}

function restartLevel() {
  clearHint();
  hideResult();
  board = createBoard(SIZE, TYPES);
  selected = null;
  score = 0;
  movesLeft = level().moves;
  bestChain = 1;
  gameState = 'playing';
  busy = false;
  dragStart = null;
  fxElement.replaceChildren();
  comboElement.classList.remove('show');
  setStatus('Swipe to match 3. Make 4+ for powers.');
  render({ dropping: true });
  scheduleHint();
}

boardElement.addEventListener('pointerdown', (event) => {
  if (gameState !== 'playing' || busy) return;
  const piece = event.target.closest('.piece');
  if (!piece) return;
  ensureAudio();
  clearHint();
  dragStart = {
    index: Number(piece.dataset.index),
    x: event.clientX,
    y: event.clientY,
  };
});

boardElement.addEventListener('pointerup', (event) => {
  if (!dragStart || gameState !== 'playing' || busy) {
    dragStart = null;
    return;
  }

  const dx = event.clientX - dragStart.x;
  const dy = event.clientY - dragStart.y;
  const distance = Math.hypot(dx, dy);

  if (distance >= 16) {
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

restartButton.addEventListener('click', () => {
  ensureAudio();
  restartLevel();
});

resultAction.addEventListener('click', () => {
  ensureAudio();
  if (gameState === 'won') levelIndex = levelIndex < LEVELS.length - 1 ? levelIndex + 1 : 0;
  restartLevel();
});

restartLevel();
