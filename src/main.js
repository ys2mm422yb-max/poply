import {
  areChainNeighbours,
  coordsOf,
  createBoard,
  findHintChain,
  hasValidChain,
  reshuffleBoard,
  resolveChain,
  specialKind,
  tileBase,
} from './game.js';

const SIZE = 8;
const LEVELS = Object.freeze([
  { number: 1, targetScore: 4000, moves: 16, types: 5 },
  { number: 2, targetScore: 5600, moves: 17, types: 5 },
  { number: 3, targetScore: 7600, moves: 18, types: 5 },
  { number: 4, targetScore: 9800, moves: 19, types: 6 },
  { number: 5, targetScore: 12500, moves: 20, types: 6 },
]);

const de = (navigator.language || '').toLowerCase().startsWith('de');
const copy = de ? {
  score: 'Punkte', moves: 'Züge', best: 'Beste Kette',
  connect: 'Zieh durch 3+ gleiche Steine.',
  guided: 'Zieh durch die leuchtenden gleichen Steine.',
  short: 'Verbinde mindestens 3 gleiche Steine.',
  chain: (n) => `${n} verbunden`,
  hint: 'Hier ist eine mögliche Kette.',
  shuffle: 'Keine Kette möglich — neu gemischt.',
  nice: (n) => n >= 5 ? `${n}er-Kette!` : 'Pop!',
  clear: 'Level geschafft!',
  out: 'Keine Züge mehr.',
  next: 'Nächstes Level', retry: 'Nochmal', again: 'Level 1 spielen',
  resultWin: 'Level geschafft!', resultLose: 'Knapp daneben',
  smooth: 'Starke Kette. Weiter so.',
  left: (n) => `Noch ${n.toLocaleString('de-DE')} Punkte.`,
  powerTip: '5 gleiche = Blast · 7+ gleiche = Prism',
} : {
  score: 'Score', moves: 'Moves', best: 'Best chain',
  connect: 'Drag through 3+ matching pieces.',
  guided: 'Drag through the glowing matching pieces.',
  short: 'Connect at least 3 matching pieces.',
  chain: (n) => `${n} connected`,
  hint: 'Here is a possible chain.',
  shuffle: 'No chain available — reshuffled.',
  nice: (n) => n >= 5 ? `${n}-piece chain!` : 'Pop!',
  clear: 'Level clear!',
  out: 'Out of moves.',
  next: 'Next level', retry: 'Try again', again: 'Play level 1',
  resultWin: 'Level clear!', resultLose: 'So close',
  smooth: 'Great chain. Keep the flow.',
  left: (n) => `${n.toLocaleString()} points left.`,
  powerTip: '5 matching = Blast · 7+ matching = Prism',
};

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
const chainSvg = document.querySelector('#chain-svg');
const chainPolyline = document.querySelector('#chain-polyline');
const hintPolyline = document.querySelector('#hint-polyline');
const scoreLabel = document.querySelector('#score-label');
const movesLabel = document.querySelector('#moves-label');
const bestLabel = document.querySelector('#best-label');
const powerTip = document.querySelector('#power-tip');

let levelIndex = 0;
let board = [];
let score = 0;
let movesLeft = 0;
let bestChain = 0;
let gameState = 'playing';
let busy = false;
let chainPath = [];
let hintPath = [];
let pointerActive = false;
let activePointerId = null;
let hintTimer = null;
let statusTimer = null;
let audioContext = null;
let firstSuccessfulMove = false;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const level = () => LEVELS[levelIndex];
const locale = de ? 'de-DE' : undefined;

function randomTile() {
  return Math.floor(Math.random() * level().types);
}

function localizeChrome() {
  scoreLabel.textContent = copy.score;
  movesLabel.textContent = copy.moves;
  bestLabel.textContent = copy.best;
  powerTip.textContent = copy.powerTip;
}

function ensureAudio() {
  if (audioContext || !('AudioContext' in window || 'webkitAudioContext' in window)) return audioContext;
  const Context = window.AudioContext || window.webkitAudioContext;
  audioContext = new Context();
  return audioContext;
}

