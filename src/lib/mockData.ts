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
  type: 'send' | 'receive' | 'topup' | 'cashout' | 'tap'
  // For send/receive: the other party
  // For topup/cashout: a system label
  // For tap: the merchant
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

/**
 * A Sorted Points ledger entry. Points attach to ACTIONS (sends, taps,
 * referrals, profile completion) — never to balance held or time elapsed.
 * That distinction is deliberate and legal: points are a loyalty program,
 * not interest. Keep it that way.
 */
export type PointsEntry = {
  id: string
  source: 'send' | 'tap' | 'referral' | 'profile' | 'founding'
  amount: number
  createdAt: string
  label?: string
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

// ─── MOCK CONTACTS — Hannah's address book ──────────────────
// Order matters: most-recent-paid at the top. This mirrors how the Send Who
// screen surfaces recents.
export const MOCK_CONTACTS: User[] = [
  USERS_BY_HANDLE.get('jackl')!,
  USERS_BY_HANDLE.get('maya')!,
  USERS_BY_HANDLE.get('naomi')!,
  USERS_BY_HANDLE.get('charlien')!,
  USERS_BY_HANDLE.get('ella')!,
  USERS_BY_HANDLE.get('tomh')!,
  USERS_BY_HANDLE.get('zoebee')!,
  USERS_BY_HANDLE.get('amelia')!,
  USERS_BY_HANDLE.get('lukem')!,
  USERS_BY_HANDLE.get('isla')!,
  USERS_BY_HANDLE.get('ruby')!,
  USERS_BY_HANDLE.get('oscar')!,
]

/**
 * Build an ISO timestamp `n` minutes/hours/days ago — relative to a fixed
 * "demo now" reference so screenshots and time labels are deterministic.
 */
const DEMO_NOW = new Date('2026-05-13T14:32:00+10:00').getTime()
function ago(opts: { days?: number; hours?: number; minutes?: number }): string {
  const ms =
    (opts.days ?? 0) * 86_400_000 + (opts.hours ?? 0) * 3_600_000 + (opts.minutes ?? 0) * 60_000
  return new Date(DEMO_NOW - ms).toISOString()
}

const systemTopUp = {
  handle: 'topup',
  firstName: 'Top',
  lastName: 'up',
  initials: 'TU',
  color: 'sky' as const,
  verified: true,
}
const systemCashOut = {
  handle: 'cashout',
  firstName: 'Cash',
  lastName: 'out',
  initials: 'CO',
  color: 'butter' as const,
  verified: true,
}

// ─── MERCHANTS — where the Sorted card gets tapped ──────────
// Counterparties for 'tap' transactions. Local-feeling Aussie spots.
const merchant = (
  handle: string,
  firstName: string,
  lastName: string,
  initials: string,
  color: User['color'],
) => ({ handle, firstName, lastName, initials, color, verified: true })

const CORNER_CAFE = merchant('cornercafe', 'Corner', 'Cafe', 'CC', 'coral')
const WOOLIES = merchant('woolworths', 'Woolworths', '', 'W', 'lime')
const SEVENELEVEN = merchant('seveneleven', '7-Eleven', '', '7E', 'butter')
const BUNNINGS = merchant('bunnings', 'Bunnings', 'Warehouse', 'BW', 'sky')
const MESSINA = merchant('messina', 'Gelato', 'Messina', 'GM', 'plum')
const KMART = merchant('kmart', 'Kmart', '', 'K', 'coral')

function tx(
  id: string,
  type: Transaction['type'],
  cp: Transaction['counterparty'],
  amountCents: number,
  when: string,
  note?: string,
  reference?: string,
): Transaction {
  return {
    id,
    type,
    counterparty: cp,
    amountCents,
    note,
    createdAt: when,
    status: 'confirmed',
    reference: reference ?? `sol_${id.slice(-6)}`,
  }
}

const U = USERS_BY_HANDLE
/**
 * Seeded transaction history — designed to read like an actual 6-week slice
 * of someone's life. Mix of small daily things ($4 coffees, $18 lunches),
 * mid-sized social splits ($45 dinner share, $120 concert), and the
 * occasional bigger move (rent, bond refund, side-hustle income).
 *
 * Time ordering: newest first. Card taps sprinkle through most days.
 * Top-ups irregular. Most-recent send last in the list goes to the top
 * of contacts.
 */
export const SEED_TRANSACTIONS: Transaction[] = [
  // Today
  tx('tx_001', 'tap', CORNER_CAFE, -550, ago({ hours: 2 }), 'Flat white + banana bread'),
  tx('tx_002', 'send', U.get('ella')!, -800, ago({ hours: 4 }), 'Coffee ☕'),
  tx('tx_003', 'receive', U.get('jackl')!, 2400, ago({ hours: 6 }), 'Your half of the Uber'),

  // Yesterday
  tx('tx_004', 'tap', WOOLIES, -2380, ago({ days: 1, hours: 2 }), 'Groceries'),
  tx('tx_005', 'send', U.get('tomh')!, -1850, ago({ days: 1, hours: 5 }), 'Banh mi + iced coffee'),
  tx('tx_006', 'receive', U.get('zoebee')!, 4500, ago({ days: 1, hours: 8 }), 'Brunch split'),

  // 2 days ago
  tx('tx_007', 'send', U.get('naomi')!, -2200, ago({ days: 2, hours: 3 }), 'Yoga drop-in × 2'),
  tx('tx_008', 'tap', SEVENELEVEN, -410, ago({ days: 2, hours: 2 }), 'Servo run'),
  tx('tx_009', 'send', U.get('isla')!, -1600, ago({ days: 2, hours: 11 }), 'Wine for movie night'),

  // 3-4 days
  tx('tx_010', 'receive', U.get('amelia')!, 12500, ago({ days: 3, hours: 4 }), 'Bond refund split'),
  tx('tx_011', 'tap', CORNER_CAFE, -550, ago({ days: 3, hours: 2 })),
  tx('tx_012', 'send', U.get('maya')!, -3500, ago({ days: 3, hours: 9 }), 'Concert ticket'),
  tx('tx_013', 'send', U.get('lukem')!, -1200, ago({ days: 4, hours: 5 }), 'Pub'),
  tx('tx_014', 'tap', BUNNINGS, -1890, ago({ days: 4, hours: 2 }), 'Shelf brackets'),

  // Week 1 (days 5-7)
  tx('tx_015', 'topup', systemTopUp, 50000, ago({ days: 5, hours: 8 }), 'PayID from CBA', 'PAYID-CBA-7842'),
  tx('tx_016', 'tap', CORNER_CAFE, -500, ago({ days: 5, hours: 2 })),
  tx('tx_017', 'send', U.get('charlien')!, -4500, ago({ days: 5, hours: 14 }), 'Banh mi run for the office'),
  tx('tx_018', 'send', U.get('jackl')!, -2800, ago({ days: 6, hours: 7 }), 'Bondi → Bronte ride'),
  tx('tx_019', 'tap', MESSINA, -1250, ago({ days: 6, hours: 2 }), 'Gelato run'),
  tx('tx_020', 'receive', U.get('oscar')!, 6500, ago({ days: 7, hours: 9 }), 'Splendour ticket reso'),

  // Week 2
  tx('tx_021', 'tap', WOOLIES, -3420, ago({ days: 8, hours: 2 }), 'Big shop'),
  tx('tx_022', 'send', U.get('ruby')!, -1500, ago({ days: 8, hours: 12 }), 'Wine'),
  tx('tx_023', 'cashout', systemCashOut, -25000, ago({ days: 9, hours: 6 }), 'To Westpac', 'CASHOUT-9421'),
  tx('tx_024', 'tap', CORNER_CAFE, -550, ago({ days: 9, hours: 2 })),
  tx('tx_025', 'send', U.get('ella')!, -2200, ago({ days: 10, hours: 4 }), 'Birthday gift split'),

  // Week 3+
  tx('tx_026', 'topup', systemTopUp, 30000, ago({ days: 11, hours: 9 }), 'PayID from CBA', 'PAYID-CBA-6210'),
  tx('tx_027', 'send', U.get('maya')!, -4200, ago({ days: 12, hours: 5 }), 'Dinner Saturday'),
  tx('tx_028', 'tap', KMART, -2200, ago({ days: 12, hours: 2 }), 'Random Kmart stuff'),
  tx('tx_029', 'receive', U.get('tomh')!, 1800, ago({ days: 13, hours: 11 }), 'Cab back'),
  tx('tx_030', 'send', U.get('zoebee')!, -3800, ago({ days: 14, hours: 6 }), 'Birthday dinner Ester'),
  tx('tx_031', 'tap', CORNER_CAFE, -500, ago({ days: 15, hours: 2 })),
  tx('tx_032', 'send', U.get('naomi')!, -800, ago({ days: 16, hours: 7 }), 'Coffee'),
  tx('tx_033', 'receive', U.get('amelia')!, 5500, ago({ days: 18, hours: 4 }), 'Spotify family share'),
  tx('tx_034', 'topup', systemTopUp, 20000, ago({ days: 22, hours: 9 }), 'PayID from CBA', 'PAYID-CBA-5104'),
  tx('tx_035', 'send', U.get('jackl')!, -6500, ago({ days: 28, hours: 6 }), 'Camping trip share'),
]

// ─── SEED BALANCE ───────────────────────────────────────────
// Starting balance for @hannah — feels lived-in but with room to top up.
// Equal to the net of all SEED_TRANSACTIONS above. Used by Home + Send screens.
export const SEED_BALANCE_CENTS = 56550 // $565.50 — exact net of SEED_TRANSACTIONS (verified)

// ─── SEED POINTS ────────────────────────────────────────────
// Sorted Points: action-attached only. The seeded slice below covers the
// visible history; the balance includes older activity beyond it.
export const SEED_POINTS_BALANCE = 1240
export const SEED_POINTS_THIS_WEEK = 114

export const SEED_POINTS_HISTORY: PointsEntry[] = [
  { id: 'pt_001', source: 'tap', amount: 6, createdAt: ago({ hours: 2 }), label: 'Corner Cafe' },
  { id: 'pt_002', source: 'send', amount: 10, createdAt: ago({ hours: 4 }), label: 'Sent to @ella' },
  { id: 'pt_003', source: 'tap', amount: 24, createdAt: ago({ days: 1, hours: 2 }), label: 'Woolworths' },
  { id: 'pt_004', source: 'send', amount: 10, createdAt: ago({ days: 1, hours: 5 }), label: 'Sent to @tomh' },
  { id: 'pt_005', source: 'tap', amount: 4, createdAt: ago({ days: 2, hours: 2 }), label: '7-Eleven' },
  { id: 'pt_006', source: 'send', amount: 10, createdAt: ago({ days: 2, hours: 3 }), label: 'Sent to @naomi' },
  { id: 'pt_007', source: 'send', amount: 25, createdAt: ago({ days: 2, hours: 11 }), label: 'New mate · @isla' },
  { id: 'pt_008', source: 'tap', amount: 6, createdAt: ago({ days: 3, hours: 2 }), label: 'Corner Cafe' },
  { id: 'pt_009', source: 'tap', amount: 19, createdAt: ago({ days: 4, hours: 2 }), label: 'Bunnings Warehouse' },
  { id: 'pt_010', source: 'founding', amount: 250, createdAt: ago({ days: 42 }), label: 'Founding member' },
]

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
  // Demo "now" — must match the DEMO_NOW used to seed transaction timestamps
  // so relative labels stay consistent ("just now", "5h ago", etc.) regardless
  // of when the demo is actually viewed.
  const now = new Date('2026-05-13T14:32:00+10:00')
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
