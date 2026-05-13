import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { NumericKeypad } from '../components/NumericKeypad'
import { USERS_BY_HANDLE } from '../lib/mockData'
import { autoShrinkAmountSize } from '../lib/displaySize'

const PRESETS = [10, 20, 50, 100]

/**
 * RequestAmount — type how much to ask for + optional note.
 *
 * Mirrors SendAmount's structure but without the over-balance gate (since
 * we're requesting from someone else's balance, not our own).
 */
export default function RequestAmount() {
  const navigate = useNavigate()
  const { handle } = useParams<{ handle: string }>()
  const recipient = handle ? USERS_BY_HANDLE.get(handle) : undefined

  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  if (!recipient) {
    return (
      <Screen className="px-6 pt-6">
        <Header title="REQUEST" />
        <p className="text-ink-muted mt-4">User not found.</p>
      </Screen>
    )
  }

  const cents = Math.round(parseFloat(amount || '0') * 100)
  const valid = cents > 0

  function handleSubmit() {
    if (!valid) return
    sessionStorage.setItem(
      'pendingRequest',
      JSON.stringify({ handle: recipient!.handle, cents, note: note.trim() })
    )
    navigate(`/request/${recipient!.handle}/confirm`)
  }

  const [intPart = '0', decPart = ''] = amount.split('.')
  const dollarsDisplay = intPart === '' ? '0' : parseInt(intPart || '0').toLocaleString('en-AU')

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="REQUEST" />

      {/* Recipient */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center pt-2 pb-4"
      >
        <Avatar user={recipient} size="lg" />
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mt-2">
          Asking
        </p>
        <p className="font-display font-bold text-[16px] tracking-tight text-ink">
          {recipient.firstName} {recipient.lastName}
        </p>
        <p className="font-body text-[12px] text-ink-muted">@{recipient.handle}</p>
      </motion.div>

      {/* Amount display */}
      <div className="flex flex-col items-center text-center pt-2 pb-4">
        <div className="flex items-baseline justify-center mb-2 leading-none">
          <span className="font-numeric font-semibold text-[28px] mr-1 self-start mt-3 text-ink-muted">
            $
          </span>
          <motion.span
            key={dollarsDisplay}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.12 }}
            style={{ fontSize: autoShrinkAmountSize(dollarsDisplay) }}
            className="font-numeric font-bold leading-none tracking-[-0.04em] numeric text-ink"
          >
            {dollarsDisplay}
          </motion.span>
          <span className="font-numeric font-semibold text-[28px] ml-1 self-end mb-2 text-ink-muted">
            .{amount.includes('.') ? decPart.padEnd(2, '0').slice(0, 2) : '00'}
          </span>
        </div>
        <p className="font-mono font-semibold text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          They get a notification
        </p>
      </div>

      {/* Preset chips */}
      <div className="flex gap-2 mb-4 justify-center">
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

      {/* Optional note */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="What's it for? (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 60))}
          maxLength={60}
          className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[12px] outline-none focus:border-ink transition-colors font-body text-[14px] text-ink py-2.5 px-3.5 placeholder:text-ink-faint"
        />
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
        Review request
      </button>

      <NumericKeypad value={amount} onChange={setAmount} className="mb-2" />
    </Screen>
  )
}
