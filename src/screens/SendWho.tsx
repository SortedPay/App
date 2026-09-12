import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, ChevronRight, Plus, Star } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { User } from '../lib/model'
import { useStore } from '../lib/store'
import { useUserSearch } from '../lib/search'
import { haptic } from '../lib/chime'

export default function SendWho() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const contacts = useStore((s) => s.contacts)
  const pinnedHandles = useStore((s) => s.pinnedHandles)
  const togglePinned = useStore((s) => s.togglePinned)

  // Contacts answer instantly; the API fills in everyone else on Sorted
  const { results } = useUserSearch(query)
  const showRecent = query.length === 0

  // Split contacts: pinned at top (in pin order), then recents (excluding pinned)
  const pinnedSet = useMemo(() => new Set(pinnedHandles), [pinnedHandles])
  const pinned: User[] = useMemo(() => {
    return pinnedHandles
      .map((h) => contacts.find((c) => c.handle === h))
      .filter(Boolean) as User[]
  }, [pinnedHandles, contacts])
  const recents: User[] = useMemo(
    () => contacts.filter((c) => !pinnedSet.has(c.handle)),
    [contacts, pinnedSet]
  )

  const list: User[] = showRecent ? recents : results

  function handleTogglePin(e: React.MouseEvent, handle: string) {
    // Stop the row's navigate-to-send from firing
    e.stopPropagation()
    e.preventDefault()
    haptic(10)
    togglePinned(handle)
  }

  // Reusable row — shared between pinned + recents + search results
  function ContactRow({ u, index }: { u: User; index: number }) {
    const isPinned = pinnedSet.has(u.handle)
    return (
      <motion.li
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 + index * 0.04, duration: 0.3 }}
      >
        <button
          onClick={() => navigate(`/send/${u.handle}`)}
          className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-paper-elevated border-[1px] border-line active:translate-y-[1px] transition-transform text-left"
        >
          <Avatar user={u} size="md" />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[15px] tracking-tight text-ink leading-[1.2]">
              {u.firstName} {u.lastName ?? ''}
            </div>
            <div className="font-body text-[12px] text-ink-muted mt-0.5">@{u.handle}</div>
          </div>
          {/* Pin toggle — sized big enough to tap, stops propagation so row doesn't navigate */}
          <span
            role="button"
            tabIndex={0}
            aria-label={isPinned ? `Unpin ${u.handle}` : `Pin ${u.handle}`}
            onClick={(e) => handleTogglePin(e, u.handle)}
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
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="SEND" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="pt-2"
      >
        <h1 className="font-display font-bold text-[34px] leading-[1] tracking-tightest text-ink mb-2">
          Who&apos;s it for?
        </h1>
        <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft mb-6">
          Type a @handle, or pick a recent.
        </p>

        {/* Search input */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search @handle or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[14px] outline-none focus:border-ink transition-colors font-body font-medium text-[15px] text-ink py-[14px] px-[18px] placeholder:text-ink-faint"
          />
        </div>

        {/* Send via SMS card — always visible */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          onClick={() => navigate('/sms')}
          className="w-full mb-6 flex items-center gap-3 p-3 rounded-[14px] bg-lime-soft border-[1.5px] border-lime-deep active:translate-y-[1px] transition-transform"
        >
          <div className="w-10 h-10 bg-lime border-[1.5px] border-ink rounded-full flex items-center justify-center flex-shrink-0">
            <MessageSquare size={18} strokeWidth={2.4} className="text-ink" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-display font-bold text-[15px] tracking-tight text-ink leading-[1.2]">
              Send via SMS
            </div>
            <div className="font-body text-[12px] text-ink-soft mt-0.5 leading-[1.3]">
              Not on Sorted yet? Text them a claim link.
            </div>
          </div>
          <ChevronRight size={18} strokeWidth={2.4} className="text-ink-muted flex-shrink-0" />
        </motion.button>
      </motion.div>

      {/* PINNED section — only when not searching and user has pins */}
      {showRecent && pinned.length > 0 && (
        <section className="mb-5">
          <div className="flex items-center gap-1.5 mb-3 px-1">
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

      {/* RECENT section (only when not searching) */}
      {showRecent && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              {pinned.length > 0 ? 'Recent' : 'Recent'}
            </h2>
            <button
              onClick={() => navigate('/contacts/new')}
              className="inline-flex items-center gap-1 font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink active:translate-y-[1px] transition-transform"
            >
              <Plus size={12} strokeWidth={2.6} />
              New contact
            </button>
          </div>
          {list.length > 0 ? (
            <ul className="space-y-2">
              {list.map((u, idx) => (
                <ContactRow key={u.id} u={u} index={idx} />
              ))}
            </ul>
          ) : (
            <div className="bg-paper-elevated border border-line rounded-[14px] p-5 text-center">
              <p className="font-display font-bold text-[14px] tracking-tight text-ink mb-1">
                No contacts yet
              </p>
              <p className="font-body text-[12px] text-ink-muted">
                Add someone, or send to a @handle to start your list.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Search results */}
      {!showRecent && list.length > 0 && (
        <section>
          <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3 px-1">
            Results
          </h2>
          <ul className="space-y-2">
            {list.map((u, idx) => (
              <ContactRow key={u.id} u={u} index={idx} />
            ))}
          </ul>
        </section>
      )}

      {/* No-match empty state with SMS CTA */}
      {!showRecent && list.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
          <div className="text-center py-6 px-4">
            <p className="font-display font-bold text-[16px] tracking-tight text-ink mb-1">
              No one called &ldquo;{query}&rdquo; yet
            </p>
            <p className="font-body text-[13px] text-ink-muted max-w-[28ch] mx-auto mb-4">
              Sorted&apos;s newish — they might not be on it yet. Send them a text instead?
            </p>
            <button
              onClick={() => navigate('/sms')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime border-[1.5px] border-ink shadow-ink-sm font-display font-bold text-[13px] text-ink active:translate-y-[2px] active:shadow-none transition-all"
            >
              <MessageSquare size={14} strokeWidth={2.4} />
              Send via SMS instead
            </button>
          </div>
        </motion.div>
      )}
    </Screen>
  )
}
