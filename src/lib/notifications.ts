/**
 * Notification catalogue — the single list of toggles the Notifications
 * screen renders and the store seeds `notificationPrefs` from.
 */

export type NotificationItem = {
  id: string
  label: string
  detail: string
  defaultOn: boolean
}

export type NotificationSection = {
  title: string
  items: NotificationItem[]
}

export const NOTIFICATION_CHANNELS: NotificationItem[] = [
  { id: 'ch-push', label: 'Push', detail: 'On your device', defaultOn: true },
  { id: 'ch-email', label: 'Email', detail: 'Your account email', defaultOn: true },
  { id: 'ch-sms', label: 'SMS', detail: 'For high-value sends only', defaultOn: false },
]

export const NOTIFICATION_SECTIONS: NotificationSection[] = [
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
    title: 'Card & Points',
    items: [
      { id: 'card-taps', label: 'Card taps', detail: 'Instant ping every time you tap', defaultOn: true },
      { id: 'points-weekly', label: 'Weekly points summary', detail: 'Sundays · what you stacked this week', defaultOn: false },
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

export function defaultNotificationPrefs(): Record<string, boolean> {
  const prefs: Record<string, boolean> = {}
  for (const c of NOTIFICATION_CHANNELS) prefs[c.id] = c.defaultOn
  for (const s of NOTIFICATION_SECTIONS) for (const i of s.items) prefs[i.id] = i.defaultOn
  return prefs
}
