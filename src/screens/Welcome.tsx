import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Screen from '../components/Screen'
import { cascade, popIn, softRise, SPRING_SNAP } from '../lib/motion'

export default function Welcome() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }

  const isValid = phone.replace(/\D/g, '').length === 10

  return (
    <Screen transition="fade" className="min-h-screen flex flex-col px-6">
      {/* Hero — staggered tile + headline + subtitle */}
      <motion.div
        variants={cascade}
        initial="hidden"
        animate="show"
        className="flex-1 flex flex-col items-center justify-center text-center pt-12 pb-8"
      >
        {/*
          Hero tile — the lime plus square. Combines popIn (scale + y) with an
          extra rotate-from-tilted-to-zero so the tile feels like it's settling
          into place rather than just appearing.
        */}
        <motion.div
          variants={popIn}
          // Override the variant transition for this one element so we can add rotate
          initial={{ opacity: 0, scale: 0.5, y: 16, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 14, mass: 0.9 }}
          className="w-20 h-20 bg-lime border-[2.5px] border-ink rounded-[24px] shadow-ink-md flex items-center justify-center mb-6"
        >
          <Plus size={32} strokeWidth={3} className="text-ink" />
        </motion.div>

        <motion.h1
          variants={softRise}
          className="font-display font-bold text-[44px] leading-[1] tracking-tightest text-ink mb-3 whitespace-pre-line"
        >
          {'Money,\nsorted.'}
        </motion.h1>

        <motion.p
          variants={softRise}
          className="font-body font-medium text-[15px] leading-[1.45] text-ink-soft max-w-[290px]"
        >
          Send to any @handle, anywhere in Australia.
          <br />
          Free. Instant. Done.
        </motion.p>
      </motion.div>

      {/* Phone entry — slides up after hero settles */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_SNAP, delay: 0.35 }}
        className="pb-6"
      >
        <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted block mb-2">
          Mobile number
        </label>
        <div className="flex items-stretch gap-0 mb-4 bg-paper-elevated border-[1.5px] border-line rounded-[14px] overflow-hidden focus-within:border-ink transition-colors">
          <span className="flex items-center pl-[18px] pr-1 font-body font-medium text-ink-muted text-[16px] select-none">
            +61
          </span>
          <input
            type="tel"
            inputMode="tel"
            placeholder="04XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            className="flex-1 bg-transparent border-0 outline-none font-body font-medium text-[16px] py-[14px] pr-[18px] placeholder:text-ink-faint text-ink"
            autoFocus
          />
        </div>
        <button
          className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none"
          disabled={!isValid}
          onClick={() => navigate('/verify')}
        >
          Continue
        </button>
        <p className="text-[12px] text-ink-muted mt-4 text-center px-2 leading-[1.4]">
          By continuing, you agree to Sorted&apos;s{' '}
          <button
            type="button"
            onClick={() => navigate('/legal/terms')}
            className="underline text-ink-soft"
          >
            Terms
          </button>{' '}
          and{' '}
          <button
            type="button"
            onClick={() => navigate('/legal/privacy')}
            className="underline text-ink-soft"
          >
            Privacy Policy
          </button>
          .
        </p>
        <button
          type="button"
          onClick={() => navigate('/signin')}
          className="text-center font-body text-[13px] text-ink-muted mt-3 active:text-ink transition-colors block w-full"
        >
          Already on Sorted? <span className="underline text-ink">Sign in</span>
        </button>
      </motion.div>
    </Screen>
  )
}
