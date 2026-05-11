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
  const tier = useStore((s) => s.tier)
  const reset = useStore((s) => s.reset)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(label: string) {
    setToast(label)
    setTimeout(() => setToast(null), 1800)
  }

  type Item = {
    label: string
    sub?: string
    onClick: () => void
    danger?: boolean
  }

  const items: Item[] = [
    { label: 'Profile', sub: 'Name, avatar, @handle', onClick: () => navigate('/settings/profile') },
    {
      label: 'Verification',
      sub: `Tier ${tier} · upgrade for higher limits`,
      onClick: () => navigate('/settings/verification'),
    },
    { label: 'Notifications', sub: 'Push, email, daily yield', onClick: () => navigate('/settings/notifications') },
    { label: 'Help & support', sub: 'Docs, contact us', onClick: () => showToast('Help · coming soon') },
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
  ]

  return (
    <Screen transition="fade" className="pt-2 pb-4 px-6">
      <header className="pt-4 pb-5">
        <h1 className="font-display font-bold text-[40px] leading-none tracking-tightest">
          Settings
        </h1>
      </header>

      {/* Profile card */}
      <button
        onClick={() => navigate('/settings/profile')}
        className="w-full bg-paper-elevated border border-line rounded-[16px] p-3 mb-3 flex items-center gap-3 active:translate-y-[1px] transition-transform text-left"
      >
        <Avatar user={user} size="lg" />
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

      {/* Grouped list */}
      <div className="bg-paper-elevated border border-line rounded-[16px] overflow-hidden">
        {items.map((item, idx) => (
          <div key={item.label}>
            {idx > 0 && <div className="h-px bg-line mx-4" />}
            <button
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-line-soft transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div
                  className={`font-display font-bold text-[15px] tracking-tight leading-tight ${
                    item.danger ? 'text-coral' : 'text-ink'
                  }`}
                >
                  {item.label}
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

      <p className="text-center text-[11px] text-ink-muted mt-8 mb-2 font-mono tracking-widest">
        Sorted · v0.2 · Beta
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