function playTone(frequency, duration = 0.07, gain = 0.032) {
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

function playChainSound(length, power = false) {
  playTone(360 + Math.min(length, 9) * 55, power ? 0.13 : 0.08, power ? 0.048 : 0.03);
  if (length >= 5) setTimeout(() => playTone(620 + Math.min(length, 9) * 35, 0.1, 0.027), 55);
}

function setStatus(message, tone = 'neutral', temporary = false) {
  if (statusTimer) clearTimeout(statusTimer);
  statusElement.textContent = message;
  statusElement.dataset.tone = tone;
  if (temporary) {
    statusTimer = setTimeout(() => {
      if (gameState === 'playing' && !pointerActive) {
        statusElement.textContent = copy.connect;
        statusElement.dataset.tone = 'neutral';
      }
    }, 1500);
  }
}

function pieceCenter(index) {
  const piece = boardElement.querySelector(`[data-index="${index}"]`);
  if (!piece) return null;
  const frame = boardFrame.getBoundingClientRect();
  const rect = piece.getBoundingClientRect();
  return {
    x: rect.left - frame.left + rect.width / 2,
    y: rect.top - frame.top + rect.height / 2,
  };
}

function pointsFor(path) {
  return path.map(pieceCenter).filter(Boolean).map(({ x, y }) => `${x},${y}`).join(' ');
}

function updateLines() {
  const frame = boardFrame.getBoundingClientRect();
  chainSvg.setAttribute('viewBox', `0 0 ${Math.max(1, frame.width)} ${Math.max(1, frame.height)}`);
  chainPolyline.setAttribute('points', chainPath.length > 1 ? pointsFor(chainPath) : '');
  hintPolyline.setAttribute('points', !pointerActive && hintPath.length > 1 ? pointsFor(hintPath) : '');
}

function render(options = {}) {
  const matched = new Set(options.matched || []);
  const selected = new Set(chainPath);
  const hinted = new Set(hintPath);
  const head = chainPath.at(-1);

  boardElement.replaceChildren();
  board.forEach((value, index) => {
    const base = tileBase(value);
    const special = specialKind(value);
    const { row, col } = coordsOf(index, SIZE);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = [
      'piece', `piece-${base}`,
      special ? `special-${special}` : '',
      selected.has(index) ? 'chain-selected' : '',
      head === index ? 'chain-head' : '',
      matched.has(index) ? 'matched' : '',
      hinted.has(index) ? 'hinted' : '',
      options.dropping ? 'dropping' : '',
    ].filter(Boolean).join(' ');
    button.dataset.index = String(index);
    button.disabled = gameState !== 'playing' || busy;
    button.setAttribute('role', 'gridcell');
    button.setAttribute('aria-label', `${special ? 'Power ' : ''}piece ${base + 1}, row ${row + 1}, column ${col + 1}`);
    boardElement.append(button);
  });

  const current = level();
  scoreElement.textContent = score.toLocaleString(locale);
  targetElement.textContent = current.targetScore.toLocaleString(locale);
  movesElement.textContent = String(movesLeft);
  bestChainElement.textContent = bestChain > 0 ? String(bestChain) : '—';
  levelPillElement.textContent = `Level ${current.number}`;
  progressElement.style.setProperty('--progress', `${Math.min(100, (score / current.targetScore) * 100)}%`);
  requestAnimationFrame(updateLines);
}

function animateFrame(name) {
  boardFrame.classList.remove('invalid', 'pulse', 'power', 'shuffle');
  void boardFrame.offsetWidth;
  boardFrame.classList.add(name);
}

function showCombo(message, power = false) {
  comboElement.textContent = message;
  comboElement.className = `combo-badge show${power ? ' power' : ''}`;
  setTimeout(() => comboElement.classList.remove('show'), 720);
}

function spawnBurst(indices, scoreValue, power = false) {
  if (!indices.length) return;
  const frameRect = boardFrame.getBoundingClientRect();
  const centers = [];
  for (const index of indices.slice(0, 28)) {
    const piece = boardElement.querySelector(`[data-index="${index}"]`);
    if (!piece) continue;
    const rect = piece.getBoundingClientRect();
    const x = rect.left - frameRect.left + rect.width / 2;
    const y = rect.top - frameRect.top + rect.height / 2;
    centers.push({ x, y });
    const count = power ? 5 : 3;
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('i');
      particle.className = `particle${power ? ' power-particle' : ''}`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty('--dx', `${(Math.random() - 0.5) * (power ? 110 : 66)}px`);
      particle.style.setProperty('--dy', `${(Math.random() - 0.5) * (power ? 110 : 66)}px`);
      fxElement.append(particle);
      setTimeout(() => particle.remove(), 700);
    }
  }
  if (centers.length) {
    const center = centers[Math.floor(centers.length / 2)];
    const scorePop = document.createElement('b');
    scorePop.className = 'score-pop';
    scorePop.textContent = `+${scoreValue.toLocaleString(locale)}`;
    scorePop.style.left = `${center.x}px`;
    scorePop.style.top = `${center.y}px`;
    fxElement.append(scorePop);
    setTimeout(() => scorePop.remove(), 820);
  }
}

