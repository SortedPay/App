import { useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, Plus, Sparkles } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { useStore } from '../lib/store'
import { formatAUD, formatTimeOfDay } from '../lib/mockData'

export default function TxDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tx = useStore((s) => s.transactions.find((t) => t.id === id))

  if (!tx) {
    return (
      <Screen className="pt-2">
        <Header title="Not found" />
        <p className="text-ink-muted px-2 pt-6">Transaction not found.</p>
        <button onClick={() => navigate('/activity')} className="btn btn-primary mt-4">
          Back to activity
        </button>
      </Screen>
    )
  }

  const isInflow = tx.amountCents > 0
  const cp = tx.counterparty

  return (
    <Screen transition="modal" className="pt-2">
      <Header title="Transaction" />

      <div className="text-center pt-8 pb-10">
        {(tx.type === 'send' || tx.type === 'receive') && 'id' in cp ? (
          <div className="flex justify-center mb-5">
            <Avatar user={cp} size="huge" />
          </div>
        ) : (
          <div className="flex justify-center mb-5">
            <div
              className={`w-28 h-28 rounded-full border-[3px] border-ink flex items-center justify-center ${
                tx.type === 'topup'
                  ? 'bg-sky'
                  : tx.type === 'cashout'
                  ? 'bg-butter'
                  : 'bg-lime'
              }`}
            >
              {tx.type === 'topup' ? (
                <Plus size={48} strokeWidth={2.5} />
              ) : tx.type === 'cashout' ? (
                <ArrowDown size={48} strokeWidth={2.5} />
              ) : (
                <Sparkles size={42} strokeWidth={2.2} />
              )}
            </div>
          </div>
        )}

        <p className="label-mono mb-2">
          {tx.type === 'send'
            ? 'Sent to'
            : tx.type === 'receive'
            ? 'From'
            : tx.type === 'topup'
            ? 'Top up'
            : tx.type === 'cashout'
            ? 'Cash out'
            : 'Card tap'}
        </p>

        <h1 className="font-display font-bold text-[26px] leading-tight tracking-tight mb-2">
          {tx.type === 'send' || tx.type === 'receive'
            ? `${cp.firstName} ${'lastName' in cp ? cp.lastName : ''}`
            : tx.type === 'topup'
            ? 'PayID transfer'
            : tx.type === 'cashout'
            ? 'PayID transfer'
            : 'Daily payout'}
        </h1>

        <p
          className={`font-display font-bold text-[56px] leading-none tracking-tightest mt-4 ${
            isInflow ? 'text-ink' : 'text-ink-soft'
          }`}
        >
          {formatAUD(tx.amountCents, { showSign: isInflow })}
        </p>

        {tx.note && (
          <p className="text-ink-soft text-[15px] italic mt-4 max-w-[28ch] mx-auto">
            &ldquo;{tx.note}&rdquo;
          </p>
        )}
      </div>

      {/* Detail rows */}
      <div className="bg-paper-elevated border-2 border-ink rounded-3xl p-5 space-y-3 shadow-ink-sm">
        <DetailRow label="Status" value={
          <span className={`sticker text-[10px] !px-3 !py-1 ${tx.status === 'pending' ? 'sticker-butter' : 'sticker-lime'}`}>
            {tx.status === 'pending' ? 'Pending' : 'Confirmed'}
          </span>
        } />
        <DetailRow label="Date" value={new Date(tx.createdAt).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
        <DetailRow label="Time" value={formatTimeOfDay(tx.createdAt)} />
        {tx.reference && <DetailRow label="Reference" value={<span className="font-mono">{tx.reference}</span>} />}
        {(tx.type === 'send' || tx.type === 'receive') && 'handle' in cp && (
          <DetailRow label="Handle" value={<span className="font-mono">@{cp.handle}</span>} />
        )}
      </div>
    </Screen>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="label-mono">{label}</span>
      <span className="font-display font-semibold text-[14px] text-ink">{value}</span>
    </div>
  )
}
