import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { haptic } from '../lib/chime'

type Props = {
  label: string
  holdingLabel?: string
  confirmingLabel?: string
  durationMs?: number
  onConfirm: () => void
  disabled?: boolean
}

/**
 * HoldToConfirm — high-fidelity hold-to-send button.
 *
 * The old version had a fill but no tactile feedback. This version:
 *
 *   1. Press-down scale (0.97) + shadow flatten → tactile "I'm pressing"
 *   2. Ink fill grows L→R with the hold progress (impossible to miss on lime)
 *   3. Periodic haptic micro-buzz at 25/50/75% so user feels progress
 *   4. Label cross-fades between "Hold to send" → "Keep holding 0.6s" → "Sending…"
 *   5. Label text flips lime when sitting over the ink fill (always legible)
 *   6. Cancel-shake (subtle x-axis nudge) when user releases before completing
 *   7. Final haptic + scale-up "release" feel at 100%
 *
 * Designed so the user can never wonder "is this working?" — every 50ms of
 * holding produces a visible change. And every release produces feedback
 * (whether complete or abandoned).
 */
export default function HoldToConfirm({
  label,
  holdingLabel = 'Keep holding',
  confirmingLabel = 'Sending…',
  durationMs = 1200,
  onConfirm,
  disabled = false,
}: Props) {
  const [progress, setProgress] = useState(0) // 0..1
  const [confirming, setConfirming] = useState(false)
  const [abandoned, setAbandoned] = useState(false)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  // Track which milestone haptic buzzes have fired this hold
  const buzzedRef = useRef<{ q1: boolean; q2: boolean; q3: boolean }>({ q1: false, q2: false, q3: false })

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  function resetBuzzes() {
    buzzedRef.current = { q1: false, q2: false, q3: false }
  }

  function startHold() {
    if (disabled || confirming) return
    setAbandoned(false)
    resetBuzzes()
    startRef.current = Date.now()
    // Initial press buzz — small confirmation the press registered
    haptic(8)

    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const p = Math.min(elapsed / durationMs, 1)
      setProgress(p)

      // Milestone haptic buzzes — gives user a sense of progress
      if (!buzzedRef.current.q1 && p >= 0.25) {
        buzzedRef.current.q1 = true
        haptic(6)
      }
      if (!buzzedRef.current.q2 && p >= 0.5) {
        buzzedRef.current.q2 = true
        haptic(8)
      }
      if (!buzzedRef.current.q3 && p >= 0.75) {
        buzzedRef.current.q3 = true
        haptic(10)
      }

      if (p >= 1) {
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        // Final completion buzz — bigger
        haptic(25)
        setConfirming(true)
        onConfirm()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function endHold() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (confirming) return
    // If released mid-hold, animate the fill back to 0 with a shake cue
    if (progress > 0.05 && progress < 1) {
      setAbandoned(true)
      // Clear abandon flag after the shake animation completes
      setTimeout(() => setAbandoned(false), 350)
    }
    setProgress(0)
    resetBuzzes()
  }

  const displayLabel = (() => {
    if (confirming) return confirmingLabel
    if (progress > 0 && progress < 1) {
      const remaining = Math.max(0, durationMs - progress * durationMs) / 1000
      return `${holdingLabel} · ${remaining.toFixed(1)}s`
    }
    return label
  })()

  const isHolding = progress > 0 && progress < 1

  return (
    <motion.button
      type="button"
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      onPointerCancel={endHold}
      disabled={disabled || confirming}
      // Press scale: subtle squeeze on grip, exaggerated bounce on completion
      animate={{
        scale: confirming ? 1.02 : isHolding ? 0.985 : 1,
        x: abandoned ? [0, -4, 4, -3, 3, 0] : 0,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 380, damping: 22 },
        x: { duration: 0.32, ease: 'easeOut' },
      }}
      style={{ touchAction: 'manipulation' }}
      className={`relative w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink overflow-hidden select-none disabled:opacity-70 transition-shadow duration-100 ${
        isHolding ? 'shadow-none translate-y-[2px]' : 'shadow-ink'
      }`}
      aria-label={label}
    >
      {/* Progress fill — INK on lime for impossible-to-miss contrast. Width
          interpolated by Framer so it tracks the RAF smoothly without thrash. */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-ink"
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.08, ease: 'linear' }}
        aria-hidden
      />

      {/* Base label in ink — visible over the un-filled (lime) area */}
      <span className="relative z-10 inline-flex items-center justify-center w-full font-display font-bold text-[16px] text-ink">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={displayLabel}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {displayLabel}
          </motion.span>
        </AnimatePresence>
      </span>

      {/* Lime label clipped to fill width — flips colour over the ink fill */}
      <span
        className="absolute inset-0 z-20 inline-flex items-center justify-center font-display font-bold text-[16px] text-lime pointer-events-none"
        style={{
          clipPath: `inset(0 ${100 - progress * 100}% 0 0)`,
        }}
        aria-hidden
      >
        {displayLabel}
      </span>
    </motion.button>
  )
}
