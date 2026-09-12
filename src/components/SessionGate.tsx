import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { WifiOff } from 'lucide-react'
import { useStore } from '../lib/store'

/**
 * Wraps every screen that needs an account. While the app is still asking the
 * API who we are it shows the mark; signed-out users go to Welcome; an API
 * that cannot be reached says so with a retry, rather than rendering empty
 * balances as if they were real.
 */
export default function SessionGate({ children }: { children: ReactNode }) {
  const status = useStore((s) => s.session.status)
  const error = useStore((s) => s.session.error)
  const hydratedAt = useStore((s) => s.hydratedAt)
  const boot = useStore((s) => s.boot)
  const location = useLocation()

  if (status === 'booting') return <Holding />
  if (status === 'signed_out') return <Navigate to="/welcome" replace state={{ from: location.pathname }} />
  if (status === 'unreachable' && !hydratedAt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-paper-elevated border-[2px] border-ink shadow-ink-sm flex items-center justify-center mb-5">
          <WifiOff size={24} strokeWidth={2.4} className="text-ink" />
        </div>
        <h1 className="font-display font-bold text-[26px] leading-[1.05] tracking-tightest text-ink mb-2">Can&apos;t reach Sorted.</h1>
        <p className="font-body text-[14px] leading-[1.45] text-ink-soft max-w-[300px] mb-6">{error ?? 'Check your connection and try again.'}</p>
        <button
          onClick={() => void boot()}
          className="px-6 py-3 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[15px] text-ink active:translate-y-[2px] active:shadow-none transition-all"
        >
          Try again
        </button>
      </div>
    )
  }
  return <>{children}</>
}

function Holding() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.p
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="font-display font-bold text-[28px] tracking-tightest text-ink"
      >
        Sorted.
      </motion.p>
    </div>
  )
}
