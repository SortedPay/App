import { ArrowDown, Plus, Sparkles, Share2, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import Avatar from './Avatar'
import { Transaction, formatAUD, formatTimeOfDay } from '../lib/mockData'

interface Props {
  tx: Transaction
  /** When true, hides any "back" handling — used inside a sheet */
  inSheet?: boolean
}

export function TxDetailContent({ tx }: Props) {
  const isInflow = tx.amountCents > 0
  const cp = tx.counterparty

  return (
    <div>
      {/* Hero — avatar/icon + amount */}
      <div className="text-center pt-2 pb-6">
        {(tx.type === 'send' || tx.type === 'receive') && 'id' in cp ? (
          <motion.div
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="flex justify-center mb-4"
          >
            <Avatar user={cp} size="xl" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.92, rotate: -4 }}
            animate={{ scale: 1, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="flex justify-center mb-4"
          >
            <div
              className={`w-20 h-20 rounded-full border-[2.5px] border-ink flex items-center justify-center shadow-ink-sm ${
                tx.type === 'topup'
                  ? 'bg-butter'
                  : tx.type === 'cashout'
                  ? 'bg-sky'
                  : 'bg-lime'
              }`}
            >
              {tx.type === 'topup' ? (
                <Plus size={32} strokeWidth={2.8} />
              ) : tx.type === 'cashout' ? (
                <ArrowDown size={32} strokeWidth={2.8} />
              ) : (
                <Sparkles size={28} strokeWidth={2.4} />
              )}
            </div>
          </motion.div>
        )}

        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
          {tx.type === 'send'
            ? 'Sent to'
            : tx.type === 'receive'
            ? 'Received from'
            : tx.type === 'topup'
            ? 'Top up'
            : tx.type === 'cashout'
            ? 'Cash out'
            : 'Yield earned'}
        </p>

        <h1 className="font-display font-bold text-[22px] leading-tight tracking-tight mb-1">
          {tx.type === 'send' || tx.type === 'receive'
            ? `${cp.firstName} ${'lastName' in cp ? cp.lastName : ''}`
            : tx.type === 'topup'
            ? 'PayID transfer'
            : tx.type === 'cashout'
            ? 'To bank'
            : 'Daily payout'}
        </h1>

        <p
          className={`font-display font-bold text-[52px] leading-none tracking-[-0.05em] mt-3 ${
            isInflow ? 'text-ink' : 'text-ink-soft'
          }`}
        >
          {formatAUD(tx.amountCents, { showSign: isInflow })}
        </p>

        {tx.note && (
          <p className="text-ink-soft text-[14px] italic mt-3 max-w-[28ch] mx-auto">
            &ldquo;{tx.note}&rdquo;
          </p>
        )}
      </div>

      {/* Status pill */}
      <div className="flex justify-center mb-4">
        {tx.status === 'pending' ? (
          <span className="inline-flex items-center gap-1.5 bg-butter/30 border border-butter px-3 py-1 rounded-full">
            <AlertTriangle size={11} strokeWidth={2.5} className="text-ink-soft" />
            <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              Pending
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-lime-soft border border-lime-deep px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-lime-deep rounded-full" />
            <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink">
              Confirmed
            </span>
          </span>
        )}
      </div>

      {/* Detail rows */}
      <div className="bg-paper-elevated border border-line rounded-[18px] p-4 space-y-0">
        <DetailRow
          label="Date"
          value={new Date(tx.createdAt).toLocaleDateString('en-AU', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        />
        <Divider />
        <DetailRow label="Time" value={formatTimeOfDay(tx.createdAt)} />
        {tx.reference && (
          <>
            <Divider />
            <DetailRow
              label="Reference"
              value={<span className="font-mono text-[12px]">{tx.reference}</span>}
            />
          </>
        )}
        {(tx.type === 'send' || tx.type === 'receive') && 'handle' in cp && (
          <>
            <Divider />
            <DetailRow
              label="Handle"
              value={<span className="font-mono text-[13px]">@{cp.handle}</span>}
            />
          </>
        )}
        {(tx.type === 'send' || tx.type === 'receive' || tx.type === 'yield') && (
          <>
            <Divider />
            <DetailRow label="Network" value="Solana" />
          </>
        )}
        {(tx.type === 'send' || tx.type === 'receive') && (
          <>
            <Divider />
            <DetailRow label="Network fee" value="$0.0008" />
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-paper-elevated border-[2px] border-ink rounded-[14px] py-3 flex items-center justify-center gap-1.5 font-display font-bold text-[13px] tracking-tight active:translate-y-[2px] transition-transform shadow-ink-sm">
          <Share2 size={14} strokeWidth={2.4} />
          Share
        </button>
        {tx.type === 'send' && tx.status !== 'pending' && (
          <button className="flex-1 bg-ink text-paper border-[2px] border-ink rounded-[14px] py-3 flex items-center justify-center font-display font-bold text-[13px] tracking-tight active:translate-y-[2px] transition-transform shadow-ink-sm">
            Send again
          </button>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </span>
      <span className="font-display font-semibold text-[13px] text-ink">{value}</span>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-line" />
}
