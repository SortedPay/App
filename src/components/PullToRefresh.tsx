import { useEffect, useRef, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

/**
 * PullToRefresh — touch-friendly pull-down refresh gesture.
 *
 * Design choices:
 *   - Pointer events so it works on touch + mouse (good for dev testing).
 *   - Only activates when the page is scrolled to the top — otherwise the
 *     gesture is consumed by normal scroll. This is the standard pattern
 *     and matches every iOS/Android app the user already uses.
 *   - Threshold of 70px to trigger; rubber-band scale beyond that
 *     (visual feedback that they've "pulled hard enough").
 *   - Spinner with a fixed 700ms minimum visible duration even if the
 *     refresh resolves faster — so the interaction has weight.
 */

type Props = {
  /** Called when user releases past threshold. Should return a Promise. */
  onRefresh: () => Promise<void> | void
  /** Pixels of pull required to trigger refresh. Default 70. */
  threshold?: number
  /** Content underneath. */
  children: ReactNode
}

const MIN_VISIBLE_MS = 700

export default function PullToRefresh({ onRefresh, threshold = 70, children }: Props) {
  const [pull, setPull] = useState(0) // current pull distance in px
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const startedAtTop = useRef(false)

  function onPointerDown(e: React.PointerEvent) {
    if (refreshing) return
    // Only start tracking if we're scrolled to the top
    startedAtTop.current = window.scrollY <= 0
    startY.current = e.clientY
  }

  function onPointerMove(e: React.PointerEvent) {
    if (refreshing || startY.current == null) return
    if (!startedAtTop.current) return
    const delta = e.clientY - startY.current
    if (delta <= 0) {
      setPull(0)
      return
    }
    // Rubber-band: scale up to threshold linearly, beyond that diminishing returns
    const linear = Math.min(delta, threshold)
    const overflow = Math.max(0, delta - threshold)
    const rubber = overflow * 0.3
    setPull(linear + rubber)
  }

  async function onPointerEnd() {
    if (refreshing) {
      startY.current = null
      return
    }
    const triggered = pull >= threshold
    startY.current = null
    if (!triggered) {
      setPull(0)
      return
    }
    // Start the refresh, hold the visible state for a min duration
    setRefreshing(true)
    setPull(threshold) // snap to threshold while spinning
    const startedAt = Date.now()
    try {
      await onRefresh()
    } finally {
      const elapsed = Date.now() - startedAt
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)
      setTimeout(() => {
        setRefreshing(false)
        setPull(0)
      }, remaining)
    }
  }

  // Failsafe: cancel pull if pointer leaves the document mid-drag
  useEffect(() => {
    function onCancel() {
      if (!refreshing) setPull(0)
      startY.current = null
    }
    window.addEventListener('pointercancel', onCancel)
    return () => window.removeEventListener('pointercancel', onCancel)
  }, [refreshing])

  // Indicator opacity scales with pull progress
  const indicatorOpacity = Math.min(1, pull / threshold)
  // Rotation gives a "wind up" feel before trigger; spinner takes over once refreshing
  const indicatorRotation = (pull / threshold) * 360

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      style={{ touchAction: refreshing ? 'pan-y' : 'pan-y' }}
      className="relative"
    >
      {/* Indicator — sits above content, visible while pulling or refreshing */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center"
        style={{
          top: -40,
          opacity: indicatorOpacity,
          transform: `translate(-50%, ${pull}px)`,
          transition: refreshing ? 'transform 200ms ease-out' : 'none',
        }}
      >
        <motion.div
          animate={refreshing ? { rotate: 360 } : { rotate: indicatorRotation }}
          transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
          className="w-9 h-9 rounded-full bg-lime border-[1.5px] border-ink shadow-ink-sm flex items-center justify-center"
        >
          <Loader2 size={16} strokeWidth={2.5} className="text-ink" />
        </motion.div>
      </div>

      {/* Content — translated down with the pull so it feels coupled to the gesture */}
      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: pull === 0 || refreshing ? 'transform 200ms ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
