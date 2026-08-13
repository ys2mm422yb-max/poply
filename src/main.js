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
import {
  applyChainToObjectives,
  areGoalsComplete,
  createObjectiveState,
  progressForGoal,
  remainingGoalCount,
} from './objectives.js';
import {
  loadProgress,
  recordLevelWin,
  saveProgress,
  selectLevel,
  totalStars,
} from './progress.js';

const SIZE = 8;
const PROGRESS_KEY = 'poply.progress.v1';
const LEVELS = Object.freeze([
  { number: 1, targetScore: 2400, moves: 14, types: 5, goals: [{ kind: 'collect', base: 2, target: 8 }] },
  { number: 2, targetScore: 3400, moves: 15, types: 5, goals: [{ kind: 'collect', base: 3, target: 10 }] },
  { number: 3, targetScore: 4600, moves: 16, types: 5, goals: [{ kind: 'chain', target: 5 }] },
  { number: 4, targetScore: 5800, moves: 17, types: 5, goals: [{ kind: 'power', target: 1 }] },
  { number: 5, targetScore: 7000, moves: 18, types: 5, goals: [{ kind: 'collect', base: 0, target: 10 }, { kind: 'collect', base: 4, target: 10 }] },
  { number: 6, targetScore: 8400, moves: 18, types: 5, goals: [{ kind: 'chain', target: 7 }, { kind: 'power', target: 1 }] },
  { number: 7, targetScore: 9800, moves: 19, types: 5, goals: [{ kind: 'collect', base: 1, target: 14 }, { kind: 'collect', base: 3, target: 14 }] },
  { number: 8, targetScore: 11800, moves: 20, types: 5, goals: [{ kind: 'power', target: 2 }, { kind: 'chain', target: 8 }] },
]);

