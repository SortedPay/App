// ─────────────────────────────────────────────────────────────
// MOCK DATA — the seed world for @hannah
//
// This module simulates a real backend. State is held in memory
// during the session; the Zustand store wraps it with actions.
// ─────────────────────────────────────────────────────────────

export type User = {
  id: string
  handle: string
  firstName: string
  lastName: string
  initials: string // for avatar fallback
  color: 'lime' | 'coral' | 'sky' | 'butter' | 'plum'
  verified: boolean // KYC tier 1+
}

export type Transaction = {
  id: string
  type: 'send' | 'receive' | 'topup' | 'cashout' | 'yield'
  // For send/receive: the other party
  // For topup/cashout: a system label
  // For yield: a system label
  counterparty: User | { handle: string; firstName: string; lastName: string; initials: string; color: User['color']; verified: boolean }
  // amount in minor units (cents). Positive = inflow, negative = outflow.
  amountCents: number
  // Optional message attached to the tx
  note?: string
  // ISO timestamp
  createdAt: string
  // for 'topup' that's pending
  status: 'pending' | 'confirmed' | 'failed'
  // For receive: the on-chain reference once confirmed
  reference?: string
}

// ─── DEMO USER POOL ─────────────────────────────────────────
// These are the people @hannah can send to / receive from.
// Realistic Aussie names + handles with a mix of common patterns.

export const HANNAH: User = {
  id: 'u_hannah',
  handle: 'hannah',
  firstName: 'Hannah',
  lastName: 'Reid',
  initials: 'HR',
  color: 'lime',
  verified: true,
}

export const DEMO_USERS: User[] = [
  { id: 'u_jackl', handle: 'jackl', firstName: 'Jack', lastName: 'Lawson', initials: 'JL', color: 'sky', verified: true },
  { id: 'u_maya', handle: 'maya', firstName: 'Maya', lastName: 'Chen', initials: 'MC', color: 'coral', verified: true },
  { id: 'u_noah', handle: 'noah', firstName: 'Noah', lastName: 'Wilson', initials: 'NW', color: 'butter', verified: true },
  { id: 'u_ella', handle: 'ella', firstName: 'Ella', lastName: 'O\u2019Brien', initials: 'EO', color: 'plum', verified: true },
  { id: 'u_tomh', handle: 'tomh', firstName: 'Tom', lastName: 'Hayes', initials: 'TH', color: 'lime', verified: true },
  { id: 'u_zoebee', handle: 'zoebee', firstName: 'Zo\u00eb', lastName: 'Beckett', initials: 'ZB', color: 'sky', verified: true },
  { id: 'u_cooper', handle: 'cooper', firstName: 'Cooper', lastName: 'Nguy\u1ec5n', initials: 'CN', color: 'coral', verified: true },
  { id: 'u_amelia', handle: 'amelia', firstName: 'Amelia', lastName: 'Foster', initials: 'AF', color: 'butter', verified: true },
  { id: 'u_lukem', handle: 'lukem', firstName: 'Luke', lastName: 'Mitchell', initials: 'LM', color: 'plum', verified: true },
  { id: 'u_isla', handle: 'isla', firstName: 'Isla', lastName: 'Patel', initials: 'IP', color: 'lime', verified: true },
  { id: 'u_finn', handle: 'finn', firstName: 'Finn', lastName: 'Walker', initials: 'FW', color: 'sky', verified: false },
  { id: 'u_ruby', handle: 'ruby', firstName: 'Ruby', lastName: 'Tran', initials: 'RT', color: 'coral', verified: true },
  { id: 'u_oscar', handle: 'oscar', firstName: 'Oscar', lastName: 'Kelly', initials: 'OK', color: 'butter', verified: true },
  { id: 'u_lily', handle: 'lily', firstName: 'Lily', lastName: 'Cameron', initials: 'LC', color: 'plum', verified: true },
  { id: 'u_kai', handle: 'kai', firstName: 'Kai', lastName: 'Anderson', initials: 'KA', color: 'lime', verified: true },
]

// Quick lookup maps
export const USERS_BY_HANDLE = new Map<string, User>()
DEMO_USERS.forEach((u) => USERS_BY_HANDLE.set(u.handle, u))
USERS_BY_HANDLE.set(HANNAH.handle, HANNAH)

