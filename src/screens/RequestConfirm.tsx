import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Send } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { USERS_BY_HANDLE } from '../lib/mockData'
import { useStore, SortedError } from '../lib/store'
import { playChime, haptic } from '../lib/chime'

/**
 * RequestConfirm — single-tap "Send request" (no hold-to-send).
 *
 * Requests are intentionally lower-friction than sends. Sending money requires
 * the hold gesture because it's irreversible value movement. Asking for money
 * doesn't move money, so a tap is enough.
 */
export default function RequestConfirm() {
  const navigate = useNavigate()
  const { handle } = useParams<{ handle: string }>()
  const requestMoney = useStore((s) => s.requestMoney)

  const pending = JSON.parse(sessionStorage.getItem('pendingRequest') || '{}') as {
    handle?: string
    cents?: number
    note?: string
  }
  const recipient = handle ? USERS_BY_HANDLE.get(handle) : undefined
  const cents = pending.cents ?? 0

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!recipient || cents <= 0) {
    return (
      <Screen className="px-6 pt-2">
        <Header title="INVALID" />
        <p className="text-ink-muted mt-4">Missing request details.</p>
      </Screen>
    )
  }

  const dollars = Math.floor(cents / 100).toLocaleString('en-AU')
  const centsStr = String(cents % 100).padStart(2, '0')

  async function executeConfirm() {
    if (!recipient) return
    setError(null)
    setSending(true)
    try {
      await requestMoney(recipient, cents, pending.note)
      sessionStorage.removeItem('pendingRequest')
      // Light chime — request sent is a smaller win than send-confirmed
      playChime('accent')
      haptic(15)
      navigate(`/request/${recipient.handle}/sent`, { replace: true })
    } catch (e) {
      haptic(40)
      if (e instanceof SortedError) {
        setError(e.message)
      } else {
        setError('Something went wrong. Give it another go.')
      }
      setSending(false)
    }
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="CONFIRM" />

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

      <div className="flex items-baseline justify-center mb-5 leading-none">
        <span className="font-numeric font-semibold text-[28px] mr-1 self-start mt-3 text-ink-muted">
          $
        </span>
        <span className="font-numeric font-bold text-[80px] leading-none tracking-[-0.04em] numeric text-ink">
          {dollars}
        </span>
        <span className="font-numeric font-semibold text-[28px] ml-1 self-end mb-2 text-ink-muted">
          .{centsStr}
        </span>
      </div>

      {/* Receipt-style details */}
      <div className="bg-paper-elevated rounded-[16px] border border-line">
        <ReceiptRow label="To" value={`@${recipient.handle}`} />
        <Divider />
        <ReceiptRow label="They'll see" value="Notification + in-app banner" />
        <Divider />
        <ReceiptRow label="Expires" value="In 7 days" />
      </div>

      {pending.note && (
        <p className="font-body italic text-[13px] text-ink-soft text-center mt-3">
          &ldquo;{pending.note}&rdquo;
        </p>
      )}

      <div className="flex-1" />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mb-3 bg-coral-soft border border-coral rounded-[12px] px-3.5 py-2.5 flex items-start gap-2"
          >
            <AlertTriangle size={14} strokeWidth={2.4} className="text-coral mt-[2px] shrink-0" />
            <p className="font-body text-[13px] leading-[1.4] text-ink flex-1">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
        onClick={executeConfirm}
        disabled={sending}
        className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        <Send size={16} strokeWidth={2.6} />
        {sending ? 'Sending…' : 'Send request'}
      </motion.button>
      <p className="text-center font-body text-[12px] text-ink-muted mt-3 mb-3">
        Free to send. They have 7 days to pay.
      </p>
    </Screen>
  )
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="font-body text-[14px] text-ink-soft">{label}</span>
      <span className="font-body font-semibold text-[14px] text-ink">{value}</span>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-line mx-4" />
}
