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
  { id: 'u_naomi', handle: 'naomi', firstName: 'Naomi', lastName: 'Wilson', initials: 'NW', color: 'butter', verified: true },
  { id: 'u_ella', handle: 'ella', firstName: 'Ella', lastName: 'O\u2019Brien', initials: 'EO', color: 'plum', verified: true },
  { id: 'u_tomh', handle: 'tomh', firstName: 'Tom', lastName: 'Hayes', initials: 'TH', color: 'lime', verified: true },
  { id: 'u_zoebee', handle: 'zoebee', firstName: 'Zo\u00eb', lastName: 'Beckett', initials: 'ZB', color: 'sky', verified: true },
  { id: 'u_charlien', handle: 'charlien', firstName: 'Charlie', lastName: 'Nguy\u1ec5n', initials: 'CN', color: 'plum', verified: true },
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

// ─── MOCK CONTACTS — v0.2 beta "address book" ───────────────
// These four always appear in the Send · Who RECENT list so beta
// testers can test the send flow without needing prior transactions.
// In v0.3 this is replaced by real address book + sends-derived recents.
export const MOCK_CONTACTS: User[] = [
  USERS_BY_HANDLE.get('jackl')!,
  USERS_BY_HANDLE.get('maya')!,
  USERS_BY_HANDLE.get('naomi')!,
  USERS_BY_HANDLE.get('charlien')!,
]

// (Helper `ago()` was used by SEED_TRANSACTIONS — removed for v0.2 since seed is empty.
// Restore from git history when seed data is re-enabled.)


// ─── SEED TRANSACTIONS — Hannah's recent activity ───────────
// Built so the feed feels like a real life: top-ups, sends to mates,
// receives, regular yield drops, and a recent cash-out.

// ─── SEED TRANSACTIONS — empty for v0.2 beta ───────────────
// Beta testers start at $0 with no activity. They top up, send,
// and see their own activity build naturally.
//
// To restore the "lived-in" @hannah demo state with 15 transactions,
// see git history of this file (May 9 commit) — the full SEED_TRANSACTIONS
// array is preserved there.
export const SEED_TRANSACTIONS: Transaction[] = []

// ─── SEED BALANCE ───────────────────────────────────────────
// Starting balance for @hannah: $1,247.50
// (Matches the marketing site's activity-list pattern)
// v0.2: beta testers go through real onboarding flow.
// First-load state is empty — they top up to fund.
// Set SEED_BALANCE_CENTS to 124750 etc. to restore the "lived-in" demo state.
export const SEED_BALANCE_CENTS = 0

// Total yield earned to date (lifetime)
export const SEED_LIFETIME_YIELD_CENTS = 0

// Yield earned today (resets daily — for the home screen "earned today" badge)
export const SEED_YIELD_TODAY_CENTS = 0

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
