import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import Screen from '../components/Screen'
import Confetti from '../components/Confetti'
import { USERS_BY_HANDLE } from '../lib/mockData'
import { useStore } from '../lib/store'

/**
 * RequestSent — confirmation that the request was fired.
 *
 * No chime (already played on RequestConfirm), but a soft visual celebration.
 * Lower-key than SendDone since no money actually moved.
 */
export default function RequestSent() {
  const navigate = useNavigate()
  const { handle } = useParams<{ handle: string }>()
  const recipient = handle ? USERS_BY_HANDLE.get(handle) : undefined
  const requests = useStore((s) => s.requests)
  const lastReq = requests.find((r) => r.direction === 'sent' && r.counterparty.handle === handle)

  const [confettiActive, setConfettiActive] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setConfettiActive(true), 150)
    return () => clearTimeout(t)
  }, [])

  const amount = lastReq ? (lastReq.amountCents / 100).toFixed(2) : '0.00'

  return (
    <Screen transition="modal" className="min-h-screen flex flex-col px-6 pb-6">
      <Confetti active={confettiActive} originY="32%" />

      <div className="flex flex-col items-center text-center pt-20">
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -15 }}
          animate={{ scale: [0, 1.12, 1], opacity: 1, rotate: 0 }}
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
            <Send size={32} strokeWidth={2.8} className="text-ink" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-display font-bold text-[44px] leading-[0.95] tracking-tightest text-ink mb-3"
        >
          Sent.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          className="font-body font-medium text-[15px] leading-[1.45] text-ink-soft max-w-[290px]"
        >
          ${amount} request sent to{' '}
          <span className="font-semibold text-ink">@{recipient?.handle}</span>.
          <br />
          They&apos;ll get a notification.
        </motion.p>
      </div>

      <div className="flex-1" />

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        onClick={() => navigate('/home', { replace: true })}
        className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all"
      >
        Done
      </motion.button>
    </Screen>
  )
}
