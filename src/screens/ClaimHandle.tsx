import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AtSign } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { USERS_BY_HANDLE } from '../lib/mockData'

export default function ClaimHandle() {
  const navigate = useNavigate()
  const [handle, setHandle] = useState('hannah')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)

  function isAvailable(h: string): boolean {
    if (h.length < 3) return false
    if (!/^[a-z0-9_]+$/.test(h)) return false
    if (h === 'hannah') return true
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
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="CLAIM HANDLE" />

      {/* Centered hero */}
      <div className="flex flex-col items-center text-center pt-10 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-20 h-20 bg-lime border-[2.5px] border-ink rounded-[24px] shadow-ink-md flex items-center justify-center mb-6"
        >
          <AtSign size={30} strokeWidth={2.6} className="text-ink" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55 }}
          className="font-display font-bold text-[34px] leading-[1] tracking-tightest text-ink mb-3"
        >
          Pick your @handle.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft max-w-[290px]"
        >
          This is how mates find you to send money. Pick something you&apos;ll keep.
        </motion.p>
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.5 }}
        className="mt-4"
      >
        <div className="flex items-stretch gap-0 mb-2 bg-paper-elevated border-[1.5px] border-line rounded-[14px] overflow-hidden focus-within:border-ink transition-colors">
          <span className="flex items-center pl-[18px] pr-0 font-body font-medium text-ink-muted text-[16px] select-none">
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
            className="flex-1 bg-transparent border-0 outline-none font-body font-medium text-[16px] py-[14px] pr-[18px] placeholder:text-ink-faint text-ink"
            autoFocus
          />
        </div>

        <div className="min-h-[20px] mb-6 px-1">
          <AnimatePresence mode="wait">
            {!checking && available === true && (
              <motion.p
                key="available"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[13px] text-ink-muted"
              >
                @{handle} is yours.
              </motion.p>
            )}
            {!checking && available === false && handle.length >= 3 && (
              <motion.p
                key="taken"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[13px] text-coral"
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
          className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none"
          disabled={!available}
          onClick={() => navigate('/profile')}
        >
          Claim @{handle || 'handle'}
        </button>
      </motion.div>
    </Screen>
  )
}
