import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, ChevronRight } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { searchUsers, MOCK_CONTACTS, User } from '../lib/mockData'

export default function SendWho() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const results = useMemo(() => searchUsers(query, 'hannah'), [query])
  const showRecent = query.length === 0
  const list: User[] = showRecent ? MOCK_CONTACTS : results

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

      {/* RECENT section */}
      {list.length > 0 && (
        <section>
          <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3 px-1">
            {showRecent ? 'Recent' : 'Results'}
          </h2>
          <ul className="space-y-2">
            {list.map((u, idx) => (
              <motion.li
                key={u.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.05, duration: 0.35 }}
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
                    <div className="font-body text-[12px] text-ink-muted mt-0.5">
                      @{u.handle}
                    </div>
                  </div>
                  <ChevronRight size={18} strokeWidth={2.4} className="text-ink-muted flex-shrink-0" />
                </button>
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      {!showRecent && list.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-10 px-4 text-center"
        >
          <p className="font-display font-bold text-[16px] tracking-tight text-ink-muted mb-1">
            No matches
          </p>
          <p className="text-[13px] text-ink-muted max-w-[28ch]">
            No one with &ldquo;{query}&rdquo; yet. Double-check the handle.
          </p>
        </motion.div>
      )}
    </Screen>
  )
}
