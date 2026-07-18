import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Copy, Settings as SettingsIcon, Share2, Sparkles, Users, Gift } from 'lucide-react'
import Screen from '../components/Screen'
import Avatar from '../components/Avatar'
import QrCode from '../components/QrCode'
import { useStore } from '../lib/store'
import { TIERS, tierFor } from '../lib/tiers'
import { cascade, popIn, cardRise, softRise, SPRING_SNAP } from '../lib/motion'

/**
 * Profile — the person, made shareable. (Stage 2 backlog item, built.)
 *
 * The idea from the pivot brief: every profile is an acquisition surface.
 * Splitting a bill at a table = scan a mate's QR. So the hero here is the
 * shareable @handle card, with tier flair on top and settings tucked below.
 */

const TIER_RING: Record<(typeof TIERS)[number]['color'], string> = {
  paper: 'ring-line',
  sky: 'ring-sky',
  butter: 'ring-butter',
  lime: 'ring-lime',
}

const TIER_CHIP: Record<(typeof TIERS)[number]['color'], string> = {
  paper: 'bg-paper-deep text-ink',
  sky: 'bg-sky text-ink',
  butter: 'bg-butter text-ink',
  lime: 'bg-lime text-ink',
}

export default function Me() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const avatarUrl = useStore((s) => s.avatarUrl)
  const pointsBalance = useStore((s) => s.pointsBalance)
  const pointsThisWeek = useStore((s) => s.pointsThisWeek)
  const contacts = useStore((s) => s.contacts)
  const [toast, setToast] = useState<string | null>(null)

  const { tier, next, progress } = tierFor(pointsBalance)
  const profileUrl = `app.paymentsorted.com/@${user.handle}`

  function showToast(label: string) {
    setToast(label)
    setTimeout(() => setToast(null), 1600)
  }

  function copyLink() {
    navigator.clipboard?.writeText(`https://${profileUrl}`)
    showToast('Link copied')
  }

  async function shareLink() {
    const url = `https://${profileUrl}`
    if (navigator.share) {
      try {
        await navigator.share({ title: `Pay @${user.handle} on Sorted`, url })
      } catch {
        // user dismissed the sheet — that's fine
      }
    } else {
      copyLink()
    }
  }

  return (
    <Screen transition="fade" className="pt-2 pb-4 px-6">
      <motion.div variants={cascade} initial="hidden" animate="show">
        {/* Header — matches Home's pattern (top-level tab, no back) */}
        <motion.header variants={softRise} className="flex items-start justify-between pt-3 pb-5">
          <div>
            <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted mb-0.5">
              Your account
            </p>
            <h1 className="font-display font-bold text-[32px] leading-none tracking-tightest">Profile</h1>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-full bg-paper-elevated border border-line flex items-center justify-center active:scale-[0.95] transition-transform"
            aria-label="Settings"
          >
            <SettingsIcon size={18} strokeWidth={2.5} className="text-ink" />
          </button>
        </motion.header>

        {/* Hero — avatar with tier ring + badge */}
        <motion.div variants={popIn} className="flex flex-col items-center pb-5">
          <div className={`rounded-full ring-4 ring-offset-4 ring-offset-paper ${TIER_RING[tier.color]} `}>
            <Avatar user={user} size="huge" imageUrl={avatarUrl} />
          </div>
          <motion.button
            onClick={() => navigate('/perks')}
            whileTap={{ scale: 0.96 }}
            transition={SPRING_SNAP}
            className={`mt-4 px-3.5 py-1.5 rounded-full border-[1.5px] border-ink shadow-ink-sm font-mono font-bold text-[10px] uppercase tracking-[0.16em] flex items-center gap-1.5 ${TIER_CHIP[tier.color]}`}
          >
            <Sparkles size={11} strokeWidth={2.5} />
            {tier.name}
          </motion.button>
          <h2 className="font-display font-bold text-[24px] tracking-tight mt-3 leading-none">
            {user.firstName} {user.lastName}
          </h2>
          <p className="font-mono font-semibold text-[13px] text-ink-muted mt-1.5 tracking-wider">@{user.handle}</p>
        </motion.div>

        {/* Shareable handle card — the acquisition surface */}
        <motion.div
          variants={cardRise}
          className="bg-ink rounded-[24px] border-[2.5px] border-ink shadow-ink-md p-5 mb-4 relative overflow-hidden"
        >
          {/* faint lime dot grid, same texture family as the Sorted card */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle, #C8F154 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
          <div className="relative flex items-center gap-5">
            <div className="w-[124px] h-[124px] shrink-0 bg-ink rounded-[14px]">
              <QrCode payload={`https://${profileUrl}`} className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.18em] text-paper/55 mb-1">
                Scan to pay me
              </p>
              <p className="font-display font-bold text-[22px] text-paper leading-none tracking-tight truncate">
                @{user.handle}
              </p>
              <p className="font-mono text-[10px] text-paper/60 mt-1.5 tracking-wide truncate">{profileUrl}</p>
              <div className="flex gap-2 mt-3.5">
                <motion.button
                  onClick={copyLink}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_SNAP}
                  className="bg-paper text-ink font-display font-bold text-[12px] rounded-full px-3.5 py-1.5 flex items-center gap-1.5"
                >
                  <Copy size={12} strokeWidth={2.5} />
                  Copy
                </motion.button>
                <motion.button
                  onClick={shareLink}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_SNAP}
                  className="bg-lime text-ink font-display font-bold text-[12px] rounded-full px-3.5 py-1.5 flex items-center gap-1.5 border border-ink"
                >
                  <Share2 size={12} strokeWidth={2.5} />
                  Share
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Points summary → Perks */}
        <motion.button
          variants={cardRise}
          onClick={() => navigate('/perks')}
          className="w-full bg-lime-soft border border-line rounded-[16px] p-4 mb-4 text-left active:translate-y-[1px] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-ink-muted mb-1">
                Sorted Points
              </p>
              <p className="font-display font-bold text-[22px] leading-none tracking-tight">
                {pointsBalance.toLocaleString('en-AU')}
                <span className="text-[13px] text-ink-muted font-body font-semibold ml-2">
                  +{pointsThisWeek} this week
                </span>
              </p>
            </div>
            <ChevronRight size={18} strokeWidth={2.5} className="text-ink-muted" />
          </div>
          {/* tier progress */}
          <div className="mt-3 h-2 rounded-full bg-paper border border-line overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              className="h-full bg-lime border-r border-ink/30"
            />
          </div>
          <p className="font-mono text-[9.5px] text-ink-muted mt-1.5 tracking-wide uppercase">
            {next ? `${(next.min - pointsBalance).toLocaleString('en-AU')} pts to ${next.name}` : 'Top tier. Icon status.'}
          </p>
        </motion.button>

        {/* Quick rows */}
        <motion.div variants={cardRise} className="bg-paper-elevated border border-line rounded-[16px] overflow-hidden">
          {[
            { icon: Users, label: 'Contacts', sub: `${contacts.length} mates`, to: '/contacts' },
            { icon: Gift, label: 'Invite mates', sub: 'Share Sorted, both win', to: '/referrals' },
            { icon: SettingsIcon, label: 'Settings', sub: 'Security, limits, notifications', to: '/settings' },
          ].map((row, i, arr) => {
            const Icon = row.icon
            return (
              <button
                key={row.label}
                onClick={() => navigate(row.to)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-paper-deep transition-colors ${
                  i < arr.length - 1 ? 'border-b border-line' : ''
                }`}
              >
                <span className="w-9 h-9 rounded-[10px] bg-paper border border-line flex items-center justify-center">
                  <Icon size={16} strokeWidth={2.5} className="text-ink" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-bold text-[15px] tracking-tight text-ink">{row.label}</span>
                  <span className="block font-body text-[12px] text-ink-muted">{row.sub}</span>
                </span>
                <ChevronRight size={16} strokeWidth={2.5} className="text-ink-faint" />
              </button>
            )
          })}
        </motion.div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={SPRING_SNAP}
            className="fixed bottom-36 inset-x-0 mx-auto w-fit bg-ink text-paper font-display font-bold text-[13px] px-4 py-2.5 rounded-full shadow-ink-sm z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  )
}
