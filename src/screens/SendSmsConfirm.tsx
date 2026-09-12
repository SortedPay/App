import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Smartphone } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import HoldToConfirm from '../components/HoldToConfirm'
import { useStore, SortedError } from '../lib/store'
import { readIntent } from '../lib/intent'
import { haptic } from '../lib/chime'

export default function SendSmsConfirm() {
  const navigate = useNavigate()
  const sendViaSms = useStore((s) => s.sendViaSms)

  const [pending] = useState(() => readIntent<{ phone?: string; name?: string; cents?: number }>('pendingSmsSend'))
  const phone = pending.phone ?? ''
  const name = pending.name ?? ''
  const cents = pending.cents ?? 0

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!phone || cents <= 0) {
    return <Navigate to="/sms" replace />
  }

  const dollars = Math.floor(cents / 100).toLocaleString('en-AU')
  const centsStr = String(cents % 100).padStart(2, '0')
  const formattedPhone = `+61 ${phone.slice(1, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`

  async function executeConfirm() {
    setError(null)
    setSending(true)
    try {
      // Money moves into escrow now; the recipient claims with the code we text them.
      const { claim, transaction } = await sendViaSms({ phone, name: name || undefined, amountCents: cents })
      sessionStorage.setItem(
        'pendingSmsSend',
        JSON.stringify({ phone, name, cents, claimId: claim.id, code: claim.code, transactionId: transaction.id, undoUntil: claim.undoUntil }),
      )
      navigate('/sms/pending', { replace: true })
    } catch (e) {
      haptic(40)
      setError(e instanceof SortedError ? e.message : 'Something went wrong. Give it another go.')
      setSending(false)
    }
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="CONFIRM" />

      {/* Recipient — phone in dashed lime ring */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center pt-2"
      >
        <div className="w-14 h-14 rounded-full border-[2px] border-dashed border-lime-deep flex items-center justify-center bg-paper-elevated">
          <Smartphone size={22} strokeWidth={2.2} className="text-ink" />
        </div>
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mt-3">
          Sending via SMS to
        </p>
        <p className="font-display font-bold text-[18px] tracking-tight mt-1 text-ink">
          {name || 'New contact'}
        </p>
        <p className="font-body text-[13px] text-ink-muted mt-0.5">{formattedPhone}</p>

        {/* Amount */}
        <div className="flex items-baseline justify-center leading-none mt-6 mb-6">
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

      {/* PEACE OF MIND — sky card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
        className="bg-sky-soft border border-sky rounded-[14px] p-4 mb-4"
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky" />
          <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink">
            Peace of mind
          </span>
        </div>
        <p className="font-body text-[13px] leading-[1.45] text-ink-soft">
          You can undo this anytime in the first 24 hours. We&apos;ll remind both of you after 12h if it&apos;s still unclaimed.
        </p>
      </motion.div>

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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
      >
        <HoldToConfirm
          label="Hold to send via SMS"
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
