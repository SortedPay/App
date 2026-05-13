import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Share2, UserPlus, Sparkles } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { useStore } from '../lib/store'
import { REFERRAL_REWARD_CENTS } from '../lib/store'
import { formatRelativeTime } from '../lib/mockData'
import { cascade, popIn, cardRise, softRise } from '../lib/motion'

export default function Referrals() {
  const referralCode = useStore((s) => s.referralCode)
  const referrals = useStore((s) => s.referrals)
  const addReferral = useStore((s) => s.addReferral)
  const simulateClaim = useStore((s) => s._simulateReferralClaim)

  const [copied, setCopied] = useState(false)
  const [friendHandle, setFriendHandle] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  // Stats — confirmed count + total earned
  const stats = useMemo(() => {
    const confirmed = referrals.filter((r) => r.status === 'confirmed')
    const earnedCents = confirmed.reduce((sum, r) => sum + r.earnedCents, 0)
    return {
      confirmedCount: confirmed.length,
      invitedCount: referrals.length,
      earnedCents,
    }
  }, [referrals])

  const shareLink = `app.paymentsorted.com/?ref=${referralCode}`

  function copyLink() {
    navigator.clipboard?.writeText(`https://${shareLink}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function shareLinkNative() {
    const text = `Try Sorted — instant payments to any @handle in Australia. Sign up with my link and we both get $10 once you top up. https://${shareLink}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Sorted', text, url: `https://${shareLink}` })
      } catch {
        // user cancelled — no-op
      }
    } else {
      copyLink()
    }
  }

  function handleInvite() {
    const cleaned = friendHandle.trim()
    if (!cleaned) return
    addReferral(cleaned)
    setFriendHandle('')
    showToast(`Invite tracked for @${cleaned.replace(/^@/, '')}`)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="REFERRALS" />

      <motion.div variants={cascade} initial="hidden" animate="show">
        {/* Hero — lime card with count + earned, pops in */}
        <motion.section
          variants={popIn}
          className="bg-lime border-[2px] border-ink rounded-[24px] shadow-ink-md p-5 mb-3"
        >
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink/65 mb-3">
          Invite mates · $10 each
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.18em] text-ink/65 mb-1">
              Referrals
            </p>
            <p className="font-numeric font-bold text-[40px] leading-none tracking-[-0.04em] text-ink numeric">
              {stats.confirmedCount}
              {stats.invitedCount > stats.confirmedCount && (
                <span className="font-numeric font-semibold text-[20px] text-ink/65 ml-1">
                  /{stats.invitedCount}
                </span>
              )}
            </p>
            {stats.invitedCount > stats.confirmedCount && (
              <p className="font-body text-[11px] text-ink-soft mt-1">
                {stats.invitedCount - stats.confirmedCount} pending top-up
              </p>
            )}
          </div>
          <div>
            <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.18em] text-ink/65 mb-1">
              Earned
            </p>
            <p className="font-numeric font-bold text-[40px] leading-none tracking-[-0.04em] text-ink numeric">
              ${(stats.earnedCents / 100).toFixed(0)}
              <span className="font-numeric font-semibold text-[20px] text-ink/65">
                .{String(stats.earnedCents % 100).padStart(2, '0')}
              </span>
            </p>
          </div>
        </div>
      </motion.section>

      {/* Share link card */}
        <motion.section
          variants={cardRise}
          className="bg-paper-elevated border border-line rounded-[16px] p-4 mb-3"
        >
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
          Your link
        </p>
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="font-mono font-semibold text-[14px] text-ink truncate">{shareLink}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={copyLink}
            className="py-2.5 rounded-[12px] bg-paper-elevated border-[1.5px] border-ink font-display font-bold text-[13px] text-ink flex items-center justify-center gap-1.5 active:translate-y-[1px] transition-transform"
          >
            {copied ? (
              <>
                <Check size={13} strokeWidth={2.5} /> Copied
              </>
            ) : (
              <>
                <Copy size={13} strokeWidth={2.5} /> Copy
              </>
            )}
          </button>
          <button
            onClick={shareLinkNative}
            className="py-2.5 rounded-[12px] bg-lime border-[1.5px] border-ink shadow-ink-sm font-display font-bold text-[13px] text-ink flex items-center justify-center gap-1.5 active:translate-y-[1px] active:shadow-none transition-all"
          >
            <Share2 size={13} strokeWidth={2.5} /> Share
          </button>
        </div>
      </motion.section>

      {/* Manual invite — log a friend's @handle/name (useful for tracking offline shares) */}
        <motion.section
          variants={cardRise}
          className="bg-paper-elevated border border-line rounded-[16px] p-4 mb-5"
        >
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
          Track an invite
        </p>
        <div className="flex items-stretch bg-paper border-[1.5px] border-line rounded-[12px] overflow-hidden focus-within:border-ink transition-colors mb-2">
          <input
            type="text"
            value={friendHandle}
            onChange={(e) => setFriendHandle(e.target.value)}
            placeholder="@handle or name"
            className="flex-1 bg-transparent border-0 outline-none font-body font-medium text-[14px] py-[11px] px-[14px] placeholder:text-ink-faint text-ink"
            autoCapitalize="off"
            autoCorrect="off"
          />
          <button
            onClick={handleInvite}
            disabled={!friendHandle.trim()}
            className="px-3 bg-ink text-paper font-display font-bold text-[12px] disabled:opacity-50 active:translate-y-[1px] transition-transform flex items-center gap-1"
          >
            <UserPlus size={12} strokeWidth={2.5} />
            Add
          </button>
        </div>
        <p className="font-body text-[11px] text-ink-muted leading-[1.45]">
          Adds them to your list as &ldquo;invited&rdquo;. When they top up $20+, you earn $10.
        </p>
      </motion.section>

      {/* Referrals list */}
        {referrals.length > 0 ? (
          <motion.section variants={cardRise}>
            <h2 className="font-display font-bold text-[16px] tracking-tight mb-2.5">
              Your invites
            </h2>
            <ul className="space-y-2">
              {referrals.map((r) => (
                <li
                  key={r.id}
                  className="bg-paper-elevated border border-line rounded-[14px] px-4 py-3 flex items-center gap-3"
                >
                  {/* Avatar circle */}
                  <div
                    className={`w-9 h-9 rounded-full border-[1.5px] border-ink flex items-center justify-center flex-shrink-0 ${
                      r.status === 'confirmed' ? 'bg-lime' : 'bg-paper-deep'
                    }`}
                  >
                    {r.status === 'confirmed' ? (
                      <Check size={14} strokeWidth={2.6} className="text-ink" />
                    ) : (
                      <span className="font-display font-bold text-[11px] tracking-tight text-ink">
                        {r.friendHandle.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[14px] tracking-tight leading-[1.2] text-ink truncate">
                      @{r.friendHandle}
                    </div>
                    <div className="text-[11px] text-ink-muted leading-[1.3]">
                      {r.status === 'confirmed' ? (
                        <>Topped up · {r.confirmedAt ? formatRelativeTime(r.confirmedAt) : ''}</>
                      ) : (
                        <>Invited · {formatRelativeTime(r.invitedAt)}</>
                      )}
                    </div>
                  </div>

                  {r.status === 'confirmed' ? (
                    <div className="font-numeric font-bold text-[14px] tracking-tight text-ink numeric">
                      +${(r.earnedCents / 100).toFixed(2)}
                    </div>
                  ) : (
                    // Demo affordance — tap to simulate the friend topping up $20+
                    // In v0.4 this triggers automatically server-side
                    <button
                      onClick={() => {
                        simulateClaim(r.id)
                        showToast(`+$10 from @${r.friendHandle}`)
                      }}
                      className="px-2.5 py-1 rounded-full bg-paper-deep border border-line font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-ink-muted active:text-ink transition-colors flex items-center gap-1"
                      title="Demo: simulate friend top-up"
                    >
                      <Sparkles size={10} strokeWidth={2.5} />
                      Simulate
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </motion.section>
        ) : (
          <motion.section variants={softRise} className="text-center pt-4">
            <p className="font-body font-medium text-[14px] text-ink-soft max-w-[28ch] mx-auto">
              No invites yet. Share your link or add a friend&apos;s handle above.
            </p>
          </motion.section>
        )}
      </motion.div>

      <div className="flex-1" />

      {/* Reward terms footer */}
      <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted text-center mt-6">
        ${(REFERRAL_REWARD_CENTS / 100).toFixed(0)} per mate who tops up $20 or more
      </p>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-ink text-paper px-5 py-3 rounded-2xl shadow-ink-md flex items-center gap-2.5 font-display font-semibold text-[14px] tracking-tight pointer-events-none max-w-[90vw]"
          >
            <Sparkles size={14} strokeWidth={2.5} className="text-lime shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  )
}
