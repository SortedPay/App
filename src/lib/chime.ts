/**
 * useChime — synthesize percussive chimes via Web Audio API.
 *
 * Two presets:
 *   - 'success' — a quick two-note rising chord (C5 → E5) with a soft envelope.
 *     Used on Sent / All sorted / Wallet ready / Done states.
 *   - 'accent'  — a single warm note. For lighter confirmations.
 *
 * Why synthesis instead of audio files:
 *   1. Zero asset weight (the bundle stays under 600KB)
 *   2. No CORS or preload issues on PWAs
 *   3. Sounds consistent across devices since we control envelope + frequency
 *
 * Gotchas:
 *   - iOS Safari requires AudioContext creation/resume from a user-initiated
 *     event (touch/click). We create it lazily on first call.
 *   - Some standalone iOS PWAs still silence audio when locked. We fail soft —
 *     no error, just no sound. The visual confetti still fires.
 */

let ctxSingleton: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctxSingleton) return ctxSingleton
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctxSingleton = new AC()
    return ctxSingleton
  } catch {
    return null
  }
}

function playNote(ctx: AudioContext, freq: number, startAt: number, durationMs: number, gain = 0.18) {
  const osc = ctx.createOscillator()
  const env = ctx.createGain()

  // Triangle wave gives a warmer, more "mallet" feel than sine — less sterile
  osc.type = 'triangle'
  osc.frequency.value = freq

  // ADSR envelope — quick attack, gentle decay. No release tail to keep punchy.
  const duration = durationMs / 1000
  env.gain.setValueAtTime(0, startAt)
  env.gain.linearRampToValueAtTime(gain, startAt + 0.01)
  env.gain.exponentialRampToValueAtTime(0.001, startAt + duration)

  osc.connect(env)
  env.connect(ctx.destination)

  osc.start(startAt)
  osc.stop(startAt + duration + 0.02)
}

export type ChimeType = 'success' | 'accent' | 'tap'

/**
 * Fire a chime. Safe to call from any click handler. No-op on devices/contexts
 * where Web Audio isn't available or hasn't been unlocked.
 */
export function playChime(type: ChimeType = 'success'): void {
  const ctx = getCtx()
  if (!ctx) return

  // iOS requires .resume() if the context was suspended
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  const now = ctx.currentTime

  switch (type) {
    case 'success': {
      // C5 (523.25) → E5 (659.25) — a major third rising, classic "good" sound
      playNote(ctx, 523.25, now, 180, 0.22)
      playNote(ctx, 659.25, now + 0.08, 260, 0.2)
      break
    }
    case 'accent': {
      // Single E5 — lighter confirmation
      playNote(ctx, 659.25, now, 200, 0.18)
      break
    }
    case 'tap': {
      // Quick high note for keypress feedback
      playNote(ctx, 880, now, 50, 0.08)
      break
    }
  }
}

/**
 * Light haptic buzz. Android/some PWAs support navigator.vibrate.
 * iOS PWAs typically ignore this silently — we don't depend on it.
 */
export function haptic(durationMs: number = 12): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(durationMs)
    } catch {
      // Ignore — some browsers throw if disabled
    }
  }
}

/**
 * The combined "send confirmed" feedback — chime + haptic in one call.
 */
export function celebrate(): void {
  playChime('success')
  haptic(20)
}
