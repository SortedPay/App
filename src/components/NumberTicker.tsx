import { useEffect, useRef, useState } from 'react'

interface Props {
  /** The current value (cents) */
  valueCents: number
  /** Animation duration in ms */
  duration?: number
  /** Optional className for the wrapper span */
  className?: string
  /** Render the value yourself, given the dollar/cent split */
  render?: (parts: { dollars: string; cents: string }) => React.ReactNode
}

/**
 * Smoothly animates a number from its previous value to its current value.
 * Format: $X,XXX.YY where the dollars are formatted with thousand separators.
 *
 * If `render` is provided, you control the markup. Otherwise renders as text.
 */
export function NumberTicker({ valueCents, duration = 800, className = '', render }: Props) {
  const [displayCents, setDisplayCents] = useState(valueCents)
  const startCents = useRef(valueCents)
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    if (valueCents === displayCents) return

    startCents.current = displayCents
    startTime.current = null
    if (rafId.current) cancelAnimationFrame(rafId.current)

    const target = valueCents
    const start = displayCents

    const step = (now: number) => {
      if (startTime.current === null) startTime.current = now
      const elapsed = now - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (target - start) * eased)
      setDisplayCents(current)
      if (progress < 1) {
        rafId.current = requestAnimationFrame(step)
      }
    }

    rafId.current = requestAnimationFrame(step)

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueCents, duration])

  const dollars = Math.floor(Math.abs(displayCents) / 100).toLocaleString('en-AU')
  const cents = String(Math.abs(displayCents) % 100).padStart(2, '0')

  if (render) return <>{render({ dollars, cents })}</>

  return <span className={className}>${dollars}.{cents}</span>
}
