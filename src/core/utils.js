export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by)
}

export function shuffledCopy(items, random = Math.random) {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
