import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { searchUsers, recentRecipients } from '../lib/mockData'
import { useStore } from '../lib/store'

export default function SendWho() {
  const navigate = useNavigate()
  const transactions = useStore((s) => s.transactions)
  const [query, setQuery] = useState('')

  const results = useMemo(() => searchUsers(query, 'hannah'), [query])
  const recents = useMemo(() => recentRecipients(transactions).slice(0, 5), [transactions])

  return (
    <Screen transition="slide" className="pt-2">
      <Header title="Send to" />
      <div className="pt-4">
        <h1 className="font-display font-bold text-[32px] leading-none tracking-tightest mb-5">
          Who&apos;s getting paid?
        </h1>

        <div className="flex items-stretch gap-0 mb-5 bg-paper-elevated border-2 border-ink rounded-2xl overflow-hidden focus-within:shadow-ink-sm focus-within:-translate-y-px transition-all">
          <span className="flex items-center pl-5 pr-1 font-mono font-semibold text-ink-muted text-[18px] select-none">
            @
          </span>
          <input
            type="text"
            placeholder="handle or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none font-body font-medium text-[16px] py-4 pr-5 placeholder:text-ink-faint"
            autoFocus
          />
        </div>

        {/* Results or recents */}
        {query.length > 0 ? (
          <section>
            <h2 className="label-mono mb-2 px-1">Results</h2>
            {results.length === 0 ? (
              <p className="text-ink-muted text-[14px] px-1 py-4">No matches.</p>
            ) : (
              <ul className="space-y-1">
                {results.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => navigate(`/send/${u.handle}`)}
                      className="w-full flex items-center gap-3 py-2.5 px-2 rounded-2xl active:bg-line-soft transition-colors text-left"
                    >
                      <Avatar user={u} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-[15px] tracking-tight">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="font-mono text-[12px] text-ink-muted">@{u.handle}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          recents.length > 0 && (
            <section>
              <h2 className="label-mono mb-2 px-1">Recent</h2>
              <ul className="space-y-1">
                {recents.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => navigate(`/send/${u.handle}`)}
                      className="w-full flex items-center gap-3 py-2.5 px-2 rounded-2xl active:bg-line-soft transition-colors text-left"
                    >
                      <Avatar user={u} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-[15px] tracking-tight">
                          {u.firstName}
                        </div>
                        <div className="font-mono text-[12px] text-ink-muted">@{u.handle}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        )}
      </div>
    </Screen>
  )
}
