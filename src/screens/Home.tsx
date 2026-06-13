import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUp, CreditCard, Plus, QrCode, Sparkles, HandCoins, Users } from 'lucide-react'
import Screen from '../components/Screen'
import Avatar from '../components/Avatar'
import { NumberTicker } from '../components/NumberTicker'
import { BottomSheet } from '../components/BottomSheet'
import { TxDetailContent } from '../components/TxDetailContent'
import PullToRefresh from '../components/PullToRefresh'
import { useStore } from '../lib/store'
import { formatAUD, formatRelativeTime, Transaction } from '../lib/mockData'
import { cascade, cardRise, softRise, popIn } from '../lib/motion'

export default function Home() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const avatarUrl = useStore((s) => s.avatarUrl)
  const balanceCents = useStore((s) => s.balanceCents)
  const pointsBalance = useStore((s) => s.pointsBalance)
  const pointsThisWeek = useStore((s) => s.pointsThisWeek)
  const transactions = useStore((s) => s.transactions)
  const requests = useStore((s) => s.requests)
  const payRequest = useStore((s) => s.payRequest)
  const declineRequest = useStore((s) => s.declineRequest)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)

  const recent = transactions.slice(0, 4)
  // Only pending received — these are the asks that need user action
  const pendingReceived = requests.filter((r) => r.direction === 'received' && r.status === 'pending')

  async function handlePay(id: string) {
    setPayingId(id)
    try {
      await payRequest(id)
    } catch {
      // Toast / error UI deferred to v0.4
    } finally {
      setPayingId(null)
    }
  }

  // Mock refresh — in v0.4 this re-fetches balance + recent tx from API
  async function handleRefresh() {
    await new Promise((r) => setTimeout(r, 700))
  }

  return (
    <Screen transition="fade" className="pt-2 pb-4">
      {/* Header — greeting + avatar (no animation, sits there) */}
      <header className="flex items-center justify-between pt-3 pb-5">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted mb-0.5">
            G&apos;day
          </p>
          <h1 className="font-display font-bold text-[32px] leading-none tracking-tightest">
            {user.firstName}
          </h1>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.1 }}
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        >
          <Avatar user={user} size="lg" imageUrl={avatarUrl} />
        </motion.button>
      </header>

      <PullToRefresh onRefresh={handleRefresh}>
      {/* Cascade — balance card (pop), points strip (rise), activity (rise) */}
      <motion.div variants={cascade} initial="hidden" animate="show">
        {/* Balance card — POPS in. This is the headline element. */}
        <motion.section
          variants={popIn}
          className="bg-ink rounded-[24px] px-5 pt-5 pb-4 mb-3 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(200, 241, 84, 0.12) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />
          <div className="relative">
            <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-paper/55 mb-1.5">
              Available balance
            </p>
            <NumberTicker
              valueCents={balanceCents}
              duration={900}
              render={({ dollars, cents }) => (
                <div className="flex items-baseline mb-4 leading-none numeric">
                  <span className="font-numeric font-semibold text-paper/55 text-[22px] mr-1 -translate-y-[2px]">
                    $
                  </span>
                  <span className="font-numeric font-bold text-paper text-[56px] tracking-[-0.04em]">
                    {dollars}
                  </span>
                  <span className="font-numeric font-semibold text-paper/55 text-[22px] ml-0.5">
                    .{cents}
                  </span>
                </div>
              )}
            />

            {/* Quick actions */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/send')}
                className="flex-1 bg-lime text-ink font-display font-bold text-[15px] tracking-tight rounded-[14px] py-3 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
              >
                <ArrowUp size={16} strokeWidth={2.8} />
                Send
              </button>
              <button
                onClick={() => navigate('/receive')}
                className="flex-1 bg-paper text-ink font-display font-bold text-[15px] tracking-tight rounded-[14px] py-3 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
              >
                <ArrowDown size={16} strokeWidth={2.8} />
                Receive
              </button>
              <button
                onClick={() => navigate('/topup')}
                className="w-11 bg-paper/15 text-paper rounded-[14px] py-3 flex items-center justify-center active:scale-[0.97] transition-transform"
                aria-label="Top up"
              >
                <Plus size={16} strokeWidth={2.8} />
              </button>
            </div>
          </div>
        </motion.section>

        {/* Fresh-user nudge — only when balance is zero. Lime accent so it pops. */}
        {balanceCents === 0 && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            onClick={() => navigate('/topup')}
            className="w-full bg-lime border-[1.5px] border-ink rounded-[16px] px-4 py-3 mb-3 flex items-center gap-3 active:translate-y-[1px] active:shadow-none shadow-ink-sm transition-all text-left"
          >
            <div className="w-9 h-9 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
              <Plus size={18} strokeWidth={2.8} className="text-lime" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
                Top up and start sending
              </p>
              <p className="font-body text-[12px] text-ink/65 mt-0.5 leading-[1.3]">
                PayID from your bank · arrives in seconds
              </p>
            </div>
            <ArrowRight size={16} strokeWidth={2.6} className="text-ink flex-shrink-0" />
          </motion.button>
        )}

        {/* Secondary actions — Request + Split */}
        <motion.div
          variants={cardRise}
          className="flex gap-2 mb-3"
        >
          <button
            onClick={() => navigate('/request')}
            className="flex-1 bg-paper-elevated border border-line rounded-[14px] py-2.5 px-3 flex items-center justify-center gap-1.5 active:bg-line-soft transition-colors"
          >
            <HandCoins size={15} strokeWidth={2.4} className="text-ink" />
            <span className="font-display font-bold text-[13px] tracking-tight text-ink">
              Request
            </span>
          </button>
          <button
            onClick={() => navigate('/split')}
            className="flex-1 bg-paper-elevated border border-line rounded-[14px] py-2.5 px-3 flex items-center justify-center gap-1.5 active:bg-line-soft transition-colors"
          >
            <Users size={15} strokeWidth={2.4} className="text-ink" />
            <span className="font-display font-bold text-[13px] tracking-tight text-ink">
              Split
            </span>
          </button>
        </motion.div>

        {/* Sorted Points strip — taps through to Perks */}
        <motion.button
          variants={cardRise}
          onClick={() => navigate('/perks')}
          className="bg-lime rounded-[16px] px-4 py-3 mb-5 flex items-center justify-between w-full active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} strokeWidth={2.6} className="text-ink" />
            <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink/65">
              Sorted Points
            </span>
            <span className="font-numeric font-bold text-[17px] tracking-[-0.02em] ml-1 numeric">
              {pointsBalance.toLocaleString('en-AU')}
            </span>
          </div>
          <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink">
            +{pointsThisWeek} this week →
          </span>
        </motion.button>

        {/* Pending requests — soft alert card for inbound asks */}
        {pendingReceived.length > 0 && (
          <motion.section variants={cardRise} className="mb-4">
            <header className="flex items-center justify-between mb-2.5 px-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                <h2 className="font-display font-bold text-[16px] tracking-tight">
                  {pendingReceived.length === 1
                    ? '1 mate is asking'
                    : `${pendingReceived.length} mates are asking`}
                </h2>
              </div>
            </header>
            <ul className="space-y-2">
              {pendingReceived.slice(0, 3).map((req) => {
                const cp = req.counterparty
                const amount = (req.amountCents / 100).toFixed(2)
                const isPaying = payingId === req.id
                return (
                  <li
                    key={req.id}
                    className="bg-paper-elevated border border-line rounded-[14px] p-3 flex items-center gap-3"
                  >
                    <Avatar user={cp} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
                        {cp.firstName} wants ${amount}
                      </div>
                      <div className="font-body text-[12px] text-ink-muted mt-0.5 leading-[1.3] truncate">
                        {req.note || `@${cp.handle}`}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => declineRequest(req.id)}
                        disabled={isPaying}
                        aria-label="Decline"
                        className="w-8 h-8 rounded-full bg-paper-elevated border border-line flex items-center justify-center active:bg-line-soft transition-colors disabled:opacity-50"
                      >
                        <span className="font-mono font-semibold text-[14px] text-ink-muted">✕</span>
                      </button>
                      <button
                        onClick={() => handlePay(req.id)}
                        disabled={isPaying}
                        className="px-3.5 py-1.5 rounded-full bg-lime border-[1.5px] border-ink shadow-ink-sm font-display font-bold text-[12px] text-ink active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-70"
                      >
                        {isPaying ? '…' : 'Pay'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </motion.section>
        )}

        {/* Activity preview — softRise, last in the cascade */}
        <motion.section variants={softRise}>
          <header className="flex items-center justify-between mb-2.5 px-2">
            <h2 className="font-display font-bold text-[16px] tracking-tight">Recent activity</h2>
            <button
              onClick={() => navigate('/activity')}
              className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink-muted active:text-ink"
            >
              See all →
            </button>
          </header>

          {recent.length === 0 ? (
            <div className="px-5 py-7 rounded-[14px] bg-paper-elevated/50 border border-dashed border-line text-center">
              <p className="font-display font-bold text-[16px] tracking-tight text-ink-muted leading-tight">
                No activity yet
              </p>
              <p className="text-[13px] text-ink-muted mt-1">Top up to get going</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((tx) => (
                <li key={tx.id}>
                  <ActivityRow tx={tx} onClick={() => setSelectedTx(tx)} />
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </motion.div>
      </PullToRefresh>

      {/* Bottom sheet for tx detail */}
      <BottomSheet open={!!selectedTx} onClose={() => setSelectedTx(null)}>
        {selectedTx && <TxDetailContent tx={selectedTx} />}
      </BottomSheet>
    </Screen>
  )
}

// ─── Activity row — card-style with subtle paper-elevated background + line border ───
export function ActivityRow({ tx, onClick }: { tx: Transaction; onClick?: () => void }) {
  const isInflow = tx.amountCents > 0
  const cp = tx.counterparty

  let title: string
  let subtitle: string
  if (tx.type === 'send') {
    title = cp.firstName + (cp.lastName ? ' ' + cp.lastName : '')
    subtitle = tx.note ?? `@${cp.handle}`
  } else if (tx.type === 'receive') {
    title = cp.firstName + (cp.lastName ? ' ' + cp.lastName : '')
    subtitle = tx.note ?? `@${cp.handle}`
  } else if (tx.type === 'topup') {
    title = 'Top up'
    subtitle = tx.status === 'pending' ? 'Pending…' : tx.note ?? 'Bank transfer'
  } else if (tx.type === 'cashout') {
    title = 'Cash out'
    subtitle = tx.note ?? 'To bank'
  } else {
    // Card tap — title is the merchant
    title = cp.firstName + (cp.lastName ? ' ' + cp.lastName : '')
    subtitle = tx.note ?? 'Card tap'
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] bg-paper-elevated border border-line active:bg-line-soft transition-colors text-left"
    >
      {/* Avatar / icon */}
      {(tx.type === 'send' || tx.type === 'receive') && 'id' in cp ? (
        <Avatar user={cp} size="md" />
      ) : (
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            tx.type === 'topup'
              ? 'bg-sky'
              : tx.type === 'cashout'
              ? 'bg-butter'
              : 'bg-plum'
          }`}
        >
          {tx.type === 'topup' ? (
            <Plus size={16} strokeWidth={2.8} className="text-ink" />
          ) : tx.type === 'cashout' ? (
            <ArrowDown size={16} strokeWidth={2.8} className="text-ink" />
          ) : (
            <CreditCard size={14} strokeWidth={2.5} className="text-paper" />
          )}
        </div>
      )}

      {/* Title + subtitle */}
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-[14px] tracking-tight text-ink truncate leading-[1.2]">
          {title}
        </div>
        <div className="text-[11px] text-ink-muted truncate leading-[1.3]">
          {subtitle} · {formatRelativeTime(tx.createdAt)}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <div
          className={`font-numeric font-bold text-[14px] tracking-tight numeric ${
            isInflow ? 'text-ink' : 'text-ink-soft'
          } ${tx.status === 'pending' ? 'opacity-50' : ''}`}
        >
          {formatAUD(tx.amountCents, { showSign: isInflow })}
        </div>
      </div>

      {/* Hidden QR icon — keeps spacing consistent */}
      <QrCode size={12} className="opacity-0 shrink-0" />
    </button>
  )
}
