import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { USERS_BY_HANDLE } from '../lib/mockData'

export default function ClaimHandle() {
  const navigate = useNavigate()
  const [handle, setHandle] = useState('hannah')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)

  // Reserved handles + existing demo users are taken (except 'hannah' which is reserved for the demo user)
  function isAvailable(h: string): boolean {
    if (h.length < 3) return false
    if (!/^[a-z0-9_]+$/.test(h)) return false
    // Special: hannah is the demo user's handle and is "available" to claim
    if (h === 'hannah') return true
    // Other existing users are taken
    return !USERS_BY_HANDLE.has(h)
  }

  useEffect(() => {
    if (handle.length < 3) {
      setAvailable(null)
      return
    }
    setChecking(true)
    const id = setTimeout(() => {
      setAvailable(isAvailable(handle))
      setChecking(false)
    }, 350)
    return () => clearTimeout(id)
  }, [handle])

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col">
      <Header title="Claim handle" />

      <div className="flex-1 flex flex-col justify-center pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display font-bold text-[40px] leading-[0.95] tracking-tighter text-ink mb-3">
            Pick your<br />
            <span className="hl">@handle.</span>
          </h1>
          <p className="text-ink-soft mb-10 text-[15px] max-w-[30ch]">
            This is how mates find you to send money. Pick something you&apos;ll keep.
          </p>

          <div className="relative mb-3">
            <div className="flex items-stretch gap-0 bg-paper-elevated border-2 border-ink rounded-2xl overflow-hidden focus-within:shadow-ink-sm focus-within:-translate-y-px transition-all">
              <span className="flex items-center pl-5 pr-1 font-mono font-semibold text-ink-muted text-[18px] select-none">
                @
              </span>
              <input
                type="text"
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                placeholder="yourhandle"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="flex-1 bg-transparent border-0 outline-none font-body font-semibold text-[18px] py-4 pr-12"
                autoFocus
              />
            </div>
            {/* Status indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center pointer-events-none">
              <AnimatePresence mode="wait">
                {checking && (
                  <motion.div
                    key="checking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-4 h-4 border-2 border-ink-faint border-t-ink rounded-full animate-spin"
                  />
                )}
                {!checking && available === true && (
                  <motion.div
                    key="ok"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-7 h-7 rounded-full bg-lime border-2 border-ink flex items-center justify-center"
                  >
                    <Check size={14} strokeWidth={3} />
                  </motion.div>
                )}
                {!checking && available === false && (
                  <motion.div
                    key="bad"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-7 h-7 rounded-full bg-coral border-2 border-ink flex items-center justify-center text-paper"
                  >
                    <X size={14} strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="min-h-[24px] mb-8">
            <AnimatePresence mode="wait">
              {!checking && available === true && (
                <motion.p
                  key="available"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[13px] font-semibold text-ink"
                >
                  <span className="font-mono">@{handle}</span> is yours.
                </motion.p>
              )}
              {!checking && available === false && handle.length >= 3 && (
                <motion.p
                  key="taken"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[13px] font-semibold text-coral"
                >
                  Sorry, that one&apos;s taken.
                </motion.p>
              )}
              {!checking && handle.length > 0 && handle.length < 3 && (
                <motion.p
                  key="short"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[13px] text-ink-muted"
                >
                  At least 3 characters.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            className="btn btn-primary btn-lg btn-block"
            disabled={!available}
            onClick={() => navigate('/profile')}
          >
            Claim @{handle || 'handle'}
          </button>
        </motion.div>
      </div>
    </Screen>
  )
}
