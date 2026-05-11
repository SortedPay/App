import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'

interface Props {
  /** Current value as a string */
  value: string
  /** Called with the new value */
  onChange: (value: string) => void
  /** Allow decimals */
  allowDecimal?: boolean
  /** Max number of digits before the decimal */
  maxIntegerDigits?: number
  /** Max digits after the decimal */
  maxDecimalDigits?: number
  className?: string
}

const KEYS: Array<{ label: string; value: string; isAction?: boolean }> = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '.', value: '.' },
  { label: '0', value: '0' },
  { label: '⌫', value: 'backspace', isAction: true },
]

export function NumericKeypad({
  value,
  onChange,
  allowDecimal = true,
  maxIntegerDigits = 8,
  maxDecimalDigits = 2,
  className = '',
}: Props) {
  function handleKey(key: string) {
    if (key === 'backspace') {
      onChange(value.slice(0, -1))
      return
    }

    if (key === '.') {
      if (!allowDecimal) return
      if (value.includes('.')) return
      if (value === '') {
        onChange('0.')
        return
      }
      onChange(value + '.')
      return
    }

    // Numeric key
    const next = value + key

    // Validation
    const [intPart, decPart] = next.split('.')
    if (intPart.length > maxIntegerDigits) return
    if (decPart && decPart.length > maxDecimalDigits) return
    if (next === '0') {
      onChange('0')
      return
    }
    // Strip leading zeros (but keep "0." valid)
    if (value === '0' && key !== '.') {
      onChange(key)
      return
    }
    onChange(next)
  }

  return (
    <div className={`grid grid-cols-3 gap-1 ${className}`}>
      {KEYS.map((k) => {
        const isDecimal = k.value === '.'
        const isBackspace = k.value === 'backspace'
        const disabled =
          (isDecimal && !allowDecimal) ||
          (isDecimal && value.includes('.')) ||
          (isBackspace && value === '')

        return (
          <motion.button
            key={k.value}
            whileTap={disabled ? undefined : { scale: 0.92 }}
            transition={{ duration: 0.08 }}
            onClick={() => handleKey(k.value)}
            disabled={disabled}
            className={`
              h-[60px] rounded-[16px]
              flex items-center justify-center
              font-display font-bold text-[28px] tracking-tight
              select-none
              transition-colors duration-100
              ${
                disabled
                  ? 'text-ink-faint'
                  : isBackspace
                  ? 'text-ink-soft active:bg-line-soft'
                  : 'text-ink active:bg-paper-elevated'
              }
            `}
            aria-label={isBackspace ? 'Backspace' : `Digit ${k.label}`}
          >
            {isBackspace ? <Delete size={22} strokeWidth={2.4} /> : k.label}
          </motion.button>
        )
      })}
    </div>
  )
}
