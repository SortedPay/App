import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AtSign } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import ApiStatusNote from '../components/ApiStatusNote'
import { sendCode } from '../lib/auth'

/** Returning users: same mobile + code flow as sign-up, the API finds the account. */
export default function SignIn() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }

  const isValid = phone.replace(/\D/g, '').length === 10

  async function handleContinue() {
    if (!isValid || busy) return
    setBusy(true)
    setError(null)
    try {
      await sendCode(phone)
      navigate('/verify')
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send a code. Try again.")
      setBusy(false)
    }
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="SIGN IN" />

      <div className="flex-1 flex flex-col items-center justify-center text-center pb-10">
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-20 h-20 bg-lime border-[2.5px] border-ink rounded-[24px] shadow-ink-md flex items-center justify-center mb-6"
        >
          <AtSign size={30} strokeWidth={2.6} className="text-ink" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="font-display font-bold text-[28px] leading-[1.05] tracking-tightest text-ink mb-3"
        >
          Welcome back.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft max-w-[290px] mb-2"
        >
          Pop in the mobile you signed up with and we&apos;ll text you a code.
        </motion.p>
      </div>

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

      {error && <p className="font-body text-[12px] text-coral mb-3 px-1">{error}</p>}
      <ApiStatusNote />

      <button
        onClick={handleContinue}
        disabled={!isValid || busy}
        className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none"
      >
        {busy ? 'Sending code…' : 'Continue'}
      </button>

      <button
        onClick={() => navigate('/welcome')}
        className="w-full py-3 mt-2 font-body font-medium text-[13px] text-ink-muted active:text-ink transition-colors"
      >
        New here? Start fresh →
      </button>
    </Screen>
  )
}
