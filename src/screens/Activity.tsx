import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import Screen from '../components/Screen'
import { ActivityRow } from './Home'

export default function Activity() {
  const navigate = useNavigate()
  const transactions = useStore((s) => s.transactions)

  // Group by day
  const groups = new Map<string, typeof transactions>()
  for (const tx of transactions) {
    const d = new Date(tx.createdAt)
    const key = d.toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }

  return (
    <Screen transition="fade" className="pt-2 pb-4">
      <header className="pt-4 pb-6 flex items-center justify-between">
        <div>
          <p className="label-mono mb-1">All</p>
          <h1 className="font-display font-bold text-[32px] leading-none tracking-tightest">
            Activity.
          </h1>
        </div>
      </header>

      {[...groups.entries()].map(([dateLabel, txs]) => (
        <section key={dateLabel} className="mb-6">
          <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted mb-2 px-2 sticky top-0 bg-paper py-1.5 z-10">
            {dateLabel}
          </h2>
          <ul className="space-y-1">
            {txs.map((tx) => (
              <li key={tx.id}>
                <ActivityRow tx={tx} onClick={() => navigate(`/activity/${tx.id}`)} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Screen>
  )
}
