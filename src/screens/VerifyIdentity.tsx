import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Loader2, Check, Plus } from 'lucide-react'
import Screen from '../components/Screen'

type Step = {
  id: string
  label: string
  detail: string
}

const STEPS: Step[] = [
  { id: 'identity', label: 'Verifying identity', detail: 'Cross-checking with FrankieOne' },
  { id: 'documents', label: 'Reading your details', detail: 'Encrypted, never stored' },
  { id: 'wallet', label: 'Provisioning your wallet', detail: 'Solana mainnet · TEE-secured via Privy' },
  { id: 'finalising', label: 'Finalising', detail: 'Almost there' },
]

export default function VerifyIdentity() {
  const navigate = useNavigate()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [completedIds, setCompletedIds] = useState<string[]>([])

  useEffect(() => {
    const timings = [800, 900, 1000, 800]
    let cancelled = false

    async function run() {
      for (let i = 0; i < STEPS.length; i++) {
        if (cancelled) return
        setCurrentIdx(i)
        await new Promise((r) => setTimeout(r, timings[i]))
        if (cancelled) return
        setCompletedIds((prev) => [...prev, STEPS[i].id])
      }
      await new Promise((r) => setTimeout(r, 500))
      if (!cancelled) navigate('/ready')
    }
    run()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <Screen transition="fade" className="min-h-screen flex flex-col px-6">
      {/* Centered hero */}
      <div className="flex flex-col items-center text-center pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-20 h-20 bg-sky border-[2.5px] border-ink rounded-[24px] shadow-ink-md flex items-center justify-center mb-6"
        >
          <Plus size={30} strokeWidth={3} className="text-ink" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55 }}
          className="font-display font-bold text-[34px] leading-[1] tracking-tightest text-ink mb-3"
        >
          Verifying your details.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft max-w-[300px]"
        >
          Australian regulation, sorted in seconds.
          <br />
          Powered by FrankieOne &amp; Privy.
        </motion.p>
      </div>

      {/* Step pills */}
      <div className="space-y-2 flex-1">
        {STEPS.map((step, idx) => {
          const isCompleted = completedIds.includes(step.id)
          const isActive = currentIdx === idx && !isCompleted
          const isPending = idx > currentIdx

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.06 }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-[14px]
                border transition-all duration-300
                ${
                  isCompleted
                    ? 'border-lime-deep bg-lime-soft'
                    : isActive
                    ? 'border-ink bg-paper-elevated'
                    : 'border-line bg-paper-elevated/50'
                }
              `}
            >
              {/* Status dot */}
              <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className="w-6 h-6 bg-lime-deep rounded-full flex items-center justify-center"
                    >
                      <Check size={14} strokeWidth={3} className="text-ink" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Loader2 size={18} className="animate-spin text-ink" strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-5 h-5 rounded-full bg-line"
                    />
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`font-display font-bold text-[14px] tracking-tight leading-[1.2] ${
                    isPending ? 'text-ink-faint' : 'text-ink'
                  }`}
                >
                  {step.label}
                </div>
                <div
                  className={`text-[11px] mt-0.5 leading-[1.3] ${
                    isPending ? 'text-ink-faint' : 'text-ink-muted'
                  }`}
                >
                  {step.detail}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Trust footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="py-6 flex items-center justify-center gap-1.5 text-ink-muted"
      >
        <ShieldCheck size={11} strokeWidth={2.4} />
        <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em]">
          256-bit encrypted · AUSTRAC compliant
        </span>
      </motion.div>
    </Screen>
  )
}
