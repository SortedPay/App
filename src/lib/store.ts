import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  HANNAH,
  MOCK_CONTACTS,
  PointsEntry,
  SEED_BALANCE_CENTS,
  SEED_POINTS_BALANCE,
  SEED_POINTS_HISTORY,
  SEED_POINTS_THIS_WEEK,
  SEED_TRANSACTIONS,
  Transaction,
  User,
} from './mockData'
import { defaultNotificationPrefs } from './notifications'

// ─────────────────────────────────────────────────────────────
// ERRORS
// ─────────────────────────────────────────────────────────────

/**
 * Typed errors so the UI can give specific user-friendly messages without
 * string-matching on .message. Used by send / topUp / cashOut.
 */
export type SortedErrorCode =
  | 'offline'
  | 'insufficient_balance'
  | 'invalid_amount'
  | 'recipient_not_found'
  | 'verify_failed'
  | 'network'
  | 'unknown'

export class SortedError extends Error {
  code: SortedErrorCode
  constructor(code: SortedErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'SortedError'
  }
}

/** Check connectivity. Uses navigator.onLine — best-effort, can lie on some networks. */
function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine !== false
}

// ─────────────────────────────────────────────────────────────
// APP STATE
// ─────────────────────────────────────────────────────────────

type Tier = 0 | 1 | 2

type AppState = {
  // ── identity ──
  user: User
  tier: Tier
  // ── money ──
  balanceCents: number
  /**
   * Sorted Points — earned from ACTIONS (sends, taps, referrals), never from
   * balance held or time elapsed. That distinction is deliberate and legal:
   * points are a loyalty program, not interest. Keep it that way.
   */
  pointsBalance: number
  pointsThisWeek: number
  pointsHistory: PointsEntry[]
  /** The Sorted card (demo state). */
  card: { status: 'active' | 'frozen'; last4: string }
  // ── activity ──
  transactions: Transaction[]
  // ── contacts: handles the user has sent to or added explicitly.
  //    Seeded with MOCK_CONTACTS for v0.2 so testers see people they can send to. ──
  contacts: User[]
  /** Handles the user has pinned to the top of Send Who. Persisted to localStorage. */
  pinnedHandles: string[]
  // ── referrals ──
  /** Stable per-user invite code, e.g. "hannah" → share link app.paymentsorted.com/?ref=hannah */
  referralCode: string
  /** People this user has invited. Status moves invited → confirmed when their friend makes their first send. */
  referrals: Referral[]
  /** Open money requests — both sent (this user asking) and received (someone asking this user). */
  requests: MoneyRequest[]
  // ── UI ──
  notifications: boolean
  /** Per-toggle notification switches, keyed by the ids in `lib/notifications.ts`. */
  notificationPrefs: Record<string, boolean>
  quietHours: QuietHours
  security: SecurityPrefs
  // Object URL pointing at the user's avatar Blob (loaded from IndexedDB on mount).
  // Lives on the store rather than user object because object URLs are session-scoped.
  avatarUrl: string | null
  // ── actions ──
  send: (to: User, amountCents: number, note?: string) => Promise<Transaction>
  /** Create a pending top-up row. Nothing is credited until `confirmTopUp`. */
  topUp: (amountCents: number) => Promise<Transaction>
  /** Mark a pending top-up confirmed and credit the balance. */
  confirmTopUp: (id: string) => void
  cashOut: (amountCents: number) => Promise<Transaction>
  /** Freeze / unfreeze the Sorted card. */
  toggleCardFreeze: () => void
  addContact: (user: User) => void
  removeContact: (handle: string) => void
  /** Toggle a handle in/out of pinnedHandles. Pinned contacts surface first in Send Who. */
  togglePinned: (handle: string) => void
  /** Add a new referral invite (e.g. when user copies the share link, we record who they shared with). */
  addReferral: (friendHandle: string) => void
  /** Demo affordance: simulate a friend's first send so the referrer sees the 500-point unlock. */
  _simulateReferralClaim: (referralId: string) => void
  /** Send a money request to another user. */
  requestMoney: (to: User, amountCents: number, note?: string) => Promise<MoneyRequest>
  /** Mark a received request as paid — fires a real send under the hood. */
  payRequest: (requestId: string) => Promise<Transaction>
  /** Mark a received request as declined — no money moves. */
  declineRequest: (requestId: string) => void
  /** Cancel a sent request. */
  cancelRequest: (requestId: string) => void
  setTier: (t: Tier) => void
  setNotifications: (on: boolean) => void
  setNotificationPref: (id: string, on: boolean) => void
  setQuietHours: (patch: Partial<QuietHours>) => void
  setSecurity: (patch: Partial<SecurityPrefs>) => void
  setAvatarUrl: (url: string | null) => void
  updateUser: (patch: Partial<User>) => void
  reset: () => void
}