// ─── HELPER: minutes ago / hours ago / days ago ─────────────
function ago(opts: { minutes?: number; hours?: number; days?: number; weeks?: number }): string {
  const now = new Date('2026-05-07T14:32:00+10:00') // anchored Aussie time for consistent demos
  const ms =
    (opts.minutes ?? 0) * 60_000 +
    (opts.hours ?? 0) * 3_600_000 +
    (opts.days ?? 0) * 86_400_000 +
    (opts.weeks ?? 0) * 604_800_000
  return new Date(now.getTime() - ms).toISOString()
}

// ─── SEED TRANSACTIONS — Hannah's recent activity ───────────
// Built so the feed feels like a real life: top-ups, sends to mates,
// receives, regular yield drops, and a recent cash-out.

export const SEED_TRANSACTIONS: Transaction[] = [
  // Latest: a tiny yield drop (today)
  {
    id: 'tx_001',
    type: 'yield',
    counterparty: { handle: 'sorted', firstName: 'Sorted', lastName: 'yield', initials: 'S', color: 'lime', verified: true },
    amountCents: 11,
    createdAt: ago({ minutes: 32 }),
    status: 'confirmed',
    reference: 'YIELD-2026-05-07',
  },
  // Sent Jack $20 for lunch, 1 hour ago
  {
    id: 'tx_002',
    type: 'send',
    counterparty: USERS_BY_HANDLE.get('jackl')!,
    amountCents: -2000,
    note: 'banh mi 🥖',
    createdAt: ago({ hours: 1 }),
    status: 'confirmed',
    reference: 'sol_4xK7p',
  },
  // Maya sent her $48.50 for the concert ticket, 4 hours ago
  {
    id: 'tx_003',
    type: 'receive',
    counterparty: USERS_BY_HANDLE.get('maya')!,
    amountCents: 4850,
    note: 'concert ticket — thx!',
    createdAt: ago({ hours: 4 }),
    status: 'confirmed',
    reference: 'sol_9mP3q',
  },
  // Yield from yesterday
  {
    id: 'tx_004',
    type: 'yield',
    counterparty: { handle: 'sorted', firstName: 'Sorted', lastName: 'yield', initials: 'S', color: 'lime', verified: true },
    amountCents: 10,
    createdAt: ago({ days: 1 }),
    status: 'confirmed',
    reference: 'YIELD-2026-05-06',
  },
  // Topped up $200 yesterday
  {
    id: 'tx_005',
    type: 'topup',
    counterparty: { handle: 'topup', firstName: 'Top', lastName: 'up', initials: 'TU', color: 'sky', verified: true },
    amountCents: 20000,
    note: 'PayID from CBA',
    createdAt: ago({ days: 1, hours: 2 }),
    status: 'confirmed',
    reference: 'PAYID-CBA-3398',
  },
  // Sent Noah $35 for the uber 2 days ago
  {
    id: 'tx_006',
    type: 'send',
    counterparty: USERS_BY_HANDLE.get('noah')!,
    amountCents: -3500,
    note: 'uber split',
    createdAt: ago({ days: 2 }),
    status: 'confirmed',
    reference: 'sol_2nL8w',
  },
  // Yield 2 days ago
  {
    id: 'tx_007',
    type: 'yield',
    counterparty: { handle: 'sorted', firstName: 'Sorted', lastName: 'yield', initials: 'S', color: 'lime', verified: true },
    amountCents: 9,
    createdAt: ago({ days: 2 }),
    status: 'confirmed',
    reference: 'YIELD-2026-05-05',
  },
  // Ella sent $15 — birthday gift
  {
    id: 'tx_008',
    type: 'receive',
    counterparty: USERS_BY_HANDLE.get('ella')!,
    amountCents: 1500,
    note: 'happy bday 🎂',
    createdAt: ago({ days: 3 }),
    status: 'confirmed',
    reference: 'sol_7tR1a',
  },
  // Sent Cooper $80 — climbing gym monthly
  {
    id: 'tx_009',
    type: 'send',
    counterparty: USERS_BY_HANDLE.get('cooper')!,
    amountCents: -8000,
    note: 'climbing — month',
    createdAt: ago({ days: 4 }),
    status: 'confirmed',
    reference: 'sol_5kQ9c',
  },
  // A few more yield drops working back
  {
    id: 'tx_010',
    type: 'yield',
    counterparty: { handle: 'sorted', firstName: 'Sorted', lastName: 'yield', initials: 'S', color: 'lime', verified: true },
    amountCents: 9,
    createdAt: ago({ days: 4 }),
    status: 'confirmed',
    reference: 'YIELD-2026-05-03',
  },
  // Tom paid back $25
  {
    id: 'tx_011',
    type: 'receive',
    counterparty: USERS_BY_HANDLE.get('tomh')!,
    amountCents: 2500,
    note: 'from the weekend',
    createdAt: ago({ days: 5 }),
    status: 'confirmed',
    reference: 'sol_8vJ2x',
  },
  // Big top-up a week ago
  {
    id: 'tx_012',
    type: 'topup',
    counterparty: { handle: 'topup', firstName: 'Top', lastName: 'up', initials: 'TU', color: 'sky', verified: true },
    amountCents: 100000,
    note: 'PayID from CBA',
    createdAt: ago({ weeks: 1 }),
    status: 'confirmed',
    reference: 'PAYID-CBA-3221',
  },
  // Sent Zoë $42 for the hens
  {
    id: 'tx_013',
    type: 'send',
    counterparty: USERS_BY_HANDLE.get('zoebee')!,
    amountCents: -4200,
    note: 'hens contribution',
    createdAt: ago({ weeks: 1, days: 1 }),
    status: 'confirmed',
    reference: 'sol_3pH7d',
  },
  // Cashout to bank
  {
    id: 'tx_014',
    type: 'cashout',
    counterparty: { handle: 'cashout', firstName: 'Cash', lastName: 'out', initials: 'CO', color: 'butter', verified: true },
    amountCents: -50000,
    note: 'to CBA savings',
    createdAt: ago({ weeks: 1, days: 3 }),
    status: 'confirmed',
    reference: 'PAYID-OUT-1129',
  },
  // Earlier yield drops...
  {
    id: 'tx_015',
    type: 'yield',
    counterparty: { handle: 'sorted', firstName: 'Sorted', lastName: 'yield', initials: 'S', color: 'lime', verified: true },
    amountCents: 8,
    createdAt: ago({ weeks: 1, days: 4 }),
    status: 'confirmed',
    reference: 'YIELD-2026-04-29',
  },
]

