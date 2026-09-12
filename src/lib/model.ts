/**
 * The app's view of the world: the shapes screens render, and the helpers
 * that format them. Everything here is populated from the API (see
 * `lib/api`), never from seed data.
 */

export type AvatarColor = 'lime' | 'coral' | 'sky' | 'butter' | 'plum'

export type User = {
  id: string
  handle: string
  firstName: string
  lastName: string
  initials: string // for avatar fallback
  color: AvatarColor
  verified: boolean // KYC tier 1+
  /** Australian mobile for display, e.g. "0412 345 921". Only the signed-in user has one. */
  phone?: string
  email?: string
}

/** A non-user counterparty: the top-up / cash-out system rows, a merchant, an SMS recipient. */
export type SystemCounterparty = {
  handle: string
  firstName: string
  lastName: string
  initials: string
  color: AvatarColor
  verified: boolean
}

export type Transaction = {
  id: string
  type: 'send' | 'receive' | 'topup' | 'cashout' | 'tap'
  // For send/receive: the other party. For topup/cashout: a system label. For tap: the merchant.
  counterparty: User | SystemCounterparty
  // amount in minor units (cents). Positive = inflow, negative = outflow.
  amountCents: number
  note?: string
  // ISO timestamp
  createdAt: string
  status: 'pending' | 'confirmed' | 'failed' | 'reversed'
  // The on-chain signature (or PayID reference) once confirmed
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
  source: 'send' | 'new_contact' | 'tap' | 'referral' | 'profile' | 'founding'
  amount: number
  createdAt: string
  label?: string
}

// ─── HELPERS ────────────────────────────────────────────────

export function formatAUD(cents: number, opts: { showSign?: boolean; compact?: boolean } = {}): string {
  const abs = Math.abs(cents)
  const dollars = (abs / 100).toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const sign = opts.showSign ? (cents >= 0 ? '+' : '−') : cents < 0 ? '−' : ''
  return `${sign}$${dollars}`
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso)
  const diffMs = Date.now() - then.getTime()
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

/** "0412 345 921" → "+61 412 345 921". Returns the input untouched if it isn't a local mobile. */
export function formatPhoneIntl(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!/^04\d{8}$/.test(digits)) return phone
  const local = digits.slice(1)
  return `+61 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}

export function normaliseHandle(raw: string): string {
  return raw.replace(/^@/, '').trim().toLowerCase()
}

// ─── KNOWN USERS ────────────────────────────────────────────
// Every profile the app has seen from the API (contacts, search results,
// counterparties) so a route like /send/:handle resolves without another
// round trip. Screens fall back to `users.byHandle` when it misses.

const known = new Map<string, User>()

export function rememberUsers(users: Iterable<User>) {
  for (const u of users) if (u.handle) known.set(u.handle.toLowerCase(), u)
}

export function knownUser(handle: string): User | undefined {
  return known.get(normaliseHandle(handle))
}

export function forgetKnownUsers() {
  known.clear()
}

/**
 * Find a user by handle. Contacts win, then anything the API has shown us.
 * Returns undefined when we have never seen them; callers that need certainty
 * ask the API (`useResolvedUser`).
 */
export function resolveUser(handle: string, contacts: User[]): User | undefined {
  const h = normaliseHandle(handle)
  if (!h) return undefined
  return contacts.find((c) => c.handle.toLowerCase() === h) ?? knownUser(h)
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
