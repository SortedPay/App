import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Screen from '../components/Screen'

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
      {/* Top hero — centered tile + headline + subtitle */}
      <div className="flex-1 flex flex-col items-center justify-center text-center pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-20 h-20 bg-lime border-[2.5px] border-ink rounded-[24px] shadow-ink-md flex items-center justify-center mb-6"
        >
          <Plus size={32} strokeWidth={3} className="text-ink" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-[44px] leading-[1] tracking-tightest text-ink mb-3 whitespace-pre-line"
        >
          {'Money,\nsorted.'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.55 }}
          className="font-body font-medium text-[15px] leading-[1.45] text-ink-soft max-w-[290px]"
        >
          Send to any @handle, anywhere in Australia.
          <br />
          Free. Instant. Done.
        </motion.p>
      </div>

      {/* Phone entry */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.5 }}
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
          <span className="underline">Terms</span> and{' '}
          <span className="underline">Privacy Policy</span>.
        </p>
      </motion.div>
    </Screen>
  )
}
