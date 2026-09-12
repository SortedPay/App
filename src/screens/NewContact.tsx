import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, MessageSquare, Check } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { User } from '../lib/model'
import { useStore } from '../lib/store'
import { useUserSearch } from '../lib/search'

export default function NewContact() {
  const navigate = useNavigate()
  const addContact = useStore((s) => s.addContact)
  const contacts = useStore((s) => s.contacts)

  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { results: found, searching } = useUserSearch(query)
  const results = found.filter((u) => !contacts.some((c) => c.handle === u.handle))

  // A handle-shaped query that nobody on Sorted has yet → offer the SMS path
  const normalised = query.toLowerCase().replace(/[^a-z0-9_]/g, '')
  const showNotOnSorted = normalised.length >= 3 && !searching && results.length === 0 && !contacts.some((c) => c.handle === normalised)

  async function handleAddExisting(u: User) {
    setError(null)
    try {
      await addContact(u)
      setSaved(u.handle)
      setTimeout(() => navigate(-1), 600)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add them. Try again.")
    }
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="NEW CONTACT" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="pt-2"
      >
        <h1 className="font-display font-bold text-[32px] leading-[1.05] tracking-tightest text-ink mb-2">
          Add a contact
        </h1>
        <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft mb-6">
          Search by @handle or name. They&apos;ll show up in your Recent list.
        </p>

        <div className="mb-5">
          <input
            type="text"
            placeholder="@handle or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[14px] outline-none focus:border-ink transition-colors font-body font-medium text-[15px] text-ink py-[14px] px-[18px] placeholder:text-ink-faint"
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      </motion.div>

      {/* Existing-user matches */}
      {results.length > 0 && (
        <section>
          <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3 px-1">
            On Sorted
          </h2>
          <ul className="space-y-2">
            {results.map((u, idx) => (
              <motion.li
                key={u.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <button
                  onClick={() => handleAddExisting(u)}
                  disabled={saved !== null}
                  className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-paper-elevated border-[1px] border-line active:translate-y-[1px] transition-transform text-left disabled:opacity-60"
                >
                  <Avatar user={u} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[15px] tracking-tight text-ink leading-[1.2]">
                      {u.firstName} {u.lastName ?? ''}
                    </div>
                    <div className="font-body text-[12px] text-ink-muted mt-0.5">
                      @{u.handle}
                    </div>
                  </div>
                  {saved === u.handle ? (
                    <span className="w-6 h-6 rounded-full bg-lime border border-ink flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} className="text-ink" />
                    </span>
                  ) : (
                    <ChevronRight size={18} strokeWidth={2.4} className="text-ink-muted flex-shrink-0" />
                  )}
                </button>
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      {error && <p className="font-body text-[12px] text-coral px-1 mb-3">{error}</p>}

      {/* Nobody on Sorted has that handle yet — the SMS send is the way in */}
      {showNotOnSorted && (
        <section className="mt-2">
          <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3 px-1">
            Not on Sorted yet?
          </h2>
          <button
            onClick={() => navigate('/sms')}
            className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-paper-elevated border-[1.5px] border-dashed border-line active:translate-y-[1px] transition-transform text-left"
          >
            <div className="w-11 h-11 rounded-full bg-paper border border-line flex items-center justify-center flex-shrink-0">
              <MessageSquare size={18} strokeWidth={2.4} className="text-ink-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
                No one called &ldquo;@{normalised}&rdquo; yet
              </div>
              <div className="font-body text-[12px] text-ink-muted mt-0.5">
                Send them money by SMS — they join when they claim it.
              </div>
            </div>
          </button>
        </section>
      )}

      {/* Empty state — no input yet */}
      {query.length === 0 && (
        <div className="text-center pt-6 px-4">
          <p className="font-body text-[13px] text-ink-muted max-w-[28ch] mx-auto">
            Type someone&apos;s @handle or name to find them.
          </p>
        </div>
      )}

      {/* Short query but no matches */}
      {query.length > 0 && !showNotOnSorted && results.length === 0 && normalised.length > 0 && normalised.length < 3 && (
        <div className="text-center pt-4 px-4">
          <p className="font-body text-[13px] text-ink-muted">
            Keep typing — handles are at least 3 characters.
          </p>
        </div>
      )}
    </Screen>
  )
}
