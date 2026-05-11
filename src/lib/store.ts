import { create } from 'zustand'
import {
  HANNAH,
  SEED_BALANCE_CENTS,
  SEED_LIFETIME_YIELD_CENTS,
  SEED_TRANSACTIONS,
  SEED_YIELD_TODAY_CENTS,
  Transaction,
  User,
} from './mockData'

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
  yieldTodayCents: number
  lifetimeYieldCents: number
  // ── activity ──
  transactions: Transaction[]
  // ── UI ──
  notifications: boolean
  // ── actions ──
  send: (to: User, amountCents: number, note?: string) => Promise<Transaction>
  topUp: (amountCents: number) => Promise<Transaction>
  cashOut: (amountCents: number) => Promise<Transaction>
  setTier: (t: Tier) => void
  setNotifications: (on: boolean) => void
  reset: () => void
  // ── internal: simulated yield tick ──
  _tickYield: () => void
}

// Helper to generate a quick id
const mkId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`

// Initial state object — used both for setup and for reset()
function initialState() {
  return {
    user: HANNAH,
    tier: 1 as Tier,
    balanceCents: SEED_BALANCE_CENTS,
    yieldTodayCents: SEED_YIELD_TODAY_CENTS,
    lifetimeYieldCents: SEED_LIFETIME_YIELD_CENTS,
    transactions: [...SEED_TRANSACTIONS],
    notifications: true,
  }
}

export const useStore = create<AppState>((set, get) => ({
  ...initialState(),

  // ── SEND ──
  // Simulates server validation + signing + confirmation.
  // Total elapsed: ~1.5s for the full flow.
  async send(to, amountCents, note) {
    if (amountCents <= 0) throw new Error('Amount must be positive')
    const balance = get().balanceCents
    if (amountCents > balance) throw new Error('Insufficient balance')

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

    set((state) => ({
      balanceCents: state.balanceCents - amountCents,
      transactions: [tx, ...state.transactions],
    }))

    return tx
  },

  // ── TOP-UP ──
  // Three states: pending → confirmed (3 seconds delay).
  // Returns the pending transaction immediately so UI can show it,
  // then mutates to confirmed.
  async topUp(amountCents) {
    if (amountCents <= 0) throw new Error('Amount must be positive')

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
    if (amountCents <= 0) throw new Error('Amount must be positive')
    const balance = get().balanceCents
    if (amountCents > balance) throw new Error('Insufficient balance')

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

  // ── UI/SETTINGS ──
  setTier: (t) => set({ tier: t }),
  setNotifications: (on) => set({ notifications: on }),

  // ── RESET ──
  reset: () => set(initialState()),

  // ── YIELD TICK ──
  // Called by App.tsx every minute. Adds a fraction of a cent
  // visibly so demos feel alive. Doesn't add a transaction every minute
  // (would clutter feed) — accumulates and adds one per day.
  _tickYield: () => {
    set((state) => ({
      yieldTodayCents: state.yieldTodayCents + 1, // add 1 cent every minute for demo
      balanceCents: state.balanceCents + 1,
      lifetimeYieldCents: state.lifetimeYieldCents + 1,
    }))
  },
}))
