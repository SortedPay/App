/**
 * tRPC client for SortedPay/API.
 *
 * The API repo is private and its `AppRouter` type pulls in zod, drizzle and
 * the Solana adapters, so this public app does not import it. Instead this is
 * tRPC's untyped client wrapped in a typed facade: every procedure the app
 * calls is listed once here with the input and output shapes from
 * `./types`. Batching, error decoding and auth headers are tRPC's own.
 */
import { createTRPCUntypedClient, httpBatchLink, TRPCClientError } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import { getAuthToken } from '../auth'
import type * as T from './types'

export const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/+$/, '')
export const apiConfigured = API_URL.length > 0

/**
 * Typed errors so the UI can give specific user-friendly messages without
 * string-matching on .message. The API sets `code` on every error it
 * raises; `offline` and `network` are added on this side.
 */
export class SortedError extends Error {
  code: T.SortedErrorCode
  constructor(code: T.SortedErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'SortedError'
  }
}

function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine !== false
}

const client = createTRPCUntypedClient<AnyRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      headers: async () => {
        const token = await getAuthToken()
        return token ? { authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})

type ErrorData = { sortedCode?: T.SortedErrorCode; httpStatus?: number }

export function toSortedError(err: unknown): SortedError {
  if (err instanceof SortedError) return err
  if (err instanceof TRPCClientError) {
    const data = (err.data ?? null) as ErrorData | null
    if (!data) {
      // No tRPC envelope at all: the request never reached the API.
      return new SortedError(isOnline() ? 'network' : 'offline', isOnline() ? "Couldn't reach Sorted. Try again in a moment." : "You're offline. Try again when you have signal.")
    }
    const code = data.sortedCode ?? (data.httpStatus === 401 ? 'unauthorized' : 'unknown')
    return new SortedError(code, err.message || 'Something went wrong. Give it another go.')
  }
  if (err instanceof Error) return new SortedError('unknown', err.message)
  return new SortedError('unknown', 'Something went wrong. Give it another go.')
}

async function run<R>(kind: 'query' | 'mutation', path: string, input?: unknown): Promise<R> {
  if (!apiConfigured) throw new SortedError('network', "This build isn't connected to a Sorted API.")
  if (!isOnline()) throw new SortedError('offline', "You're offline. Try again when you have signal.")
  try {
    return (kind === 'query' ? await client.query(path, input) : await client.mutation(path, input)) as R
  } catch (err) {
    throw toSortedError(err)
  }
}

const q = <R>(path: string, input?: unknown) => run<R>('query', path, input)
const m = <R>(path: string, input?: unknown) => run<R>('mutation', path, input)

export function idempotencyKey(): string {
  return crypto.randomUUID()
}

export const api = {
  system: {
    config: () => q<T.SystemConfig>('system.config'),
  },
  auth: {
    /** First call after sign-in: creates the user on first contact. Idempotent. */
    bootstrap: (input: { referralCode?: string } = {}) => m<T.MeSummary>('auth.bootstrap', input),
    me: () => q<T.MeSummary>('auth.me'),
  },
  handles: {
    check: (handle: string) => q<T.HandleCheck>('handles.check', { handle }),
    claim: (handle: string) => m<T.MeSummary>('handles.claim', { handle }),
  },
  users: {
    updateProfile: (patch: { firstName?: string; lastName?: string; avatarColor?: T.AvatarColor; email?: string | null }) => m<T.MeSummary>('users.updateProfile', patch),
    search: (query: string) => q<T.PublicUser[]>('users.search', { q: query }),
    byHandle: (handle: string) => q<T.PublicUser | null>('users.byHandle', { handle }),
  },
  activity: {
    list: (input: { limit?: number; before?: string } = {}) => q<T.ActivityItem[]>('activity.list', input),
    pendingSms: () => q<T.SmsClaim[]>('activity.pendingSms'),
  },
  sends: {
    prepare: (input: { idempotencyKey: string; handle: string; amountCents: number; note?: string | null }) => m<T.PreparedOutflow>('sends.prepare', input),
    submit: (input: { transactionId: string; signedTransaction?: string }) => m<T.TransactionRow>('sends.submit', input),
    status: (transactionId: string) => q<T.SendStatus>('sends.status', { transactionId }),
    viaSms: (input: { idempotencyKey: string; phone: string; name?: string | null; amountCents: number; note?: string | null }) => m<T.SmsSendResult>('sends.viaSms', input),
    undoSms: (claimId: string) => m<T.TransactionRow>('sends.undoSms', { claimId }),
    claim: (code: string) => m<T.TransactionRow>('sends.claim', { code }),
    previewClaim: (code: string) => q<T.ClaimPreview>('sends.previewClaim', { code }),
  },
  requests: {
    list: () => q<T.RequestView[]>('requests.list'),
    create: (input: { handle: string; amountCents: number; note?: string | null }) => m<T.MoneyRequestRow>('requests.create', input),
    split: (input: { handles: string[]; totalCents: number; note?: string | null }) => m<T.SplitResult>('requests.split', input),
    preparePay: (input: { idempotencyKey: string; requestId: string }) => m<T.PreparedOutflow>('requests.preparePay', input),
    decline: (requestId: string) => m<void>('requests.decline', { requestId }),
    cancel: (requestId: string) => m<void>('requests.cancel', { requestId }),
  },
  topups: {
    create: (amountCents: number) => m<T.TopupIntent>('topups.create', { amountCents }),
    get: (id: string) => q<T.TopupIntent>('topups.get', { id }),
    list: () => q<T.TopupIntent[]>('topups.list'),
    cashOut: (input: { idempotencyKey: string; amountCents: number; bankAccountId: string }) => m<T.CashOutResult>('topups.cashOut', input),
    bankAccounts: {
      list: () => q<T.BankAccount[]>('topups.bankAccounts.list'),
      add: (input: { accountName: string; bsb: string; accountNumber: string }) => m<T.BankAccount>('topups.bankAccounts.add', input),
      remove: (id: string) => m<void>('topups.bankAccounts.remove', { id }),
    },
  },
  kyc: {
    status: () => q<T.KycStatus>('kyc.status'),
    start: (tier: 1 | 2) => m<T.MeSummary>('kyc.start', { tier }),
  },
  points: {
    summary: () => q<T.PointsSummary>('points.summary'),
  },
  contacts: {
    list: () => q<T.ContactRow[]>('contacts.list'),
    add: (handle: string) => m<T.ContactRow>('contacts.add', { handle }),
    remove: (userId: string) => m<void>('contacts.remove', { userId }),
    setPinned: (userId: string, pinned: boolean) => m<void>('contacts.setPinned', { userId, pinned }),
  },
  card: {
    get: () => q<T.CardView & { userId: string }>('card.get'),
    setFrozen: (frozen: boolean) => m<T.CardView & { userId: string }>('card.setFrozen', { frozen }),
  },
  referrals: {
    list: () => q<T.ReferralsView>('referrals.list'),
    invite: (hint: string) => m<T.ReferralRow>('referrals.invite', { hint }),
  },
  /** Only exist when the API runs with ALLOW_SIMULATION=true (never production). */
  sim: {
    bankPaymentReceived: (intentId: string) => m<T.TopupIntent>('sim.bankPaymentReceived', { intentId }),
    cardTap: (merchantName: string, amountCents: number) => m<T.TransactionRow>('sim.cardTap', { merchantName, amountCents }),
  },
}

export type Api = typeof api
