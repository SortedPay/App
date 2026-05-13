import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inbox, Search, X } from 'lucide-react'
import { useStore } from '../lib/store'
import Screen from '../components/Screen'
import { ActivityRow } from './Home'
import { BottomSheet } from '../components/BottomSheet'
import { TxDetailContent } from '../components/TxDetailContent'
import { Transaction } from '../lib/mockData'
import { ActivityRowSkeleton } from '../components/Skeleton'
import PullToRefresh from '../components/PullToRefresh'

type Filter = 'all' | 'sent' | 'received' | 'yield'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'sent', label: 'Sent' },
  { key: 'received', label: 'In' },
  { key: 'yield', label: 'Yield' },
]

function matchesFilter(tx: Transaction, filter: Filter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'sent':
      return tx.type === 'send' || tx.type === 'cashout'
    case 'received':
      return tx.type === 'receive' || tx.type === 'topup'
    case 'yield':
      return tx.type === 'yield'
  }
}

function matchesQuery(tx: Transaction, q: string): boolean {
  if (!q) return true
  const needle = q.toLowerCase()
  const cp = tx.counterparty
  const fields = [
    cp.handle,
    cp.firstName,
    cp.lastName ?? '',
    tx.note ?? '',
    tx.reference ?? '',
  ]
  return fields.some((f) => f.toLowerCase().includes(needle))
}

export default function Activity() {
  const transactions = useStore((s) => s.transactions)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // Brief skeleton on cold mount so the page feels like it's "loading from network"
  // even though the data is in-memory. In v0.4 this is where real API loading lives.
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(t)
  }, [])

  // Filter pipeline: apply type filter, then search query
  const filtered = useMemo(
    () => transactions.filter((tx) => matchesFilter(tx, filter) && matchesQuery(tx, query)),
    [transactions, filter, query]
  )

  // Group by day for the date-section headers
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    for (const tx of filtered) {
      const d = new Date(tx.createdAt)
      const txDay = new Date(d)
      txDay.setHours(0, 0, 0, 0)

      let key: string
      if (txDay.getTime() === today.getTime()) key = 'Today'
      else if (txDay.getTime() === yesterday.getTime()) key = 'Yesterday'
      else
        key = d.toLocaleDateString('en-AU', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })

      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(tx)
    }
    return map
  }, [filtered])

  // Refresh simulation — in v0.4 this re-fetches from API
  async function handleRefresh() {
    await new Promise((r) => setTimeout(r, 700))
  }

  // ── HEADER ROW (reused across loading / empty / loaded) ──
  const Header = (
    <header className="pt-4 pb-3">
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-display font-bold text-[34px] leading-none tracking-tightest">
          Activity
        </h1>
        <button
          onClick={() => {
            setSearchOpen((o) => !o)
            if (searchOpen) setQuery('')
          }}
          aria-label={searchOpen ? 'Close search' : 'Search activity'}
          className="w-9 h-9 rounded-full bg-paper-elevated border border-line flex items-center justify-center active:translate-y-[1px] transition-transform"
        >
          {searchOpen ? (
            <X size={16} strokeWidth={2.4} className="text-ink" />
          ) : (
            <Search size={16} strokeWidth={2.4} className="text-ink" />
          )}
        </button>
      </div>

      {/* Search input — slides in when search is open */}
      <AnimatePresence initial={false}>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-3"
          >
            <input
              type="text"
              autoFocus
              placeholder="Search by name, handle, or note"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[12px] outline-none focus:border-ink transition-colors font-body font-medium text-[14px] text-ink py-[10px] px-[14px] placeholder:text-ink-faint"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto -mx-6 px-6 pb-1 scrollbar-none">
        {FILTERS.map((f) => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full border-[1.5px] font-display font-bold text-[12px] tracking-tight transition-colors ${
                active
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper-elevated text-ink border-line active:bg-line-soft'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>
    </header>
  )

  // Skeleton state
  if (loading) {
    return (
      <Screen transition="fade" className="pt-2 pb-4 px-6">
        {Header}
        <div className="space-y-2 mt-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ActivityRowSkeleton key={i} />
          ))}
        </div>
      </Screen>
    )
  }

  // Truly empty (no transactions ever)
  if (transactions.length === 0) {
    return (
      <Screen transition="fade" className="pt-2 pb-4 min-h-screen flex flex-col px-6">
        {Header}
        <div className="flex-1 flex flex-col items-center justify-center pb-24">
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

  return (
    <>
      <Screen transition="fade" className="pt-2 pb-4 px-6">
        {Header}

        <PullToRefresh onRefresh={handleRefresh}>
          {filtered.length === 0 ? (
            // Filter/search returned nothing — different from "no tx ever"
            <div className="text-center py-10">
              <p className="font-display font-bold text-[15px] tracking-tight text-ink-muted mb-1">
                Nothing matches.
              </p>
              <p className="font-body text-[12px] text-ink-faint max-w-[28ch] mx-auto">
                Try a different filter or clear your search.
              </p>
            </div>
          ) : (
            [...groups.entries()].map(([dateLabel, txs]) => (
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
            ))
          )}
        </PullToRefresh>
      </Screen>

      {/* Bottom sheet for tx detail */}
      <BottomSheet open={!!selectedTx} onClose={() => setSelectedTx(null)}>
        {selectedTx && <TxDetailContent tx={selectedTx} />}
      </BottomSheet>
    </>
  )
}
