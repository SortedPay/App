import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import Screen from '../components/Screen'
import Confetti from '../components/Confetti'
import { USERS_BY_HANDLE } from '../lib/mockData'
import { playChime } from '../lib/chime'

type Summary = {
  totalCents: number
  perPersonCents: number
  peopleCount: number
  note?: string
  handles: string[]
}

/**
 * SplitSent — confirmation after firing N requests in one go.
 *
 * Brings chime + confetti because splitting is the "moat moment" — the feature
 * that distinguishes Sorted from generic P2P apps. No haptic on auto-mount
 * (the tap that fired the split already buzzed; firing again here would warn).
 */
export default function SplitSent() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [confettiActive, setConfettiActive] = useState(false)
  // Track whether we attempted to load summary so we can redirect cleanly
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('pendingSplitSummary')
      if (raw) setSummary(JSON.parse(raw) as Summary)
    } catch {
      // ignore
    }
    setLoaded(true)
    const t = setTimeout(() => {
      playChime('success')
      setConfettiActive(true)
    }, 180)
    return () => clearTimeout(t)
  }, [])

  if (loaded && !summary) {
    return <Navigate to="/home" replace />
  }
  if (!summary) return null // brief pre-load flash

  // Look up actual user records so we can show avatars
  const people = summary.handles
    .map((h) => USERS_BY_HANDLE.get(h))
    .filter(Boolean) as { handle: string; firstName: string; initials: string; color: string }[]

  return (
    <Screen transition="modal" className="min-h-screen flex flex-col px-6 pb-6">
      <Confetti active={confettiActive} originY="32%" />

      <div className="flex flex-col items-center text-center pt-16">
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
            <Users size={32} strokeWidth={2.6} className="text-ink" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-display font-bold text-[44px] leading-[0.95] tracking-tightest text-ink mb-2"
        >
          Split.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          className="font-body font-medium text-[15px] leading-[1.45] text-ink-soft max-w-[300px] mb-6"
        >
          ${(summary.totalCents / 100).toFixed(2)} divided{' '}
          <span className="font-semibold text-ink">{summary.peopleCount + 1} ways</span>.
          <br />
          Each mate gets a ${(summary.perPersonCents / 100).toFixed(2)} request.
        </motion.p>

        {/* Per-person card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45 }}
          className="bg-paper-elevated border border-line rounded-[14px] w-full max-w-[340px] mx-auto mb-3 overflow-hidden"
        >
          {people.map((p, i) => (
            <div
              key={p.handle}
              className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? 'border-t border-line' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-[12px] tracking-tight text-ink border-[1.5px] border-ink bg-${p.color}`}
              >
                {p.initials}
              </div>
              <div className="flex-1 text-left">
                <div className="font-display font-bold text-[14px] tracking-tight leading-[1.2]">
                  @{p.handle}
                </div>
                <div className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted leading-[1.3] mt-0.5">
                  Request sent
                </div>
              </div>
              <div className="font-numeric font-bold text-[14px] tracking-tight text-ink numeric">
                ${(summary.perPersonCents / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex-1" />

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
