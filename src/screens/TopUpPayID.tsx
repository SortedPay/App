import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, AlertTriangle } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { useStore, SortedError } from '../lib/store'
import { formatAUD } from '../lib/mockData'
import { haptic } from '../lib/chime'

// Convert stages mimic the v0.3 architecture:
//   1. Bank payment arrives via PayID (Monoova/Zai virtual account webhook)
//   2. Sorted buys AUDD on secondary market via market maker (~30-60s, 0.1-0.3% spread)
//   3. AUDD is transferred to user's Privy-managed Solana wallet (1-2s)
type Stage = 'waiting' | 'received' | 'converting' | 'done'

const STAGE_DURATIONS: Record<Exclude<Stage, 'waiting' | 'done'>, number> = {
  received: 1000, // "Bank payment received" — confirms the AUD landed
  converting: 3000, // "Converting AUD to AUDD" — the secondary-market step
}

export default function TopUpPayID() {
  const navigate = useNavigate()
  const topUp = useStore((s) => s.topUp)
  const user = useStore((s) => s.user)
  const cents = parseInt(sessionStorage.getItem('pendingTopUp') || '0', 10)

  const [copied, setCopied] = useState(false)
  const [stage, setStage] = useState<Stage>('waiting')
  const [error, setError] = useState<string | null>(null)

  // Per-session unique PayID + reference — matches the Monoova/Zai virtual-account model
  // where each user gets a distinct PayID that routes to them automatically.
  const reference = useMemo(
    () => `${user.handle.toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    [user.handle]
  )
  const payID = useMemo(
    () => `topup+${user.handle}-${reference.split('-')[1].toLowerCase()}@sorted.au`,
    [user.handle, reference]
  )

  const timerRef = useRef<number | null>(null)

  // Clean up any running timer on unmount
  useEffect(
    () => () => {
      if (timerRef.current != null) clearTimeout(timerRef.current)
    },
    []
  )

  function copy() {
    navigator.clipboard?.writeText(payID)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function simulatePayment() {
    if (stage !== 'waiting') return

    // Stage 1: bank payment received
    setStage('received')
    timerRef.current = window.setTimeout(() => {
      // Stage 2: converting AUD → AUDD on Solana
      setStage('converting')
      timerRef.current = window.setTimeout(async () => {
        // Stage 3: actually credit the balance, then navigate home
        try {
          await topUp(cents)
          sessionStorage.removeItem('pendingTopUp')
          setStage('done')
          timerRef.current = window.setTimeout(() => navigate('/home'), 500)
        } catch (e) {
          haptic(40)
          if (e instanceof SortedError) {
            setError(e.message)
          } else {
            setError('Top up failed. Give it another go.')
          }
          setStage('waiting')
        }
      }, STAGE_DURATIONS.converting)
    }, STAGE_DURATIONS.received)
  }

  // Pill content varies by stage
  const pill = (() => {
    switch (stage) {
      case 'waiting':
        return {
          bg: 'bg-butter border border-ink/20',
          text: 'Waiting for your bank · usually 1-3 min',
          dot: 'bg-ink animate-pulse',
        }
      case 'received':
        return {
          bg: 'bg-sky-soft border border-sky',
          text: 'Bank payment received',
          dot: 'bg-sky',
        }
      case 'converting':
        return {
          bg: 'bg-sky-soft border border-sky',
          text: 'Converting AUD to AUDD on Solana',
          dot: 'bg-sky animate-pulse',
        }
      case 'done':
        return {
          bg: 'bg-lime-soft border border-lime-deep',
          text: 'Done — balance updated',
          dot: 'bg-lime-deep',
        }
    }
  })()

  const buttonLabel = (() => {
    switch (stage) {
      case 'waiting':
        return 'Simulate bank payment'
      case 'received':
        return 'Confirming payment…'
      case 'converting':
        return 'Converting to AUDD…'
      case 'done':
        return 'Done!'
    }
  })()

  const isProcessing = stage === 'received' || stage === 'converting'

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="PAY-ID" />

      <div className="pt-2 pb-5">
        <h1 className="font-display font-bold text-[32px] leading-[1.05] tracking-tightest text-ink mb-2">
          Send {formatAUD(cents)} from your bank.
        </h1>
        <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft">
          Open your banking app and pay this PayID. Auto-detected when it lands.
        </p>
      </div>

      {/* Lime PayID card with DEMO badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative bg-lime border-[2px] border-ink rounded-[20px] p-4 mb-3 shadow-ink-md"
      >
        {/* DEMO badge — small coral pill so testers know this isn't real */}
        <div className="absolute -top-2 -right-2 bg-coral border border-ink rounded-full px-2 py-0.5 font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-paper">
          Demo
        </div>

        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink/65 mb-2">
          Pay-ID
        </p>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono font-semibold text-[14px] text-ink truncate">{payID}</p>
          <button
            onClick={copy}
            className="bg-paper-elevated border border-ink text-ink font-display font-bold text-[12px] rounded-full px-3 py-1 flex items-center gap-1 active:translate-y-[1px] transition-transform flex-shrink-0"
          >
            {copied ? (
              <>
                <Check size={12} strokeWidth={2.5} />
                Copied
              </>
            ) : (
              <>
                <Copy size={12} strokeWidth={2.5} />
                Copy
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Reference card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45 }}
        className="bg-paper-elevated border border-line rounded-[14px] p-4 mb-4"
      >
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1">
          Reference
        </p>
        <p className="font-mono font-semibold text-[15px] text-ink">{reference}</p>
      </motion.div>

      {/* Status pill — animates between stages */}
      <div className="mb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className={`${pill.bg} rounded-full px-4 py-2.5 flex items-center justify-center gap-2`}
          >
            <span className={`w-2 h-2 rounded-full ${pill.dot}`} />
            <span className="font-mono font-semibold text-[11px] uppercase tracking-[0.16em] text-ink">
              {pill.text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-1" />

      {/* Error banner — appears if topUp fails */}
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

      {/* Simulate (secondary / paper) */}
      <button
        onClick={simulatePayment}
        disabled={stage !== 'waiting'}
        className="w-full py-4 rounded-[14px] bg-paper-elevated border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-70 mb-2"
      >
        {isProcessing ? (
          <motion.span animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 1.2, repeat: Infinity }}>
            {buttonLabel}
          </motion.span>
        ) : (
          buttonLabel
        )}
      </button>

      <p className="text-center font-body text-[11px] text-ink-muted mb-3 max-w-[34ch] mx-auto leading-[1.4]">
        v0.2 demo. In the real app, the PayID is auto-detected from your bank — no buttons.
      </p>
    </Screen>
  )
}
