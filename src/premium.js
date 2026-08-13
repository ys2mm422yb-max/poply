const board = document.querySelector('#board');
const frame = document.querySelector('#board-frame');
const fx = document.querySelector('#fx');
const status = document.querySelector('#status');

const palette = ['#ff7087', '#ffd061', '#65e3a6', '#66c5ff', '#aa90ff', '#ff8bd7'];

function pieceBase(piece) {
  const klass = piece ? [...piece.classList].find((name) => /^piece-\d+$/.test(name)) : null;
  return klass ? Number(klass.slice(6)) : null;
}

function selectedPieces() {
  return board ? [...board.querySelectorAll('.piece.chain-selected')] : [];
}

function activeColor() {
  const base = pieceBase(selectedPieces().at(-1));
  return palette[base] || '#8aa9ff';
}

function createFlowHud() {
  if (!frame) return null;
  const existing = frame.querySelector('.flow-hud');
  if (existing) return existing;
  const hud = document.createElement('div');
  hud.className = 'flow-hud';
  hud.setAttribute('aria-hidden', 'true');
  const dot = document.createElement('span');
  dot.className = 'flow-dot';
  const copy = document.createElement('span');
  copy.className = 'flow-copy';
  const count = document.createElement('strong');
  count.className = 'flow-count';
  hud.append(dot, copy, count);
  frame.append(hud);
  return hud;
}

const flowHud = createFlowHud();
let hideTimer = null;

function syncFlowHud() {
  if (!flowHud || !status || !frame) return;
  const selected = selectedPieces();
  const tone = status.dataset.tone || 'neutral';
  const message = status.textContent?.trim() || '';
  frame.style.setProperty('--chain-color', activeColor());
  flowHud.classList.toggle('connecting', selected.length > 0);
  const copy = flowHud.querySelector('.flow-copy');
  const count = flowHud.querySelector('.flow-count');
  if (copy) copy.textContent = message;
  if (count) count.textContent = String(selected.length);
  if (hideTimer) clearTimeout(hideTimer);
  if (selected.length > 0) {
    flowHud.classList.add('show');
  } else if (tone !== 'neutral' && message) {
    flowHud.classList.add('show');
    hideTimer = setTimeout(() => flowHud.classList.remove('show'), tone === 'win' ? 2200 : 1250);
  } else {
    flowHud.classList.remove('show');
  }
}

function tunePieces() {
  if (!board) return;
  for (const piece of board.querySelectorAll('.piece')) {
    if (piece.dataset.premiumReady) continue;
    piece.dataset.premiumReady = '1';
    const index = Number(piece.dataset.index || 0);
    piece.style.setProperty('--row-delay', `${Math.min(Math.floor(index / 8) * 8, 48)}ms`);
  }
}

function centerFor(piece) {
  if (!piece || !frame) return null;
  const frameRect = frame.getBoundingClientRect();
  const rect = piece.getBoundingClientRect();
  return {
    x: rect.left - frameRect.left + rect.width / 2,
    y: rect.top - frameRect.top + rect.height / 2,
  };
}

function makeSpark(x, y, color, distance, angle) {
  if (!fx) return;
  const spark = document.createElement('i');
  spark.className = 'premium-spark';
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  spark.style.setProperty('--spark', color);
  spark.style.setProperty('--rot', `${angle}rad`);
  spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
  spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
  fx.append(spark);
  setTimeout(() => spark.remove(), 680);
}

function makeShockwave(x, y, color) {
  if (!fx) return;
  const wave = document.createElement('i');
  wave.className = 'premium-shockwave';
  wave.style.left = `${x}px`;
  wave.style.top = `${y}px`;
  wave.style.setProperty('--spark', color);
  fx.append(wave);
  setTimeout(() => wave.remove(), 520);
}

function pulseFrame(power) {
  if (!frame) return;
  frame.classList.remove('premium-impact', 'premium-power-impact');
  void frame.offsetWidth;
  frame.classList.add(power ? 'premium-power-impact' : 'premium-impact');
  setTimeout(() => frame.classList.remove('premium-impact', 'premium-power-impact'), power ? 460 : 300);
}

function spawnPremiumBurst() {
  if (!board || !fx || !frame) return;
  const matched = [...board.querySelectorAll('.piece.matched')].slice(0, 14);
  if (!matched.length) return;
  const power = frame.classList.contains('power') || matched.length >= 7;
  pulseFrame(power);
  matched.forEach((piece, pieceIndex) => {
    const point = centerFor(piece);
    if (!point) return;
    const color = palette[pieceBase(piece)] || activeColor();
    const count = power ? 6 : 4;
    for (let i = 0; i < count; i += 1) {
      const angle = ((Math.PI * 2) / count) * i + (pieceIndex % 3) * 0.17;
      const distance = (power ? 34 : 25) + Math.random() * (power ? 38 : 22);
      makeSpark(point.x, point.y, color, distance, angle);
    }
    if (pieceIndex % (power ? 2 : 4) === 0) makeShockwave(point.x, point.y, color);
  });
}

function colorNativeParticles() {
  if (!fx) return;
  const color = activeColor();
  for (const particle of fx.querySelectorAll('.particle:not([data-premium-colored])')) {
    particle.dataset.premiumColored = '1';
    particle.style.setProperty('--fx-color', color);
  }
}

if (status) {
  new MutationObserver(syncFlowHud).observe(status, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-tone'],
  });
}

if (board) {
  new MutationObserver(() => requestAnimationFrame(() => {
    tunePieces();
    syncFlowHud();
  })).observe(board, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
}

if (fx) {
  new MutationObserver((records) => {
    let scoreAdded = false;
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === 1 && node.classList?.contains('score-pop')) scoreAdded = true;
      }
    }
    requestAnimationFrame(colorNativeParticles);
    if (scoreAdded) requestAnimationFrame(spawnPremiumBurst);
  }).observe(fx, { childList: true });
}

window.addEventListener('resize', syncFlowHud);
tunePieces();
syncFlowHud();
