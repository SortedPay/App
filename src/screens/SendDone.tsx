import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Share2, Home as HomeIcon } from 'lucide-react'
import Screen from '../components/Screen'
import { USERS_BY_HANDLE, formatAUD } from '../lib/mockData'
import { useStore } from '../lib/store'

export default function SendDone() {
  const navigate = useNavigate()
  const { handle } = useParams<{ handle: string }>()
  const recipient = handle ? USERS_BY_HANDLE.get(handle) : undefined
  const transactions = useStore((s) => s.transactions)
  const lastTx = transactions[0]
  const amountAUD = lastTx ? formatAUD(Math.abs(lastTx.amountCents)) : '$0.00'

  return (
    <Screen transition="modal" className="pt-2 min-h-screen flex flex-col">
      {/* Hero — celebratory mark + headline */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: -3 }}
          transition={{ type: 'spring', stiffness: 250, damping: 18 }}
          className="w-24 h-24 bg-lime border-[3px] border-ink rounded-full shadow-ink-md flex items-center justify-center mb-8"
        >
          <Check size={44} strokeWidth={4} className="text-ink" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-display font-bold text-[44px] leading-none tracking-tightest text-ink mb-3"
        >
          You&apos;re sorted!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-ink-soft text-[16px] leading-[1.4] max-w-[26ch]"
        >
          <strong className="text-ink">{amountAUD}</strong> just landed with{' '}
          <strong className="text-ink">@{recipient?.handle}</strong>.
          <br />
          Settled in 1.2 seconds.
        </motion.p>
      </div>

      {/* Receipt card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        className="mx-4 bg-paper-elevated border border-line rounded-[18px] px-4 py-3.5 mb-4"
      >
        <ReceiptRow label="Network" value="Solana" />
        <div className="h-px bg-line my-2.5" />
        <ReceiptRow label="Network fee" value="$0.0008" />
        <div className="h-px bg-line my-2.5" />
        <ReceiptRow
          label="Reference"
          value={lastTx?.reference ?? '—'}
          mono
        />
      </motion.div>

      {/* Dual CTAs — matches Hold to confirm style */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.4 }}
        className="px-4 pb-6 flex gap-2"
      >
        <button
          className="flex-1 bg-paper-elevated text-ink border-[2.5px] border-ink rounded-[18px] py-4 flex items-center justify-center gap-1.5 font-display font-bold text-[14px] tracking-tight shadow-ink-md active:translate-y-[2px] active:shadow-ink-sm transition-all"
        >
          <Share2 size={14} strokeWidth={2.4} />
          Share receipt
        </button>
        <button
          onClick={() => navigate('/home')}
          className="flex-1 bg-lime text-ink border-[2.5px] border-ink rounded-[18px] py-4 flex items-center justify-center gap-1.5 font-display font-bold text-[14px] tracking-tight shadow-ink-md active:translate-y-[2px] active:shadow-ink-sm transition-all"
        >
          <HomeIcon size={14} strokeWidth={2.4} />
          Done
        </button>
      </motion.div>
    </Screen>
  )
}

function ReceiptRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </span>
      <span
        className={
          mono
            ? 'font-mono font-semibold text-[11px] tracking-[0.06em] text-ink'
            : 'font-display font-bold text-[14px] tracking-tight text-ink'
        }
      >
        {value}
      </span>
    </div>
  )
}