function clearHint() {
  hintPath = [];
  if (hintTimer) clearTimeout(hintTimer);
  hintTimer = null;
  updateLines();
}

function revealHint(guided = false) {
  if (gameState !== 'playing' || busy || pointerActive) return;
  hintPath = findHintChain(board, SIZE);
  if (!hintPath.length) return;
  render();
  setStatus(guided ? copy.guided : copy.hint, 'hint');
}

function scheduleHint() {
  clearHint();
  if (gameState !== 'playing' || busy) return;
  hintTimer = setTimeout(() => revealHint(false), 4200);
}

function beginChain(index, pointerId) {
  if (gameState !== 'playing' || busy) return;
  ensureAudio();
  clearHint();
  pointerActive = true;
  activePointerId = pointerId;
  chainPath = [index];
  boardFrame.classList.add('connecting');
  render();
  setStatus(copy.chain(1), 'hint');
}

function extendChain(index) {
  if (!pointerActive || !chainPath.length) return;
  const last = chainPath.at(-1);
  if (index === last) return;

  if (chainPath.length > 1 && index === chainPath.at(-2)) {
    chainPath.pop();
    render();
    setStatus(copy.chain(chainPath.length), chainPath.length >= 3 ? 'good' : 'hint');
    return;
  }

  if (chainPath.includes(index)) return;
  if (!areChainNeighbours(last, index, SIZE)) return;
  if (tileBase(board[index]) !== tileBase(board[chainPath[0]])) {
    boardFrame.classList.remove('blocked');
    void boardFrame.offsetWidth;
    boardFrame.classList.add('blocked');
    setTimeout(() => boardFrame.classList.remove('blocked'), 140);
    return;
  }

  chainPath.push(index);
  if (navigator.vibrate) navigator.vibrate(4);
  render();
  setStatus(copy.chain(chainPath.length), chainPath.length >= 3 ? 'good' : 'hint');
}

