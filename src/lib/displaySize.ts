/**
 * Compute the font size for the big amount-display on Send / TopUp / SMS screens,
 * shrinking it as the digit count grows so the number always fits.
 *
 * The base size (80px) is sized for 1–3 digit dollar amounts ("$0" through "$999").
 * Larger amounts get progressively scaled down using a simple breakpoint table.
 *
 * Why not just CSS clamp/container queries: we want the SIDE-currency-symbol
 * + cents to stay at their original ratio, which requires keeping the integer
 * scale independent. Pure CSS would require width measurement.
 *
 * Returns the px value to apply as `fontSize` on the integer span.
 */
export function autoShrinkAmountSize(dollarsDisplay: string, base = 80): number {
  // dollarsDisplay is already locale-formatted (e.g. "1,234" or "12,345")
  // Count effective characters — commas count, since they take width
  const len = dollarsDisplay.length

  if (len <= 3) return base // "0" to "999"
  if (len === 4) return Math.round(base * 0.9) // "1,000" → 72
  if (len === 5) return Math.round(base * 0.78) // "12,345" → 62
  if (len === 6) return Math.round(base * 0.66) // "123,456" → 53
  if (len === 7) return Math.round(base * 0.56) // "1,234,567" → 45
  return Math.round(base * 0.5) // longer — just hold the line
}
