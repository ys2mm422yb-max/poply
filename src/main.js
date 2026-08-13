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
const TUTORIAL_KEY = 'poply-first-move-v4';
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
const tutorialElement = document.querySelector('#tutorial');
const guideArrowElement = document.querySelector('#guide-arrow');

let levelIndex = 0;
let board = [];
let selected = null;
let score = 0;
let movesLeft = 0;
let bestChain = 0;
let gameState = 'playing';
let busy = false;
let dragStart = null;
let suppressClick = false;
let hintPair = [];
let tutorialPair = [];
let tutorialActive = false;
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

function defaultStatus() {
  return tutorialActive
    ? 'Move the glowing piece into the outlined slot → make 3.'
    : 'Make 3 matching pieces in a line.';
}

function guidePair() {
  if (tutorialActive && tutorialPair.length === 2) return tutorialPair;
  if (hintPair.length === 2) return hintPair;
  return [];
}

function positionGuideArrow() {
  const pair = guidePair();
  if (pair.length !== 2) {
    guideArrowElement.classList.remove('show', 'tutorial');
    return;
  }

  const from = boardElement.querySelector(`[data-index="${pair[0]}"]`);
  const to = boardElement.querySelector(`[data-index="${pair[1]}"]`);
  if (!from || !to) return;

  const frameRect = boardFrame.getBoundingClientRect();
  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();
  const x1 = fromRect.left - frameRect.left + fromRect.width / 2;
  const y1 = fromRect.top - frameRect.top + fromRect.height / 2;
  const x2 = toRect.left - frameRect.left + toRect.width / 2;
  const y2 = toRect.top - frameRect.top + toRect.height / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  guideArrowElement.style.left = `${x1}px`;
  guideArrowElement.style.top = `${y1}px`;
  guideArrowElement.style.width = `${Math.max(20, length)}px`;
  guideArrowElement.style.transform = `translateY(-50%) rotate(${angle}deg)`;
  guideArrowElement.classList.toggle('tutorial', tutorialActive);
  guideArrowElement.classList.add('show');
}

function render(options = {}) {
  const matched = new Set(options.matched || []);
  const created = new Set((options.created || []).map((item) => item.index));
  const invalid = new Set(options.invalid || []);
  const hint = new Set(hintPair);
  const tutorialSource = tutorialActive ? tutorialPair[0] : null;
  const tutorialTarget = tutorialActive ? tutorialPair[1] : null;

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
      invalid.has(index) ? 'invalid-piece' : '',
      hint.has(index) ? 'hinted' : '',
      tutorialSource === index ? 'tutorial-source' : '',
      tutorialTarget === index ? 'tutorial-target' : '',
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
  bestChainElement.textContent = bestChain > 0 ? `${bestChain}×` : '—';
  levelPillElement.textContent = `Level ${current.number}`;
  progressElement.style.setProperty('--progress', `${Math.min(100, (score / current.targetScore) * 100)}%`);
  tutorialElement.hidden = !tutorialActive;

  requestAnimationFrame(positionGuideArrow);
}

function setStatus(message, tone = 'neutral', temporary = false) {
  if (statusTimer) clearTimeout(statusTimer);
  statusElement.textContent = message;
  statusElement.dataset.tone = tone;

  if (temporary) {
    statusTimer = setTimeout(() => {
      if (gameState === 'playing') {
        statusElement.textContent = defaultStatus();
        statusElement.dataset.tone = tutorialActive ? 'hint' : 'neutral';
      }
    }, 1700);
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
  if (hintTimer) clearTimeout(hintTimer);
  hintTimer = null;
  hintPair = tutorialActive ? tutorialPair.slice() : [];
}

function tutorialWasSeen() {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === 'done';
  } catch {
    return false;
  }
}

function markTutorialSeen() {
  try {
    localStorage.setItem(TUTORIAL_KEY, 'done');
  } catch {
    // Storage may be disabled; the tutorial can simply appear again next session.
  }
}

function startTutorial(force = false) {
  if (levelIndex !== 0 || (!force && tutorialWasSeen())) {
    tutorialActive = false;
    tutorialPair = [];
    return false;
  }

  const moves = getValidMoves(board, SIZE);
  if (!moves.length) return false;
  tutorialPair = moves[0];
  tutorialActive = true;
  hintPair = tutorialPair.slice();
  render();
  setStatus(defaultStatus(), 'hint');
  return true;
}

function completeTutorial() {
  if (!tutorialActive) return;
  tutorialActive = false;
  tutorialPair = [];
  hintPair = [];
  markTutorialSeen();
  tutorialElement.hidden = true;
  guideArrowElement.classList.remove('show', 'tutorial');
}

