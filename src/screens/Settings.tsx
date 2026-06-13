import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react'
import Screen from '../components/Screen'
import Avatar from '../components/Avatar'
import { useStore } from '../lib/store'

export default function Settings() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const avatarUrl = useStore((s) => s.avatarUrl)
  const tier = useStore((s) => s.tier)
  const reset = useStore((s) => s.reset)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(label: string) {
    setToast(label)
    setTimeout(() => setToast(null), 1800)
  }

  function buildFeedbackMailto(): string {
    const subject = encodeURIComponent(`Sorted beta v${__APP_VERSION__} feedback`)
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    const lang = typeof navigator !== 'undefined' ? navigator.language : 'unknown'
    const w = typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : 'unknown'
    const body = encodeURIComponent(
      `\n\n---\nDebug info (please keep so we can find your build):\nBuild: v${__APP_VERSION__} (${__BUILD_HASH__})\nViewport: ${w}\nDevice: ${ua}\nLocale: ${lang}\n`
    )
    return `mailto:hello@paymentsorted.com?subject=${subject}&body=${body}`
  }

  function copyBuildInfo() {
    const info = `Sorted v${__APP_VERSION__} (${__BUILD_HASH__})`
    navigator.clipboard?.writeText(info)
    showToast('Build info copied')
  }

  type Item = {
    label: string
    sub?: string
    onClick: () => void
    danger?: boolean
    badge?: string
  }

  type Group = {
    title?: string
    items: Item[]
  }

  const groups: Group[] = [
    {
      title: 'Account',
      items: [
        { label: 'Profile', sub: 'Name, avatar, @handle', onClick: () => navigate('/settings/profile') },
        {
          label: 'Verification',
          sub: tier === 1 ? `Tier ${tier} · upgrade for higher limits` : `Tier ${tier} · max limits`,
          onClick: () => navigate('/settings/verification'),
          badge: tier === 1 ? 'UPGRADE' : undefined,
        },
        {
          label: 'Security & 2FA',
          sub: 'Sign-in, two-step, devices',
          onClick: () => navigate('/settings/security'),
        },
        {
          label: 'Notifications',
          sub: 'Push, email, quiet hours',
          onClick: () => navigate('/settings/notifications'),
        },
      ],
    },
    {
      title: 'Money',
      items: [
        {
          label: 'Tax & reports',
          sub: 'Download your FY history',
          onClick: () => navigate('/settings/tax'),
        },
        {
          label: 'Invite mates · $10 each',
          sub: 'When they top up $20+, you earn $10',
          onClick: () => navigate('/referrals'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          label: 'Send feedback',
          sub: 'Tell us what you think',
          onClick: () => {
            window.location.href = buildFeedbackMailto()
          },
        },
        {
          label: 'Help & support',
          sub: 'Docs, contact us',
          onClick: () => {
            window.location.href = 'mailto:hello@paymentsorted.com?subject=Sorted beta — help'
          },
        },
        {
          label: 'Terms',
          sub: 'Plain English. No fine print.',
          onClick: () => navigate('/legal/terms'),
        },
        {
          label: 'Privacy',
          sub: 'What we collect, what we don\u2019t',
          onClick: () => navigate('/legal/privacy'),
        },
      ],
    },
    {
      title: 'Demo',
      items: [
        {
          label: 'Reset demo',
          sub: 'Restart from onboarding',
          onClick: () => {
            if (confirm('Reset demo state? Wallet returns to $0 and onboarding.')) {
              reset()
              showToast('Demo reset')
              navigate('/')
            }
          },
        },
        { label: 'Sign out', onClick: () => navigate('/'), danger: true },
      ],
    },
  ]

  return (
    <Screen transition="fade" className="pt-2 pb-4 px-6">
      <header className="pt-3 pb-5">
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted mb-0.5">
          Your account
        </p>
        <h1 className="font-display font-bold text-[32px] leading-none tracking-tightest">Profile</h1>
      </header>

      {/* Profile card */}
      <button
        onClick={() => navigate('/settings/profile')}
        className="w-full bg-paper-elevated border border-line rounded-[16px] p-3 mb-4 flex items-center gap-3 active:translate-y-[1px] transition-transform text-left"
      >
        <Avatar user={user} size="lg" imageUrl={avatarUrl} />
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[16px] leading-tight tracking-tight text-ink">
            {user.firstName} {user.lastName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-body text-[12px] text-ink-muted">@{user.handle}</span>
            <span className="inline-flex items-center bg-lime-soft border border-lime-deep rounded-md px-1.5 py-0.5 font-mono font-semibold text-[9px] uppercase tracking-[0.14em] text-ink">
              Tier {tier}
            </span>
          </div>
        </div>
        <ArrowRight size={16} strokeWidth={2.4} className="text-ink-muted flex-shrink-0" />
      </button>

      {/* Grouped lists — each group is its own visual block with a title */}
      {groups.map((group) => (
        <div key={group.title ?? 'untitled'} className="mb-4">
          {group.title && (
            <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted px-2 mb-2">
              {group.title}
            </h2>
          )}
          <div className="bg-paper-elevated border border-line rounded-[16px] overflow-hidden">
            {group.items.map((item, idx) => (
              <div key={item.label}>
                {idx > 0 && <div className="h-px bg-line mx-4" />}
                <button
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-line-soft transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-display font-bold text-[15px] tracking-tight leading-tight ${
                          item.danger ? 'text-coral' : 'text-ink'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="inline-flex items-center bg-lime border border-ink rounded-md px-1.5 py-0.5 font-mono font-semibold text-[8px] uppercase tracking-[0.14em] text-ink">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.sub && (
                      <div className="font-body text-[12px] text-ink-muted mt-0.5 leading-tight">
                        {item.sub}
                      </div>
                    )}
                  </div>
                  {item.danger ? (
                    <ArrowRight size={16} strokeWidth={2.4} className="text-coral flex-shrink-0" />
                  ) : (
                    <ChevronRight size={16} strokeWidth={2.4} className="text-ink-muted flex-shrink-0" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={copyBuildInfo}
        className="block mx-auto mt-8 mb-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted active:text-ink transition-colors"
        aria-label="Copy build info"
      >
        Sorted · v{__APP_VERSION__} · {__BUILD_HASH__}
      </button>

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
