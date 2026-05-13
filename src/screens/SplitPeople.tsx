import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Users, X } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { User } from '../lib/mockData'
import { useStore } from '../lib/store'
import { haptic } from '../lib/chime'

/**
 * SplitPeople — pick the mates to split a bill with.
 *
 * Up to 8 people. The current user is always included implicitly (they're
 * the one paying upfront), so picking 3 mates means the bill divides 4 ways.
 *
 * Tap to toggle in/out. Selected chips fly up to a "selected" row at the
 * top to make the in-progress group visible.
 */
export default function SplitPeople() {
  const navigate = useNavigate()
  const contacts = useStore((s) => s.contacts)

  // Live-loaded so newly added contacts appear
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<User[]>(() => {
    // Persist mid-flight selection across nav back/forward via sessionStorage
    try {
      const raw = sessionStorage.getItem('pendingSplitPeople')
      if (raw) return JSON.parse(raw) as User[]
    } catch {
      // ignore
    }
    return []
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(
      (c) =>
        c.handle.toLowerCase().includes(q) ||
        c.firstName.toLowerCase().includes(q) ||
        (c.lastName ?? '').toLowerCase().includes(q)
    )
  }, [contacts, search])

  const selectedHandles = useMemo(() => new Set(selected.map((u) => u.handle)), [selected])

  function toggle(u: User) {
    haptic(8)
    setSelected((prev) => {
      const already = prev.some((p) => p.handle === u.handle)
      if (already) return prev.filter((p) => p.handle !== u.handle)
      // Cap at 8 — anything more is a list, not a split
      if (prev.length >= 8) return prev
      return [...prev, u]
    })
  }

  function handleContinue() {
    if (selected.length === 0) return
    sessionStorage.setItem('pendingSplitPeople', JSON.stringify(selected))
    navigate('/split/amount')
  }

  const canContinue = selected.length >= 1

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="SPLIT" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-2"
      >
        <h1 className="font-display font-bold text-[34px] leading-[1] tracking-tightest text-ink mb-2">
          Split with who?
        </h1>
        <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft mb-5">
          Pick the mates. We&apos;ll divide the bill evenly.
        </p>
      </motion.div>

      {/* Selected chip rail — shows in-progress group */}
      <AnimatePresence initial={false}>
        {selected.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Users size={11} strokeWidth={2.6} className="text-ink" />
              <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                Splitting with · {selected.length}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto -mx-6 px-6 pb-1 scrollbar-none">
              {selected.map((u) => (
                <motion.button
                  key={u.handle}
                  layout
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                  onClick={() => toggle(u)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full bg-ink text-paper border-[1.5px] border-ink"
                >
                  <Avatar user={u} size="sm" />
                  <span className="font-display font-bold text-[13px] tracking-tight">
                    @{u.handle}
                  </span>
                  <X size={12} strokeWidth={2.6} className="text-paper/70" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search input */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search @handle or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[14px] outline-none focus:border-ink transition-colors font-body font-medium text-[15px] text-ink py-[14px] px-[18px] placeholder:text-ink-faint"
        />
      </div>

      {/* Contact list */}
      <ul className="space-y-2 mb-5 flex-1 overflow-y-auto">
        {filtered.map((u, idx) => {
          const isSelected = selectedHandles.has(u.handle)
          return (
            <motion.li
              key={u.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.03, duration: 0.3 }}
            >
              <button
                onClick={() => toggle(u)}
                className={`w-full flex items-center gap-3 p-3 rounded-[14px] border-[1.5px] transition-colors text-left ${
                  isSelected ? 'bg-lime-soft border-lime-deep' : 'bg-paper-elevated border-line'
                }`}
              >
                <Avatar user={u} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[15px] tracking-tight text-ink leading-[1.2]">
                    {u.firstName} {u.lastName ?? ''}
                  </div>
                  <div className="font-body text-[12px] text-ink-muted mt-0.5">@{u.handle}</div>
                </div>
                {/* Checkmark when selected — replaces chevron */}
                <div
                  className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center transition-colors flex-shrink-0 ${
                    isSelected ? 'bg-lime border-ink' : 'bg-paper-elevated border-line'
                  }`}
                >
                  {isSelected && <Check size={14} strokeWidth={3} className="text-ink" />}
                </div>
              </button>
            </motion.li>
          )
        })}
      </ul>

      {/* Continue CTA */}
      <button
        disabled={!canContinue}
        onClick={handleContinue}
        className={`
          w-full py-4 rounded-[14px] border-[2px]
          font-display font-bold text-[16px] tracking-tight
          transition-all duration-100 mb-3
          ${
            canContinue
              ? 'bg-lime text-ink border-ink shadow-ink active:translate-y-[3px] active:shadow-none'
              : 'bg-line-soft text-ink-muted border-line opacity-70 cursor-not-allowed'
          }
        `}
      >
        {canContinue ? `Next · ${selected.length + 1} ways` : 'Pick someone to start'}
      </button>
    </Screen>
  )
}
