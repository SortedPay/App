import { useMemo, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUp,
  ArrowDown,
  HandCoins,
  Star,
  MessageCircle,
} from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { BottomSheet } from '../components/BottomSheet'
import { TxDetailContent } from '../components/TxDetailContent'
import { useStore } from '../lib/store'
import {
  USERS_BY_HANDLE,
  formatAUD,
  formatRelativeTime,
  Transaction,
} from '../lib/mockData'
import { haptic } from '../lib/chime'

/**
 * ContactDetail — everything Hannah needs to know about one person.
 *
 * Header: large avatar, name, @handle, pin toggle
 * Net card: running balance with them (you sent more, they sent more, or even)
 * Quick actions row: Send / Request / Message
 * History: all tx between you, newest first, grouped by month
 *
 * This is the Cash App-killer view — they don't have anything this rich for
 * per-contact context.
 */
export default function ContactDetail() {
  const navigate = useNavigate()
  const { handle } = useParams<{ handle: string }>()
  const contacts = useStore((s) => s.contacts)
  const transactions = useStore((s) => s.transactions)
  const requests = useStore((s) => s.requests)
  const pinnedHandles = useStore((s) => s.pinnedHandles)
  const togglePinned = useStore((s) => s.togglePinned)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const user = handle
    ? contacts.find((c) => c.handle === handle) ?? USERS_BY_HANDLE.get(handle)
    : undefined

  // History with this person — sends + receives only (no taps / topup)
  const history = useMemo(() => {
    if (!handle) return []
    return transactions.filter(
      (tx) => (tx.type === 'send' || tx.type === 'receive') && tx.counterparty.handle === handle,
    )
  }, [transactions, handle])

  // Running totals
  const totals = useMemo(() => {
    let sent = 0
    let received = 0
    for (const tx of history) {
      if (tx.amountCents < 0) sent += Math.abs(tx.amountCents)
      else received += tx.amountCents
    }
    return { sent, received, net: received - sent }
  }, [history])

  // Pending requests with this person
  const pendingRequests = useMemo(() => {
    if (!handle) return []
    return requests.filter((r) => r.counterparty.handle === handle && r.status === 'pending')
  }, [requests, handle])

  if (!handle) return <Navigate to="/contacts" replace />
  // If they're not in our known user list, show a redirect rather than a broken screen
  if (!user) return <Navigate to="/contacts" replace />

  const isPinned = pinnedHandles.includes(handle)
  const totalCount = history.length

  // Group history by month for the section headers
  const groups = (() => {
    const map = new Map<string, Transaction[]>()
    for (const tx of history) {
      const d = new Date(tx.createdAt)
      const key = d.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(tx)
    }
    return map
  })()

  return (
    <>
      <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
        <Header
          title=""
          right={
            <button
              onClick={() => {
                haptic(10)
                togglePinned(handle)
              }}
              aria-label={isPinned ? 'Unpin' : 'Pin'}
              className="p-1.5 -m-1.5 rounded-full active:bg-line-soft transition-colors"
            >
              <Star
                size={18}
                strokeWidth={2.2}
                className={isPinned ? 'text-ink fill-lime' : 'text-ink-muted'}
              />
            </button>
          }
        />

        {/* Hero — big avatar + name + handle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center pt-2 pb-5"
        >
          <Avatar user={user} size="xl" />
          <h1 className="font-display font-bold text-[28px] tracking-tightest text-ink mt-3 leading-[1.05]">
            {user.firstName} {user.lastName}
          </h1>
          <p className="font-body text-[14px] text-ink-muted mt-1">@{user.handle}</p>
        </motion.div>

        {/* Net card — running balance with them */}
        {totalCount > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-ink rounded-[18px] px-4 py-3.5 mb-4 text-paper"
          >
            <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-paper/55 mb-1">
              {totals.net === 0
                ? 'All square'
                : totals.net > 0
                ? `${user.firstName} sent more`
                : `You sent more`}
            </p>
            <p
              className={`font-numeric font-bold text-[32px] leading-none tracking-[-0.04em] mb-3 ${
                totals.net > 0 ? 'text-lime' : totals.net < 0 ? 'text-coral' : 'text-paper'
              }`}
            >
              {totals.net === 0
                ? '$0.00'
                : `${totals.net > 0 ? '+' : '−'}${formatAUD(Math.abs(totals.net))}`}
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-paper/55 mb-0.5">
                  You sent
                </p>
                <p className="font-numeric font-bold text-[14px] text-paper numeric">
                  {formatAUD(totals.sent)}
                </p>
              </div>
              <div className="w-px h-8 bg-paper/15" />
              <div>
                <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-paper/55 mb-0.5">
                  Received
                </p>
                <p className="font-numeric font-bold text-[14px] text-paper numeric">
                  {formatAUD(totals.received)}
                </p>
              </div>
              <div className="w-px h-8 bg-paper/15" />
              <div>
                <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-paper/55 mb-0.5">
                  Times
                </p>
                <p className="font-numeric font-bold text-[14px] text-paper numeric">
                  {totalCount}
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="grid grid-cols-3 gap-2 mb-5"
        >
          <button
            onClick={() => navigate(`/send/${handle}`)}
            className="flex flex-col items-center gap-1 py-3 rounded-[14px] bg-lime border-[1.5px] border-ink shadow-ink-sm active:translate-y-[1px] active:shadow-none transition-all"
          >
            <ArrowUp size={18} strokeWidth={2.6} className="text-ink" />
            <span className="font-display font-bold text-[12px] tracking-tight text-ink">Send</span>
          </button>
          <button
            onClick={() => navigate(`/request/${handle}`)}
            className="flex flex-col items-center gap-1 py-3 rounded-[14px] bg-paper-elevated border border-line active:bg-line-soft transition-colors"
          >
            <HandCoins size={18} strokeWidth={2.4} className="text-ink" />
            <span className="font-display font-bold text-[12px] tracking-tight text-ink">
              Request
            </span>
          </button>
          <button
            onClick={() => {
              haptic(8)
              // In v0.5: opens in-app DM. For now, no-op with a toast feel.
            }}
            className="flex flex-col items-center gap-1 py-3 rounded-[14px] bg-paper-elevated border border-line active:bg-line-soft transition-colors"
          >
            <MessageCircle size={18} strokeWidth={2.4} className="text-ink" />
            <span className="font-display font-bold text-[12px] tracking-tight text-ink">
              Message
            </span>
          </button>
        </motion.div>

        {/* Pending requests row */}
        {pendingRequests.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-5"
          >
            <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2 px-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
              Pending
            </h2>
            <ul className="space-y-2">
              {pendingRequests.map((req) => (
                <li
                  key={req.id}
                  className="bg-lime-soft border border-lime-deep rounded-[14px] px-3 py-2.5 flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-lime border-[1.5px] border-ink rounded-full flex items-center justify-center flex-shrink-0">
                    <HandCoins size={16} strokeWidth={2.4} className="text-ink" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[13px] tracking-tight text-ink leading-[1.2]">
                      {req.direction === 'received'
                        ? `${user.firstName} wants ${formatAUD(req.amountCents)}`
                        : `You asked for ${formatAUD(req.amountCents)}`}
                    </div>
                    <div className="font-body text-[12px] text-ink-muted mt-0.5 truncate leading-[1.3]">
                      {req.note || `@${user.handle}`}
                    </div>
                  </div>
                  <div className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                    {req.direction === 'received' ? 'IN' : 'OUT'}
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* History */}
        {totalCount > 0 ? (
          <section>
            <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2.5 px-1">
              History
            </h2>
            {[...groups.entries()].map(([month, txs]) => (
              <div key={month} className="mb-4">
                <h3 className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-faint mb-2 px-2">
                  {month}
                </h3>
                <ul className="space-y-1.5">
                  {txs.map((tx) => {
                    const isOut = tx.amountCents < 0
                    return (
                      <li key={tx.id}>
                        <button
                          onClick={() => {
                            haptic(5)
                            setSelectedTx(tx)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] bg-paper-elevated border border-line active:bg-line-soft transition-colors text-left"
                        >
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-[1.5px] border-ink ${
                              isOut ? 'bg-paper' : 'bg-lime'
                            }`}
                          >
                            {isOut ? (
                              <ArrowUp size={14} strokeWidth={2.6} className="text-ink" />
                            ) : (
                              <ArrowDown size={14} strokeWidth={2.6} className="text-ink" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-display font-bold text-[13px] tracking-tight text-ink leading-[1.2] truncate">
                              {tx.note ?? (isOut ? `Sent to ${user.firstName}` : `From ${user.firstName}`)}
                            </div>
                            <div className="font-body text-[11px] text-ink-muted mt-0.5">
                              {formatRelativeTime(tx.createdAt)}
                            </div>
                          </div>
                          <div
                            className={`font-numeric font-bold text-[14px] tracking-tight numeric ${
                              isOut ? 'text-ink' : 'text-lime-deep'
                            }`}
                          >
                            {isOut ? '−' : '+'}
                            {formatAUD(Math.abs(tx.amountCents))}
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </section>
        ) : (
          <div className="bg-paper-elevated border border-dashed border-line rounded-[14px] p-5 text-center">
            <p className="font-display font-bold text-[15px] tracking-tight text-ink mb-1">
              No history yet
            </p>
            <p className="font-body text-[12px] text-ink-muted">
              Send your first dollar to {user.firstName} to start.
            </p>
          </div>
        )}
      </Screen>

      <BottomSheet open={!!selectedTx} onClose={() => setSelectedTx(null)}>
        {selectedTx && <TxDetailContent tx={selectedTx} />}
      </BottomSheet>
    </>
  )
}
