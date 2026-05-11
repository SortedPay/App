import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'

// Lightweight network-status indicator. Sits above the app, only renders when offline.
// In v0.3 (real backend) this is the difference between "send pending" working and
// "send is silently failing" — for v0.2 it's purely a UX cue that something will
// fail if attempted.
export default function OfflineBanner() {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 inset-x-0 z-[60] bg-ink text-paper py-2 px-4 flex items-center justify-center gap-2 pointer-events-none"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)' }}
        >
          <WifiOff size={14} strokeWidth={2.5} className="text-coral" />
          <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em]">
            You&apos;re offline
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
