import { useState } from 'react'
import { motion } from 'framer-motion'
import { Inbox, ChevronDown } from 'lucide-react'
import { useStore } from '../lib/store'
import Screen from '../components/Screen'
import { ActivityRow } from './Home'
import { BottomSheet } from '../components/BottomSheet'
import { TxDetailContent } from '../components/TxDetailContent'
import { Transaction } from '../lib/mockData'

export default function Activity() {
  const transactions = useStore((s) => s.transactions)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  // Empty state
  if (transactions.length === 0) {
    return (
      <Screen transition="fade" className="pt-2 pb-4 min-h-screen flex flex-col">
        <header className="pt-4 pb-2 flex items-center justify-between">
          <h1 className="font-display font-bold text-[34px] leading-none tracking-tightest">
            Activity
          </h1>
          <div className="bg-paper-elevated border border-line rounded-full px-3 py-1.5 flex items-center gap-1">
            <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              All
            </span>
            <ChevronDown size={12} strokeWidth={2.4} className="text-ink-muted" />
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
          <motion.div
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: 1, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 250, damping: 16 }}
            className="w-20 h-20 bg-lime-soft border-[2.5px] border-line rounded-2xl flex items-center justify-center mb-5"
          >
            <Inbox size={32} strokeWidth={2.2} className="text-ink-muted" />
          </motion.div>
          <h2 className="font-display font-bold text-[22px] tracking-tight mb-2 text-center">
            Nothing here yet.
          </h2>
          <p className="text-ink-muted text-[14px] text-center max-w-[28ch] leading-[1.5]">
            Send your first dollar and it&apos;ll show up here.
          </p>
        </div>
      </Screen>
    )
  }

  // Group by day
  const groups = new Map<string, typeof transactions>()
  for (const tx of transactions) {
    const d = new Date(tx.createdAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let key: string
    const txDay = new Date(d)
    txDay.setHours(0, 0, 0, 0)

    if (txDay.getTime() === today.getTime()) key = 'Today'
    else if (txDay.getTime() === yesterday.getTime()) key = 'Yesterday'
    else
      key = d.toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })

    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }

  return (
    <>
      <Screen transition="fade" className="pt-2 pb-4 px-6">
        <header className="pt-4 pb-5 flex items-center justify-between">
          <h1 className="font-display font-bold text-[34px] leading-none tracking-tightest">
            Activity
          </h1>
          <div className="bg-paper-elevated border border-line rounded-full px-3 py-1.5 flex items-center gap-1">
            <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              All
            </span>
            <ChevronDown size={12} strokeWidth={2.4} className="text-ink-muted" />
          </div>
        </header>

        {[...groups.entries()].map(([dateLabel, txs]) => (
          <section key={dateLabel} className="mb-5">
            <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2 px-2 sticky top-0 bg-paper py-1.5 z-10">
              {dateLabel}
            </h2>
            <ul className="space-y-2">
              {txs.map((tx) => (
                <li key={tx.id}>
                  <ActivityRow tx={tx} onClick={() => setSelectedTx(tx)} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Screen>

      {/* Bottom sheet for tx detail */}
      <BottomSheet open={!!selectedTx} onClose={() => setSelectedTx(null)}>
        {selectedTx && <TxDetailContent tx={selectedTx} />}
      </BottomSheet>
    </>
  )
}
