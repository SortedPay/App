import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Moon } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { Toggle } from '../components/Toggle'
import { haptic } from '../lib/chime'

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

const CHANNELS: NotificationItem[] = [
  { id: 'ch-push', label: 'Push', detail: 'On your device', defaultOn: true },
  { id: 'ch-email', label: 'Email', detail: 'hannah@hannahreid.com', defaultOn: true },
  { id: 'ch-sms', label: 'SMS', detail: 'For high-value sends only', defaultOn: false },
]

export default function SettingsNotifications() {
  const [state, setState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    SECTIONS.forEach((s) => s.items.forEach((i) => (init[i.id] = i.defaultOn)))
    CHANNELS.forEach((c) => (init[c.id] = c.defaultOn))
    return init
  })

  const [quietHours, setQuietHours] = useState(false)
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('07:00')

  function setItem(id: string, v: boolean) {
    haptic(5)
    setState((s) => ({ ...s, [id]: v }))
  }

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
        We default to less, not more.
      </p>

      <div className="space-y-6">
        {/* Channels — how, before what */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2 px-1">
            Channels
          </h2>
          <div className="bg-paper-elevated border border-line rounded-[18px] divide-y divide-line">
            {CHANNELS.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[14px] tracking-tight">{c.label}</div>
                  <div className="text-[12px] text-ink-muted leading-[1.4]">{c.detail}</div>
                </div>
                <Toggle
                  on={state[c.id]}
                  onToggle={(v) => setItem(c.id, v)}
                  label={c.label}
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Quiet hours */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
        >
          <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2 px-1">
            Quiet hours
          </h2>
          <div className="bg-paper-elevated border border-line rounded-[18px] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Moon size={18} strokeWidth={2.4} className="text-ink flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[14px] tracking-tight">
                  Pause non-urgent pings
                </div>
                <div className="text-[12px] text-ink-muted leading-[1.4]">
                  Money-received + security still come through
                </div>
              </div>
              <Toggle
                on={quietHours}
                onToggle={(v) => {
                  haptic(5)
                  setQuietHours(v)
                }}
                label="Quiet hours"
              />
            </div>
            <AnimatePresence initial={false}>
              {quietHours && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-line px-4 py-3 flex items-center gap-3">
                    <div className="flex-1">
                      <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted block mb-1">
                        From
                      </label>
                      <input
                        type="time"
                        value={quietStart}
                        onChange={(e) => setQuietStart(e.target.value)}
                        className="w-full bg-paper border border-line rounded-[10px] px-3 py-2 font-numeric font-bold text-[15px] text-ink outline-none focus:border-ink transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted block mb-1">
                        Until
                      </label>
                      <input
                        type="time"
                        value={quietEnd}
                        onChange={(e) => setQuietEnd(e.target.value)}
                        className="w-full bg-paper border border-line rounded-[10px] px-3 py-2 font-numeric font-bold text-[15px] text-ink outline-none focus:border-ink transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* What — categories of notifications */}
        {SECTIONS.map((section, sIdx) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + sIdx * 0.08 }}
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
                    onToggle={(v) => setItem(item.id, v)}
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
