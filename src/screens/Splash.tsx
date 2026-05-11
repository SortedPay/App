import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const id = setTimeout(() => navigate('/welcome', { replace: true }), 1500)
    return () => clearTimeout(id)
  }, [navigate])

  return (
    <div className="fixed inset-0 bg-lime flex flex-col items-center justify-center">
      <div className="-mt-12 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-[64px] leading-none tracking-tightest text-ink mb-3"
        >
          Sorted.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="font-mono font-semibold text-[11px] uppercase tracking-[0.24em] text-ink/65"
        >
          Money · Sorted
        </motion.p>
      </div>
    </div>
  )
}
