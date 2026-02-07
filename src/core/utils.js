export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by)
}
