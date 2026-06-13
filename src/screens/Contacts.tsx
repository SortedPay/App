import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Star, X } from 'lucide-react'
import Screen from '../components/Screen'
import Avatar from '../components/Avatar'
import { useStore } from '../lib/store'
import { User, formatAUD, formatRelativeTime, Transaction } from '../lib/mockData'
import { haptic } from '../lib/chime'

/**
 * Contacts — your address book + history per person.
 *
 * Lists all saved contacts with:
 *   - Avatar + name + @handle
 *   - Last activity preview ("$22 · 4h ago" or "Add one")
 *   - Pinned star indicator if pinned
 *   - Tappable star to pin/unpin in-place
 *
 * Tapping a row opens that contact's detail screen (history + actions).
 */
export default function Contacts() {
  const navigate = useNavigate()
  const contacts = useStore((s) => s.contacts)
  const transactions = useStore((s) => s.transactions)
  const pinnedHandles = useStore((s) => s.pinnedHandles)
  const togglePinned = useStore((s) => s.togglePinned)
  const [search, setSearch] = useState('')

  // Build a quick lookup of last-tx and total per handle so we can show
  // "last activity" + a running total at-a-glance. Computed once per render.
  const stats = useMemo(() => {
    const out = new Map<string, { lastTx?: Transaction; sentCents: number; receivedCents: number; count: number }>()
    for (const tx of transactions) {
      if (tx.type !== 'send' && tx.type !== 'receive') continue
      const handle = tx.counterparty.handle
      const cur = out.get(handle) ?? { sentCents: 0, receivedCents: 0, count: 0 }
      // First tx we encounter (transactions are newest-first) is the lastTx
      if (!cur.lastTx) cur.lastTx = tx
      if (tx.amountCents < 0) cur.sentCents += Math.abs(tx.amountCents)
      else cur.receivedCents += tx.amountCents
      cur.count += 1
      out.set(handle, cur)
    }
    return out
  }, [transactions])

  const pinnedSet = useMemo(() => new Set(pinnedHandles), [pinnedHandles])

  // Filter by search query
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(
      (c) =>
        c.handle.toLowerCase().includes(q) ||
        c.firstName.toLowerCase().includes(q) ||
        (c.lastName ?? '').toLowerCase().includes(q),
    )
  }, [contacts, search])

  // Split into pinned + others
  const pinned = filtered.filter((c) => pinnedSet.has(c.handle))
  const others = filtered.filter((c) => !pinnedSet.has(c.handle))

  function handlePinToggle(e: React.MouseEvent, handle: string) {
    e.stopPropagation()
    e.preventDefault()
    haptic(10)
    togglePinned(handle)
  }

  function ContactRow({ u, index }: { u: User; index: number }) {
    const s = stats.get(u.handle)
    const isPinned = pinnedSet.has(u.handle)
    return (
      <motion.li
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 + index * 0.025, duration: 0.3 }}
      >
        <button
          onClick={() => navigate(`/contacts/${u.handle}`)}
          className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-paper-elevated border border-line active:translate-y-[1px] transition-transform text-left"
        >
          <Avatar user={u} size="md" />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[15px] tracking-tight text-ink leading-[1.2]">
              {u.firstName} {u.lastName ?? ''}
            </div>
            <div className="font-body text-[12px] text-ink-muted mt-0.5 truncate">
              {s?.lastTx
                ? `${s.lastTx.amountCents < 0 ? 'Sent ' : 'Received '}${formatAUD(Math.abs(s.lastTx.amountCents))} · ${formatRelativeTime(s.lastTx.createdAt)}`
                : `@${u.handle}`}
            </div>
          </div>
          <span
            role="button"
            tabIndex={0}
            aria-label={isPinned ? `Unpin ${u.handle}` : `Pin ${u.handle}`}
            onClick={(e) => handlePinToggle(e, u.handle)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                e.preventDefault()
                haptic(10)
                togglePinned(u.handle)
              }
            }}
            className="p-1.5 -m-1.5 rounded-full active:bg-line-soft transition-colors flex-shrink-0"
          >
            <Star
              size={18}
              strokeWidth={2.2}
              className={isPinned ? 'text-ink fill-lime' : 'text-ink-faint'}
            />
          </span>
        </button>
      </motion.li>
    )
  }

  return (
    <Screen transition="fade" className="pt-2 pb-4 px-6">
      <header className="pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-display font-bold text-[34px] leading-none tracking-tightest">
          Contacts
        </h1>
        <button
          onClick={() => navigate('/contacts/new')}
          aria-label="Add contact"
          className="w-9 h-9 rounded-full bg-lime border-[1.5px] border-ink shadow-ink-sm flex items-center justify-center active:translate-y-[1px] active:shadow-none transition-all"
        >
          <Plus size={18} strokeWidth={2.6} className="text-ink" />
        </button>
      </header>

      {/* Search input */}
      <div className="relative mb-4">
        <Search
          size={16}
          strokeWidth={2.4}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search @handle or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[14px] outline-none focus:border-ink transition-colors font-body font-medium text-[14px] text-ink py-[12px] pl-[42px] pr-[42px] placeholder:text-ink-faint"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-line-soft flex items-center justify-center"
          >
            <X size={12} strokeWidth={2.6} className="text-ink-muted" />
          </button>
        )}
      </div>

      {/* Pinned section */}
      {pinned.length > 0 && (
        <section className="mb-5">
          <div className="flex items-center gap-1.5 mb-2.5 px-1">
            <Star size={11} strokeWidth={2.6} className="text-ink fill-lime" />
            <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Pinned
            </h2>
          </div>
          <ul className="space-y-2">
            {pinned.map((u, idx) => (
              <ContactRow key={u.id} u={u} index={idx} />
            ))}
          </ul>
        </section>
      )}

      {/* All contacts */}
      {others.length > 0 && (
        <section>
          {pinned.length > 0 && (
            <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2.5 px-1">
              All · {others.length}
            </h2>
          )}
          <ul className="space-y-2">
            {others.map((u, idx) => (
              <ContactRow key={u.id} u={u} index={idx} />
            ))}
          </ul>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="text-center pt-8">
          <p className="font-display font-bold text-[16px] tracking-tight text-ink mb-1">
            No matches
          </p>
          <p className="font-body text-[13px] text-ink-muted">
            Try a different search or add someone new.
          </p>
        </div>
      )}
    </Screen>
  )
}
