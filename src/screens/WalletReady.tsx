import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Screen from '../components/Screen'

export default function WalletReady() {
  const navigate = useNavigate()

  // Auto-advance after 4s if user doesn't tap.
  useEffect(() => {
    const id = setTimeout(() => navigate('/home'), 4000)
    return () => clearTimeout(id)
  }, [navigate])

  return (
    <Screen transition="fade" className="min-h-screen flex flex-col px-6 pb-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Lime check circle */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
          className="w-24 h-24 bg-lime border-[2.5px] border-ink rounded-full shadow-ink-md flex items-center justify-center mb-8"
        >
          <Check size={44} strokeWidth={3} className="text-ink" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="font-display font-bold text-[44px] leading-[0.95] tracking-tightest text-ink mb-3 whitespace-pre-line"
        >
          {"You're\nsorted."}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="font-body font-medium text-[14px] leading-[1.5] text-ink-soft max-w-[280px]"
        >
          Your wallet&apos;s ready.
          <br />
          Top up to start sending.
        </motion.p>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.45 }}
        onClick={() => navigate('/home')}
        className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all"
      >
        Take me in
      </motion.button>
    </Screen>
  )
}
