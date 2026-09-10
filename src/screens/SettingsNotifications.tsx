import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Moon } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { Toggle } from '../components/Toggle'
import { useStore, QuietHours } from '../lib/store'
import { NOTIFICATION_CHANNELS, NOTIFICATION_SECTIONS, NotificationItem } from '../lib/notifications'
import { haptic } from '../lib/chime'

export default function SettingsNotifications() {
  const email = useStore((s) => s.user.email)
  const prefs = useStore((s) => s.notificationPrefs)
  const setNotificationPref = useStore((s) => s.setNotificationPref)
  const quietHours = useStore((s) => s.quietHours)
  const setQuietHours = useStore((s) => s.setQuietHours)

  const channels = NOTIFICATION_CHANNELS.map((c) =>
    c.id === 'ch-email' && email ? { ...c, detail: email } : c,
  )

  function isOn(item: NotificationItem) {
    return prefs[item.id] ?? item.defaultOn
  }

  function setItem(id: string, v: boolean) {
    haptic(5)
    setNotificationPref(id, v)
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
        <ToggleGroup title="Channels" items={channels} isOn={isOn} onToggle={setItem} delay={0.05} />

        <QuietHoursCard
          value={quietHours}
          onToggle={(on) => {
            haptic(5)
            setQuietHours({ on })
          }}
          onTimes={setQuietHours}
        />

        {NOTIFICATION_SECTIONS.map((section, sIdx) => (
          <ToggleGroup
            key={section.title}
            title={section.title}
            items={section.items}
            isOn={isOn}
            onToggle={setItem}
            delay={0.2 + sIdx * 0.08}
          />
        ))}
      </div>
    </Screen>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2 px-1">
      {children}
    </h2>
  )
}

function ToggleGroup({
  title,
  items,
  isOn,
  onToggle,
  delay,
}: {
  title: string
  items: NotificationItem[]
  isOn: (item: NotificationItem) => boolean
  onToggle: (id: string, on: boolean) => void
  delay: number
}) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <SectionTitle>{title}</SectionTitle>
      <div className="bg-paper-elevated border border-line rounded-[18px] divide-y divide-line">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3.5">
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[14px] tracking-tight">{item.label}</div>
              <div className="text-[12px] text-ink-muted leading-[1.4]">{item.detail}</div>
            </div>
            <Toggle on={isOn(item)} onToggle={(v) => onToggle(item.id, v)} label={item.label} />
          </div>
        ))}
      </div>
    </motion.section>
  )
}

function QuietHoursCard({
  value,
  onToggle,
  onTimes,
}: {
  value: QuietHours
  onToggle: (on: boolean) => void
  onTimes: (patch: Partial<QuietHours>) => void
}) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
      <SectionTitle>Quiet hours</SectionTitle>
      <div className="bg-paper-elevated border border-line rounded-[18px] overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Moon size={18} strokeWidth={2.4} className="text-ink flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[14px] tracking-tight">Pause non-urgent pings</div>
            <div className="text-[12px] text-ink-muted leading-[1.4]">
              Money-received + security still come through
            </div>
          </div>
          <Toggle on={value.on} onToggle={onToggle} label="Quiet hours" />
        </div>
        <AnimatePresence initial={false}>
          {value.on && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="border-t border-line px-4 py-3 flex items-center gap-3">
                <TimeField label="From" value={value.from} onChange={(from) => onTimes({ from })} />
                <TimeField label="Until" value={value.until} onChange={(until) => onTimes({ until })} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex-1">
      <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted block mb-1">
        {label}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-paper border border-line rounded-[10px] px-3 py-2 font-numeric font-bold text-[15px] text-ink outline-none focus:border-ink transition-colors"
      />
    </div>
  )
}
