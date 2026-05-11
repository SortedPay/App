import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  /** Width as CSS value */
  w?: string
  /** Height as CSS value */
  h?: string
  /** Border radius — defaults to 8px */
  rounded?: string
}

/**
 * Single shimmering rectangle. Compose into screens.
 */
export function Skeleton({ className = '', w, h, rounded = '8px' }: SkeletonProps) {
  return (
    <motion.div
      animate={{ opacity: [0.55, 0.85, 0.55] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: w, height: h, borderRadius: rounded }}
      className={`bg-line-soft ${className}`}
    />
  )
}

/**
 * Activity row skeleton — matches ActivityRow proportions
 */
export function ActivityRowSkeleton() {
  return (
    <div className="bg-paper-elevated border border-line rounded-[14px] px-3 py-2.5 flex items-center gap-3">
      <Skeleton w="38px" h="38px" rounded="50%" />
      <div className="flex-1 space-y-1.5">
        <Skeleton w="60%" h="14px" />
        <Skeleton w="40%" h="11px" />
      </div>
      <Skeleton w="56px" h="14px" />
    </div>
  )
}

/**
 * Balance card skeleton
 */
export function BalanceCardSkeleton() {
  return (
    <div className="bg-ink rounded-[24px] px-5 pt-5 pb-4 mb-3">
      <Skeleton w="92px" h="11px" className="mb-3 !bg-paper/15" />
      <Skeleton w="60%" h="56px" className="mb-4 !bg-paper/15" />
      <div className="flex gap-2">
        <Skeleton h="44px" className="flex-1 !bg-paper/15" rounded="14px" />
        <Skeleton h="44px" className="flex-1 !bg-paper/15" rounded="14px" />
        <Skeleton w="44px" h="44px" className="!bg-paper/15" rounded="14px" />
      </div>
    </div>
  )
}
