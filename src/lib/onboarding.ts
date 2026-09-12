import type { MeSummary } from './api/types'

/** After sign-in, the first screen that still needs something from the user. */
export function nextOnboardingRoute(me: MeSummary): string {
  if (!me.user.hasHandle) return '/claim'
  if (!me.user.firstName) return '/profile'
  if (me.user.kycTier < 1) return '/verifying'
  return '/home'
}
