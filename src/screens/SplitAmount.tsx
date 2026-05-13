import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { NumericKeypad } from '../components/NumericKeypad'
import { User } from '../lib/mockData'
import { useStore } from '../lib/store'
import { autoShrinkAmountSize } from '../lib/displaySize'

/**
 * SplitAmount — type the bill total + see the live per-person preview.
 *
 * The current user covers their own share, so the bill divides by (selected + 1).
 * We fire one request per selected person — never to the user themselves.
 *
 * Currently the split is even. Custom splits (e.g. "Mum: $40, mates: $20")
 * are a v0.5 feature.
 */
export default function SplitAmount() {
  const navigate = useNavigate()
  const requestMoney = useStore((s) => s.requestMoney)

  // Recover the selected people from sessionStorage
  const [people, setPeople] = useState<User[]>([])
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('pendingSplitPeople')
      if (raw) setPeople(JSON.parse(raw) as User[])
    } catch {
      // ignore
    }
  }, [])

  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)

  const totalCents = Math.round(parseFloat(amount || '0') * 100)
  const ways = people.length + 1 // includes the user
  // Floor to whole cents to avoid sub-cent rounding noise.
  // The user (payer) eats any remainder — fair, since they're the one organising.
  const perPersonCents = ways > 0 ? Math.floor(totalCents / ways) : 0
  const userOwes = totalCents - perPersonCents * people.length
  const valid = totalCents >= 100 && perPersonCents > 0 && people.length > 0

  const [intPart = '0', decPart = ''] = amount.split('.')
  const dollarsDisplay = intPart === '' ? '0' : parseInt(intPart || '0').toLocaleString('en-AU')

  async function handleSplit() {
    if (!valid || sending) return
    setSending(true)
    // Fire one request per person — sequential so we don't hammer the (mock) backend
    try {
      for (const p of people) {
        await requestMoney(p, perPersonCents, note.trim() || undefined)
      }
      sessionStorage.removeItem('pendingSplitPeople')
      sessionStorage.setItem(
        'pendingSplitSummary',
        JSON.stringify({
          totalCents,
          perPersonCents,
          peopleCount: people.length,
          note: note.trim(),
          handles: people.map((p) => p.handle),
        })
      )
      navigate('/split/sent', { replace: true })
    } catch {
      // If one fails we still navigate — earlier ones already fired
      setSending(false)
    }
  }

  if (people.length === 0) {
    return <Navigate to="/split" replace />
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="SPLIT" />

      {/* Compact people summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center pt-2 pb-3"
      >
        {/* Overlapping avatar stack */}
        <div className="flex items-center justify-center mb-2">
          {people.slice(0, 5).map((p, idx) => (
            <div
              key={p.handle}
              style={{ marginLeft: idx === 0 ? 0 : -10, zIndex: people.length - idx }}
              className="ring-2 ring-paper rounded-full"
            >
              <Avatar user={p} size="md" />
            </div>
          ))}
          {people.length > 5 && (
            <div
              style={{ marginLeft: -10 }}
              className="w-10 h-10 rounded-full bg-paper-deep border-[1.5px] border-ink flex items-center justify-center ring-2 ring-paper font-display font-bold text-[12px] text-ink"
            >
              +{people.length - 5}
            </div>
          )}
        </div>
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted flex items-center gap-1.5">
          <Users size={11} strokeWidth={2.6} />
          {ways} ways · you and {people.length} {people.length === 1 ? 'mate' : 'mates'}
        </p>
      </motion.div>

      {/* Bill total display */}
      <div className="flex flex-col items-center text-center pt-1 pb-2">
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1">
          Total bill
        </p>
        <div className="flex items-baseline justify-center mb-2 leading-none">
          <span className="font-numeric font-semibold text-[28px] mr-1 self-start mt-3 text-ink-muted">
            $
          </span>
          <motion.span
            key={dollarsDisplay}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.12 }}
            style={{ fontSize: autoShrinkAmountSize(dollarsDisplay, 72) }}
            className="font-numeric font-bold leading-none tracking-[-0.04em] numeric text-ink"
          >
            {dollarsDisplay}
          </motion.span>
          <span className="font-numeric font-semibold text-[24px] ml-1 self-end mb-2 text-ink-muted">
            .{amount.includes('.') ? decPart.padEnd(2, '0').slice(0, 2) : '00'}
          </span>
        </div>
      </div>

      {/* Per-person split — the magic preview */}
      {valid && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-lime border-[2px] border-ink rounded-[16px] px-4 py-3 mb-4 flex items-center justify-between shadow-ink-sm"
        >
          <div>
            <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-ink/65 mb-0.5">
              Each mate pays
            </p>
            <p className="font-numeric font-bold text-[26px] leading-none tracking-[-0.03em] text-ink numeric">
              ${(perPersonCents / 100).toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-ink/65 mb-0.5">
              Your share
            </p>
            <p className="font-numeric font-bold text-[26px] leading-none tracking-[-0.03em] text-ink numeric">
              ${(userOwes / 100).toFixed(2)}
            </p>
          </div>
        </motion.div>
      )}

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

      <button
        disabled={!valid || sending}
        onClick={handleSplit}
        className={`
          w-full py-4 rounded-[14px] border-[2px]
          font-display font-bold text-[16px] tracking-tight
          transition-all duration-100 mb-3
          ${
            valid && !sending
              ? 'bg-lime text-ink border-ink shadow-ink active:translate-y-[3px] active:shadow-none'
              : 'bg-line-soft text-ink-muted border-line opacity-70 cursor-not-allowed'
          }
        `}
      >
        {sending
          ? 'Sending requests…'
          : valid
          ? `Send ${people.length} ${people.length === 1 ? 'request' : 'requests'}`
          : 'Type the total bill'}
      </button>

      <NumericKeypad value={amount} onChange={setAmount} className="mb-2" />
    </Screen>
  )
}
