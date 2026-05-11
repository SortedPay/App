import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Bell, Shield, HelpCircle, LogOut, User as UserIcon, RotateCcw, Sparkles } from 'lucide-react'
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

  const items: Array<{ icon: typeof UserIcon; label: string; sub?: string; onClick: () => void; danger?: boolean }> = [
    { icon: UserIcon, label: 'Profile', sub: `@${user.handle}`, onClick: () => showToast('Profile · coming soon') },
    { icon: Shield, label: 'Verification', sub: `Tier ${tier} · verified`, onClick: () => showToast('Verification · coming soon') },
    { icon: Bell, label: 'Notifications', sub: 'Push, email, SMS', onClick: () => showToast('Notifications · coming soon') },
    { icon: HelpCircle, label: 'Help & support', onClick: () => showToast('Help · coming soon') },
    {
      icon: RotateCcw,
      label: 'Reset demo',
      sub: 'Wipe state, start fresh',
      onClick: () => {
        if (confirm('Reset all demo data? This will restore @hannah\'s starting balance and transactions.')) {
          reset()
          showToast('Demo reset')
        }
      },
    },
    { icon: LogOut, label: 'Sign out', onClick: () => navigate('/'), danger: true },
  ]

  return (
    <Screen transition="fade" className="pt-2 pb-4">
      <header className="pt-4 pb-6">
        <p className="label-mono mb-1">Manage</p>
        <h1 className="font-display font-bold text-[32px] leading-none tracking-tightest">
          Settings.
        </h1>
      </header>

      {/* Profile card */}
      <section className="bg-paper-elevated border-2 border-ink rounded-3xl p-5 mb-6 flex items-center gap-4 shadow-ink-sm">
        <Avatar user={user} size="xl" />
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[20px] leading-none tracking-tight text-ink truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="font-mono text-[13px] text-ink-muted mt-1">@{user.handle}</p>
          <span className="sticker sticker-lime mt-3 text-[11px]">
            Tier {tier} verified
          </span>
        </div>
      </section>

      {/* Settings list */}
      <ul className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.label}>
              <button
                onClick={item.onClick}
                className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl active:bg-line-soft transition-colors text-left"
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center shrink-0 ${
                    item.danger ? 'bg-coral text-paper' : 'bg-paper-elevated text-ink'
                  }`}
                >
                  <Icon size={17} strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-display font-bold text-[15px] tracking-tight ${item.danger ? 'text-coral' : 'text-ink'}`}>
                    {item.label}
                  </div>
                  {item.sub && (
                    <div className="text-[12px] text-ink-muted truncate">{item.sub}</div>
                  )}
                </div>
                <ChevronRight size={18} className="text-ink-muted shrink-0" />
              </button>
            </li>
          )
        })}
      </ul>

      <p className="text-center text-[11px] text-ink-muted mt-10 mb-2 font-mono tracking-widest">
        SORTED · v0.1 · DEMO BUILD
      </p>

      {/* Toast notification */}
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
