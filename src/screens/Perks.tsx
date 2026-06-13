import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUp,
  BadgeCheck,
  ChevronRight,
  CreditCard,
  Flame,
  Gift,
  Lock,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import Screen from '../components/Screen'
import { useStore } from '../lib/store'
import { formatRelativeTime } from '../lib/mockData'
import { cascade, cardRise, popIn, softRise } from '../lib/motion'

/**
 * Perks — Sorted Points HQ. Points come from ACTIONS (sends, taps,
 * referrals) — never from balance held or time elapsed. Loyalty, not
 * interest. The tier ladder is status + flair, never money.
 */

const TIERS = [
  { name: 'Fresh', min: 0 },
  { name: 'Local', min: 500 },
  { name: 'Legend', min: 2500 },
  { name: 'Icon', min: 10000 },
] as const

const EARN_RULES = [
  { icon: ArrowUp, bubble: 'bg-lime', iconClass: 'text-ink', label: 'Send to a mate', sub: 'Min $5 · up to 5 a day', pts: '+10' },
  { icon: UserPlus, bubble: 'bg-coral', iconClass: 'text-ink', label: 'First send to someone new', sub: 'Grow the circle', pts: '+25' },
  { icon: CreditCard, bubble: 'bg-plum', iconClass: 'text-paper', label: 'Tap your card', sub: 'Automatic on every tap', pts: '+1/$1' },
  { icon: Flame, bubble: 'bg-butter', iconClass: 'text-ink', label: '7-day streak', sub: 'Stay active all week', pts: '×1.5' },
  { icon: Gift, bubble: 'bg-sky', iconClass: 'text-ink', label: 'Refer a mate', sub: 'When they make their first send', pts: '+500', to: '/referrals' },
  { icon: BadgeCheck, bubble: 'bg-lime', iconClass: 'text-ink', label: 'Complete your profile', sub: 'One-off', pts: '+100' },
]

const PERK_TEASERS = [
  { name: 'Corner Cafe', perk: '$3 off your morning coffee' },
  { name: 'The Local', perk: 'Parmy + pint deal, Thursdays' },
  { name: 'Gelato Messina', perk: 'Free scoop upgrade' },
]

