import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'

export default function Splash() {
  const navigate = useNavigate()

  const status = useStore((s) => s.session.status)
  const [minDone, setMinDone] = useState(false)

  // Hold the mark for a beat, then go wherever the session says: straight
  // home for a returning user, onboarding otherwise. While the API is still
  // being asked we wait rather than guess.
  useEffect(() => {
    const id = setTimeout(() => setMinDone(true), 1500)
    return () => clearTimeout(id)
  }, [])
  useEffect(() => {
    if (!minDone || status === 'booting') return
    navigate(status === 'signed_in' ? '/home' : '/welcome', { replace: true })
  }, [minDone, status, navigate])

  return (
    <div className="fixed inset-0 bg-lime flex flex-col items-center justify-center">
      <div className="-mt-12 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, mass: 0.9 }}
          className="font-display font-bold text-[64px] leading-none tracking-tightest text-ink mb-3"
        >
          Sorted.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono font-semibold text-[11px] uppercase tracking-[0.24em] text-ink/65"
        >
          Money · Sorted
        </motion.p>
      </div>
    </div>
  )
}
