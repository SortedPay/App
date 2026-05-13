import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { NumberTicker } from '../components/NumberTicker'
import { useStore } from '../lib/store'
import { formatRelativeTime } from '../lib/mockData'
import { cascade, popIn, cardRise } from '../lib/motion'
import { playChime, haptic } from '../lib/chime'

export default function Yield() {
  const accruedYieldCents = useStore((s) => s.accruedYieldCents)
  const lifetimeYieldCents = useStore((s) => s.lifetimeYieldCents)
  const balanceCents = useStore((s) => s.balanceCents)
  const transactions = useStore((s) => s.transactions)
  const claimYield = useStore((s) => s.claimYield)
  const yieldTxs = transactions.filter((t) => t.type === 'yield').slice(0, 6)

  const [claimedToast, setClaimedToast] = useState<number | null>(null)

  function handleClaim() {
    const amount = claimYield()
    if (amount > 0) {
      // Light feedback — claiming yield is a small win, not a big celebration
      playChime('accent')
      haptic(15)
      setClaimedToast(amount)
      setTimeout(() => setClaimedToast(null), 2000)
    }
  }

  const canClaim = accruedYieldCents > 0
  const hasBalance = balanceCents > 0

  return (
    <Screen transition="modal" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="EARNINGS" />

      <motion.div variants={cascade} initial="hidden" animate="show">
        {/* Hero — 3.33% APY lime card, pops in */}
        <motion.section
          variants={popIn}
          className="bg-lime border-[2px] border-ink rounded-[24px] shadow-ink-md p-5 mb-3"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink/65">
              Your yield
            </span>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-ink ml-1"
            />
          <span className="font-mono font-semibold text-[9px] uppercase tracking-[0.14em] text-ink/65">
            Live
          </span>
        </div>

        <div className="flex items-baseline leading-[0.9] mb-1 numeric">
          <span
            className="font-numeric font-bold text-ink"
            style={{ fontSize: 80, letterSpacing: '-0.05em' }}
          >
            3.33
          </span>
          <span
            className="font-numeric font-bold text-ink ml-1"
            style={{ fontSize: 36, letterSpacing: '-0.04em' }}
          >
            %
          </span>
        </div>
        <div className="font-body text-[13px] text-ink-soft mt-1">
          APY · Compounds daily · No lock-up
        </div>
      </motion.section>

      {/* Accrued / Claim Now card — pops in (headline interaction) */}
        <motion.section
          variants={popIn}
          className="bg-paper-elevated border-[2px] border-ink rounded-[16px] shadow-ink p-4 mb-3"
        >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1">
              Rewards pending
            </p>
            <NumberTicker
              valueCents={accruedYieldCents}
              duration={400}
              render={({ dollars, cents }) => (
                <div className="flex items-baseline leading-none numeric">
                  <span className="font-numeric font-semibold text-ink-muted text-[20px] mr-0.5">
                    $
                  </span>
                  <span className="font-numeric font-bold text-ink text-[36px] tracking-[-0.035em]">
                    {dollars}
                  </span>
                  <span className="font-numeric font-semibold text-ink-muted text-[20px]">
                    .{cents}
                  </span>
                </div>
              )}
            />
            <p className="text-[12px] text-ink-muted mt-1.5">
              {hasBalance
                ? 'Earning every minute. Claim anytime.'
                : 'Top up to start earning yield.'}
            </p>
          </div>

          {/* Claim button — disabled when nothing to claim */}
          <button
            onClick={handleClaim}
            disabled={!canClaim}
            className={`flex-shrink-0 self-center px-4 py-2.5 rounded-full border-[1.5px] font-display font-bold text-[13px] tracking-tight transition-all ${
              canClaim
                ? 'bg-lime border-ink text-ink shadow-ink-sm active:translate-y-[2px] active:shadow-none'
                : 'bg-line-soft border-line text-ink-muted cursor-not-allowed'
            }`}
          >
            Claim now
          </button>
        </div>
      </motion.section>

      {/* Lifetime card */}
      <motion.section
        variants={cardRise}
        className="bg-paper-elevated border border-line rounded-[16px] p-4 mb-3"
      >
        <div className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1">
          Lifetime earned
        </div>
        <NumberTicker
          valueCents={lifetimeYieldCents}
          duration={900}
          render={({ dollars, cents }) => (
            <div className="flex items-baseline leading-none numeric">
              <span className="font-numeric font-semibold text-ink-muted text-[18px] mr-0.5">
                $
              </span>
              <span className="font-numeric font-bold text-ink text-[32px] tracking-[-0.035em]">
                {dollars}
              </span>
              <span className="font-numeric font-semibold text-ink-muted text-[18px]">
                .{cents}
              </span>
            </div>
          )}
        />
        <div className="text-[12px] text-ink-muted mt-1.5">
          Every cent you&apos;ve claimed, all-time.
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section
        variants={cardRise}
        className="bg-ink rounded-[16px] p-4 mb-5 text-paper"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-lime flex items-center justify-center">
            <span className="font-mono font-bold text-[10px] text-ink">i</span>
          </div>
          <span className="font-display font-bold text-[15px] tracking-tight">How it works</span>
        </div>

        <ul className="space-y-2">
          {[
            'Your AUDD balance earns 3.33% APY in real time',
            'Rewards accrue here until you tap Claim now',
            'Claimed yield moves into your spendable balance instantly',
            'Generated by Treasury-backed reserves on Solana',
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime flex-shrink-0 mt-[7px]" />
              <span className="text-[13px] leading-[1.45] text-paper/90">{text}</span>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Recent payouts (only when claims have happened) */}
        {yieldTxs.length > 0 && (
          <motion.section variants={cardRise}>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="font-display font-bold text-[16px] tracking-tight">Recent payouts</h2>
              <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                Last 7 days
              </span>
            </div>

            <ul className="space-y-2">
              {yieldTxs.map((tx) => (
                <li
                  key={tx.id}
                  className="bg-paper-elevated border border-line rounded-[14px] px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-lime border-[1.5px] border-ink flex items-center justify-center flex-shrink-0">
                    <Sparkles size={13} strokeWidth={2.5} className="text-ink" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[13px] tracking-tight leading-[1.2]">
                      Daily yield
                    </div>
                    <div className="text-[11px] text-ink-muted leading-[1.3]">
                      {formatRelativeTime(tx.createdAt)}
                    </div>
                  </div>
                  <div className="font-numeric font-bold text-[14px] tracking-tight text-ink numeric">
                    +${(Math.abs(tx.amountCents) / 100).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
      </motion.div>

      {/* Toast on successful claim */}
      <AnimatePresence>
        {claimedToast !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-ink text-paper px-5 py-3 rounded-2xl shadow-ink-md flex items-center gap-2.5 font-display font-semibold text-[14px] tracking-tight pointer-events-none max-w-[90vw]"
          >
            <Check size={14} strokeWidth={3} className="text-lime shrink-0" />
            Claimed ${(claimedToast / 100).toFixed(2)} into balance
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  )
}
