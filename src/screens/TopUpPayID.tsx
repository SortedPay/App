import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { useStore } from '../lib/store'
import { formatAUD } from '../lib/mockData'

export default function TopUpPayID() {
  const navigate = useNavigate()
  const topUp = useStore((s) => s.topUp)
  const cents = parseInt(sessionStorage.getItem('pendingTopUp') || '0', 10)

  const [copied, setCopied] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(60)
  const tickRef = useRef<number | null>(null)

  // Derive a stable "HANNAH-XXXX" reference per visit (regenerates on remount)
  const reference = useRef(
    `HANNAH-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  )

  const payID = 'topup@sorted.au'

  useEffect(() => {
    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => {
      if (tickRef.current != null) clearInterval(tickRef.current)
    }
  }, [])

  function copy() {
    navigator.clipboard?.writeText(payID)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function simulatePayment() {
    setSimulating(true)
    await topUp(cents)
    sessionStorage.removeItem('pendingTopUp')
    navigate('/home')
  }

  const timerLabel = `0:${String(secondsLeft).padStart(2, '0')}`

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

      {/* Lime PayID card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-lime border-[2px] border-ink rounded-[20px] p-4 mb-3 shadow-ink-md"
      >
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink/65 mb-2">
          Pay-ID
        </p>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono font-semibold text-[18px] text-ink truncate">{payID}</p>
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
        <p className="font-mono font-semibold text-[15px] text-ink">{reference.current}</p>
      </motion.div>

      {/* Butter waiting pill */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
        className="bg-butter border border-ink/20 rounded-full px-4 py-2.5 mb-3 flex items-center justify-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
        <span className="font-mono font-semibold text-[11px] uppercase tracking-[0.16em] text-ink">
          Waiting for your bank · {timerLabel}
        </span>
      </motion.div>

      <div className="flex-1" />

      {/* Simulate (secondary / paper) */}
      <button
        onClick={simulatePayment}
        disabled={simulating}
        className="w-full py-4 rounded-[14px] bg-paper-elevated border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-70 mb-3"
      >
        {simulating ? 'Detecting payment…' : 'Simulate bank payment'}
      </button>
    </Screen>
  )
}
