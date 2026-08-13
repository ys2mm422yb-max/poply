export function anticipationForLength(length, de = false) {
  const count = Number.isFinite(length) ? Math.max(0, Math.floor(length)) : 0;
  if (count >= 7) {
    return {
      tier: 'prism',
      message: de ? 'PRISM BEREIT' : 'PRISM READY',
      haptic: [18, 24, 18],
    };
  }
  if (count >= 5) {
    return {
      tier: 'blast',
      message: de ? 'BLAST BEREIT' : 'BLAST READY',
      haptic: [12, 18, 12],
    };
  }
  if (count >= 3) {
    return {
      tier: 'chain',
      message: de ? 'KETTE BEREIT' : 'CHAIN READY',
      haptic: 8,
    };
  }
  return { tier: 'building', message: '', haptic: 0 };
}

function installAnticipation() {
  if (typeof document === 'undefined') return;

  const board = document.querySelector('#board');
  const frame = document.querySelector('#board-frame');
  if (!board || !frame) return;

  const de = (navigator.language || '').toLowerCase().startsWith('de');
  let lastLength = 0;
  let lastTier = 'building';

  function selectedLength() {
    return board.querySelectorAll('.piece.chain-selected').length;
  }

  function sync() {
    const length = selectedLength();
    const anticipation = anticipationForLength(length, de);
    const flowHud = frame.querySelector('.flow-hud');
    const flowCopy = flowHud?.querySelector('.flow-copy');

    frame.classList.toggle('chain-ready', anticipation.tier === 'chain');
    frame.classList.toggle('blast-ready', anticipation.tier === 'blast');
    frame.classList.toggle('prism-ready', anticipation.tier === 'prism');

    if (flowHud) {
      flowHud.dataset.anticipation = anticipation.tier;
      if (length >= 3 && flowCopy) flowCopy.textContent = anticipation.message;
    }

    const crossedMilestone = length > lastLength && anticipation.tier !== lastTier && length >= 3;
    if (crossedMilestone && navigator.vibrate && anticipation.haptic) {
      navigator.vibrate(anticipation.haptic);
    }

    lastLength = length;
    lastTier = anticipation.tier;
  }

  new MutationObserver(() => requestAnimationFrame(sync)).observe(board, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });

  sync();
}

installAnticipation();
