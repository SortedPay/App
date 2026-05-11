import { motion } from 'framer-motion'

interface Props {
  on: boolean
  onToggle: (v: boolean) => void
  /** Optional aria label for accessibility */
  label?: string
  /** Disabled state */
  disabled?: boolean
}

/**
 * Toggle switch — designed for tactile, iOS-level feel.
 *
 * Physics:
 * - Knob translates on a spring (stiffness 700, damping 35) — fast but settled
 * - Track colour transitions in 180ms, slightly faster than the knob so the
 *   colour leads the motion (feels responsive, not laggy)
 * - Knob has a soft drop shadow that subtly grows when active
 * - Press scales the whole component to 0.96 for haptic feedback
 *
 * Sizes match Apple's UISwitch proportions: 51:31 ratio, ~17px knob inset.
 */
export function Toggle({ on, onToggle, label, disabled = false }: Props) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.94 }}
      transition={{ duration: 0.08 }}
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onToggle(!on)}
      className={`
        relative shrink-0 rounded-full
        transition-colors duration-200 ease-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        // Apple's UISwitch is 51×31 — we use 50×30 for cleaner pixel rendering at 2x
        width: 50,
        height: 30,
        // Inner padding so knob can move 20px (50 - 30 = 20)
        backgroundColor: on ? '#C8F154' : '#E5E0D2',
        // Thin border for definition without competing with knob
        boxShadow: on
          ? 'inset 0 0 0 1.5px #0E0E18'
          : 'inset 0 0 0 1.5px rgba(14, 14, 24, 0.18)',
      }}
    >
      <motion.span
        // Spring keeps the knob feeling weighted but responsive
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 700, damping: 35, mass: 0.6 }}
        className="absolute top-[2px] left-0 rounded-full bg-paper-elevated"
        style={{
          width: 26,
          height: 26,
          // Two-layer shadow: tight contact shadow + softer ambient lift
          // This is what makes the knob feel physical instead of flat
          boxShadow: on
            ? '0 2px 4px rgba(14, 14, 24, 0.28), 0 1px 1px rgba(14, 14, 24, 0.5)'
            : '0 2px 4px rgba(14, 14, 24, 0.18), 0 1px 1px rgba(14, 14, 24, 0.35)',
        }}
      />
    </motion.button>
  )
}
