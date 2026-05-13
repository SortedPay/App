import { create } from 'zustand'
import {
  HANNAH,
  MOCK_CONTACTS,
  SEED_BALANCE_CENTS,
  SEED_LIFETIME_YIELD_CENTS,
  SEED_TRANSACTIONS,
  SEED_YIELD_TODAY_CENTS,
  Transaction,
  User,
} from './mockData'

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
   * Yield earned but not yet claimed. Accrues over time based on balance.
   * Separate from balanceCents — user must tap "Claim Now" on the Yield
   * screen to move accrued → balance. Mirrors how real APY products work
   * (pending rewards vs spendable balance).
   */
  accruedYieldCents: number
  yieldTodayCents: number
  lifetimeYieldCents: number
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
  /** People this user has invited. Status moves invited → confirmed when their friend tops up ≥ $20. */
  referrals: Referral[]
  /** Open money requests — both sent (this user asking) and received (someone asking this user). */
  requests: MoneyRequest[]
  // ── UI ──
  notifications: boolean
  // Object URL pointing at the user's avatar Blob (loaded from IndexedDB on mount).
  // Lives on the store rather than user object because object URLs are session-scoped.
  avatarUrl: string | null
  // ── actions ──
  send: (to: User, amountCents: number, note?: string) => Promise<Transaction>
  topUp: (amountCents: number) => Promise<Transaction>
  cashOut: (amountCents: number) => Promise<Transaction>
  /** Move all accrued yield into spendable balance. Returns the amount claimed. */
  claimYield: () => number
  addContact: (user: User) => void
  removeContact: (handle: string) => void
  /** Toggle a handle in/out of pinnedHandles. Pinned contacts surface first in Send Who. */
  togglePinned: (handle: string) => void
  /** Add a new referral invite (e.g. when user copies the share link, we record who they shared with). */
  addReferral: (friendHandle: string) => void
  /** Demo affordance: simulate a friend topping up $20+ so referrer sees the $10 unlock. */
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
  setAvatarUrl: (url: string | null) => void
  updateUser: (patch: Partial<User>) => void
  reset: () => void
  // ── internal: simulated yield tick ──
  _tickYield: () => void
}

