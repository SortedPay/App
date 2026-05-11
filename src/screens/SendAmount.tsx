import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { NumericKeypad } from '../components/NumericKeypad'
import { USERS_BY_HANDLE, formatAUD } from '../lib/mockData'
import { useStore } from '../lib/store'

const PRESETS = [10, 20, 50, 100]

export default function SendAmount() {
  const navigate = useNavigate()
  const { handle } = useParams<{ handle: string }>()
  const balance = useStore((s) => s.balanceCents)
  const recipient = handle ? USERS_BY_HANDLE.get(handle) : undefined

  const [amount, setAmount] = useState('')

  if (!recipient) {
    return (
      <Screen className="px-6 pt-6">
        <p className="text-ink-muted">User not found.</p>
      </Screen>
    )
  }

  const cents = Math.round(parseFloat(amount || '0') * 100)
  const valid = cents > 0 && (balance === 0 || cents <= balance)
  // v0.2: when balance is 0 (fresh wallet) we still allow tapping Review so users
  // can preview the flow — the Confirm screen will gate on real balance later.
  const overBalance = balance > 0 && cents > balance

  function handleSubmit() {
    if (!valid) return
    sessionStorage.setItem(
      'pendingSend',
      JSON.stringify({ handle: recipient!.handle, cents, note: '' })
    )
    navigate(`/send/${recipient!.handle}/confirm`)
  }

  // Format amount for display
  const [intPart = '0', decPart = ''] = amount.split('.')
  const dollarsDisplay = intPart === '' ? '0' : parseInt(intPart || '0').toLocaleString('en-AU')

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="SEND" />

      {/* Recipient */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center pt-2 pb-4"
      >
        <Avatar user={recipient} size="lg" />
        <p className="font-display font-bold text-[16px] tracking-tight mt-2 text-ink">
          {recipient.firstName} {recipient.lastName}
        </p>
        <p className="font-body text-[12px] text-ink-muted">@{recipient.handle}</p>
      </motion.div>

      {/* Amount display */}
      <div className="flex flex-col items-center text-center pt-2 pb-4">
        <div className="flex items-baseline justify-center mb-2 leading-none">
          <span
            className={`font-numeric font-semibold text-[28px] mr-1 self-start mt-3 transition-colors ${
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
            className={`font-numeric font-bold text-[80px] leading-none tracking-[-0.04em] numeric transition-colors ${
              overBalance ? 'text-coral' : 'text-ink'
            }`}
          >
            {dollarsDisplay}
          </motion.span>
          <span
            className={`font-numeric font-semibold text-[28px] ml-1 self-end mb-2 transition-colors ${
              overBalance ? 'text-coral' : 'text-ink-muted'
            }`}
          >
            .{amount.includes('.') ? decPart.padEnd(2, '0').slice(0, 2) : '00'}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {overBalance ? (
            <motion.p
              key="over"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono font-semibold text-[11px] uppercase tracking-[0.14em] text-coral"
            >
              Over balance · {formatAUD(balance)} available
            </motion.p>
          ) : (
            <motion.p
              key="balance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono font-semibold text-[11px] uppercase tracking-[0.14em] text-ink-muted"
            >
              Balance · {formatAUD(balance)}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Preset chips */}
      <div className="flex gap-2 mb-5 justify-center">
        {PRESETS.map((preset) => (
          <motion.button
            key={preset}
            whileTap={{ scale: 0.94 }}
            onClick={() => setAmount(preset.toString())}
            className={`px-4 py-1.5 rounded-full border-[1.5px] font-display font-bold text-[13px] tracking-tight transition-colors ${
              amount === preset.toString()
                ? 'bg-ink text-paper border-ink'
                : 'bg-paper-elevated text-ink border-line active:bg-line-soft'
            }`}
          >
            ${preset}
          </motion.button>
        ))}
      </div>

      {/* CTA */}
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

      {/* Keypad */}
      <NumericKeypad value={amount} onChange={setAmount} className="mb-2" />
    </Screen>
  )
}
