/**
 * Tax reporting helpers — Australian financial year aware.
 *
 * Australian FY runs 1 July → 30 June. So FY2025 = 1 Jul 2024 → 30 Jun 2025
 * by Australian convention (named for the year it ENDS).
 *
 * Used by the Settings → Tax screen to:
 *   - List the last 3 FYs (current + 2 prior)
 *   - Compute a summary (totals, net, yield, count) for a chosen FY
 *   - Build a CSV download of every transaction in that period
 */

import { Transaction, formatAUD } from './mockData'

export type FYRange = {
  /** Display name e.g. "FY 2025-26" */
  label: string
  /** Inclusive lower bound (1 July UTC) */
  from: Date
  /** Exclusive upper bound (1 July next year UTC) */
  to: Date
  /** True if this FY is currently in progress */
  current: boolean
}

/** Get the FY label & bounds containing the given date. */
export function fyForDate(d: Date): FYRange {
  const y = d.getFullYear()
  const m = d.getMonth() // 0-indexed
  // Months before July (0..5) belong to the previous FY's tail
  const fyStartYear = m < 6 ? y - 1 : y
  return makeFY(fyStartYear)
}

function makeFY(startYear: number): FYRange {
  const from = new Date(startYear, 6, 1) // 1 July, local time — close enough for AU users
  const to = new Date(startYear + 1, 6, 1)
  const now = new Date()
  return {
    label: `FY ${String(startYear).slice(2)}-${String(startYear + 1).slice(2)}`,
    from,
    to,
    current: now >= from && now < to,
  }
}

/** Return the last `n` FYs starting from the current one going back. */
export function recentFYs(n: number = 3): FYRange[] {
  const current = fyForDate(new Date())
  const startYear = current.from.getFullYear()
  return Array.from({ length: n }, (_, i) => makeFY(startYear - i))
}

/** Filter transactions to those whose createdAt falls inside the FY. */
export function transactionsInFY(transactions: Transaction[], fy: FYRange): Transaction[] {
  return transactions.filter((tx) => {
    const t = new Date(tx.createdAt)
    return t >= fy.from && t < fy.to
  })
}

export type FYSummary = {
  fy: FYRange
  totalInCents: number
  totalOutCents: number
  netCents: number
  yieldEarnedCents: number
  count: number
  firstTxAt?: string
  lastTxAt?: string
}

export function summariseFY(transactions: Transaction[], fy: FYRange): FYSummary {
  const txs = transactionsInFY(transactions, fy)
  let inC = 0
  let outC = 0
  let yieldC = 0
  for (const tx of txs) {
    if (tx.type === 'yield') yieldC += tx.amountCents
    if (tx.amountCents > 0) inC += tx.amountCents
    else outC += Math.abs(tx.amountCents)
  }
  return {
    fy,
    totalInCents: inC,
    totalOutCents: outC,
    netCents: inC - outC,
    yieldEarnedCents: yieldC,
    count: txs.length,
    firstTxAt: txs.length ? txs[txs.length - 1].createdAt : undefined,
    lastTxAt: txs.length ? txs[0].createdAt : undefined,
  }
}

/**
 * Build a CSV string of every transaction in the FY, ATO-friendly columns.
 * Columns: Date, Type, Counterparty, Handle, Description, Amount (AUD), Direction, Status, Reference
 */
export function buildCSV(transactions: Transaction[], fy: FYRange, userHandle: string): string {
  const txs = transactionsInFY(transactions, fy)
  const header = [
    'Date',
    'Type',
    'Counterparty Name',
    'Counterparty Handle',
    'Description',
    'Amount AUD',
    'Direction',
    'Status',
    'Reference',
  ].join(',')

  const rows = txs.map((tx) => {
    const d = new Date(tx.createdAt)
    const dateStr = d.toISOString().split('T')[0] // YYYY-MM-DD
    const cp = tx.counterparty
    const name = `${cp.firstName} ${cp.lastName ?? ''}`.trim()
    const handle = cp.handle
    const desc = tx.note ?? ''
    const amount = (Math.abs(tx.amountCents) / 100).toFixed(2)
    const direction = tx.amountCents >= 0 ? 'In' : 'Out'
    const ref = tx.reference ?? ''
    // CSV-escape any commas or quotes in user-text fields
    return [
      dateStr,
      tx.type,
      escapeCSV(name),
      handle,
      escapeCSV(desc),
      amount,
      direction,
      tx.status,
      ref,
    ].join(',')
  })

  // Footer summary row, prefixed with # so it's clearly metadata not data
  const summary = summariseFY(transactions, fy)
  const footer = [
    '',
    `# Sorted transaction history for @${userHandle}`,
    `# Period: ${fy.label} (${fy.from.toISOString().split('T')[0]} to ${nextDay(fy.to).toISOString().split('T')[0]})`,
    `# Total in: ${formatAUD(summary.totalInCents)}`,
    `# Total out: ${formatAUD(summary.totalOutCents)}`,
    `# Net: ${formatAUD(summary.netCents)}`,
    `# Yield earned: ${formatAUD(summary.yieldEarnedCents)}`,
    `# Transactions: ${summary.count}`,
    `# Generated: ${new Date().toISOString()}`,
  ].join('\n')

  return [header, ...rows, footer].join('\n')
}

function escapeCSV(s: string): string {
  if (!s) return ''
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function nextDay(d: Date): Date {
  const n = new Date(d)
  n.setDate(n.getDate() - 1)
  return n
}

/**
 * Trigger a CSV download in the browser. No backend required — works
 * entirely client-side.
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoke after a tick — some browsers race on immediate revoke
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