// ─── SEED BALANCE ───────────────────────────────────────────
// Starting balance for @hannah: $1,247.50
// (Matches the marketing site's activity-list pattern)
export const SEED_BALANCE_CENTS = 124750

// Total yield earned to date (lifetime)
export const SEED_LIFETIME_YIELD_CENTS = 380

// Yield earned today (resets daily — for the home screen "earned today" badge)
export const SEED_YIELD_TODAY_CENTS = 11

// ─── HELPERS ────────────────────────────────────────────────

export function formatAUD(cents: number, opts: { showSign?: boolean; compact?: boolean } = {}): string {
  const abs = Math.abs(cents)
  const dollars = (abs / 100).toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const sign = opts.showSign ? (cents >= 0 ? '+' : '\u2212') : cents < 0 ? '\u2212' : ''
  return `${sign}$${dollars}`
}

export function formatRelativeTime(iso: string): string {
  const now = new Date('2026-05-07T14:32:00+10:00')
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()
  const m = Math.floor(diffMs / 60_000)
  const h = Math.floor(diffMs / 3_600_000)
  const d = Math.floor(diffMs / 86_400_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  return then.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export function formatTimeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function searchUsers(query: string, excludeHandle?: string): User[] {
  const q = query.trim().toLowerCase().replace(/^@/, '')
  if (!q) return []
  const matches: User[] = []
  for (const u of DEMO_USERS) {
    if (excludeHandle && u.handle === excludeHandle) continue
    if (u.handle.includes(q) || u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q)) {
      matches.push(u)
    }
  }
  return matches.slice(0, 6)
}

// Recent recipients — ordered by last-sent
export function recentRecipients(transactions: Transaction[]): User[] {
  const seen = new Set<string>()
  const recents: User[] = []
  for (const tx of transactions) {
    if (tx.type !== 'send') continue
    const cp = tx.counterparty
    if ('id' in cp && !seen.has(cp.handle)) {
      seen.add(cp.handle)
      recents.push(cp as User)
      if (recents.length >= 6) break
    }
  }
  return recents
}
