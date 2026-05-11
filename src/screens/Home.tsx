import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, Plus, QrCode, Sparkles } from 'lucide-react'
import Screen from '../components/Screen'
import Avatar from '../components/Avatar'
import { useStore } from '../lib/store'
import { formatAUD, formatRelativeTime, Transaction } from '../lib/mockData'

export default function Home() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const balanceCents = useStore((s) => s.balanceCents)
  const yieldTodayCents = useStore((s) => s.yieldTodayCents)
  const transactions = useStore((s) => s.transactions)

  const dollarPart = Math.floor(balanceCents / 100).toLocaleString('en-AU')
  const centsPart = String(balanceCents % 100).padStart(2, '0')

  const recent = transactions.slice(0, 4)

  return (
    <Screen transition="fade" className="pt-2 pb-4">
      {/* Header — greeting + avatar */}
      <header className="flex items-center justify-between pt-3 pb-5">
        <div>
          <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted mb-0.5">
            G&apos;day
          </p>
          <h1 className="font-display font-bold text-[32px] leading-none tracking-tightest">
            {user.firstName}
          </h1>
        </div>
        <button onClick={() => navigate('/settings')} aria-label="Settings">
          <Avatar user={user} size="lg" />
        </button>
      </header>

      {/* Balance card — refined: muted currency symbol, balanced cents weight */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
          <div className="flex items-baseline mb-4 leading-none">
            <span className="font-display font-semibold text-paper/65 text-[22px] mr-1 -translate-y-[2px]">
              $
            </span>
            <motion.span
              key={dollarPart}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-bold text-paper text-[56px] tracking-tightest"
            >
              {dollarPart}
            </motion.span>
            <span className="font-display font-semibold text-paper/65 text-[22px] ml-0.5">
              .{centsPart}
            </span>
          </div>

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

      {/* Earnings strip — single horizontal bar (like the mockup) */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="bg-lime rounded-[16px] px-4 py-3 mb-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} strokeWidth={2.5} className="text-ink" />
          <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink/65">
            Earned today
          </span>
          <span className="font-display font-bold text-[18px] tracking-tighter ml-1.5">
            {formatAUD(yieldTodayCents, { showSign: true })}
          </span>
        </div>
        <div className="font-mono font-semibold text-[11px] tracking-wide text-ink">
          <span className="font-display font-bold text-[14px] tracking-tighter mr-1">3.33%</span>
          APY
        </div>
      </motion.section>

      {/* Activity preview */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
      >
        <header className="flex items-center justify-between mb-2.5 px-2">
          <h2 className="font-display font-bold text-[16px] tracking-tight">Recent activity</h2>
          <button
            onClick={() => navigate('/activity')}
            className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink-muted active:text-ink"
          >
            See all →
          </button>
        </header>

        <ul className="space-y-2">
          {recent.map((tx) => (
            <li key={tx.id}>
              <ActivityRow tx={tx} onClick={() => navigate(`/activity/${tx.id}`)} />
            </li>
          ))}
        </ul>
      </motion.section>
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
    title = 'Yield earned'
    subtitle = 'Daily payout'
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
              : 'bg-lime'
          }`}
        >
          {tx.type === 'topup' ? (
            <Plus size={16} strokeWidth={2.8} className="text-ink" />
          ) : tx.type === 'cashout' ? (
            <ArrowDown size={16} strokeWidth={2.8} className="text-ink" />
          ) : (
            <Sparkles size={14} strokeWidth={2.5} className="text-ink" />
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
          className={`font-display font-bold text-[14px] tracking-tight ${
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