function scheduleHint() {
  clearHint();
  if (tutorialActive || gameState !== 'playing' || busy) return;
  hintTimer = setTimeout(() => {
    if (gameState !== 'playing' || busy || selected !== null) return;
    const moves = getValidMoves(board, SIZE);
    if (!moves.length) return;
    hintPair = moves[Math.floor(Math.random() * moves.length)];
    render();
    setStatus('Try the glowing move — it will make 3.', 'hint');
    setTimeout(() => {
      if (gameState === 'playing' && !tutorialActive) {
        hintPair = [];
        render();
        setStatus(defaultStatus());
        scheduleHint();
      }
    }, 1900);
  }, 4200);
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

function isValidMovePair(a, b) {
  return getValidMoves(board, SIZE).some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function resetDragPreview() {
  const dragging = boardElement.querySelector('.dragging');
  if (dragging) {
    dragging.classList.remove('dragging');
    dragging.style.removeProperty('--drag-x');
    dragging.style.removeProperty('--drag-y');
  }
  for (const target of boardElement.querySelectorAll('.drag-target, .valid-drag-target, .invalid-drag-target')) {
    target.classList.remove('drag-target', 'valid-drag-target', 'invalid-drag-target');
  }
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

    if (result.reason === 'same-color') {
      render({ invalid: [a, b] });
      animateFrame('invalid');
      playTone(175, 0.06, 0.018);
      await wait(240);
      busy = false;
      if (levelIndex === 0 && score === 0) startTutorial(true);
      else render();
      setStatus('Same colours do not merge. Move one piece so 3 matching pieces line up.', 'bad', true);
      scheduleHint();
      return;
    }

    board = result.swappedBoard;
    render();
    await wait(105);
    animateFrame('invalid');
    playTone(180, 0.06, 0.018);
    await wait(135);
    board = settledBoard;
    busy = false;
    render();
    setStatus('That move does not leave 3 matching pieces in a line.', 'bad', true);
    scheduleHint();
    return;
  }

  completeTutorial();
  busy = true;
  movesLeft -= 1;
  board = result.swappedBoard;
  render();
  await wait(125);

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
    setStatus('Choose a neighbouring slot that makes 3.');
    scheduleHint();
    return;
  }

  if (selected === index) {
    selected = null;
    render();
    setStatus(defaultStatus(), tutorialActive ? 'hint' : 'neutral');
    scheduleHint();
    return;
  }

  if (!areAdjacent(selected, index, SIZE)) {
    selected = index;
    render();
    setStatus('Only move into a neighbouring slot.');
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
  bestChain = 0;
  gameState = 'playing';
  busy = false;
  dragStart = null;
  tutorialActive = false;
  tutorialPair = [];
  fxElement.replaceChildren();
  comboElement.classList.remove('show');
  render({ dropping: true });

  if (!startTutorial()) {
    setStatus(defaultStatus());
    scheduleHint();
  }
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
    pointerId: event.pointerId,
    piece,
  };

  piece.classList.add('dragging');
  if (boardElement.setPointerCapture) {
    try { boardElement.setPointerCapture(event.pointerId); } catch { /* no-op */ }
  }
});

boardElement.addEventListener('pointermove', (event) => {
  if (!dragStart || event.pointerId !== dragStart.pointerId || busy) return;

  const dx = event.clientX - dragStart.x;
  const dy = event.clientY - dragStart.y;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const rect = dragStart.piece.getBoundingClientRect();
  const limit = rect.width * 1.05;
  const tx = horizontal ? Math.max(-limit, Math.min(limit, dx)) : 0;
  const ty = horizontal ? 0 : Math.max(-limit, Math.min(limit, dy));

  dragStart.piece.style.setProperty('--drag-x', `${tx}px`);
  dragStart.piece.style.setProperty('--drag-y', `${ty}px`);

  for (const target of boardElement.querySelectorAll('.drag-target, .valid-drag-target, .invalid-drag-target')) {
    target.classList.remove('drag-target', 'valid-drag-target', 'invalid-drag-target');
  }

  if (Math.hypot(dx, dy) < 8) return;
  const targetIndex = swipeTarget(dragStart.index, dx, dy);
  if (targetIndex === null) return;
  const target = boardElement.querySelector(`[data-index="${targetIndex}"]`);
  if (!target) return;

  target.classList.add('drag-target');
  target.classList.add(isValidMovePair(dragStart.index, targetIndex) ? 'valid-drag-target' : 'invalid-drag-target');
});

boardElement.addEventListener('pointerup', (event) => {
  if (!dragStart || gameState !== 'playing' || busy) {
    resetDragPreview();
    dragStart = null;
    return;
  }

  const start = dragStart;
  const dx = event.clientX - start.x;
  const dy = event.clientY - start.y;
  const distance = Math.hypot(dx, dy);
  const target = distance >= 16 ? swipeTarget(start.index, dx, dy) : null;

  resetDragPreview();
  dragStart = null;

  if (target !== null) {
    suppressClick = true;
    attemptMove(start.index, target);
    setTimeout(() => { suppressClick = false; }, 0);
  }
});

boardElement.addEventListener('pointercancel', () => {
  resetDragPreview();
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

window.addEventListener('resize', () => requestAnimationFrame(positionGuideArrow));

restartLevel();
