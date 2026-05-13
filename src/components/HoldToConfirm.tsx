import { useEffect, useRef, useState } from 'react'

type Props = {
  label: string
  holdingLabel?: string
  confirmingLabel?: string
  durationMs?: number
  onConfirm: () => void
  disabled?: boolean
}

/**
 * HoldToConfirm — progress-fill hold button.
 *
 * Visual feedback in three layers:
 *   1. INK fill grows from left → right as the user holds (strong contrast on lime).
 *   2. Label updates with remaining seconds, e.g. "Keep holding · 0.6s".
 *   3. A second label layer is clipped to the fill width and rendered in lime
 *      so the text portion sitting over the ink fill flips colour cleanly —
 *      the text never goes invisible at the fill boundary.
 *
 * The fill is INK (not lime-deep) so it's impossible to miss against the lime
 * button. The previous lime-deep on lime was nearly invisible in bright light.
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
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  function startHold() {
    if (disabled || confirming) return
    startRef.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const p = Math.min(elapsed / durationMs, 1)
      setProgress(p)
      if (p >= 1) {
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
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
    if (!confirming) setProgress(0)
  }

  const displayLabel = (() => {
    if (confirming) return confirmingLabel
    if (progress > 0 && progress < 1) {
      const remaining = Math.max(0, durationMs - progress * durationMs) / 1000
      return `${holdingLabel} · ${remaining.toFixed(1)}s`
    }
    return label
  })()

  return (
    <button
      type="button"
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      onPointerCancel={endHold}
      disabled={disabled || confirming}
      style={{ touchAction: 'manipulation' }}
      className="relative w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] overflow-hidden select-none disabled:opacity-70"
      aria-label={label}
    >
      {/* Progress fill — INK on lime for impossible-to-miss contrast */}
      <div
        className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-75 ease-out"
        style={{ width: `${progress * 100}%` }}
        aria-hidden
      />

      {/* Base label in ink — visible over the un-filled (lime) area */}
      <span className="relative z-10 inline-flex items-center justify-center w-full text-ink">
        {displayLabel}
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
    </button>
  )
}
