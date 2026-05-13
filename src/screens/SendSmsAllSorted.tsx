import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Screen from '../components/Screen'
import Confetti from '../components/Confetti'
import { formatAUD } from '../lib/mockData'
import { useStore } from '../lib/store'
import { celebrate } from '../lib/chime'

export default function SendSmsAllSorted() {
  const navigate = useNavigate()
  const send = useStore((s) => s.send)

  const pending = JSON.parse(sessionStorage.getItem('pendingSmsSend') || '{}') as {
    phone?: string
    name?: string
    cents?: number
  }
  const name = pending.name || 'them'
  const cents = pending.cents ?? 0
  const amountAUD = formatAUD(cents)

  // Fire the celebrate moment on mount
  const [confettiActive, setConfettiActive] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => {
      celebrate()
      setConfettiActive(true)
    }, 180)
    return () => clearTimeout(t)
  }, [])

  // On mount, record the send in the store (mocked — treats SMS recipient as an ad-hoc user)
  useEffect(() => {
    if (cents <= 0) return
    const recipient = {
      id: `sms_${pending.phone}`,
      handle: pending.phone ?? 'sms',
      firstName: name,
      lastName: '',
      initials: name.slice(0, 2).toUpperCase(),
      color: 'butter' as const,
      verified: false,
    }
    send(recipient, cents, 'via SMS').catch(() => {})
    sessionStorage.removeItem('pendingSmsSend')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Screen transition="modal" className="min-h-screen flex flex-col px-6 pb-6">
      <Confetti active={confettiActive} originY="32%" />
      <div className="flex flex-col items-center text-center pt-20">
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -15 }}
          animate={{ scale: [0, 1.15, 1], opacity: 1, rotate: 0 }}
          transition={{
            scale: { duration: 0.55, times: [0, 0.6, 1], ease: [0.34, 1.56, 0.64, 1] },
            rotate: { type: 'spring', stiffness: 280, damping: 14 },
            opacity: { duration: 0.2 },
          }}
          className="w-20 h-20 bg-lime border-[2.5px] border-ink rounded-full shadow-ink-md flex items-center justify-center mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 380, damping: 16 }}
          >
            <Check size={36} strokeWidth={3} className="text-ink" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="font-display font-bold text-[44px] leading-none tracking-tightest text-ink mb-3"
        >
          All sorted.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="font-body text-[16px] text-ink-soft"
        >
          <span className="font-bold text-ink">{amountAUD}</span>{' '}
          <span className="text-ink-muted">to</span>{' '}
          <span className="text-ink-muted">{name}</span>
        </motion.p>
      </div>

      <div className="flex-1" />

      {/* Receipt card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-paper-elevated border border-line rounded-[14px] overflow-hidden mb-4"
      >
        <ReceiptRow
          label="Status"
          value={
            <span className="inline-flex items-center gap-1.5 bg-lime-soft border border-lime-deep rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-deep" />
              <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink">
                Confirmed
              </span>
            </span>
          }
        />
        <Divider />
        <ReceiptRow label="Network" value={<span className="font-body font-semibold text-[14px] text-ink">Solana</span>} />
        <Divider />
        <ReceiptRow label="Network fee" value={<span className="font-body font-semibold text-[14px] text-ink">$0.0008</span>} />
        <Divider />
        <ReceiptRow label="Settled in" value={<span className="font-body font-semibold text-[14px] text-ink">2.1s</span>} />
        <Divider />
        <ReceiptRow label="Tx ID" value={<span className="font-mono text-[13px] text-ink">5KJp…9zQ2</span>} />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        onClick={() => navigate('/home', { replace: true })}
        className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all"
      >
        Done
      </motion.button>
    </Screen>
  )
}

function ReceiptRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="font-body text-[14px] text-ink-soft">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-line mx-4" />
}
