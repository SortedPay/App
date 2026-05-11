import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Smartphone } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { NumericKeypad } from '../components/NumericKeypad'
import { formatAUD } from '../lib/mockData'
import { useStore } from '../lib/store'

const PRESETS = [10, 20, 50, 100]

export default function SendSmsAmount() {
  const navigate = useNavigate()
  const balance = useStore((s) => s.balanceCents)

  const pending = JSON.parse(sessionStorage.getItem('pendingSmsSend') || '{}') as {
    phone?: string
    name?: string
  }
  const phone = pending.phone ?? ''
  const name = pending.name ?? ''

  const [amount, setAmount] = useState('')

  const cents = Math.round(parseFloat(amount || '0') * 100)
  const valid = cents > 0 && (balance === 0 || cents <= balance)
  const overBalance = balance > 0 && cents > balance

  function handleSubmit() {
    if (!valid) return
    sessionStorage.setItem(
      'pendingSmsSend',
      JSON.stringify({ phone, name, cents })
    )
    navigate('/sms/confirm')
  }

  if (!phone) {
    return (
      <Screen className="px-6 pt-6">
        <Header title="SEND VIA SMS" />
        <p className="text-ink-muted mt-4">Add a recipient first.</p>
      </Screen>
    )
  }

  const [intPart = '0', decPart = ''] = amount.split('.')
  const dollarsDisplay = intPart === '' ? '0' : parseInt(intPart || '0').toLocaleString('en-AU')
  const formattedPhone = `+61 ${phone.slice(1, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="SEND VIA SMS" />

      {/* Recipient — phone glyph in dashed lime ring */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center pt-2 pb-3"
      >
        <div className="w-14 h-14 rounded-full border-[2px] border-dashed border-lime-deep flex items-center justify-center bg-paper-elevated">
          <Smartphone size={22} strokeWidth={2.2} className="text-ink" />
        </div>
        <p className="font-display font-bold text-[16px] tracking-tight mt-2 text-ink">
          {name || 'New contact'}
        </p>
        <p className="font-body text-[12px] text-ink-muted">{formattedPhone}</p>
      </motion.div>

      {/* Amount */}
      <div className="flex flex-col items-center text-center pt-2 pb-4">
        <div className="flex items-baseline justify-center leading-none mb-2">
          <span
            className={`font-numeric font-semibold text-[28px] mr-1 self-start mt-3 ${
              overBalance ? 'text-coral' : 'text-ink-muted'
            }`}
          >
            $
          </span>
          <motion.span
            key={dollarsDisplay}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.12 }}
            className={`font-numeric font-bold text-[80px] leading-none tracking-[-0.04em] numeric ${
              overBalance ? 'text-coral' : 'text-ink'
            }`}
          >
            {dollarsDisplay}
          </motion.span>
          <span
            className={`font-numeric font-semibold text-[28px] ml-1 self-end mb-2 ${
              overBalance ? 'text-coral' : 'text-ink-muted'
            }`}
          >
            .{amount.includes('.') ? decPart.padEnd(2, '0').slice(0, 2) : '00'}
          </span>
        </div>
        <p className="font-mono font-semibold text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          {overBalance ? `Over balance · ${formatAUD(balance)} available` : `Balance · ${formatAUD(balance)}`}
        </p>
      </div>

      <div className="flex gap-2 mb-4 justify-center">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(String(p))}
            className={`px-4 py-1.5 rounded-full border-[1.5px] font-display font-bold text-[13px] tracking-tight transition-colors ${
              amount === String(p)
                ? 'bg-ink text-paper border-ink'
                : 'bg-paper-elevated text-ink border-line active:bg-line-soft'
            }`}
          >
            ${p}
          </button>
        ))}
      </div>

      <button
        disabled={!valid}
        onClick={handleSubmit}
        className={`
          w-full py-4 rounded-[14px] border-[2px]
          font-display font-bold text-[16px] tracking-tight
          transition-all duration-100 mb-3
          ${
            valid
              ? 'bg-lime text-ink border-ink shadow-ink active:translate-y-[3px] active:shadow-none'
              : 'bg-line-soft text-ink-muted border-line opacity-70 cursor-not-allowed'
          }
        `}
      >
        Review send
      </button>

      <NumericKeypad value={amount} onChange={setAmount} className="mb-2" />
    </Screen>
  )
}
