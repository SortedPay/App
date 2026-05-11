import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/Screen'
import Header from '../components/Header'

export default function SendSmsNumber() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }

  const isValid = phone.replace(/\D/g, '').length === 10

  function handleContinue() {
    if (!isValid) return
    sessionStorage.setItem(
      'pendingSmsSend',
      JSON.stringify({ phone: phone.replace(/\D/g, ''), name: name.trim() })
    )
    navigate('/sms/amount')
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="SEND VIA SMS" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="pt-2"
      >
        <h1 className="font-display font-bold text-[32px] leading-[1.05] tracking-tightest text-ink mb-2">
          What&apos;s their number?
        </h1>
        <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft mb-6">
          We&apos;ll text them a link. They claim, you&apos;re done.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted block mb-2">
              Mobile number
            </label>
            <div className="flex items-stretch bg-paper-elevated border-[1.5px] border-line rounded-[14px] overflow-hidden focus-within:border-ink transition-colors">
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
          </div>

          <div>
            <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted block mb-2">
              Name (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Mum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[14px] outline-none focus:border-ink transition-colors font-body font-medium text-[16px] text-ink py-[14px] px-[18px] placeholder:text-ink-faint"
              maxLength={32}
            />
          </div>
        </div>

        {/* HOW IT WORKS card */}
        <div className="bg-paper-elevated border border-line rounded-[14px] p-4 mb-6">
          <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
            How it works
          </p>
          <ol className="space-y-2">
            {[
              'They get a text from Sorted with a claim link',
              'They tap the link, set up their account in 60 seconds',
              'Your money lands in their balance — they keep it',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-lime border border-ink flex items-center justify-center font-display font-bold text-[11px] text-ink flex-shrink-0 mt-[1px]">
                  {i + 1}
                </span>
                <span className="font-body text-[13px] leading-[1.4] text-ink-soft">{text}</span>
              </li>
            ))}
          </ol>
        </div>
      </motion.div>

      <div className="flex-1" />

      <button
        disabled={!isValid}
        onClick={handleContinue}
        className={`
          w-full py-4 rounded-[14px] border-[2px]
          font-display font-bold text-[16px] tracking-tight
          transition-all duration-100
          ${
            isValid
              ? 'bg-lime text-ink border-ink shadow-ink active:translate-y-[3px] active:shadow-none'
              : 'bg-line-soft text-ink-muted border-line opacity-70 cursor-not-allowed'
          }
        `}
      >
        Continue
      </button>
    </Screen>
  )
}