const de = (navigator.language || '').toLowerCase().startsWith('de');
const colorNames = de
  ? ['Rot', 'Gelb', 'Grün', 'Blau', 'Lila', 'Pink']
  : ['Red', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink'];
const copy = de ? {
  score: 'Punkte', moves: 'Züge', best: 'Beste Kette', goals: 'Ziele', restart: 'Neustart',
  connect: 'Zieh durch 3+ gleiche Steine.',
  guided: 'Zieh durch die leuchtenden gleichen Steine.',
  short: 'Verbinde mindestens 3 gleiche Steine.',
  chain: (n) => `${n} verbunden`,
  hint: 'Hier ist eine mögliche Kette.',
  shuffle: 'Keine Kette möglich — neu gemischt.',
  nice: (n) => n >= 5 ? `${n}er-Kette!` : 'Pop!',
  clear: 'Level geschafft!',
  out: 'Keine Züge mehr.',
  next: 'Nächstes Level', retry: 'Nochmal', again: 'Nochmal spielen',
  resultWin: 'Level geschafft!', resultLose: 'Noch nicht geschafft',
  smooth: 'Ziele erfüllt. Stark gespielt.',
  powerTip: '5 gleiche = Blast · 7+ gleiche = Prism',
  collectGoal: (name) => `${name} sammeln`,
  chainGoal: 'Kette', powerGoal: 'Power',
  scoreMissing: (n) => `Noch ${n.toLocaleString('de-DE')} Punkte`,
  goalsMissing: (n) => `${n} Ziel${n === 1 ? '' : 'e'} offen`,
  totalStars: (n) => `${n} Sterne insgesamt`,
  locked: 'Noch gesperrt',
} : {
  score: 'Score', moves: 'Moves', best: 'Best chain', goals: 'Goals', restart: 'Restart',
  connect: 'Drag through 3+ matching pieces.',
  guided: 'Drag through the glowing matching pieces.',
  short: 'Connect at least 3 matching pieces.',
  chain: (n) => `${n} connected`,
  hint: 'Here is a possible chain.',
  shuffle: 'No chain available — reshuffled.',
  nice: (n) => n >= 5 ? `${n}-piece chain!` : 'Pop!',
  clear: 'Level clear!',
  out: 'Out of moves.',
  next: 'Next level', retry: 'Try again', again: 'Play again',
  resultWin: 'Level clear!', resultLose: 'Not quite yet',
  smooth: 'Goals complete. Great run.',
  powerTip: '5 matching = Blast · 7+ matching = Prism',
  collectGoal: (name) => `Collect ${name}`, chainGoal: 'Chain', powerGoal: 'Power',
  scoreMissing: (n) => `${n.toLocaleString()} points left`,
  goalsMissing: (n) => `${n} goal${n === 1 ? '' : 's'} left`,
  totalStars: (n) => `${n} total stars`,
  locked: 'Locked',
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
const levelTrailElement = document.querySelector('#level-trail');
const objectivesElement = document.querySelector('#objectives');
const goalsLabel = document.querySelector('#goals-label');
const statusElement = document.querySelector('#status');
const restartButton = document.querySelector('#restart');
const resultElement = document.querySelector('#result');
const resultTitle = document.querySelector('#result-title');
const resultCopy = document.querySelector('#result-copy');
const resultScore = document.querySelector('#result-score');
const resultProgress = document.querySelector('#result-progress');
const resultAction = document.querySelector('#result-action');
const starsElement = document.querySelector('#stars');
const chainSvg = document.querySelector('#chain-svg');
const chainPolyline = document.querySelector('#chain-polyline');
const hintPolyline = document.querySelector('#hint-polyline');
const scoreLabel = document.querySelector('#score-label');
const movesLabel = document.querySelector('#moves-label');
const bestLabel = document.querySelector('#best-label');
const powerTip = document.querySelector('#power-tip');

let progress = loadProgress(window.localStorage, PROGRESS_KEY, LEVELS.length);
let levelIndex = Math.max(0, Math.min(LEVELS.length - 1, progress.currentLevel - 1));
let board = [];
let score = 0;
let movesLeft = 0;
let bestChain = 0;
let objectiveState = createObjectiveState();
let gameState = 'playing';
let busy = false;
let chainPath = [];
let hintPath = [];
let pointerActive = false;
let activePointerId = null;
let hintTimer = null;
let statusTimer = null;
let audioContext = null;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const level = () => LEVELS[levelIndex];
const locale = de ? 'de-DE' : undefined;

function randomTile() {
  return Math.floor(Math.random() * level().types);
}

function persistProgress() {
  progress = saveProgress(window.localStorage, PROGRESS_KEY, progress, LEVELS.length);
}

function localizeChrome() {
  scoreLabel.textContent = copy.score;
  movesLabel.textContent = copy.moves;
  bestLabel.textContent = copy.best;
  goalsLabel.textContent = copy.goals;
  powerTip.textContent = copy.powerTip;
  restartButton.textContent = copy.restart;
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

function goalLabel(goal) {
  if (goal.kind === 'collect') return copy.collectGoal(colorNames[goal.base] || `${goal.base + 1}`);
  if (goal.kind === 'chain') return copy.chainGoal;
  return copy.powerGoal;
}

function goalIcon(goal) {
  if (goal.kind === 'collect') return '●';
  if (goal.kind === 'chain') return '↗';
  return '✦';
}

function renderObjectives() {
  objectivesElement.replaceChildren();
  for (const goal of level().goals) {
    const state = progressForGoal(goal, objectiveState);
    const chip = document.createElement('div');
    chip.className = [
      'objective-chip',
      `goal-${goal.kind}`,
      goal.kind === 'collect' ? `goal-color-${goal.base}` : '',
      state.complete ? 'complete' : '',
    ].filter(Boolean).join(' ');

    const icon = document.createElement('span');
    icon.className = 'goal-icon';
    icon.textContent = goalIcon(goal);

    const label = document.createElement('span');
    label.textContent = goalLabel(goal);

    const value = document.createElement('strong');
    value.className = 'goal-value';
    value.textContent = `${Math.min(state.current, state.target)}/${state.target}`;

    chip.append(icon, label, value);
    objectivesElement.append(chip);
  }
}

function renderLevelTrail() {
  levelTrailElement.replaceChildren();
  for (const item of LEVELS) {
    const unlocked = item.number <= progress.unlocked;
    const stars = progress.stars[item.number] || 0;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = ['level-node', unlocked ? 'unlocked' : 'locked', item.number === level().number ? 'active' : ''].filter(Boolean).join(' ');
    button.textContent = String(item.number);
    button.dataset.stars = stars ? '★'.repeat(stars) : '';
    button.disabled = !unlocked || busy || pointerActive;
    button.setAttribute('aria-label', unlocked ? `Level ${item.number}${stars ? `, ${stars} stars` : ''}` : `Level ${item.number}, ${copy.locked}`);
    button.addEventListener('click', () => {
      if (!unlocked || busy || pointerActive || item.number === level().number) return;
      progress = selectLevel(progress, item.number, LEVELS.length);
      persistProgress();
      levelIndex = item.number - 1;
      restartLevel();
    });
    levelTrailElement.append(button);
  }
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
  renderObjectives();
  renderLevelTrail();
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

function levelComplete() {
  return score >= level().targetScore && areGoalsComplete(level().goals, objectiveState);
}

function missingSummary() {
  const missing = [];
  if (score < level().targetScore) missing.push(copy.scoreMissing(level().targetScore - score));
  const goals = remainingGoalCount(level().goals, objectiveState);
  if (goals) missing.push(copy.goalsMissing(goals));
  return missing.join(' · ');
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

  objectiveState = applyChainToObjectives(objectiveState, result);
  board = result.board;
  score += result.score;
  bestChain = Math.max(bestChain, result.chainLength);
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

  if (levelComplete()) {
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
    progress = recordLevelWin(progress, level().number, stars, bestChain, LEVELS.length);
    persistProgress();
    renderLevelTrail();
    starsElement.textContent = `${'★ '.repeat(stars)}${'☆ '.repeat(3 - stars)}`.trim();
    resultTitle.textContent = copy.resultWin;
    resultCopy.textContent = copy.smooth;
    resultProgress.textContent = copy.totalStars(totalStars(progress));
    resultAction.textContent = levelIndex < LEVELS.length - 1 ? copy.next : copy.again;
  } else {
    starsElement.textContent = '☆ ☆ ☆';
    resultTitle.textContent = copy.resultLose;
    resultCopy.textContent = missingSummary();
    resultProgress.textContent = copy.totalStars(totalStars(progress));
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
  objectiveState = createObjectiveState();
  gameState = 'playing';
  busy = false;
  pointerActive = false;
  activePointerId = null;
  chainPath = [];
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
  if (gameState === 'won' && levelIndex < LEVELS.length - 1) {
    levelIndex += 1;
    progress = selectLevel(progress, levelIndex + 1, LEVELS.length);
    persistProgress();
  }
  restartLevel();
});

window.addEventListener('resize', () => requestAnimationFrame(updateLines));

localizeChrome();
restartLevel();
