// Shared cooldown so an edge-swipe gesture spanning stacked screens
// (e.g. article -> topic list -> tab) can't fire router.back() more than
// once and skip a navigation layer.
const COOLDOWN_MS = 600;
let lastTriggeredAt = 0;

export const trySwipeBack = (): boolean => {
  const now = Date.now();
  if (now - lastTriggeredAt < COOLDOWN_MS) return false;
  lastTriggeredAt = now;
  return true;
};