async function finishChain() {
  if (!pointerActive) return;
  pointerActive = false;
  activePointerId = null;
  boardFrame.classList.remove('connecting', 'blocked');
  const path = chainPath.slice();

  if (path.length < 3) {
    chainPath = [];
    animateFrame('invalid');
    playTone(170, 0.055, 0.016);
    render();
    setStatus(copy.short, 'bad', true);
    scheduleHint();
    return;
  }

  const result = resolveChain(board, path, SIZE, randomTile);
  if (!result.valid) {
    chainPath = [];
    animateFrame('invalid');
    render();
    setStatus(copy.short, 'bad', true);
    scheduleHint();
    return;
  }

  busy = true;
  movesLeft -= 1;
  const power = Boolean(result.creation || result.activations.length);
  render({ matched: result.cleared });
  spawnBurst(result.cleared, result.score, power);
  playChainSound(result.chainLength, power);

  if (result.chainLength >= 7) showCombo(`${result.chainLength} CHAIN · PRISM!`, true);
  else if (result.chainLength >= 5) showCombo(`${result.chainLength} CHAIN · BLAST!`, true);
  else if (result.chainLength >= 4) showCombo(`${result.chainLength} CHAIN!`);

  if (power) animateFrame('power');
  if (navigator.vibrate) navigator.vibrate(power ? [12, 18, 14] : 9);
  await wait(power ? 310 : 245);

  board = result.board;
  score += result.score;
  bestChain = Math.max(bestChain, result.chainLength);
  firstSuccessfulMove = true;
  chainPath = [];
  render({ dropping: true });
  await wait(190);

  if (!hasValidChain(board, SIZE)) {
    setStatus(copy.shuffle, 'hint');
    animateFrame('shuffle');
    await wait(260);
    board = reshuffleBoard(board, SIZE);
    render({ dropping: true });
    await wait(180);
  }

  busy = false;
  render();

  if (score >= level().targetScore) {
    gameState = 'won';
    render();
    setStatus(copy.clear, 'win');
    animateFrame('pulse');
    playTone(650, 0.12, 0.045);
    setTimeout(() => playTone(860, 0.16, 0.042), 105);
    await wait(500);
    showResult(true);
  } else if (movesLeft <= 0) {
    gameState = 'lost';
    render();
    setStatus(copy.out, 'bad');
    await wait(320);
    showResult(false);
  } else {
    setStatus(copy.nice(result.chainLength), 'good', true);
    scheduleHint();
  }
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
    resultTitle.textContent = copy.resultWin;
    resultCopy.textContent = copy.smooth;
    resultAction.textContent = levelIndex < LEVELS.length - 1 ? copy.next : copy.again;
  } else {
    starsElement.textContent = '☆ ☆ ☆';
    resultTitle.textContent = copy.resultLose;
    resultCopy.textContent = copy.left(Math.max(0, level().targetScore - score));
    resultAction.textContent = copy.retry;
  }
  resultScore.textContent = score.toLocaleString(locale);
}

function hideResult() {
  resultElement.hidden = true;
}

function restartLevel() {
  clearHint();
  hideResult();
  board = createBoard(SIZE, level().types);
  score = 0;
  movesLeft = level().moves;
  bestChain = 0;
  gameState = 'playing';
  busy = false;
  pointerActive = false;
  activePointerId = null;
  chainPath = [];
  firstSuccessfulMove = false;
  fxElement.replaceChildren();
  comboElement.classList.remove('show');
  setStatus(copy.connect);
  render({ dropping: true });
  if (level().number === 1) hintTimer = setTimeout(() => revealHint(true), 650);
  else scheduleHint();
}

boardElement.addEventListener('pointerdown', (event) => {
  if (gameState !== 'playing' || busy) return;
  const piece = event.target.closest('.piece');
  if (!piece) return;
  event.preventDefault();
  try { piece.setPointerCapture(event.pointerId); } catch {}
  beginChain(Number(piece.dataset.index), event.pointerId);
});

boardElement.addEventListener('pointermove', (event) => {
  if (!pointerActive || event.pointerId !== activePointerId || busy) return;
  event.preventDefault();
  const element = document.elementFromPoint(event.clientX, event.clientY);
  const piece = element?.closest?.('.piece');
  if (!piece || !boardElement.contains(piece)) return;
  extendChain(Number(piece.dataset.index));
});

boardElement.addEventListener('pointerup', (event) => {
  if (!pointerActive || event.pointerId !== activePointerId) return;
  event.preventDefault();
  finishChain();
});

boardElement.addEventListener('pointercancel', () => {
  if (!pointerActive) return;
  pointerActive = false;
  activePointerId = null;
  chainPath = [];
  boardFrame.classList.remove('connecting', 'blocked');
  render();
  setStatus(copy.connect);
  scheduleHint();
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

window.addEventListener('resize', () => requestAnimationFrame(updateLines));

localizeChrome();
restartLevel();
