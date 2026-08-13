const board = document.querySelector('#board');
const boardFrame = document.querySelector('#board-frame');
const chainPolyline = document.querySelector('#chain-polyline');
const chainGlow = document.querySelector('#chain-glow');
const chainTail = document.querySelector('#chain-tail');
const chainTailGlow = document.querySelector('#chain-tail-glow');
const fx = document.querySelector('#fx');
const restart = document.querySelector('#restart');

const palette = ['#ff7087', '#ffd061', '#65e3a6', '#66c5ff', '#aa90ff', '#ff8bd7'];
let pointer = null;
let activePointer = null;
let ringLock = false;

function restoreRestartIcon() {
  if (!restart) return;
  const de = (navigator.language || '').toLowerCase().startsWith('de');
  const label = de ? 'Level neu starten' : 'Restart level';
  restart.setAttribute('aria-label', label);
  restart.title = label;
  restart.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-2.34 5.66" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 5v6h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
}

function selectedBase() {
  const selected = board?.querySelector('.piece.chain-selected, .piece.chain-head');
  if (!selected) return null;
  const match = [...selected.classList].find((name) => /^piece-\d+$/.test(name));
  return match ? Number(match.slice(6)) : null;
}

function updateChainColor() {
  if (!boardFrame) return;
  const base = selectedBase();
  const color = palette[base] || '#8aa9ff';
  boardFrame.style.setProperty('--chain-color', color);
}

function syncGlow() {
  if (!chainPolyline || !chainGlow) return;
  chainGlow.setAttribute('points', chainPolyline.getAttribute('points') || '');
  updateChainColor();
}

function relativePoint(clientX, clientY) {
  const rect = boardFrame.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function headCenter() {
  const head = board?.querySelector('.piece.chain-head');
  if (!head) return null;
  const frame = boardFrame.getBoundingClientRect();
  const rect = head.getBoundingClientRect();
  return {
    x: rect.left - frame.left + rect.width / 2,
    y: rect.top - frame.top + rect.height / 2,
  };
}

function hideTail() {
  for (const line of [chainTail, chainTailGlow]) {
    if (!line) continue;
    line.style.opacity = '0';
    line.setAttribute('x1', '0');
    line.setAttribute('y1', '0');
    line.setAttribute('x2', '0');
    line.setAttribute('y2', '0');
  }
}

function drawTail() {
  syncGlow();
  if (activePointer === null || !pointer) {
    hideTail();
    return;
  }
  const head = headCenter();
  if (!head) {
    hideTail();
    return;
  }

  const dx = pointer.x - head.x;
  const dy = pointer.y - head.y;
  const distance = Math.hypot(dx, dy);
  const max = 54;
  const scale = distance > max ? max / distance : 1;
  const end = { x: head.x + dx * scale, y: head.y + dy * scale };

  for (const line of [chainTailGlow, chainTail]) {
    if (!line) continue;
    line.setAttribute('x1', String(head.x));
    line.setAttribute('y1', String(head.y));
    line.setAttribute('x2', String(end.x));
    line.setAttribute('y2', String(end.y));
    line.style.opacity = distance > 5 ? '1' : '0';
  }
}

function spawnRings() {
  if (ringLock || !fx || !boardFrame || !board) return;
  const matched = [...board.querySelectorAll('.piece.matched')];
  if (!matched.length) return;
  ringLock = true;
  const frame = boardFrame.getBoundingClientRect();

  for (const piece of matched.slice(0, 18)) {
    const rect = piece.getBoundingClientRect();
    const ring = document.createElement('i');
    ring.className = 'pop-ring';
    const match = [...piece.classList].find((name) => /^piece-\d+$/.test(name));
    const base = match ? Number(match.slice(6)) : null;
    ring.style.setProperty('--fx-color', palette[base] || 'var(--chain-color)');
    ring.style.left = `${rect.left - frame.left + rect.width / 2}px`;
    ring.style.top = `${rect.top - frame.top + rect.height / 2}px`;
    fx.append(ring);
    setTimeout(() => ring.remove(), 460);
  }

  setTimeout(() => { ringLock = false; }, 80);
}

if (chainPolyline) {
  new MutationObserver(() => requestAnimationFrame(syncGlow))
    .observe(chainPolyline, { attributes: true, attributeFilter: ['points'] });
}

if (board) {
  new MutationObserver(() => requestAnimationFrame(() => {
    syncGlow();
    drawTail();
  })).observe(board, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

  board.addEventListener('pointerdown', (event) => {
    activePointer = event.pointerId;
    pointer = relativePoint(event.clientX, event.clientY);
    requestAnimationFrame(drawTail);
  });

  board.addEventListener('pointermove', (event) => {
    if (activePointer !== event.pointerId) return;
    pointer = relativePoint(event.clientX, event.clientY);
    requestAnimationFrame(drawTail);
  });

  const endPointer = (event) => {
    if (event?.pointerId !== undefined && activePointer !== event.pointerId) return;
    activePointer = null;
    pointer = null;
    requestAnimationFrame(hideTail);
  };
  board.addEventListener('pointerup', endPointer);
  board.addEventListener('pointercancel', endPointer);
}

if (fx) {
  new MutationObserver((records) => {
    let scoreAdded = false;
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === 1 && node.classList?.contains('score-pop')) scoreAdded = true;
      }
    }
    if (scoreAdded) requestAnimationFrame(spawnRings);
  }).observe(fx, { childList: true });
}

window.addEventListener('resize', () => requestAnimationFrame(drawTail));
restoreRestartIcon();
syncGlow();
hideTail();
