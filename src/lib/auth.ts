/**
 * Session + signing bridge.
 *
 * Two modes, picked at build time by VITE_PRIVY_APP_ID:
 *
 *   dev   — the API runs AUTH_PROVIDER=dev and trusts a bearer token of the
 *           form `dev:<au mobile>`. Any 6-digit code "verifies". The API
 *           refuses this provider in production, so a dev build can never
 *           talk to the real thing.
 *   privy — SMS login through Privy, a Privy access token (ES256 JWT) as the
 *           bearer, and the user's embedded Solana wallet signs every outflow.
 *           The Privy SDK is loaded lazily (see `privy.tsx`) and registers an
 *           imperative bridge here so the rest of the app never touches
 *           Privy hooks directly.
 *
 * User keys never leave the wallet provider; in dev mode the API signs with
 * its own mock or dev-local custody and the app sends no signature at all.
 */

export type AuthMode = 'dev' | 'privy'

export const PRIVY_APP_ID: string | undefined = import.meta.env.VITE_PRIVY_APP_ID || undefined
export const authMode: AuthMode = PRIVY_APP_ID ? 'privy' : 'dev'

const TOKEN_KEY = 'sorted-auth-token'
const PRIVY_FLAG_KEY = 'sorted-auth-privy'
const PENDING_PHONE_KEY = 'sorted-auth-pending-phone'
const CLAIM_CODE_KEY = 'sorted-pending-claim'
const REFERRAL_KEY = 'sorted-referral-code'

export type AuthBridge = {
  /** Resolves once the provider has restored any existing session. */
  ready: Promise<void>
  isAuthenticated: () => boolean
  getAccessToken: () => Promise<string | null>
  sendCode: (phoneE164: string) => Promise<void>
  loginWithCode: (code: string) => Promise<void>
  logout: () => Promise<void>
  /** Signs a serialised Solana transaction with the user's embedded wallet. */
  signTransaction: (transaction: Uint8Array) => Promise<Uint8Array>
}

let bridge: AuthBridge | null = null
let bridgeResolve: ((b: AuthBridge) => void) | null = null
const bridgePromise: Promise<AuthBridge> = new Promise((resolve) => {
  bridgeResolve = resolve
})

/** Called once by the Privy provider when its hooks are live. */
export function registerAuthBridge(b: AuthBridge) {
  bridge = b
  bridgeResolve?.(b)
}

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

function read(key: string): string | null {
  return storage()?.getItem(key) ?? null
}
function write(key: string, value: string | null) {
  const s = storage()
  if (!s) return
  if (value === null) s.removeItem(key)
  else s.setItem(key, value)
}

/** "0412 345 921" or "+61412345921" → "+61412345921". Returns null for anything that isn't an AU mobile. */
export function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  let national: string
  if (digits.startsWith('61') && digits.length === 11) national = digits.slice(2)
  else if (digits.startsWith('0') && digits.length === 10) national = digits.slice(1)
  else if (digits.length === 9) national = digits
  else return null
  if (!national.startsWith('4')) return null
  return `+61${national}`
}

/** "+61412345921" → "0412 345 921" for display. */
export function toLocalMobile(e164: string): string {
  const n = e164.replace(/^\+61/, '0')
  return n.length === 10 ? `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}` : e164
}

/** Resolves when we can trust `hasSession()` and `getAuthToken()`. Immediate in dev mode. */
export async function whenAuthReady(): Promise<void> {
  if (authMode === 'dev') return
  const b = bridge ?? (await bridgePromise)
  await b.ready
}

export function hasSession(): boolean {
  if (authMode === 'dev') return !!read(TOKEN_KEY)
  // Privy keeps its own session; the flag only records that this app finished a login here.
  return !!read(PRIVY_FLAG_KEY) && (bridge?.isAuthenticated() ?? true)
}

export async function getAuthToken(): Promise<string | null> {
  if (authMode === 'dev') return read(TOKEN_KEY)
  if (!bridge) return null
  try {
    return await bridge.getAccessToken()
  } catch {
    return null
  }
}

export function pendingPhone(): string | null {
  return read(PENDING_PHONE_KEY)
}

/** Step 1 of sign-in. In dev mode nothing is sent; the number is just remembered for the verify screen. */
export async function sendCode(phoneRaw: string): Promise<void> {
  const e164 = toE164(phoneRaw)
  if (!e164) throw new Error('Enter an Australian mobile number.')
  write(PENDING_PHONE_KEY, e164)
  if (authMode === 'privy') {
    const b = bridge ?? (await bridgePromise)
    await b.sendCode(e164)
  }
}

/** Step 2 of sign-in. Resolves with a session in place; the caller then bootstraps against the API. */
export async function verifyCode(code: string): Promise<void> {
  const digits = code.replace(/\D/g, '')
  if (digits.length !== 6) throw new Error("That code didn't work. Have another go.")
  if (authMode === 'dev') {
    const phone = pendingPhone()
    if (!phone) throw new Error('Enter your mobile number first.')
    write(TOKEN_KEY, `dev:${phone}`)
    return
  }
  const b = bridge ?? (await bridgePromise)
  await b.loginWithCode(digits)
  write(PRIVY_FLAG_KEY, '1')
}

export async function signOut(): Promise<void> {
  write(TOKEN_KEY, null)
  write(PRIVY_FLAG_KEY, null)
  write(PENDING_PHONE_KEY, null)
  if (authMode === 'privy' && bridge) {
    try {
      await bridge.logout()
    } catch {
      // The local session is gone either way.
    }
  }
}

/**
 * Signs a prepared outflow. Returns the signed transaction as base64 for
 * `sends.submit`, or undefined when the API signs for the user (dev custody).
 */
export async function signPreparedTransaction(base64: string): Promise<string | undefined> {
  if (authMode === 'dev') return undefined
  const b = bridge ?? (await bridgePromise)
  const signed = await b.signTransaction(base64ToBytes(base64))
  return bytesToBase64(signed)
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

// ── Cross-flow intents that must survive onboarding ──

/** A claim code from an SMS link (app.paymentsorted.com/c/<code>), parked until the recipient has an account. */
export function stashClaimCode(code: string | null) {
  write(CLAIM_CODE_KEY, code)
}
export function stashedClaimCode(): string | null {
  return read(CLAIM_CODE_KEY)
}

/** `?ref=<handle>` from a share link, sent with the first bootstrap so the referrer gets credit. */
export function stashReferralCode(code: string | null) {
  write(REFERRAL_KEY, code)
}
export function stashedReferralCode(): string | null {
  return read(REFERRAL_KEY)
}
