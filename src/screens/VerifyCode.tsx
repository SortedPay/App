import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, AlertTriangle } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { haptic } from '../lib/chime'

// Demo code accepted by the mock verify endpoint. In v0.4 this is replaced
// by Privy's real OTP flow. Any other 6-digit input shows an error so the
// happy + sad paths are both walkable.
const DEMO_CODE = '123456'

export default function VerifyCode() {
  const navigate = useNavigate()
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(30)

  useEffect(() => {
    inputRefs.current[0]?.focus()
    const timer = setInterval(() => {
      setResendCountdown((c) => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  function handleChange(idx: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[idx] = digit
    setCode(next)
    // Any keystroke clears the error so the cell turns black again
    if (error) setError(null)
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus()
    if (next.every((d) => d) && next.join('').length === 6) submitCode(next.join(''))
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length > 0) {
      const next = pasted.padEnd(6, '').split('').slice(0, 6)
      setCode(next)
      setError(null)
      const lastIdx = Math.min(pasted.length, 5)
      inputRefs.current[lastIdx]?.focus()
      if (pasted.length === 6) submitCode(pasted)
    }
  }

  async function submitCode(submitted: string) {
    setVerifying(true)
    await new Promise((r) => setTimeout(r, 700))
    setVerifying(false)
    if (submitted !== DEMO_CODE) {
      haptic(40)
      setError("That code didn't work. Have another go.")
      // Clear and re-focus first cell so user can retry
      setCode(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
      return
    }
    setVerified(true)
    await new Promise((r) => setTimeout(r, 600))
    navigate('/claim')
  }

  function handleResend() {
    if (resendCountdown > 0) return
    setResendCountdown(30)
    setCode(['', '', '', '', '', ''])
    setError(null)
    inputRefs.current[0]?.focus()
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="VERIFY" />

      {/* Centered hero — sky tile + headline + subtitle */}
      <div className="flex-1 flex flex-col items-center text-center pt-12">
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-20 h-20 bg-sky border-[2.5px] border-ink rounded-[24px] shadow-ink-md flex items-center justify-center mb-6"
        >
          <MessageSquare size={30} strokeWidth={2.6} className="text-ink" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55 }}
          className="font-display font-bold text-[34px] leading-[1] tracking-tightest text-ink mb-3"
        >
          Check your messages.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft max-w-[290px] mb-10"
        >
          We sent a 6-digit code to +61 04XX XXX 921. Pop it in below.
          <br />
          <span className="text-[11px] text-ink-muted font-mono tracking-[0.1em]">
            (Demo: use 123456)
          </span>
        </motion.p>

        {/* OTP cells */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
          className="grid grid-cols-6 gap-2 w-full mb-4"
        >
          {code.map((digit, idx) => {
            const filled = !!digit
            return (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={verifying || verified}
                className={`
                  w-full h-[54px] min-w-0 text-center font-display font-bold text-[24px] tracking-tighter
                  bg-paper-elevated rounded-[14px]
                  border-[1.5px] outline-none
                  transition-all duration-200
                  ${
                    error
                      ? 'border-coral bg-coral-soft text-coral'
                      : verified
                      ? 'border-lime-deep bg-lime-soft text-ink'
                      : filled
                      ? 'border-ink text-ink'
                      : 'border-line text-ink-soft focus:border-ink'
                  }
                `}
              />
            )
          })}
        </motion.div>

        {/* Error banner — appears when wrong code submitted */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="w-full mb-3 bg-coral-soft border border-coral rounded-[12px] px-3.5 py-2.5 flex items-start gap-2"
            >
              <AlertTriangle size={14} strokeWidth={2.4} className="text-coral mt-[2px] shrink-0" />
              <p className="font-body text-[13px] leading-[1.4] text-ink flex-1 text-left">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resend hint */}
        <p className="text-[13px] text-ink-muted text-center">
          Didn&apos;t arrive?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCountdown > 0}
            className={
              resendCountdown > 0
                ? 'text-ink-faint cursor-not-allowed'
                : 'text-ink font-semibold underline'
            }
          >
            {resendCountdown > 0 ? `Resend in ${resendCountdown}s.` : 'Send again.'}
          </button>
        </p>

        {verifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mt-6 text-ink-soft"
          >
            <div className="w-3 h-3 border-[2.5px] border-ink border-t-transparent rounded-full animate-spin" />
            <span className="font-mono font-semibold text-[11px] uppercase tracking-[0.18em]">
              Verifying…
            </span>
          </motion.div>
        )}
      </div>
    </Screen>
  )
}
