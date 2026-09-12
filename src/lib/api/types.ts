/**
 * The API's wire types, transcribed from SortedPay/API (private repo).
 *
 * Source of truth: `src/services/*.ts` and `src/trpc/routers/*.ts` over
 * there. tRPC runs without a transformer, so every Date arrives as an ISO
 * string and every bigint cents column as a number. Keep this file in step
 * with the API; `npm run lint` will not catch drift on its own.
 */

export type AvatarColor = 'lime' | 'coral' | 'sky' | 'butter' | 'plum'

/** Codes the API attaches to every error as `data.sortedCode`, plus the client-side ones. */
export type SortedErrorCode =
  | 'insufficient_balance'
  | 'invalid_amount'
  | 'recipient_not_found'
  | 'recipient_limit'
  | 'verify_failed'
  | 'kyc_required'
  | 'limit_exceeded'
  | 'handle_taken'
  | 'handle_invalid'
  | 'not_found'
  | 'conflict'
  | 'idempotency_mismatch'
  | 'frozen'
  | 'expired'
  | 'forbidden'
  | 'unauthorized'
  | 'wallet_required'
  | 'signature_required'
  | 'chain_failed'
  | 'offline'
  | 'network'
  | 'unknown'

export type PublicUser = {
  id: string
  handle: string
  firstName: string
  lastName: string
  initials: string
  color: AvatarColor
  verified: boolean
}

export type MeUser = PublicUser & {
  /** E.164, e.g. "+61412345921" */
  phone: string | null
  email: string | null
  kycTier: number
  kycStatus: 'none' | 'pending' | 'verified' | 'failed'
  walletAddress: string | null
  status: 'active' | 'frozen' | 'closed'
  hasHandle: boolean
}

export type TierLimits = {
  perSendCents: number
  dailySendCents: number
  canSend: boolean
  canTopUp: boolean
  canCashOut: boolean
  lifetimeReceiveCapCents: number | null
}

export type CardView = { status: 'active' | 'frozen'; last4: string }

export type MeSummary = {
  user: MeUser
  /** Available now: ledger balance less outflows prepared but not yet settled. */
  balanceCents: number
  ledgerBalanceCents: number
  reservedCents: number
  points: { balance: number; thisWeek: number }
  card: CardView
  limits: TierLimits
  pendingRequests: number
}

export type SystemCounterparty = {
  handle: string
  firstName: string
  lastName: string
  initials: string
  color: AvatarColor
  verified: boolean
}

export type Counterparty = PublicUser | SystemCounterparty

export type TransactionKind = 'send' | 'request_payment' | 'sms_send' | 'sms_claim' | 'sms_undo' | 'topup' | 'cashout' | 'tap'
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'reversed'

export type ActivityItem = {
  id: string
  type: 'send' | 'receive' | 'topup' | 'cashout' | 'tap'
  counterparty: Counterparty
  amountCents: number
  note: string | null
  createdAt: string
  status: TransactionStatus
  reference: string | null
  kind: TransactionKind
}

/** A raw `transactions` row, as returned by sends.submit and friends. */
export type TransactionRow = {
  id: string
  kind: TransactionKind
  status: TransactionStatus
  amountCents: number
  fromAccountId: string
  toAccountId: string
  note: string | null
  reference: string | null
  createdByUserId: string | null
  metadata: Record<string, unknown>
  createdAt: string
  confirmedAt: string | null
}

/** sends.prepare / requests.preparePay: what the wallet signs. */
export type PreparedOutflow = {
  transactionId: string
  /** Base64 legacy Solana transaction, sponsor as fee payer, unsigned. */
  transaction: string
  sponsor: string
  expiresAt: string
}

/** The chain adapter's prepared transfer, returned inline by sends.viaSms and topups.cashOut. */
export type PreparedTransfer = {
  transaction: string
  messageHash: string
  sponsor: string
  expiresAt: string
}

export type SendStatus = {
  id: string
  status: TransactionStatus
  stage: 'prepared' | 'submitted' | 'confirmed' | 'failed' | null
  signature: string | null
  reference: string | null
}

export type SmsClaim = {
  id: string
  transactionId: string
  senderUserId: string
  phone: string
  recipientName: string | null
  amountCents: number
  code: string
  status: 'pending' | 'claimed' | 'undone' | 'expired'
  undoUntil: string
  claimedByUserId: string | null
  claimTransactionId: string | null
  createdAt: string
  resolvedAt: string | null
}

export type SmsSendResult = {
  transaction: TransactionRow
  claim: SmsClaim
  /** Non-null when the app must sign and call sends.submit. */
  prepared: PreparedTransfer | null
}

export type ClaimPreview = {
  amountCents: number
  status: SmsClaim['status']
  from: { handle: string | null; firstName: string }
}

export type RequestStatus = 'pending' | 'paid' | 'declined' | 'cancelled' | 'expired'

export type RequestView = {
  id: string
  direction: 'sent' | 'received'
  counterparty: PublicUser
  amountCents: number
  note: string | null
  status: RequestStatus
  createdAt: string
  resolvedAt: string | null
  expiresAt: string
}

export type MoneyRequestRow = {
  id: string
  requesterUserId: string
  payerUserId: string
  amountCents: number
  note: string | null
  status: RequestStatus
  paidTransactionId: string | null
  createdAt: string
  resolvedAt: string | null
  expiresAt: string
}

export type SplitResult = {
  requests: MoneyRequestRow[]
  perPersonCents: number
  yourShareCents: number
}

export type ContactRow = PublicUser & { pinned: boolean; lastInteractedAt: string }

export type PointsEntryRow = {
  id: string
  userId: string
  source: 'send' | 'new_contact' | 'tap' | 'referral' | 'profile' | 'founding'
  amount: number
  label: string | null
  transactionId: string | null
  createdAt: string
}

export type PointsSummary = { balance: number; thisWeek: number; history: PointsEntryRow[] }

export type ReferralRow = {
  id: string
  friendHandle: string
  status: 'invited' | 'confirmed'
  earnedPoints: number
  invitedAt: string
  confirmedAt: string | null
}

export type ReferralsView = { code: string; referrals: ReferralRow[] }

export type TopupIntent = {
  id: string
  userId: string
  amountCents: number
  payidReference: string
  payidAddress: string
  status: 'waiting' | 'received' | 'converting' | 'done' | 'failed'
  transactionId: string | null
  chainSignature: string | null
  lastError: string | null
  attempts: number
  createdAt: string
  updatedAt: string
}

export type BankAccount = {
  id: string
  userId: string
  accountName: string
  bsb: string
  accountNumber: string
  createdAt: string
  removedAt: string | null
}

export type CashOutResult = { transaction: TransactionRow; prepared: PreparedTransfer | null }

export type HandleCheck = { handle: string; available: boolean; suggestions: string[] }

export type KycStatus = {
  tier: number
  status: MeUser['kycStatus']
  limits: TierLimits
  latestCheck: unknown
}

export type SystemConfig = {
  authProvider: 'dev' | 'privy'
  /** privy: this app signs every outflow. mock | dev-local: the API signs; submit needs no signature. */
  custody: 'mock' | 'dev-local' | 'privy'
  chain: string
  cluster: string
  simulation: boolean
  claimUrlBase: string
}
