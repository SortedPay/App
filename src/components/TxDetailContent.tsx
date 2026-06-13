import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDown,
  Plus,
  Sparkles,
  Share2,
  AlertTriangle,
  ChevronDown,
  ArrowUp,
  HandCoins,
  User as UserIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from './Avatar'
import { Transaction, formatAUD, formatTimeOfDay } from '../lib/mockData'
import { useStore } from '../lib/store'
import { haptic } from '../lib/chime'

interface Props {
  tx: Transaction
  /** Called when user taps Send Again / Request / View Contact so the parent can close the sheet first */
  onAction?: () => void
}

/**
 * TxDetailContent — the bottom-sheet content shown when a user taps a tx.
 *
 * Designed to feel like a Cash App-tier receipt detail:
 *   - Hero: large avatar/icon + person name + big amount
 *   - Status pill (Confirmed / Pending)
 *   - Action row: Send again / Request / View contact (sends/receives only)
 *   - Receipt rows: Date, Time, Note (always visible)
 *   - Collapsible "View on-chain" section with Network, Fee, Reference,
 *     Settled in — power users tap to expand, consumers ignore.
 */
export function TxDetailContent({ tx, onAction }: Props) {
  const navigate = useNavigate()
  const togglePinned = useStore((s) => s.togglePinned)
  const pinnedHandles = useStore((s) => s.pinnedHandles)
  const [showChain, setShowChain] = useState(false)

  const isInflow = tx.amountCents > 0
  const cp = tx.counterparty
  const isSendReceive = tx.type === 'send' || tx.type === 'receive'
  const cpHandle = 'handle' in cp ? cp.handle : null
  const isPinned = cpHandle ? pinnedHandles.includes(cpHandle) : false

  function go(path: string) {
    haptic(8)
    onAction?.()
    // small delay so the sheet has time to start closing before the route flips
    setTimeout(() => navigate(path), 30)
  }

  return (
    <div>
      {/* Hero — avatar/icon + amount */}
      <div className="text-center pt-2 pb-5">
        {isSendReceive && 'id' in cp ? (
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
                tx.type === 'topup' ? 'bg-butter' : tx.type === 'cashout' ? 'bg-sky' : 'bg-lime'
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
            : 'Card tap'}
        </p>

        <h1 className="font-display font-bold text-[22px] leading-tight tracking-tight mb-1">
          {isSendReceive
            ? `${cp.firstName} ${'lastName' in cp ? cp.lastName : ''}`
            : tx.type === 'topup'
            ? 'PayID transfer'
            : tx.type === 'cashout'
            ? 'To bank'
            : 'Daily payout'}
        </h1>
        {isSendReceive && cpHandle && (
          <p className="font-body text-[12px] text-ink-muted">@{cpHandle}</p>
        )}

        <p
          className={`font-numeric font-bold text-[52px] leading-none tracking-[-0.05em] mt-3 numeric ${
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
              Confirmed · {tx.type === 'topup' || tx.type === 'cashout' ? 'minutes' : 'instant'}
            </span>
          </span>
        )}
      </div>

      {/* Action row — only for send/receive (the social ones) */}
      {isSendReceive && cpHandle && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => go(`/send/${cpHandle}`)}
            className="flex flex-col items-center gap-1 py-2.5 rounded-[12px] bg-lime border-[1.5px] border-ink shadow-ink-sm active:translate-y-[1px] active:shadow-none transition-all"
          >
            <ArrowUp size={16} strokeWidth={2.6} className="text-ink" />
            <span className="font-display font-bold text-[11px] tracking-tight text-ink">
              {tx.type === 'send' ? 'Send again' : 'Send'}
            </span>
          </button>
          <button
            onClick={() => go(`/request/${cpHandle}`)}
            className="flex flex-col items-center gap-1 py-2.5 rounded-[12px] bg-paper-elevated border border-line active:bg-line-soft transition-colors"
          >
            <HandCoins size={16} strokeWidth={2.4} className="text-ink" />
            <span className="font-display font-bold text-[11px] tracking-tight text-ink">
              Request
            </span>
          </button>
          <button
            onClick={() => go(`/contacts/${cpHandle}`)}
            className="flex flex-col items-center gap-1 py-2.5 rounded-[12px] bg-paper-elevated border border-line active:bg-line-soft transition-colors"
          >
            <UserIcon size={16} strokeWidth={2.4} className="text-ink" />
            <span className="font-display font-bold text-[11px] tracking-tight text-ink">
              Profile
            </span>
          </button>
        </div>
      )}

      {/* Receipt rows — always visible */}
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
        {tx.note && (
          <>
            <Divider />
            <DetailRow label="Note" value={tx.note} />
          </>
        )}
      </div>

      {/* On-chain section — collapsible. Power users tap, consumers don't see crypto detail. */}
      {(isSendReceive || tx.type === 'tap') && (
        <div className="mt-3">
          <button
            onClick={() => {
              haptic(5)
              setShowChain((s) => !s)
            }}
            className="w-full flex items-center justify-between px-1 py-2 active:bg-line-soft/40 rounded-md transition-colors"
            aria-expanded={showChain}
          >
            <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              View on-chain
            </span>
            <motion.span
              animate={{ rotate: showChain ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} strokeWidth={2.4} className="text-ink-muted" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {showChain && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-paper-elevated border border-line rounded-[14px] p-4 mt-1 space-y-0">
                  <DetailRow label="Network" value="Solana" />
                  {tx.type !== 'tap' && (
                    <>
                      <Divider />
                      <DetailRow label="Network fee" value="$0.0008" />
                    </>
                  )}
                  {tx.reference && (
                    <>
                      <Divider />
                      <DetailRow
                        label="Transaction ID"
                        value={
                          <span className="font-mono text-[12px] text-ink">{tx.reference}</span>
                        }
                      />
                    </>
                  )}
                  <Divider />
                  <DetailRow label="Settled in" value="1.8s" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Secondary footer actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            haptic(8)
            // In v0.5 this opens the native share sheet with a receipt link
          }}
          className="flex-1 bg-paper-elevated border-[1.5px] border-line rounded-[12px] py-2.5 flex items-center justify-center gap-1.5 font-display font-bold text-[12px] tracking-tight active:bg-line-soft transition-colors"
        >
          <Share2 size={13} strokeWidth={2.4} />
          Share receipt
        </button>
        {isSendReceive && cpHandle && (
          <button
            onClick={() => {
              haptic(10)
              togglePinned(cpHandle)
            }}
            className={`flex-1 rounded-[12px] py-2.5 flex items-center justify-center gap-1.5 font-display font-bold text-[12px] tracking-tight border-[1.5px] transition-colors ${
              isPinned
                ? 'bg-lime border-ink text-ink'
                : 'bg-paper-elevated border-line text-ink active:bg-line-soft'
            }`}
          >
            {isPinned ? 'Pinned' : 'Pin contact'}
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
      <span className="font-display font-semibold text-[13px] text-ink text-right">{value}</span>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-line" />
}
