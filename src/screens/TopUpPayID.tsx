import { useState } from 'react'
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
  const [simulated, setSimulated] = useState(false)

  const payID = 'topup@sortedaud.app'

  function copy() {
    navigator.clipboard?.writeText(payID)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function simulatePayment() {
    setSimulated(true)
    await topUp(cents)
    sessionStorage.removeItem('pendingTopUp')
    navigate('/home')
  }

  return (
    <Screen transition="slide" className="pt-2 min-h-screen flex flex-col">
      <Header title="Top up" />

      <div className="pt-4 pb-6">
        <h1 className="font-display font-bold text-[32px] leading-[0.95] tracking-tightest mb-3">
          Send <span className="hl">{formatAUD(cents)}</span><br />
          from your bank.
        </h1>
        <p className="text-ink-soft text-[15px] max-w-[30ch]">
          Use the PayID below in your banking app. Money lands in seconds.
        </p>
      </div>

      <div className="bg-sky border-[2.5px] border-ink rounded-[28px] p-5 mb-4 shadow-ink-md">
        <p className="label-mono mb-2">PayID (email)</p>
        <p className="font-mono font-semibold text-[19px] text-ink mb-4 break-all">{payID}</p>
        <button
          onClick={copy}
          className="bg-ink text-paper font-display font-bold text-[13px] rounded-xl px-4 py-2 flex items-center gap-2 active:scale-95 transition-transform"
        >
          {copied ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} strokeWidth={2.5} />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="bg-paper-elevated border-2 border-ink rounded-2xl p-4 mb-6">
        <p className="label-mono mb-1.5">Reference</p>
        <p className="font-mono font-semibold text-[15px] text-ink">@hannah-{Date.now().toString(36).slice(-4)}</p>
      </div>

      {/* Demo simulation button */}
      <button
        onClick={simulatePayment}
        disabled={simulated}
        className="btn btn-primary btn-lg btn-block mt-auto"
      >
        {simulated ? (
          <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }}>
            Detecting payment…
          </motion.span>
        ) : (
          'Simulate bank payment'
        )}
      </button>
      <p className="text-[11px] text-ink-muted text-center mt-3 font-mono uppercase tracking-widest">
        Demo · real PayID requires bank
      </p>
    </Screen>
  )
}
