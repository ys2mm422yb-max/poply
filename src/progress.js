export const PROGRESS_VERSION = 1;

export function defaultProgress(levelCount = 1) {
  return {
    version: PROGRESS_VERSION,
    unlocked: 1,
    currentLevel: 1,
    stars: {},
    bestChains: {},
    levelCount,
  };
}

export function normalizeProgress(input, levelCount = 1) {
  const safe = defaultProgress(levelCount);
  if (!input || typeof input !== 'object') return safe;

  const unlocked = Math.min(levelCount, Math.max(1, Number(input.unlocked) || 1));
  const currentLevel = Math.min(unlocked, Math.max(1, Number(input.currentLevel) || 1));
  const stars = {};
  const bestChains = {};

  for (let level = 1; level <= levelCount; level += 1) {
    const starValue = Math.max(0, Math.min(3, Number(input.stars?.[level]) || 0));
    const chainValue = Math.max(0, Number(input.bestChains?.[level]) || 0);
    if (starValue) stars[level] = starValue;
    if (chainValue) bestChains[level] = chainValue;
  }

  return {
    version: PROGRESS_VERSION,
    unlocked,
    currentLevel,
    stars,
    bestChains,
    levelCount,
  };
}

export function recordLevelWin(progress, levelNumber, stars, bestChain, levelCount) {
  const next = normalizeProgress(progress, levelCount);
  const safeLevel = Math.min(levelCount, Math.max(1, levelNumber));
  next.stars[safeLevel] = Math.max(next.stars[safeLevel] || 0, Math.max(1, Math.min(3, stars || 1)));
  next.bestChains[safeLevel] = Math.max(next.bestChains[safeLevel] || 0, Math.max(0, bestChain || 0));
  next.unlocked = Math.max(next.unlocked, Math.min(levelCount, safeLevel + 1));
  return next;
}

export function selectLevel(progress, levelNumber, levelCount) {
  const next = normalizeProgress(progress, levelCount);
  const target = Math.min(levelCount, Math.max(1, levelNumber));
  if (target > next.unlocked) return next;
  next.currentLevel = target;
  return next;
}

export function totalStars(progress) {
  return Object.values(progress?.stars || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

export function loadProgress(storage, key, levelCount) {
  try {
    const raw = storage?.getItem?.(key);
    return normalizeProgress(raw ? JSON.parse(raw) : null, levelCount);
  } catch {
    return defaultProgress(levelCount);
  }
}

export function saveProgress(storage, key, progress, levelCount) {
  const safe = normalizeProgress(progress, levelCount);
  try {
    storage?.setItem?.(key, JSON.stringify(safe));
  } catch {}
  return safe;
}