export default function Perks() {
  const navigate = useNavigate()
  const pointsBalance = useStore((s) => s.pointsBalance)
  const pointsThisWeek = useStore((s) => s.pointsThisWeek)
  const pointsHistory = useStore((s) => s.pointsHistory)

  // Tier maths — find the current rung and progress to the next
  const tierIdx = TIERS.reduce((acc, t, i) => (pointsBalance >= t.min ? i : acc), 0)
  const tier = TIERS[tierIdx]
  const nextTier = TIERS[tierIdx + 1]
  const progress = nextTier
    ? Math.min(1, (pointsBalance - tier.min) / (nextTier.min - tier.min))
    : 1

  return (
    <Screen transition="fade" className="pt-2 pb-4">
      <header className="pt-3 pb-5">
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted mb-0.5">
          Sorted Points
        </p>
        <h1 className="font-display font-bold text-[32px] leading-none tracking-tightest">Perks</h1>
      </header>

      <motion.div variants={cascade} initial="hidden" animate="show">
        {/* Points hero */}
        <motion.section variants={popIn} className="bg-lime rounded-[24px] px-5 pt-5 pb-4 mb-3 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-ink/8" />
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink/65">
                Your points
              </p>
              <span className="bg-ink rounded-full px-3 py-1 font-mono font-semibold text-[9px] uppercase tracking-[0.18em] text-lime">
                {tier.name}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-numeric font-bold text-[56px] leading-none tracking-[-0.04em] text-ink numeric">
                {pointsBalance.toLocaleString('en-AU')}
              </span>
              <span className="font-mono font-semibold text-[11px] uppercase tracking-[0.14em] text-ink/65">
                +{pointsThisWeek} this week
              </span>
            </div>

            {/* Tier progress */}
            {nextTier && (
              <div>
                <div className="h-2 rounded-full bg-ink/10 overflow-hidden mb-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    className="h-full rounded-full bg-ink"
                  />
                </div>
                <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-ink/65">
                  {(nextTier.min - pointsBalance).toLocaleString('en-AU')} to {nextTier.name}
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Design-law line — keep this honest and visible */}
        <motion.p
          variants={cardRise}
          className="text-center font-mono font-semibold text-[9.5px] uppercase tracking-[0.14em] text-ink-muted mb-5 px-4 leading-[1.6]"
        >
          Points come from what you do — never from how much you hold
        </motion.p>

        {/* How you earn */}
        <motion.section variants={cardRise} className="mb-5">
          <h2 className="font-display font-bold text-[16px] tracking-tight mb-2.5 px-2">
            How you earn
          </h2>
          <ul className="space-y-2">
            {EARN_RULES.map((rule) => {
              const Icon = rule.icon
              const Row = (
                <>
                  <div className={`w-9 h-9 rounded-full ${rule.bubble} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} strokeWidth={2.4} className={rule.iconClass} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
                      {rule.label}
                    </p>
                    <p className="font-body text-[11.5px] text-ink-muted mt-0.5 leading-[1.3]">{rule.sub}</p>
                  </div>
                  <span className="font-numeric font-bold text-[14px] tracking-tight text-ink numeric flex-shrink-0">
                    {rule.pts}
                  </span>
                  {rule.to && <ChevronRight size={14} strokeWidth={2.4} className="text-ink-muted flex-shrink-0" />}
                </>
              )
              return (
                <li key={rule.label}>
                  {rule.to ? (
                    <button
                      onClick={() => navigate(rule.to!)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] bg-paper-elevated border border-line active:bg-line-soft transition-colors text-left"
                    >
                      {Row}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] bg-paper-elevated border border-line">
                      {Row}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </motion.section>

        {/* Perks teasers — locked until launch */}
        <motion.section variants={softRise} className="mb-5">
          <h2 className="font-display font-bold text-[16px] tracking-tight mb-2.5 px-2">
            Sorted Perks
          </h2>
          <ul className="space-y-2">
            {PERK_TEASERS.map((p) => (
              <li
                key={p.name}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] bg-paper-elevated/60 border border-dashed border-line"
              >
                <div className="w-9 h-9 rounded-full bg-line-soft border border-line flex items-center justify-center flex-shrink-0">
                  <Lock size={14} strokeWidth={2.4} className="text-ink-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[14px] tracking-tight text-ink/75 leading-[1.2]">
                    {p.name}
                  </p>
                  <p className="font-body text-[11.5px] text-ink-muted mt-0.5 leading-[1.3]">{p.perk}</p>
                </div>
                <span className="font-mono font-semibold text-[8.5px] uppercase tracking-[0.14em] text-ink-muted bg-line-soft rounded-full px-2.5 py-1 flex-shrink-0">
                  With launch
                </span>
              </li>
            ))}
          </ul>
          <p className="font-body text-[11.5px] text-ink-muted mt-2.5 px-2 leading-[1.45]">
            Local Aussie businesses, unlocked with points. We're building the network now —
            starting close to home.
          </p>
        </motion.section>

        {/* Recent points */}
        <motion.section variants={softRise}>
          <h2 className="font-display font-bold text-[16px] tracking-tight mb-2.5 px-2">
            Recent points
          </h2>
          <ul className="space-y-1.5">
            {pointsHistory.slice(0, 6).map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 px-3 py-2 rounded-[12px] bg-paper-elevated border border-line"
              >
                <Sparkles size={13} strokeWidth={2.5} className="text-ink-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-body text-[13px] text-ink truncate">
                    {entry.label ?? entry.source}
                  </span>
                  <span className="font-body text-[11px] text-ink-muted ml-2">
                    {formatRelativeTime(entry.createdAt)}
                  </span>
                </div>
                <span className="font-numeric font-bold text-[13px] tracking-tight text-ink numeric flex-shrink-0">
                  +{entry.amount}
                </span>
              </li>
            ))}
          </ul>
        </motion.section>
      </motion.div>
    </Screen>
  )
}
