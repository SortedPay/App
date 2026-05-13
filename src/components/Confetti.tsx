import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Confetti — minimal, on-brand particle burst for success moments.
 *
 * Design choices:
 *   - All particles ink-black (matches brand restraint)
 *   - Mix of squares and circles (small variety — not noise)
 *   - Fires once on mount, auto-cleans after animation completes
 *   - Origin defaults to top-center but customisable
 *
 * Performance:
 *   - 24 particles is enough for "celebration" without thrashing layout
 *   - All animations are transform/opacity only (GPU-cheap)
 *   - Component unmounts itself after 1.4s so the DOM doesn't accumulate
 */

type Particle = {
  id: number
  shape: 'square' | 'circle'
  size: number
  startX: number
  startY: number
  endX: number
  endY: number
  rotateEnd: number
  delay: number
}

const PARTICLE_COUNT = 24
const ANIMATION_MS = 1300

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    // Direction biased outward from origin — half go each side
    const direction = i % 2 === 0 ? 1 : -1
    const spread = rand(40, 200) * direction
    const drop = rand(80, 280) // particles fall downward in screen px

    return {
      id: i,
      shape: Math.random() > 0.5 ? 'square' : 'circle',
      size: rand(4, 9), // small — not party-popper big
      startX: rand(-12, 12), // small spread at origin
      startY: 0,
      endX: spread,
      endY: drop,
      rotateEnd: rand(-180, 180),
      delay: rand(0, 0.08), // very slight stagger
    }
  })
}

type Props = {
  /**
   * When true, particles burst. When the prop transitions to true the
   * component re-keys so a re-trigger works.
   */
  active: boolean
  /** Defaults to top center of the screen. */
  originY?: string
}

export default function Confetti({ active, originY = '38%' }: Props) {
  // We use a "fire token" so subsequent active=true reruns spawn fresh particles
  const [fireToken, setFireToken] = useState(0)
  const particles = useMemo(() => buildParticles(), [fireToken])

  useEffect(() => {
    if (active) setFireToken((t) => t + 1)
  }, [active])

  // Auto-unmount visually after the animation duration
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!active) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), ANIMATION_MS)
    return () => clearTimeout(t)
  }, [active, fireToken])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none fixed left-1/2 z-50"
      style={{ top: originY, transform: 'translate(-50%, -50%)' }}
      aria-hidden
    >
      {particles.map((p) => (
        <motion.div
          key={`${fireToken}-${p.id}`}
          initial={{
            x: p.startX,
            y: p.startY,
            opacity: 0,
            rotate: 0,
            scale: 0.4,
          }}
          animate={{
            x: p.endX,
            y: p.endY,
            opacity: [0, 1, 1, 0],
            rotate: p.rotateEnd,
            scale: [0.4, 1, 1, 0.8],
          }}
          transition={{
            duration: ANIMATION_MS / 1000,
            delay: p.delay,
            ease: [0.2, 0.6, 0.4, 1], // ease-out-ish with slight fall acceleration
            opacity: { times: [0, 0.1, 0.6, 1] },
            scale: { times: [0, 0.15, 0.7, 1] },
          }}
          className="absolute bg-ink"
          style={{
            width: p.size,
            height: p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '1px',
            left: 0,
            top: 0,
          }}
        />
      ))}
    </div>
  )
}
