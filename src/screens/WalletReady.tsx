import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Screen from '../components/Screen'

export default function WalletReady() {
  const navigate = useNavigate()

  // Auto-advance after 3.5s if user doesn't tap. Demos shouldn't get stuck.
  useEffect(() => {
    const id = setTimeout(() => navigate('/home'), 3500)
    return () => clearTimeout(id)
  }, [navigate])

  return (
    <Screen transition="modal" className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        {/* Big lime check */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: -3 }}
          transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.1 }}
          className="w-32 h-32 bg-lime border-[3px] border-ink rounded-full shadow-ink-md flex items-center justify-center mb-10"
        >
          <Check size={64} strokeWidth={3.5} className="text-ink" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="font-display font-bold text-[56px] leading-[0.92] tracking-tightest text-ink mb-4"
        >
          You&apos;re<br />
          <span className="hl">sorted.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-ink-soft text-[16px] max-w-[26ch] mb-12"
        >
          Your wallet&apos;s ready.<br />
          Top up to start sending.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.4 }}
          onClick={() => navigate('/home')}
          className="btn btn-primary btn-lg"
        >
          Take me in
        </motion.button>
      </div>
    </Screen>
  )
}
