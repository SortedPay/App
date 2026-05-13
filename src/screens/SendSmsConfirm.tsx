import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Smartphone } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import HoldToConfirm from '../components/HoldToConfirm'

export default function SendSmsConfirm() {
  const navigate = useNavigate()

  const pending = JSON.parse(sessionStorage.getItem('pendingSmsSend') || '{}') as {
    phone?: string
    name?: string
    cents?: number
  }
  const phone = pending.phone ?? ''
  const name = pending.name ?? ''
  const cents = pending.cents ?? 0

  const [sending, setSending] = useState(false)

  if (!phone || cents <= 0) {
    return <Navigate to="/sms" replace />
  }

  const dollars = Math.floor(cents / 100).toLocaleString('en-AU')
  const centsStr = String(cents % 100).padStart(2, '0')
  const formattedPhone = `+61 ${phone.slice(1, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`

  function executeConfirm() {
    setSending(true)
    setTimeout(() => navigate('/sms/pending', { replace: true }), 400)
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
