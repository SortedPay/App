import { useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Optional max height (vh) — defaults to 85 */
  maxHeightVh?: number
}

export function BottomSheet({ open, onClose, children, maxHeightVh = 85 }: Props) {
  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = original
      }
    }
  }, [open])

  function handleDragEnd(_: any, info: PanInfo) {
    // Drag down by 100+px or velocity-based swipe = close
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 z-[60] backdrop-blur-[2px]"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className="fixed inset-x-0 bottom-0 z-[70] bg-paper rounded-t-[28px] border-t-[2.5px] border-x-[2.5px] border-ink shadow-[0_-8px_30px_rgba(14,14,24,0.18)]"
            style={{ maxHeight: `${maxHeightVh}vh` }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-line" />
            </div>

            {/* Content area — scrollable */}
            <div
              className="overflow-y-auto px-5 pb-6"
              style={{ maxHeight: `calc(${maxHeightVh}vh - 30px)` }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
