import { useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import HoldToConfirm from '../components/HoldToConfirm'
import { USERS_BY_HANDLE } from '../lib/mockData'
import { useStore, SortedError } from '../lib/store'
import { haptic } from '../lib/chime'

export default function SendConfirm() {
  const navigate = useNavigate()
  const { handle } = useParams<{ handle: string }>()
  const send = useStore((s) => s.send)

  const pending = JSON.parse(sessionStorage.getItem('pendingSend') || '{}') as {
    handle?: string
    cents?: number
    note?: string
  }
  const recipient = handle ? USERS_BY_HANDLE.get(handle) : undefined
  const cents = pending.cents ?? 0

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cold-load guard: if user lands here without intent (refresh, back-button,
  // share link), bounce them to the start of the send flow rather than
  // showing a raw error message.
  if (!recipient || cents <= 0) {
    return <Navigate to="/send" replace />
  }

  const dollars = Math.floor(cents / 100).toLocaleString('en-AU')
  const centsStr = String(cents % 100).padStart(2, '0')

  async function executeConfirm() {
    if (!recipient) return
    setError(null)
    setSending(true)
    try {
      await send(recipient, cents, pending.note)
      sessionStorage.removeItem('pendingSend')
      navigate(`/send/${recipient.handle}/done`, { replace: true })
    } catch (e) {
      // Buzz on failure so user gets tactile feedback the send didn't go
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

      {/* Recipient + amount */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center pt-2"
      >
        <Avatar user={recipient} size="lg" />
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mt-3">
          Sending to
        </p>
        <p className="font-display font-bold text-[18px] tracking-tight mt-1 text-ink">
          {recipient.firstName} {recipient.lastName}
        </p>
        <p className="font-body text-[13px] text-ink-muted mt-0.5">@{recipient.handle}</p>

        {/* Amount */}
        <div className="flex items-baseline justify-center leading-none mt-6 mb-8">
          <span className="font-numeric font-semibold text-[28px] mr-1 self-start mt-3 text-ink-muted">
            $
          </span>
          <span className="font-numeric font-bold text-[72px] leading-none tracking-[-0.04em] numeric text-ink">
            {dollars}
          </span>
          <span className="font-numeric font-semibold text-[28px] ml-1 self-end mb-2 text-ink-muted">
            .{centsStr}
          </span>
        </div>
      </motion.div>

      {/* Receipt card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
        className="bg-paper-elevated border border-line rounded-[14px] overflow-hidden"
      >
        <ReceiptRow label="Network" value="Solana" />
        <Divider />
        <ReceiptRow label="Network fee" value="$0.0008" />
        <Divider />
        <ReceiptRow label="Arrives" value="Instantly" />
      </motion.div>

      {pending.note && (
        <p className="font-body italic text-[13px] text-ink-muted text-center mt-4">
          &ldquo;{pending.note}&rdquo;
        </p>
      )}

      <div className="flex-1" />

      {/* Hold-to-send button */}
      {/* Error banner — appears when send fails */}
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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
      >
        <HoldToConfirm
          label="Hold to send"
          holdingLabel="Keep holding"
          confirmingLabel="Sending…"
          onConfirm={executeConfirm}
          disabled={sending}
        />
      </motion.div>
      <p className="text-center font-body text-[12px] text-ink-muted mt-3 mb-3">
        Tap and hold to confirm
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
