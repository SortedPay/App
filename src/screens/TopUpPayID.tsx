import { useEffect, useRef, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, AlertTriangle } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { useStore, SortedError } from '../lib/store'
import { formatAUD } from '../lib/model'
import type { TopupIntent } from '../lib/api/types'
import { haptic } from '../lib/chime'

// The intent's status, straight from the API:
//   waiting    — a PayID is provisioned for this top-up; the bank payment hasn't landed
//   received   — the AUD arrived in Sorted's account (bank webhook, or the demo button)
//   converting — AUDD is on its way from the treasury to the user's wallet
//   done       — the ledger credited the balance with the on-chain signature
type Stage = TopupIntent['status']

const POLL_MS = 3000

export default function TopUpPayID() {
  const navigate = useNavigate()
  const topUp = useStore((s) => s.topUp)
  const refreshTopUp = useStore((s) => s.refreshTopUp)
  const simulateBankPayment = useStore((s) => s.simulateBankPayment)
  const simulation = useStore((s) => s.config?.simulation ?? false)
  const [cents] = useState(() => parseInt(sessionStorage.getItem('pendingTopUp') || '0', 10))

  const [copied, setCopied] = useState(false)
  const [intent, setIntent] = useState<TopupIntent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const stage: Stage = intent?.status ?? 'waiting'

  // Provision the PayID once. Each top-up gets its own virtual PayID so the
  // bank payment routes to this intent without the user typing a reference.
  const createdRef = useRef(false)
  useEffect(() => {
    if (cents <= 0 || createdRef.current) return
    createdRef.current = true
    topUp(cents)
      .then(setIntent)
      .catch((e: unknown) => {
        haptic(40)
        setError(e instanceof SortedError ? e.message : 'Top up failed. Give it another go.')
      })
  }, [cents, topUp])

  // Poll until the money lands, then head home. The bank webhook (or the demo
  // button) moves the intent along on the API side; the app only watches.
  useEffect(() => {
    if (!intent || intent.status === 'done' || intent.status === 'failed') return
    const id = window.setInterval(() => {
      refreshTopUp(intent.id).then(setIntent).catch(() => {})
    }, POLL_MS)
    return () => clearInterval(id)
  }, [intent, refreshTopUp])

  useEffect(() => {
    if (stage !== 'done') return
    sessionStorage.removeItem('pendingTopUp')
    const id = window.setTimeout(() => navigate('/home'), 800)
    return () => clearTimeout(id)
  }, [stage, navigate])

  const payID = intent?.payidAddress ?? '…'
  const reference = intent?.payidReference ?? '…'

  function copy() {
    if (!intent) return
    navigator.clipboard?.writeText(intent.payidAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function simulatePayment() {
    if (!intent || stage !== 'waiting') return
    setError(null)
    try {
      setIntent(await simulateBankPayment(intent.id))
    } catch (e) {
      haptic(40)
      setError(e instanceof SortedError ? e.message : 'Top up failed. Give it another go.')
    }
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
          text: 'Sending AUDD to your wallet',
          dot: 'bg-sky animate-pulse',
        }
      case 'done':
        return {
          bg: 'bg-lime-soft border border-lime-deep',
          text: 'Done — balance updated',
          dot: 'bg-lime-deep',
        }
      case 'failed':
        return {
          bg: 'bg-coral-soft border border-coral',
          text: "Something went wrong — we're on it",
          dot: 'bg-coral',
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
        return 'Sending AUDD…'
      case 'done':
        return 'Done!'
      case 'failed':
        return 'Failed'
    }
  })()

  const isProcessing = stage === 'received' || stage === 'converting'

  // Cold-load guard: if no amount was set on TopUp, bounce to amount selection
  if (cents <= 0) {
    return <Navigate to="/topup" replace />
  }

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
        {/* DEMO badge — only while the API runs its mock PayID rail */}
        {simulation && (
          <div className="absolute -top-2 -right-2 bg-coral border border-ink rounded-full px-2 py-0.5 font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-paper">
            Demo
          </div>
        )}

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

      {simulation ? (
        <>
          {/* Simulate (secondary / paper) — stands in for the bank webhook */}
          <button
            onClick={simulatePayment}
            disabled={!intent || stage !== 'waiting'}
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
            Demo only. With a real bank rail the PayID is auto-detected — no buttons.
          </p>
        </>
      ) : (
        <>
          <button
            onClick={() => navigate('/home')}
            className="w-full py-4 rounded-[14px] bg-paper-elevated border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all mb-2"
          >
            I&apos;ll pay it from my bank
          </button>
          <p className="text-center font-body text-[11px] text-ink-muted mb-3 max-w-[34ch] mx-auto leading-[1.4]">
            This PayID stays open. Your balance updates the moment the payment lands.
          </p>
        </>
      )}
    </Screen>
  )
}
