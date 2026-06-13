/**
 * Shared Framer Motion presets for Sorted.
 *
 * One source of truth so animations feel cohesive across the app.
 * The vocabulary:
 *   - popIn:    Hero tiles. Spring with overshoot. Brand moments.
 *   - softRise: Standard content. Gentle ease-out, no bounce.
 *   - cascade:  Stagger container — applies popIn or softRise to children.
 *   - tickerPop: Numbers that change. Quick scale punch on update.
 *
 * Easing references (cubic-bezier):
 *   - inOutExpo:  [0.16, 1, 0.3, 1]   — sharp arrival, used for content
 *   - playfulBack: [0.34, 1.56, 0.64, 1] — overshoots, used for hero tiles
 */

import type { Transition, Variants } from 'framer-motion'

// ─────────────────────────────────────────────────────────────
// Springs — physics over keyframes
// ─────────────────────────────────────────────────────────────

/** Hero tile bounce — overshoots ~10%, settles in ~600ms. Use for the lime tiles on Welcome / ClaimHandle / WalletReady etc. */
export const SPRING_POP: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 18,
  mass: 0.9,
}

/** Slightly snappier spring for elements that need to feel responsive (avatars, success checks) */
export const SPRING_SNAP: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 22,
  mass: 0.7,
}

/** Soft spring with minimal overshoot — for secondary content */
export const SPRING_SOFT: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 26,
  mass: 1,
}

// ─────────────────────────────────────────────────────────────
// Reusable variant objects — pass directly into <motion.div variants={...}>
// ─────────────────────────────────────────────────────────────

/** Pop In — for hero tiles. Starts small + low, springs into place with overshoot. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_POP,
  },
}

/** Soft rise — for headlines, body text, secondary content. No overshoot. */
export const softRise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

/** Soft fade — for elements where movement competes (buttons in a flow). */
export const softFade: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
}

/** Card rise — like softRise but with a tiny scale, used for content cards (receipt, points history, etc). */
export const cardRise: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

// ─────────────────────────────────────────────────────────────
// Stagger containers — children inherit timing
// ─────────────────────────────────────────────────────────────

/**
 * Cascade — parent variant that staggers children.
 * Use with motion.section variants={cascade} initial="hidden" animate="show",
 * then each child uses variants={popIn} (or any of the above) — no explicit
 * transition needed on children, the parent times them.
 */
export const cascade: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
}

/** Slower cascade — for dashboards where each row deserves attention */
export const cascadeSlow: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
}

/** Tight cascade — for lists where rows should feel like one cohesive sweep */
export const cascadeTight: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
}
