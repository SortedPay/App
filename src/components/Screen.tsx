import { ReactNode } from 'react'
import { motion } from 'framer-motion'

type Props = {
  children: ReactNode
  className?: string
  // Use 'fade' for tab swaps, 'slide' for forward navigation, 'modal' for flow steps
  transition?: 'fade' | 'slide' | 'modal'
}

const VARIANTS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.18 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  modal: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function Screen({ children, className = '', transition = 'fade' }: Props) {
  const v = VARIANTS[transition]
  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={v.transition}
      className={`mx-auto max-w-md px-5 ${className}`}
    >
      {children}
    </motion.div>
  )
}
