import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { Toggle } from '../components/Toggle'

interface NotificationItem {
  id: string
  label: string
  detail: string
  defaultOn: boolean
}

const SECTIONS: { title: string; items: NotificationItem[] }[] = [
  {
    title: 'Money',
    items: [
      { id: 'sent', label: 'Money sent', detail: 'Confirmation when a payment goes through', defaultOn: true },
      { id: 'received', label: 'Money received', detail: 'Push when you get paid', defaultOn: true },
      { id: 'topup', label: 'Top-up complete', detail: 'When your bank transfer lands', defaultOn: true },
      { id: 'failed', label: 'Failed transactions', detail: "We'll always tell you about these", defaultOn: true },
    ],
  },
  {
    title: 'Yield',
    items: [
      { id: 'yield-daily', label: 'Daily yield drop', detail: '3.33% APY hits your balance', defaultOn: true },
      { id: 'yield-summary', label: 'Weekly summary', detail: 'Sundays · how much you earned', defaultOn: false },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'security', label: 'Security alerts', detail: 'Sign-ins, password changes', defaultOn: true },
      { id: 'product', label: 'Product updates', detail: 'New features, occasionally', defaultOn: false },
      { id: 'marketing', label: 'Marketing & tips', detail: "You'll never be spammed", defaultOn: false },
    ],
  },
]

export default function SettingsNotifications() {
  const [state, setState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    SECTIONS.forEach((s) => s.items.forEach((i) => (init[i.id] = i.defaultOn)))
    return init
  })

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="NOTIFICATIONS" />

      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-16 h-16 mx-auto bg-sky border-[2.5px] border-ink rounded-[20px] shadow-ink-md flex items-center justify-center mt-2 mb-5"
      >
        <Plus size={28} strokeWidth={3} className="text-ink" />
      </motion.div>

      <h1 className="font-display font-bold text-[30px] tracking-tightest text-center leading-[1] mb-2 whitespace-pre-line">
        {'How should we\nping you?'}
      </h1>
      <p className="text-ink-muted text-[13px] text-center max-w-[28ch] mx-auto mb-6">
        Push notifications. We default to less, not more.
      </p>

      <div className="space-y-6">
        {SECTIONS.map((section, sIdx) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + sIdx * 0.08 }}
          >
            <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2 px-1">
              {section.title}
            </h2>
            <div className="bg-paper-elevated border border-line rounded-[18px] divide-y divide-line">
              {section.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[14px] tracking-tight">
                      {item.label}
                    </div>
                    <div className="text-[12px] text-ink-muted leading-[1.4]">{item.detail}</div>
                  </div>
                  <Toggle
                    on={state[item.id]}
                    onToggle={(v) => setState((s) => ({ ...s, [item.id]: v }))}
                    label={item.label}
                  />
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </Screen>
  )
}
