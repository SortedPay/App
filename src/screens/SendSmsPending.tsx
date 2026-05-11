import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/Screen'
import { formatAUD } from '../lib/mockData'

export default function SendSmsPending() {
  const navigate = useNavigate()

  const pending = JSON.parse(sessionStorage.getItem('pendingSmsSend') || '{}') as {
    phone?: string
    name?: string
    cents?: number
  }
  const name = pending.name || 'them'
  const cents = pending.cents ?? 0
  const amountAUD = formatAUD(cents)

  // Auto-advance to All Sorted after 2.5s (claim simulated)
  useEffect(() => {
    const id = setTimeout(() => navigate('/sms/done', { replace: true }), 2500)
    return () => clearTimeout(id)
  }, [navigate])

  // Stable claim code per session
  const claimCode = '9F2X'

  return (
    <Screen transition="modal" className="min-h-screen flex flex-col px-6 pb-6">
      <div className="flex flex-col items-center text-center pt-16">
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 16 }}
          className="w-16 h-16 bg-butter border-[2px] border-ink rounded-full flex items-center justify-center mb-5 text-[28px]"
        >
          {/* Airplane emoji for v0.2 — replaces lucide-icon since Figma shows actual plane glyph */}
          <span style={{ filter: 'grayscale(0.1)' }}>✈️</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="font-display font-bold text-[40px] leading-none tracking-tightest text-ink mb-3"
        >
          On the way.
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

      {/* TEXT WE SENT card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="bg-paper-elevated border border-line rounded-[14px] overflow-hidden mb-4"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            Text we sent
          </span>
          <span className="inline-flex items-center gap-1.5 bg-butter rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-ink" />
            <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink">
              Pending
            </span>
          </span>
        </div>
        <div className="px-4 py-3 bg-paper-deep">
          <p className="font-body text-[13px] leading-[1.45] text-ink-soft">
            Hannah sent you {amountAUD} on Sorted. Tap to claim → sorted.au/c/{claimCode}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.45 }}
        className="grid grid-cols-2 gap-2 mb-3"
      >
        <button className="py-3.5 rounded-[14px] bg-paper-elevated border-[2px] border-ink shadow-ink font-display font-bold text-[15px] text-ink active:translate-y-[3px] active:shadow-none transition-all">
          Undo
        </button>
        <button
          onClick={() => navigate('/home', { replace: true })}
          className="py-3.5 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[15px] text-ink active:translate-y-[3px] active:shadow-none transition-all"
        >
          Done
        </button>
      </motion.div>

      <p className="text-center font-body text-[12px] text-ink-muted">
        We&apos;ll text you when {name} claims it · or undo for 24h
      </p>
    </Screen>
  )
}