/** A single referral entry — represents one friend the user invited. */
export type Referral = {
  id: string
  /** What the user typed (could be @handle or just a name). For v0.2 mock we accept either. */
  friendHandle: string
  status: 'invited' | 'confirmed'
  /** Cents the referrer earned when this referral confirmed. 0 while invited. */
  earnedCents: number
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

/** Reward per qualifying referral, in cents. Adjust here to change the offer. */
export const REFERRAL_REWARD_CENTS = 1000 // $10

// Helper to generate a quick id
const mkId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`

// Initial state object — used both for setup and for reset()
function initialState() {
  // Seed one received request so the demo immediately shows the "someone's asking you for money" UI
  const maya = MOCK_CONTACTS.find((c) => c.handle === 'maya')
  const seededRequests: MoneyRequest[] = maya
    ? [
        {
          id: mkId('req'),
          direction: 'received',
          counterparty: maya,
          amountCents: 2400,
          note: 'Lunch + coffee yest',
          status: 'pending',
          createdAt: new Date(Date.now() - 1000 * 60 * 23).toISOString(), // 23 min ago
        },
      ]
    : []
  return {
    user: HANNAH,
    tier: 1 as Tier,
    balanceCents: SEED_BALANCE_CENTS,
    accruedYieldCents: 0,
    yieldTodayCents: SEED_YIELD_TODAY_CENTS,
    lifetimeYieldCents: SEED_LIFETIME_YIELD_CENTS,
    transactions: [...SEED_TRANSACTIONS],
    contacts: [...MOCK_CONTACTS],
    pinnedHandles: [] as string[],
    referralCode: HANNAH.handle, // user's handle doubles as their referral code in v0.2
    referrals: [] as Referral[],
    requests: seededRequests,
    notifications: true,
    avatarUrl: null as string | null,
  }
}

export const useStore = create<AppState>((set, get) => ({
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
      // We strip out the existing entry (if any) and unshift the fresh one
      // so the user's RECENT list naturally shows the people they pay most.
      const filtered = state.contacts.filter((c) => c.handle !== to.handle)
      const nextContacts = [to, ...filtered]

      return {
        balanceCents: state.balanceCents - amountCents,
        transactions: [tx, ...state.transactions],
        contacts: nextContacts,
      }
    })

    return tx
  },

  // ── TOP-UP ──
  // Three states: pending → confirmed (3 seconds delay).
  // Returns the pending transaction immediately so UI can show it,
  // then mutates to confirmed.
  async topUp(amountCents) {
    if (!isOnline()) throw new SortedError('offline', "You're offline. Try again when you have signal.")
    if (amountCents <= 0) throw new SortedError('invalid_amount', 'Amount must be greater than zero.')

    const id = mkId('tx')
    const pendingTx: Transaction = {
      id,
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

    // After 3s, confirm it
    setTimeout(() => {
      set((state) => ({
        balanceCents: state.balanceCents + amountCents,
        transactions: state.transactions.map((tx) =>
          tx.id === id
            ? { ...tx, status: 'confirmed', reference: `PAYID-CBA-${Math.floor(1000 + Math.random() * 9000)}` }
            : tx,
        ),
      }))
    }, 3000)

    return pendingTx
  },

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
        earnedCents: 0,
        invitedAt: new Date().toISOString(),
      }
      return { referrals: [newReferral, ...state.referrals] }
    }),

  // Demo only — simulates the backend webhook that fires when an invited
  // friend tops up $20+. In v0.3 this is triggered by a real top-up event
  // server-side; in v0.2 we expose it as an in-app button on the referrals
  // dashboard so testers can see the unlock flow.
  _simulateReferralClaim: (referralId) =>
    set((state) => {
      const target = state.referrals.find((r) => r.id === referralId)
      if (!target || target.status === 'confirmed') return state
      const now = new Date().toISOString()
      return {
        referrals: state.referrals.map((r) =>
          r.id === referralId
            ? { ...r, status: 'confirmed', earnedCents: REFERRAL_REWARD_CENTS, confirmedAt: now }
            : r
        ),
        // Reward lands directly in spendable balance (referrer-only model, friend gets $0)
        balanceCents: state.balanceCents + REFERRAL_REWARD_CENTS,
      }
    }),

  // ── CLAIM YIELD ──
  // Moves accrued yield into spendable balance. The "rewards pending" pattern.
  claimYield: () => {
    const accrued = get().accruedYieldCents
    if (accrued <= 0) return 0
    set((state) => ({
      balanceCents: state.balanceCents + state.accruedYieldCents,
      accruedYieldCents: 0,
    }))
    return accrued
  },

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
  reset: () => set(initialState()),

  // ── YIELD TICK ──
  // Called by App.tsx every 5s so demos feel alive. Yield accrues into
  // `accruedYieldCents` (separate from spendable balance) — the user must
  // tap "Claim Now" on the Yield screen to compound it into balance.
  //
  // Real APY: 3.33% over a year ≈ 0.0001053% per minute, so on a $50 balance
  // ≈ 0.005 cents/minute — invisible. For the v0.2 demo we accelerate ~1000x
  // so testers see accrued yield tick up in their session. Drop the multiplier
  // before going live.
  _tickYield: () => {
    set((state) => {
      // Tick scales with balance — 0 balance means 0 yield, $100 balance means
      // ~5 cents per minute in demo time. Floor at 0 cents on empty balance so
      // the demo doesn't show fake yield before the user tops up.
      if (state.balanceCents <= 0) return state
      // Demo formula: 1 cent per $20 of balance per 5s tick. So $100 → 5c/5s.
      const accrueCents = Math.max(1, Math.floor(state.balanceCents / 2000))
      return {
        accruedYieldCents: state.accruedYieldCents + accrueCents,
        yieldTodayCents: state.yieldTodayCents + accrueCents,
        lifetimeYieldCents: state.lifetimeYieldCents + accrueCents,
      }
    })
  },
}))
