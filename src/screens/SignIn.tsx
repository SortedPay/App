import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AtSign } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'

// v0.2 stub: there's no real "account" yet, so signing back in just means
// jumping straight into the app as @hannah. v0.3 wires Privy + real auth.
export default function SignIn() {
  const navigate = useNavigate()

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="SIGN IN" />

      <div className="flex-1 flex flex-col items-center justify-center text-center pb-10">
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-20 h-20 bg-lime border-[2.5px] border-ink rounded-[24px] shadow-ink-md flex items-center justify-center mb-6"
        >
          <AtSign size={30} strokeWidth={2.6} className="text-ink" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="font-display font-bold text-[28px] leading-[1.05] tracking-tightest text-ink mb-3"
        >
          Welcome back.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft max-w-[290px] mb-2"
        >
          You&apos;re testing the v0.2 beta — accounts aren&apos;t real yet, so this just drops you back in as @hannah.
        </motion.p>
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          Real sign-in lands in v0.3
        </p>
      </div>

      <button
        onClick={() => navigate('/home')}
        className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all"
      >
        Continue as @hannah
      </button>

      <button
        onClick={() => navigate('/welcome')}
        className="w-full py-3 mt-2 font-body font-medium text-[13px] text-ink-muted active:text-ink transition-colors"
      >
        Or start fresh →
      </button>
    </Screen>
  )
}
