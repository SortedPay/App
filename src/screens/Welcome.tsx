import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/Screen'

export default function Welcome() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    // Aussie format: 04XX XXX XXX
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }

  const isValid = phone.replace(/\D/g, '').length === 10

  return (
    <Screen transition="fade" className="min-h-screen flex flex-col">
      {/* Top — brand mark sticker */}
      <div className="pt-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -10, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-16 h-16 bg-lime border-[2.5px] border-ink rounded-2xl shadow-ink-sm flex items-center justify-center"
        >
          <img src="/sorted-mark.svg" alt="Sorted" className="w-9 h-9" />
        </motion.div>
      </div>

      {/* Hero copy */}
      <div className="flex-1 flex flex-col justify-center pb-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-[64px] leading-[0.88] tracking-tightest text-ink mb-6"
        >
          Money,<br />
          <span className="hl">sorted.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-display font-semibold text-[19px] leading-tight text-ink-soft tracking-tight max-w-[18ch]"
        >
          Send to any <strong>@handle</strong>, anywhere in Australia.
          <br />
          <strong>Free. Instant. Done.</strong>
        </motion.p>
      </div>

      {/* Phone entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="pb-8"
      >
        <label className="label-mono block mb-2">Mobile number</label>
        <div className="flex items-stretch gap-0 mb-4 bg-paper-elevated border-2 border-ink rounded-2xl overflow-hidden focus-within:shadow-ink-sm focus-within:-translate-y-px transition-all">
          <span className="flex items-center pl-5 pr-2 font-mono font-semibold text-ink-muted text-[16px] select-none">
            +61
          </span>
          <input
            type="tel"
            inputMode="tel"
            placeholder="04XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            className="flex-1 bg-transparent border-0 outline-none font-body font-medium text-[16px] py-4 pr-5 placeholder:text-ink-faint"
            autoFocus
          />
        </div>
        <button
          className="btn btn-primary btn-lg btn-block"
          disabled={!isValid}
          onClick={() => navigate('/verify')}
        >
          Continue
        </button>
        <p className="text-[12px] text-ink-muted mt-4 text-center px-2">
          By continuing, you agree to Sorted&apos;s{' '}
          <span className="underline">Terms</span> and{' '}
          <span className="underline">Privacy Policy</span>.
        </p>
      </motion.div>
    </Screen>
  )
}
