import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, UserPlus, Check } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { searchUsers, USERS_BY_HANDLE, User } from '../lib/mockData'
import { useStore } from '../lib/store'

export default function NewContact() {
  const navigate = useNavigate()
  const addContact = useStore((s) => s.addContact)
  const contacts = useStore((s) => s.contacts)
  const me = useStore((s) => s.user)

  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState<string | null>(null)

  const results = useMemo(() => {
    if (query.length === 0) return []
    return searchUsers(query, me.handle).filter(
      (u) => !contacts.some((c) => c.handle === u.handle)
    )
  }, [query, contacts, me.handle])

  // Normalised handle for the "Add @handle" custom-entry path
  const normalised = query.toLowerCase().replace(/[^a-z0-9_]/g, '')
  const showCustomAdd =
    normalised.length >= 3 &&
    results.length === 0 &&
    !contacts.some((c) => c.handle === normalised) &&
    !USERS_BY_HANDLE.has(normalised)

  function handleAddExisting(u: User) {
    addContact(u)
    setSaved(u.handle)
    setTimeout(() => navigate(-1), 600)
  }

  function handleAddCustom() {
    // Build a placeholder user — we don't have their real name, so initials default to the first two letters of the handle.
    const newUser: User = {
      id: `user_${normalised}`,
      handle: normalised,
      firstName: normalised.charAt(0).toUpperCase() + normalised.slice(1),
      lastName: '',
      initials: normalised.slice(0, 2).toUpperCase(),
      color: 'plum',
      verified: false,
    }
    addContact(newUser)
    setSaved(normalised)
    setTimeout(() => navigate(-1), 600)
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

      {/* Custom add path — adds a handle that's not in our demo user pool */}
      {showCustomAdd && (
        <section className="mt-2">
          <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3 px-1">
            Not on Sorted yet?
          </h2>
          <button
            onClick={handleAddCustom}
            disabled={saved !== null}
            className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-paper-elevated border-[1.5px] border-dashed border-line active:translate-y-[1px] transition-transform text-left"
          >
            <div className="w-11 h-11 rounded-full bg-paper border border-line flex items-center justify-center flex-shrink-0">
              <UserPlus size={18} strokeWidth={2.4} className="text-ink-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
                Add &ldquo;@{normalised}&rdquo;
              </div>
              <div className="font-body text-[12px] text-ink-muted mt-0.5">
                You can also send via SMS if they haven&apos;t joined yet.
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
      {query.length > 0 && !showCustomAdd && results.length === 0 && normalised.length > 0 && normalised.length < 3 && (
        <div className="text-center pt-4 px-4">
          <p className="font-body text-[13px] text-ink-muted">
            Keep typing — handles are at least 3 characters.
          </p>
        </div>
      )}
    </Screen>
  )
}
