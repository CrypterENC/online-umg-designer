export function uid(): string {
  return `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
