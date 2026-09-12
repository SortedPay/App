import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api, apiConfigured, idempotencyKey, SortedError } from './api/client'
import type * as A from './api/types'
import {
  authMode,
  hasSession,
  signOut as endSession,
  signPreparedTransaction,
  stashedReferralCode,
  stashReferralCode,
  toLocalMobile,
  whenAuthReady,
} from './auth'
import { forgetKnownUsers, rememberUsers, type AvatarColor, type PointsEntry, type Transaction, type User } from './model'
import { defaultNotificationPrefs } from './notifications'

export { SortedError }
export type { SortedErrorCode } from './api/types'

// ─────────────────────────────────────────────────────────────
// APP STATE
//
// Every slice below is populated from the API and cached in localStorage
// so the app paints instantly on the next open; `refresh()` replaces it.
// The only local-authoritative state is the UI preferences at the bottom.
// ─────────────────────────────────────────────────────────────

type Tier = 0 | 1 | 2

export type SessionStatus = 'booting' | 'signed_out' | 'signed_in' | 'unreachable'

export type Session = {
  status: SessionStatus
  /** Why we could not reach the API, when status is 'unreachable'. */
  error: string | null
}

type AppState = {
  session: Session
  /** The API's non-secret runtime config: who signs, whether demo affordances exist. */
  config: A.SystemConfig | null
  /** When the snapshot below last came from the API (ms epoch). null = cache only. */
  hydratedAt: number | null
  // ── identity ──
  user: User
  tier: Tier
  limits: A.TierLimits | null
  walletAddress: string | null
  // ── money ──
  balanceCents: number
  /** Outflows prepared but not yet settled; already excluded from balanceCents. */
  reservedCents: number
  /**
   * Sorted Points — earned from ACTIONS (sends, taps, referrals), never from
   * balance held or time elapsed. That distinction is deliberate and legal:
   * points are a loyalty program, not interest. Keep it that way.
   */
  pointsBalance: number
  pointsThisWeek: number
  pointsHistory: PointsEntry[]
  /** The Sorted card. */
  card: { status: 'active' | 'frozen'; last4: string }
  // ── activity ──
  transactions: Transaction[]
  // ── contacts: people the user has sent to, received from, or added explicitly ──
  contacts: User[]
  /** Handles pinned to the top of Send Who. Derived from the API's per-contact flag. */
  pinnedHandles: string[]
  // ── referrals ──
  /** Stable per-user invite code (the @handle) → share link app.paymentsorted.com/?ref=<code> */
  referralCode: string
  referrals: Referral[]
  /** Open money requests — both sent (this user asking) and received (someone asking this user). */
  requests: MoneyRequest[]
  /** SMS sends still waiting to be claimed (undo window open). */
  pendingSmsSends: A.SmsClaim[]
  // ── UI ──
  notifications: boolean
  /** Per-toggle notification switches, keyed by the ids in `lib/notifications.ts`. */
  notificationPrefs: Record<string, boolean>
  quietHours: QuietHours
  security: SecurityPrefs
  // Object URL pointing at the user's avatar Blob (loaded from IndexedDB on mount).
  avatarUrl: string | null

  // ── session ──
  /** App start: learn the API config, restore the session, fetch or clear the snapshot. */
  boot: () => Promise<void>
  /** After sign-in: create/load the user on the API and pull everything. */
  bootstrap: () => Promise<A.MeSummary>
  /** Re-fetch every slice. Safe to call often; one batched request. */
  refresh: () => Promise<void>
  signOut: () => Promise<void>
  // ── onboarding ──
  claimHandle: (handle: string) => Promise<void>
  updateProfile: (patch: { firstName?: string; lastName?: string; color?: AvatarColor; email?: string | null }) => Promise<void>
  startVerification: (tier: 1 | 2) => Promise<void>
  // ── money ──
  /** Handle send: prepare → sign (Privy) → submit. Resolves once the chain confirms, or with a pending row if it is slow. */
  send: (to: User, amountCents: number, note?: string) => Promise<Transaction>
  /** SMS send into escrow. Resolves with the claim the recipient will use. */
  sendViaSms: (input: { phone: string; name?: string; amountCents: number; note?: string }) => Promise<{ transaction: Transaction; claim: A.SmsClaim }>
  undoSms: (claimId: string) => Promise<void>
  claimSms: (code: string) => Promise<Transaction>
  /** Create a PayID top-up intent. Nothing is credited until the bank payment lands. */
  topUp: (amountCents: number) => Promise<A.TopupIntent>
  /** Poll a top-up; refreshes the balance when it lands. */
  refreshTopUp: (intentId: string) => Promise<A.TopupIntent>
  /** Demo only (ALLOW_SIMULATION): pretend the bank payment arrived. */
  simulateBankPayment: (intentId: string) => Promise<A.TopupIntent>
  cashOut: (amountCents: number, bankAccountId: string) => Promise<Transaction>
  toggleCardFreeze: () => Promise<void>
  // ── people ──
  addContact: (user: User) => Promise<void>
  removeContact: (handle: string) => Promise<void>
  /** Toggle a handle in/out of pinnedHandles. Pinned contacts surface first in Send Who. */
  togglePinned: (handle: string) => Promise<void>
  /** Record who the user invited so the referral shows as "invited" until their first send. */
  addReferral: (friendHandle: string) => Promise<void>
  // ── requests ──
  requestMoney: (to: User, amountCents: number, note?: string) => Promise<MoneyRequest>
  splitBill: (people: User[], totalCents: number, note?: string) => Promise<{ perPersonCents: number; yourShareCents: number }>
  /** Pay a received request — a real send under the hood (prepare → sign → submit). */
  payRequest: (requestId: string) => Promise<Transaction>
  declineRequest: (requestId: string) => Promise<void>
  cancelRequest: (requestId: string) => Promise<void>
  // ── UI ──
  setNotifications: (on: boolean) => void
  setNotificationPref: (id: string, on: boolean) => void
  setQuietHours: (patch: Partial<QuietHours>) => void
  setSecurity: (patch: Partial<SecurityPrefs>) => void
  setAvatarUrl: (url: string | null) => void
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

/** A single referral entry — one friend the user invited. */
export type Referral = {
  id: string
  friendHandle: string
  status: 'invited' | 'confirmed'
  /** Sorted Points the referrer earned when this referral confirmed. 0 while invited. */
  earnedPoints: number
  invitedAt: string
  confirmedAt?: string
}

/**
 * A money request — someone (the requester) is asking another user (the payer) to send.
 * 'sent' = I'm asking them. 'received' = they're asking me.
 */
export type MoneyRequest = {
  id: string
  direction: 'sent' | 'received'
  counterparty: User
  amountCents: number
  note?: string
  status: A.RequestStatus
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

/** Placeholder identity while signed out or before the first bootstrap. */
const NOBODY: User = { id: '', handle: '', firstName: '', lastName: '', initials: '··', color: 'lime', verified: false }

// ─────────────────────────────────────────────────────────────
// MAPPERS — API wire shapes → what the screens render
// ─────────────────────────────────────────────────────────────

function toUser(p: A.PublicUser): User {
  return { id: p.id, handle: p.handle, firstName: p.firstName, lastName: p.lastName, initials: p.initials, color: p.color, verified: p.verified }
}

function toMeUser(p: A.MeUser): User {
  return { ...toUser(p), phone: p.phone ? toLocalMobile(p.phone) : undefined, email: p.email ?? undefined }
}

function toTransaction(item: A.ActivityItem): Transaction {
  const cp = 'id' in item.counterparty ? toUser(item.counterparty) : item.counterparty
  return {
    id: item.id,
    type: item.type,
    counterparty: cp,
    amountCents: item.amountCents,
    note: item.note ?? undefined,
    createdAt: item.createdAt,
    status: item.status,
    reference: item.reference ?? undefined,
  }
}

/** A freshly settled outflow, before the activity feed catches up. */
function outflowFromRow(row: A.TransactionRow, type: Transaction['type'], counterparty: Transaction['counterparty']): Transaction {
  return {
    id: row.id,
    type,
    counterparty,
    amountCents: -row.amountCents,
    note: row.note ?? undefined,
    createdAt: row.createdAt,
    status: row.status,
    reference: row.reference ?? undefined,
  }
}

function toRequest(r: A.RequestView): MoneyRequest {
  return {
    id: r.id,
    direction: r.direction,
    counterparty: toUser(r.counterparty),
    amountCents: r.amountCents,
    note: r.note ?? undefined,
    status: r.status,
    createdAt: r.createdAt,
    resolvedAt: r.resolvedAt ?? undefined,
  }
}

function toPoints(e: A.PointsEntryRow): PointsEntry {
  return { id: e.id, source: e.source, amount: e.amount, createdAt: e.createdAt, label: e.label ?? undefined }
}

function toReferral(r: A.ReferralRow): Referral {
  return { id: r.id, friendHandle: r.friendHandle, status: r.status, earnedPoints: r.earnedPoints, invitedAt: r.invitedAt, confirmedAt: r.confirmedAt ?? undefined }
}

function tierOf(kycTier: number): Tier {
  return kycTier >= 2 ? 2 : kycTier === 1 ? 1 : 0
}

function fromMe(me: A.MeSummary) {
  return {
    user: toMeUser(me.user),
    tier: tierOf(me.user.kycTier),
    limits: me.limits,
    walletAddress: me.user.walletAddress,
    balanceCents: me.balanceCents,
    reservedCents: me.reservedCents,
    pointsBalance: me.points.balance,
    pointsThisWeek: me.points.thisWeek,
    card: { status: me.card.status, last4: me.card.last4 },
    referralCode: me.user.handle,
  }
}

const SETTLE_POLL_MS = 1_500
const SETTLE_POLL_MAX = 20

/** Empty data slices — what a signed-out app holds. Preferences are kept. */
function emptyData() {
  return {
    hydratedAt: null as number | null,
    user: NOBODY,
    tier: 0 as Tier,
    limits: null as A.TierLimits | null,
    walletAddress: null as string | null,
    balanceCents: 0,
    reservedCents: 0,
    pointsBalance: 0,
    pointsThisWeek: 0,
    pointsHistory: [] as PointsEntry[],
    card: { status: 'active' as const, last4: '····' },
    transactions: [] as Transaction[],
    contacts: [] as User[],
    pinnedHandles: [] as string[],
    referralCode: '',
    referrals: [] as Referral[],
    requests: [] as MoneyRequest[],
    pendingSmsSends: [] as A.SmsClaim[],
  }
}

function initialState() {
  return {
    session: { status: 'booting' as SessionStatus, error: null as string | null },
    config: null as A.SystemConfig | null,
    ...emptyData(),
    notifications: true,
    notificationPrefs: defaultNotificationPrefs(),
    quietHours: { ...DEFAULT_QUIET_HOURS },
    security: { ...DEFAULT_SECURITY },
    avatarUrl: null as string | null,
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      /** Prepare → sign (Privy custody) → submit → wait for the chain. Shared by handle sends and request payments. */
      async function settleOutflow(prepared: A.PreparedOutflow): Promise<A.TransactionRow> {
        const signedTransaction = get().config?.custody === 'privy' ? await signPreparedTransaction(prepared.transaction) : undefined
        let row = await api.sends.submit({ transactionId: prepared.transactionId, signedTransaction })
        for (let i = 0; row.status === 'pending' && i < SETTLE_POLL_MAX; i++) {
          await new Promise((r) => setTimeout(r, SETTLE_POLL_MS))
          const status = await api.sends.status(row.id)
          if (status.status === 'failed') throw new SortedError('chain_failed', 'The network rejected that send. Nothing moved.')
          row = { ...row, status: status.status, reference: status.reference }
        }
        return row
      }

      /** Optimistically drop a settled outflow into the feed and balance; `refresh` makes it exact. */
      function recordOutflow(tx: Transaction) {
        set((state) => ({
          transactions: [tx, ...state.transactions.filter((t) => t.id !== tx.id)],
          balanceCents: state.balanceCents + tx.amountCents,
        }))
        void get().refresh()
      }

      function applyMe(me: A.MeSummary) {
        set(fromMe(me))
      }

      /** One in-flight call per key; concurrent callers share the same promise. */
      const inflight = new Map<string, Promise<void>>()
      function coalesce(key: string, work: () => Promise<void>): Promise<void> {
        const existing = inflight.get(key)
        if (existing) return existing
        const p = work().finally(() => inflight.delete(key))
        inflight.set(key, p)
        return p
      }

      async function guarded<T>(work: () => Promise<T>): Promise<T> {
        try {
          return await work()
        } catch (err) {
          if (err instanceof SortedError && err.code === 'unauthorized') {
            await get().signOut()
          }
          throw err
        }
      }

      async function bootOnce() {
        if (!apiConfigured) {
          set({ session: { status: 'unreachable', error: "This build isn't connected to a Sorted API (VITE_API_URL is empty)." } })
          return
        }
        set((s) => ({ session: { status: s.session.status === 'signed_in' ? 'signed_in' : 'booting', error: null } }))
        await whenAuthReady()
        let config: A.SystemConfig
        try {
          config = await api.system.config()
        } catch (err) {
          const e = err instanceof SortedError ? err : new SortedError('network', 'Could not reach Sorted.')
          set({ session: { status: 'unreachable', error: e.message } })
          return
        }
        set({ config })
        if (config.authProvider !== authMode) {
          set({
            session: {
              status: 'unreachable',
              error: `This build signs in with ${authMode === 'privy' ? 'Privy' : 'dev tokens'} but the API expects ${config.authProvider === 'privy' ? 'Privy' : 'dev tokens'}.`,
            },
          })
          return
        }
        if (!hasSession()) {
          forgetKnownUsers()
          set({ ...emptyData(), session: { status: 'signed_out', error: null } })
          return
        }
        try {
          await get().bootstrap()
        } catch (err) {
          if (err instanceof SortedError && (err.code === 'network' || err.code === 'offline')) {
            // Keep the cached snapshot; the user can still read it.
            set({ session: { status: get().hydratedAt ? 'signed_in' : 'unreachable', error: err.message } })
            return
          }
          await get().signOut()
        }
      }

      async function refreshOnce() {
        if (get().session.status !== 'signed_in' && get().session.status !== 'booting') return
        const [me, activity, contacts, requests, points, referrals, pendingSms] = await guarded(() =>
          Promise.all([
            api.auth.me(),
            api.activity.list({ limit: 100 }),
            api.contacts.list(),
            api.requests.list(),
            api.points.summary(),
            api.referrals.list(),
            api.activity.pendingSms(),
          ]),
        )
        const contactUsers = contacts.map(toUser)
        const requestViews = requests.map(toRequest)
        const txs = activity.map(toTransaction)
        rememberUsers(contactUsers)
        rememberUsers(requestViews.map((r) => r.counterparty))
        rememberUsers(txs.map((t) => t.counterparty).filter((c): c is User => 'id' in c))
        set({
          ...fromMe(me),
          hydratedAt: Date.now(),
          session: { status: 'signed_in', error: null },
          transactions: txs,
          contacts: contactUsers,
          pinnedHandles: contacts.filter((c) => c.pinned).map((c) => c.handle),
          requests: requestViews,
          pointsHistory: points.history.map(toPoints),
          referralCode: referrals.code,
          referrals: referrals.referrals.map(toReferral),
          pendingSmsSends: pendingSms,
        })
      }

      return {
        ...initialState(),

        // ── SESSION ──
        boot() {
          return coalesce('boot', bootOnce)
        },

        refresh() {
          return coalesce('refresh', refreshOnce)
        },

        async signOut() {
          await endSession()
          forgetKnownUsers()
          set({ ...emptyData(), session: { status: 'signed_out', error: null } })
        },

        async bootstrap() {
          const referralCode = stashedReferralCode() ?? undefined
          const me = await guarded(() => api.auth.bootstrap(referralCode ? { referralCode } : {}))
          stashReferralCode(null)
          applyMe(me)
          set({ session: { status: 'signed_in', error: null } })
          if (me.user.hasHandle) await get().refresh()
          else set({ hydratedAt: Date.now() })
          return me
        },

        // ── ONBOARDING ──
        async claimHandle(handle) {
          applyMe(await guarded(() => api.handles.claim(handle)))
        },

        async updateProfile(patch) {
          const me = await guarded(() =>
            api.users.updateProfile({
              ...(patch.firstName !== undefined ? { firstName: patch.firstName } : {}),
              ...(patch.lastName !== undefined ? { lastName: patch.lastName } : {}),
              ...(patch.color ? { avatarColor: patch.color } : {}),
              ...(patch.email !== undefined ? { email: patch.email } : {}),
            }),
          )
          applyMe(me)
          void get().refresh()
        },

        async startVerification(tier) {
          applyMe(await guarded(() => api.kyc.start(tier)))
          void get().refresh()
        },

        // ── SEND ──
        async send(to, amountCents, note) {
          if (amountCents <= 0) throw new SortedError('invalid_amount', 'Amount must be greater than zero.')
          const prepared = await guarded(() => api.sends.prepare({ idempotencyKey: idempotencyKey(), handle: to.handle, amountCents, note: note || null }))
          const row = await guarded(() => settleOutflow(prepared))
          const tx = outflowFromRow(row, 'send', to)
          recordOutflow(tx)
          return tx
        },

        async sendViaSms({ phone, name, amountCents, note }) {
          if (amountCents <= 0) throw new SortedError('invalid_amount', 'Amount must be greater than zero.')
          const result = await guarded(() => api.sends.viaSms({ idempotencyKey: idempotencyKey(), phone, name: name || null, amountCents, note: note || null }))
          let row = result.transaction
          if (result.prepared) {
            row = await guarded(() => settleOutflow({ transactionId: row.id, transaction: result.prepared!.transaction, sponsor: result.prepared!.sponsor, expiresAt: result.prepared!.expiresAt }))
          }
          const label = name?.trim() || toLocalMobile(result.claim.phone)
          const tx = outflowFromRow(row, 'send', { handle: result.claim.phone, firstName: label, lastName: '', initials: label.slice(0, 2).toUpperCase(), color: 'butter', verified: false })
          recordOutflow(tx)
          return { transaction: tx, claim: result.claim }
        },

        async undoSms(claimId) {
          await guarded(() => api.sends.undoSms(claimId))
          await get().refresh()
        },

        async claimSms(code) {
          const row = await guarded(() => api.sends.claim(code))
          await get().refresh()
          const tx = get().transactions.find((t) => t.id === row.id)
          return tx ?? { id: row.id, type: 'receive', counterparty: { handle: 'sorted', firstName: 'Sorted', lastName: '', initials: 'S', color: 'lime', verified: true }, amountCents: row.amountCents, createdAt: row.createdAt, status: row.status }
        },

        // ── TOP-UP ──
        async topUp(amountCents) {
          if (amountCents <= 0) throw new SortedError('invalid_amount', 'Amount must be greater than zero.')
          return guarded(() => api.topups.create(amountCents))
        },

        async refreshTopUp(intentId) {
          const intent = await guarded(() => api.topups.get(intentId))
          if (intent.status === 'done') await get().refresh()
          return intent
        },

        async simulateBankPayment(intentId) {
          const intent = await guarded(() => api.sim.bankPaymentReceived(intentId))
          if (intent.status === 'done') await get().refresh()
          return intent
        },

        // ── CASH-OUT ──
        async cashOut(amountCents, bankAccountId) {
          if (amountCents <= 0) throw new SortedError('invalid_amount', 'Amount must be greater than zero.')
          const result = await guarded(() => api.topups.cashOut({ idempotencyKey: idempotencyKey(), amountCents, bankAccountId }))
          let row = result.transaction
          if (result.prepared) {
            row = await guarded(() => settleOutflow({ transactionId: row.id, transaction: result.prepared!.transaction, sponsor: result.prepared!.sponsor, expiresAt: result.prepared!.expiresAt }))
          }
          const tx = outflowFromRow(row, 'cashout', { handle: 'cashout', firstName: 'Cash', lastName: 'out', initials: 'CO', color: 'butter', verified: true })
          recordOutflow(tx)
          return tx
        },

        // ── CARD ──
        async toggleCardFreeze() {
          const frozen = get().card.status !== 'frozen'
          set((state) => ({ card: { ...state.card, status: frozen ? 'frozen' : 'active' } }))
          try {
            const card = await guarded(() => api.card.setFrozen(frozen))
            set({ card: { status: card.status, last4: card.last4 } })
          } catch (err) {
            set((state) => ({ card: { ...state.card, status: frozen ? 'active' : 'frozen' } }))
            throw err
          }
        },

        // ── CONTACTS ──
        async addContact(user) {
          if (get().contacts.some((c) => c.handle === user.handle)) return
          const row = await guarded(() => api.contacts.add(user.handle))
          const added = toUser(row)
          rememberUsers([added])
          set((state) => ({ contacts: [added, ...state.contacts.filter((c) => c.handle !== added.handle)] }))
        },

        async removeContact(handle) {
          const target = get().contacts.find((c) => c.handle === handle)
          if (!target) return
          set((state) => ({
            contacts: state.contacts.filter((c) => c.handle !== handle),
            pinnedHandles: state.pinnedHandles.filter((h) => h !== handle),
          }))
          await guarded(() => api.contacts.remove(target.id))
        },

        async togglePinned(handle) {
          const already = get().pinnedHandles.includes(handle)
          let target = get().contacts.find((c) => c.handle === handle)
          if (!target) {
            // Pinning someone from a transaction sheet before they are a contact: add them first.
            const row = await guarded(() => api.contacts.add(handle))
            target = toUser(row)
            set((state) => ({ contacts: [target!, ...state.contacts] }))
          }
          set((state) => ({
            pinnedHandles: already ? state.pinnedHandles.filter((h) => h !== handle) : [...state.pinnedHandles, handle],
          }))
          try {
            await guarded(() => api.contacts.setPinned(target.id, !already))
          } catch (err) {
            set((state) => ({
              pinnedHandles: already ? [...state.pinnedHandles, handle] : state.pinnedHandles.filter((h) => h !== handle),
            }))
            throw err
          }
        },

        // ── REFERRALS ──
        async addReferral(friendHandle) {
          const normalised = friendHandle.replace(/^@/, '').trim().toLowerCase()
          if (!normalised) return
          if (get().referrals.some((r) => r.friendHandle === normalised)) return
          const row = await guarded(() => api.referrals.invite(normalised))
          set((state) => ({ referrals: [toReferral(row), ...state.referrals] }))
        },

        // ── REQUESTS ──
        async requestMoney(to, amountCents, note) {
          if (amountCents <= 0) throw new SortedError('invalid_amount', 'Amount must be greater than zero.')
          const row = await guarded(() => api.requests.create({ handle: to.handle, amountCents, note: note || null }))
          const req: MoneyRequest = {
            id: row.id,
            direction: 'sent',
            counterparty: to,
            amountCents: row.amountCents,
            note: row.note ?? undefined,
            status: row.status,
            createdAt: row.createdAt,
          }
          set((state) => ({
            requests: [req, ...state.requests.filter((r) => r.id !== req.id)],
            contacts: [to, ...state.contacts.filter((c) => c.handle !== to.handle)],
          }))
          void get().refresh()
          return req
        },

        async splitBill(people, totalCents, note) {
          const result = await guarded(() => api.requests.split({ handles: people.map((p) => p.handle), totalCents, note: note || null }))
          await get().refresh()
          return { perPersonCents: result.perPersonCents, yourShareCents: result.yourShareCents }
        },

        async payRequest(requestId) {
          const req = get().requests.find((r) => r.id === requestId)
          if (!req) throw new SortedError('not_found', 'Request not found.')
          if (req.direction !== 'received') throw new SortedError('forbidden', 'Cannot pay your own request.')
          if (req.status !== 'pending') throw new SortedError('conflict', 'This request was already resolved.')
          const prepared = await guarded(() => api.requests.preparePay({ idempotencyKey: idempotencyKey(), requestId }))
          const row = await guarded(() => settleOutflow(prepared))
          set((state) => ({
            requests: state.requests.map((r) => (r.id === requestId ? { ...r, status: 'paid', resolvedAt: new Date().toISOString() } : r)),
          }))
          const tx = outflowFromRow(row, 'send', req.counterparty)
          recordOutflow(tx)
          return tx
        },

        async declineRequest(requestId) {
          set((state) => ({
            requests: state.requests.map((r) => (r.id === requestId ? { ...r, status: 'declined', resolvedAt: new Date().toISOString() } : r)),
          }))
          await guarded(() => api.requests.decline(requestId))
        },

        async cancelRequest(requestId) {
          // Cancel = remove from list. We don't keep cancelled rows around — too noisy.
          set((state) => ({ requests: state.requests.filter((r) => r.id !== requestId) }))
          await guarded(() => api.requests.cancel(requestId))
        },

        // ── UI/SETTINGS ──
        setNotifications: (on) => set({ notifications: on }),
        setNotificationPref: (id, on) => set((state) => ({ notificationPrefs: { ...state.notificationPrefs, [id]: on } })),
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
      }
    },
    {
      name: 'sorted-app-state',
      storage: createJSONStorage(() => localStorage),
      version: 4,
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== 'object') return persisted
        const p = persisted as Record<string, unknown>
        // v4: the store stopped holding seed data. Anything older is a mock
        // world, so keep only the preferences and let the API fill the rest.
        if (version < 4) {
          return {
            notifications: typeof p.notifications === 'boolean' ? p.notifications : true,
            notificationPrefs: p.notificationPrefs ?? defaultNotificationPrefs(),
            quietHours: p.quietHours ?? { ...DEFAULT_QUIET_HOURS },
            security: p.security ?? { ...DEFAULT_SECURITY },
          }
        }
        return p
      },
      /**
       * Persist the last API snapshot (instant paint next open; replaced by
       * `refresh`) and the user's preferences. Never the session status, the
       * API config or the avatar object URL.
       */
      partialize: (state) => ({
        hydratedAt: state.hydratedAt,
        user: state.user,
        tier: state.tier,
        limits: state.limits,
        walletAddress: state.walletAddress,
        balanceCents: state.balanceCents,
        reservedCents: state.reservedCents,
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
        pendingSmsSends: state.pendingSmsSends,
        notifications: state.notifications,
        notificationPrefs: state.notificationPrefs,
        quietHours: state.quietHours,
        security: state.security,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) rememberUsers(state.contacts)
      },
    },
  ),
)
