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

if (status) new MutationObserver(syncFlowHud).observe(status, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-tone'] });
if (board) new MutationObserver(() => requestAnimationFrame(() => { tunePieces(); syncFlowHud(); })).observe(board, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

window.addEventListener('resize', syncFlowHud);
tunePieces();
syncFlowHud();