export type QuietHours = {
  on: boolean
  /** "HH:MM" 24h, as produced by <input type="time"> */
  from: string
  until: string
}

export type SecurityPrefs = {
  twoFA: boolean
  biometric: boolean
  paymentPin: boolean
}

/** A single referral entry — represents one friend the user invited. */
export type Referral = {
  id: string
  /** What the user typed (could be @handle or just a name). The mock accepts either. */
  friendHandle: string
  status: 'invited' | 'confirmed'
  /** Sorted Points the referrer earned when this referral confirmed. 0 while invited. */
  earnedPoints: number
  /** ISO timestamps for sorting */
  invitedAt: string
  confirmedAt?: string
}

/**
 * A money request — someone (the requester) is asking another user (the target) to send.
 * For 'sent' direction: the current user is asking @target for money.
 * For 'received' direction: someone is asking the current user to pay them.
 * v0.3 mock fires both directions through this same model so testers see the full UI.
 */
export type MoneyRequest = {
  id: string
  /** 'sent' = I'm asking them. 'received' = they're asking me. */
  direction: 'sent' | 'received'
  /** The other party */
  counterparty: User
  amountCents: number
  note?: string
  status: 'pending' | 'paid' | 'declined'
  createdAt: string
  resolvedAt?: string
}

/**
 * Sorted Points per qualifying referral. Referrals pay in points, never cash —
 * points are a loyalty program attached to an action (the mate's first send).
 */
export const REFERRAL_REWARD_POINTS = 500

const DEFAULT_QUIET_HOURS: QuietHours = { on: false, from: '22:00', until: '07:00' }
const DEFAULT_SECURITY: SecurityPrefs = { twoFA: true, biometric: true, paymentPin: false }

