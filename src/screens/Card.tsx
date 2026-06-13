import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Snowflake, Sparkles } from 'lucide-react'
import Screen from '../components/Screen'
import { useStore } from '../lib/store'
import { cascade, cardRise, popIn, softRise } from '../lib/motion'
import { ActivityRow } from './Home'

/**
 * Card — the Sorted card lives here. Tap to pay anywhere Mastercard works,
 * straight from the balance. Freeze in one tap. Every tap earns Sorted Points.
 */
export default function Card() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const card = useStore((s) => s.card)
  const toggleCardFreeze = useStore((s) => s.toggleCardFreeze)
  const transactions = useStore((s) => s.transactions)

  const frozen = card.status === 'frozen'
  const recentTaps = transactions.filter((t) => t.type === 'tap').slice(0, 5)

  return (
    <Screen transition="fade" className="pt-2 pb-4">
      <header className="pt-3 pb-5">
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted mb-0.5">
          Tap to pay
        </p>
        <h1 className="font-display font-bold text-[32px] leading-none tracking-tightest">Card</h1>
      </header>

      <motion.div variants={cascade} initial="hidden" animate="show">
        {/* The card itself */}
        <motion.div variants={popIn} className="relative mb-4">
          <motion.div
            animate={{
              opacity: frozen ? 0.55 : 1,
              filter: frozen ? 'grayscale(1)' : 'grayscale(0)',
            }}
            transition={{ duration: 0.35 }}
            className="bg-ink rounded-[20px] aspect-[1.586] p-5 flex flex-col relative overflow-hidden"
          >
            {/* Decorative lime disc — matches the brand card on the site */}
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-lime/15" />

            <div className="relative flex items-center justify-between">
              <span className="font-display font-bold text-[20px] tracking-tight text-paper">
                Sorted
              </span>
              <span className="w-9 h-6 rounded-md bg-lime border border-ink/40" />
            </div>

            <div className="relative mt-auto">
              <p className="font-mono font-semibold text-[16px] tracking-[0.08em] text-paper/90">
                @{user.handle}
              </p>
              <p className="font-mono text-[11px] tracking-[0.14em] text-paper/50 mt-1">
                •••• {card.last4}
              </p>
            </div>

            <div className="relative flex items-end justify-between mt-4">
              <span className="font-mono font-semibold text-[9px] uppercase tracking-[0.18em] text-paper/60">
                Tap to pay
              </span>
              <span className="flex">
                <span className="w-6 h-6 rounded-full bg-coral/90 block" />
                <span className="w-6 h-6 rounded-full bg-butter/90 block -ml-2.5" />
              </span>
            </div>
          </motion.div>

          {/* Frozen badge */}
          {frozen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="bg-paper border-[1.5px] border-ink shadow-ink-sm rounded-full px-4 py-2 flex items-center gap-2">
                <Snowflake size={14} strokeWidth={2.6} className="text-ink" />
                <span className="font-mono font-semibold text-[11px] uppercase tracking-[0.16em] text-ink">
                  Frozen
                </span>
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Freeze toggle */}
        <motion.button
          variants={cardRise}
          onClick={toggleCardFreeze}
          className="w-full bg-paper-elevated border border-line rounded-[14px] px-4 py-3 mb-2 flex items-center gap-3 active:bg-line-soft transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-full bg-sky flex items-center justify-center flex-shrink-0">
            <Snowflake size={16} strokeWidth={2.4} className="text-ink" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
              {frozen ? 'Card frozen' : 'Freeze card'}
            </p>
            <p className="font-body text-[12px] text-ink-muted mt-0.5 leading-[1.3]">
              {frozen ? 'Every tap is blocked. Unfreeze any time.' : 'Blocks every tap instantly'}
            </p>
          </div>
          {/* Switch */}
          <span
            className={`w-12 h-7 rounded-full border-[1.5px] border-ink flex items-center px-0.5 transition-colors flex-shrink-0 ${
              frozen ? 'bg-sky justify-end' : 'bg-paper justify-start'
            }`}
          >
            <motion.span layout className="w-5 h-5 rounded-full bg-ink block" />
          </span>
        </motion.button>

        {/* Points-per-tap row */}
        <motion.div
          variants={cardRise}
          className="bg-lime rounded-[14px] px-4 py-3 mb-2 flex items-center gap-3"
        >
          <Sparkles size={16} strokeWidth={2.6} className="text-ink flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
              +1 Sorted Point per $1
            </p>
            <p className="font-body text-[12px] text-ink/65 mt-0.5 leading-[1.3]">
              On every tap, automatic. Points unlock Sorted Perks.
            </p>
          </div>
        </motion.div>

        {/* Recent taps */}
        <motion.section variants={softRise} className="mt-5">
          <header className="flex items-center justify-between mb-2.5 px-2">
            <h2 className="font-display font-bold text-[16px] tracking-tight">Recent taps</h2>
            <button
              onClick={() => navigate('/activity')}
              className="font-mono font-semibold text-[10px] uppercase tracking-[0.14em] text-ink-muted active:text-ink"
            >
              See all →
            </button>
          </header>
          {recentTaps.length === 0 ? (
            <div className="px-5 py-7 rounded-[14px] bg-paper-elevated/50 border border-dashed border-line text-center">
              <p className="font-display font-bold text-[16px] tracking-tight text-ink-muted leading-tight">
                No taps yet
              </p>
              <p className="text-[13px] text-ink-muted mt-1">First coffee's on the card</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentTaps.map((tx) => (
                <li key={tx.id}>
                  <ActivityRow tx={tx} onClick={() => navigate(`/activity/${tx.id}`)} />
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        <p className="text-center font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-faint mt-6">
          Demo card · rolls out with launch
        </p>
      </motion.div>
    </Screen>
  )
}
