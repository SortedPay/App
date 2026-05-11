import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/Screen'
import Header from '../components/Header'

export default function VerifyCode() {
  const navigate = useNavigate()
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [shake, setShake] = useState(false)

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  function handleChange(idx: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[idx] = digit
    setCode(next)
    if (digit && idx < 5) {
      inputRefs.current[idx + 1]?.focus()
    }
    // auto-submit on full code
    if (next.every((d) => d) && next.join('').length === 6) {
      // simulate verification — accept any 6-digit code in demo
      setTimeout(() => navigate('/claim'), 300)
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col">
      <Header title="Verify" />

      <div className="flex-1 flex flex-col justify-center pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display font-bold text-[40px] leading-[0.95] tracking-tighter text-ink mb-3">
            Check your<br />
            <span className="hl hl-sky">messages.</span>
          </h1>
          <p className="text-ink-soft mb-10 text-[15px] max-w-[28ch]">
            We sent a 6-digit code. Pop it in below.
          </p>

          <motion.div
            animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex gap-2 mb-8"
          >
            {code.map((digit, idx) => (
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
                className="input w-12 h-14 text-center font-display font-bold text-[24px] tracking-tighter px-0"
              />
            ))}
          </motion.div>

          <p className="text-[13px] text-ink-muted text-center">
            Didn&apos;t arrive?{' '}
            <button
              type="button"
              onClick={() => setShake(true)}
              className="text-ink font-semibold underline"
            >
              Send again
            </button>
          </p>
        </motion.div>
      </div>
    </Screen>
  )
}