// Helper to generate a quick id
const mkId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`

// Initial state object — used both for setup and for reset()
function initialState() {
  // Seed a handful of pending requests so the demo has the inbound + outbound
  // social dynamics on first open. Real users build this organically; the
  // demo needs it from minute one.
  const maya = MOCK_CONTACTS.find((c) => c.handle === 'maya')
  const tomh = MOCK_CONTACTS.find((c) => c.handle === 'tomh')
  const naomi = MOCK_CONTACTS.find((c) => c.handle === 'naomi')
  const ella = MOCK_CONTACTS.find((c) => c.handle === 'ella')
  const charlien = MOCK_CONTACTS.find((c) => c.handle === 'charlien')

  const seededRequests: MoneyRequest[] = []
  if (maya)
    seededRequests.push({
      id: mkId('req'),
      direction: 'received',
      counterparty: maya,
      amountCents: 2400,
      note: 'Lunch + coffee yest',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
    })
  if (tomh)
    seededRequests.push({
      id: mkId('req'),
      direction: 'received',
      counterparty: tomh,
      amountCents: 4800,
      note: 'Birthday gift for Marcus (split 4 ways)',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h ago
    })
  if (naomi)
    seededRequests.push({
      id: mkId('req'),
      direction: 'received',
      counterparty: naomi,
      amountCents: 1750,
      note: 'Yoga membership · your half',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18h ago
    })
  if (ella)
    seededRequests.push({
      id: mkId('req'),
      direction: 'sent',
      counterparty: ella,
      amountCents: 3500,
      note: 'Splendour ticket reso',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26h ago
    })
  if (charlien)
    seededRequests.push({
      id: mkId('req'),
      direction: 'sent',
      counterparty: charlien,
      amountCents: 2200,
      note: 'Banh mi order',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2d ago
    })

  return {
    user: HANNAH,
    tier: 1 as Tier,
    balanceCents: SEED_BALANCE_CENTS,
    pointsBalance: SEED_POINTS_BALANCE,
    pointsThisWeek: SEED_POINTS_THIS_WEEK,
    pointsHistory: [...SEED_POINTS_HISTORY],
    card: { status: 'active' as const, last4: '0521' },
    transactions: [...SEED_TRANSACTIONS],
    contacts: [...MOCK_CONTACTS],
    pinnedHandles: ['jackl', 'maya'] as string[], // pre-pin a couple so users see the feature
    referralCode: HANNAH.handle,
    referrals: [] as Referral[],
    requests: seededRequests,
    notifications: true,
    notificationPrefs: defaultNotificationPrefs(),
    quietHours: { ...DEFAULT_QUIET_HOURS },
    security: { ...DEFAULT_SECURITY },
    avatarUrl: null as string | null,
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState(),

      // ── SEND ──
      // Simulates server validation + signing + confirmation.
      // Total elapsed: ~1.5s for the full flow.
      async send(to, amountCents, note) {
    if (!isOnline()) throw new SortedError('offline', "You're offline. Try again when you have signal.")
    if (amountCents <= 0) throw new SortedError('invalid_amount', 'Amount must be greater than zero.')
    const balance = get().balanceCents
    if (amountCents > balance) throw new SortedError('insufficient_balance', 'Not enough in your balance.')

    // simulate server roundtrip
    await new Promise((r) => setTimeout(r, 600))

    const tx: Transaction = {
      id: mkId('tx'),
      type: 'send',
      counterparty: to,
      amountCents: -amountCents, // outflow
      note,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      reference: `sol_${Math.random().toString(36).slice(2, 8)}`,
    }

    set((state) => {
      // Auto-add to contacts and bump to top (most-recently-paid first).
      // SMS recipients are ad-hoc (no @handle yet) so they stay out of the list.
      const isSmsRecipient = to.id.startsWith('sms_')
      const filtered = state.contacts.filter((c) => c.handle !== to.handle)
      const nextContacts = isSmsRecipient ? state.contacts : [to, ...filtered]

      // Sorted Points: +10 per send — attached to the ACTION, never the balance.
      const pointsEntry: PointsEntry = {
        id: mkId('pt'),
        source: 'send',
        amount: 10,
        createdAt: new Date().toISOString(),
        label: `Sent to @${to.handle}`,
      }

      return {
        balanceCents: state.balanceCents - amountCents,
        transactions: [tx, ...state.transactions],
        contacts: nextContacts,
        pointsBalance: state.pointsBalance + 10,
        pointsThisWeek: state.pointsThisWeek + 10,
        pointsHistory: [pointsEntry, ...state.pointsHistory],
      }
    })

    return tx
  },

  // ── TOP-UP ──
  // Two steps so the UI owns the pacing: topUp() records the pending row the
  // moment the bank payment lands, confirmTopUp() credits once it settles.
  async topUp(amountCents) {
    if (!isOnline()) throw new SortedError('offline', "You're offline. Try again when you have signal.")
    if (amountCents <= 0) throw new SortedError('invalid_amount', 'Amount must be greater than zero.')

    const pendingTx: Transaction = {
      id: mkId('tx'),
      type: 'topup',
      counterparty: { handle: 'topup', firstName: 'Top', lastName: 'up', initials: 'TU', color: 'sky' as const, verified: true },
      amountCents,
      note: 'PayID from CBA',
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    set((state) => ({
      transactions: [pendingTx, ...state.transactions],
    }))

    return pendingTx
  },

  confirmTopUp: (id) =>
    set((state) => {
      const target = state.transactions.find((tx) => tx.id === id)
      if (!target || target.type !== 'topup' || target.status !== 'pending') return state
      const reference = `PAYID-CBA-${Math.floor(1000 + Math.random() * 9000)}`
      return {
        balanceCents: state.balanceCents + target.amountCents,
        transactions: state.transactions.map((tx) =>
          tx.id === id ? { ...tx, status: 'confirmed', reference } : tx,
        ),
      }
    }),

  // ── CASH-OUT ──
  async cashOut(amountCents) {
    if (!isOnline()) throw new SortedError('offline', "You're offline. Try again when you have signal.")
    if (amountCents <= 0) throw new SortedError('invalid_amount', 'Amount must be greater than zero.')
    const balance = get().balanceCents
    if (amountCents > balance) throw new SortedError('insufficient_balance', 'Not enough in your balance.')

    await new Promise((r) => setTimeout(r, 800))

    const tx: Transaction = {
      id: mkId('tx'),
      type: 'cashout',
      counterparty: { handle: 'cashout', firstName: 'Cash', lastName: 'out', initials: 'CO', color: 'butter' as const, verified: true },
      amountCents: -amountCents,
      note: 'to CBA savings',
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      reference: `PAYID-OUT-${Math.floor(1000 + Math.random() * 9000)}`,
    }

    set((state) => ({
      balanceCents: state.balanceCents - amountCents,
      transactions: [tx, ...state.transactions],
    }))

    return tx
  },

  // ── CONTACTS ──
  addContact: (user) =>
    set((state) => {
      // No-op if handle already present (avoid duplicates)
      if (state.contacts.some((c) => c.handle === user.handle)) return state
      // New contacts go to the top so they're easy to find right after adding
      return { contacts: [user, ...state.contacts] }
    }),

  removeContact: (handle) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.handle !== handle),
      // Also unpin if removed
      pinnedHandles: state.pinnedHandles.filter((h) => h !== handle),
    })),

  togglePinned: (handle) =>
    set((state) => {
      const already = state.pinnedHandles.includes(handle)
      return {
        pinnedHandles: already
          ? state.pinnedHandles.filter((h) => h !== handle)
          : [...state.pinnedHandles, handle],
      }
    }),

  // ── REFERRALS ──
  addReferral: (friendHandle) =>
    set((state) => {
      // Strip @ if user pasted it in, normalise to lowercase
      const normalised = friendHandle.replace(/^@/, '').trim().toLowerCase()
      if (!normalised) return state
      // No-op if we already invited this person
      if (state.referrals.some((r) => r.friendHandle === normalised)) return state
      const newReferral: Referral = {
        id: mkId('ref'),
        friendHandle: normalised,
        status: 'invited',
        earnedPoints: 0,
        invitedAt: new Date().toISOString(),
      }
      return { referrals: [newReferral, ...state.referrals] }
    }),

  // Demo only — stands in for the backend event that fires when an invited
  // friend makes their first send. Exposed as an in-app button on the
  // referrals dashboard so testers can see the unlock flow.
  _simulateReferralClaim: (referralId) =>
    set((state) => {
      const target = state.referrals.find((r) => r.id === referralId)
      if (!target || target.status === 'confirmed') return state
      const now = new Date().toISOString()
      const pointsEntry: PointsEntry = {
        id: mkId('pt'),
        source: 'referral',
        amount: REFERRAL_REWARD_POINTS,
        createdAt: now,
        label: `Referred @${target.friendHandle}`,
      }
      // Points only — the reward never touches balanceCents.
      return {
        referrals: state.referrals.map((r) =>
          r.id === referralId
            ? { ...r, status: 'confirmed', earnedPoints: REFERRAL_REWARD_POINTS, confirmedAt: now }
            : r
        ),
        pointsBalance: state.pointsBalance + REFERRAL_REWARD_POINTS,
        pointsThisWeek: state.pointsThisWeek + REFERRAL_REWARD_POINTS,
        pointsHistory: [pointsEntry, ...state.pointsHistory],
      }
    }),

  // ── CARD ──
  // Freeze / unfreeze the Sorted card. Demo state only — production wires
  // this to the issuer-processor's freeze endpoint.
  toggleCardFreeze: () =>
    set((state) => ({
      card: { ...state.card, status: state.card.status === 'frozen' ? 'active' : 'frozen' },
    })),

  // ── REQUESTS ──
  // Send a request to another user. Mirrors send() shape but doesn't move money;
  // creates a pending row that the receiver can pay or decline.
  async requestMoney(to, amountCents, note) {
    if (!isOnline()) throw new SortedError('offline', "You're offline. Try again when you have signal.")
    if (amountCents <= 0) throw new SortedError('invalid_amount', 'Amount must be greater than zero.')
    // Simulate a quick server roundtrip so the UI feels real
    await new Promise((r) => setTimeout(r, 500))

    const req: MoneyRequest = {
      id: mkId('req'),
      direction: 'sent',
      counterparty: to,
      amountCents,
      note,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      requests: [req, ...state.requests],
      // Also surface the contact in recents (same UX as send) so the next time
      // they're top-of-list
      contacts: [to, ...state.contacts.filter((c) => c.handle !== to.handle)],
    }))
    return req
  },

  // Pay a received request — fires a real send under the hood and marks the
  // request paid. If send throws (insufficient balance / offline), the request
  // stays pending so user can try again later.
  async payRequest(requestId) {
    const req = get().requests.find((r) => r.id === requestId)
    if (!req) throw new SortedError('unknown', 'Request not found.')
    if (req.direction !== 'received') throw new SortedError('unknown', 'Cannot pay your own request.')
    if (req.status !== 'pending') throw new SortedError('unknown', 'This request was already resolved.')

    const tx = await get().send(req.counterparty, req.amountCents, req.note)
    // On success, mark the request paid
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'paid', resolvedAt: new Date().toISOString() } : r
      ),
    }))
    return tx
  },

  declineRequest: (requestId) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'declined', resolvedAt: new Date().toISOString() } : r
      ),
    })),

  cancelRequest: (requestId) =>
    set((state) => ({
      // Cancel = remove from list. We don't keep cancelled rows around — too noisy.
      requests: state.requests.filter((r) => r.id !== requestId),
    })),

  // ── UI/SETTINGS ──
  setTier: (t) => set({ tier: t }),
  setNotifications: (on) => set({ notifications: on }),
  setNotificationPref: (id, on) =>
    set((state) => ({ notificationPrefs: { ...state.notificationPrefs, [id]: on } })),
  setQuietHours: (patch) => set((state) => ({ quietHours: { ...state.quietHours, ...patch } })),
  setSecurity: (patch) => set((state) => ({ security: { ...state.security, ...patch } })),
  setAvatarUrl: (url) =>
    set((state) => {
      // Revoke any previous object URL we created to avoid memory leaks
      if (state.avatarUrl && state.avatarUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(state.avatarUrl)
        } catch {
          // ignore — best-effort cleanup
        }
      }
      return { avatarUrl: url }
    }),
  updateUser: (patch) => set((state) => ({ user: { ...state.user, ...patch } })),

  // ── RESET ──
  reset: () => {
    // Clear localStorage so reset survives a refresh — otherwise the persisted
    // state would rehydrate and override the fresh initialState.
    try {
      localStorage.removeItem('sorted-app-state')
    } catch {
      // ignore — Safari private mode etc
    }
    set(initialState())
  },
}),
    {
      name: 'sorted-app-state',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== 'object') return persisted
        let p = persisted as Record<string, unknown>
        if (version < 2) p = migrateV1toV2(p)
        if (version < 3) p = migrateV2toV3(p)
        return p
      },
      /**
       * Only persist user-meaningful state. Skip derived/transient fields:
       *   - avatarUrl: blob URL, can't survive a reload anyway (re-loaded from IndexedDB)
       *
       * Functions are stripped automatically by JSON serialization.
       */
      partialize: (state) => ({
        user: state.user,
        tier: state.tier,
        balanceCents: state.balanceCents,
        pointsBalance: state.pointsBalance,
        pointsThisWeek: state.pointsThisWeek,
        pointsHistory: state.pointsHistory,
        card: state.card,
        transactions: state.transactions,
        contacts: state.contacts,
        pinnedHandles: state.pinnedHandles,
        referralCode: state.referralCode,
        referrals: state.referrals,
        requests: state.requests,
        notifications: state.notifications,
        notificationPrefs: state.notificationPrefs,
        quietHours: state.quietHours,
        security: state.security,
      }),
    }
  )
)

/**
 * v1 → v2: the pivot. Yield is gone (legal), points + card arrived.
 * Strip yield transactions + fields from any persisted v1 state and
 * seed the new points/card slices so old testers land cleanly.
 */
function migrateV1toV2(p: Record<string, unknown>): Record<string, unknown> {
  const txs = Array.isArray(p.transactions)
    ? (p.transactions as Transaction[]).filter((t) => (t.type as string) !== 'yield')
    : []
  delete p.accruedYieldCents
  delete p.yieldTodayCents
  delete p.lifetimeYieldCents
  return {
    ...p,
    transactions: txs,
    pointsBalance: SEED_POINTS_BALANCE,
    pointsThisWeek: SEED_POINTS_THIS_WEEK,
    pointsHistory: [...SEED_POINTS_HISTORY],
    card: { status: 'active' as const, last4: '0521' },
  }
}

/**
 * v2 → v3: referrals pay in points instead of cash, and the notification /
 * quiet-hours / security toggles moved from component state into the store.
 */
function migrateV2toV3(p: Record<string, unknown>): Record<string, unknown> {
  type LegacyReferral = Omit<Referral, 'earnedPoints'> & { earnedCents?: number; earnedPoints?: number }
  const referrals = Array.isArray(p.referrals)
    ? (p.referrals as LegacyReferral[]).map((legacy) => {
        const r = { ...legacy }
        delete r.earnedCents
        const earnedPoints = r.earnedPoints ?? (r.status === 'confirmed' ? REFERRAL_REWARD_POINTS : 0)
        return { ...r, earnedPoints }
      })
    : []
  return {
    ...p,
    referrals,
    notificationPrefs: defaultNotificationPrefs(),
    quietHours: { ...DEFAULT_QUIET_HOURS },
    security: { ...DEFAULT_SECURITY },
  }
}
