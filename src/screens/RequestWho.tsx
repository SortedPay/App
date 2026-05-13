import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Star } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { searchUsers, User } from '../lib/mockData'
import { useStore } from '../lib/store'
import { haptic } from '../lib/chime'

/**
 * RequestWho — first screen of the request flow. Pick who to ask.
 *
 * Mirrors SendWho's structure but with framing focused on asking, not sending.
 * Uses the same contacts list and pinned section so users get continuity.
 *
 * Notably we don't show a "request via SMS" affordance — only on-Sorted users
 * can be asked. People off the platform get the SMS flow from Send, not here.
 */
export default function RequestWho() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const contacts = useStore((s) => s.contacts)
  const user = useStore((s) => s.user)
  const pinnedHandles = useStore((s) => s.pinnedHandles)
  const togglePinned = useStore((s) => s.togglePinned)

  const results = useMemo(() => searchUsers(query, user.handle), [query, user.handle])
  const showRecent = query.length === 0

  const pinnedSet = useMemo(() => new Set(pinnedHandles), [pinnedHandles])
  const pinned: User[] = useMemo(
    () => pinnedHandles.map((h) => contacts.find((c) => c.handle === h)).filter(Boolean) as User[],
    [pinnedHandles, contacts]
  )
  const recents: User[] = useMemo(
    () => contacts.filter((c) => !pinnedSet.has(c.handle)),
    [contacts, pinnedSet]
  )
  const list: User[] = showRecent ? recents : results

  function handleTogglePin(e: React.MouseEvent, handle: string) {
    e.stopPropagation()
    e.preventDefault()
    haptic(10)
    togglePinned(handle)
  }

  function ContactRow({ u, index }: { u: User; index: number }) {
    const isPinned = pinnedSet.has(u.handle)
    return (
      <motion.li
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 + index * 0.04, duration: 0.3 }}
      >
        <button
          onClick={() => navigate(`/request/${u.handle}`)}
          className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-paper-elevated border-[1px] border-line active:translate-y-[1px] transition-transform text-left"
        >
          <Avatar user={u} size="md" />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[15px] tracking-tight text-ink leading-[1.2]">
              {u.firstName} {u.lastName ?? ''}
            </div>
            <div className="font-body text-[12px] text-ink-muted mt-0.5">@{u.handle}</div>
          </div>
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
      <Header title="REQUEST" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="pt-2"
      >
        <h1 className="font-display font-bold text-[34px] leading-[1] tracking-tightest text-ink mb-2">
          Who owes you?
        </h1>
        <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft mb-6">
          Pick a mate. Type the amount. They get a ping.
        </p>

        <div className="mb-5">
          <input
            type="text"
            placeholder="Search @handle or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[14px] outline-none focus:border-ink transition-colors font-body font-medium text-[15px] text-ink py-[14px] px-[18px] placeholder:text-ink-faint"
          />
        </div>
      </motion.div>

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

      {showRecent && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Recent
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

      {!showRecent && list.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
          <div className="text-center py-6 px-4">
            <p className="font-display font-bold text-[16px] tracking-tight text-ink mb-1">
              No one called &ldquo;{query}&rdquo;
            </p>
            <p className="font-body text-[13px] text-ink-muted max-w-[28ch] mx-auto">
              You can only request from people already on Sorted.
            </p>
          </div>
        </motion.div>
      )}
    </Screen>
  )
}
