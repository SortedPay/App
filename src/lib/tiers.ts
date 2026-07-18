/**
 * Sorted tiers — one source of truth for Perks + Profile.
 * Status + flair only: tiers never touch money. Points come from
 * ACTIONS, never from balance held or time elapsed.
 */

export const TIERS = [
  { name: 'Fresh', min: 0, color: 'paper' },
  { name: 'Local', min: 500, color: 'sky' },
  { name: 'Legend', min: 2500, color: 'butter' },
  { name: 'Icon', min: 10000, color: 'lime' },
] as const

export type Tier = (typeof TIERS)[number]

export function tierFor(points: number) {
  const idx = TIERS.reduce((acc, t, i) => (points >= t.min ? i : acc), 0)
  const tier = TIERS[idx]
  const next = TIERS[idx + 1]
  const progress = next ? Math.min(1, (points - tier.min) / (next.min - tier.min)) : 1
  return { idx, tier, next, progress }
}
