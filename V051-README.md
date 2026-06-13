# Sorted App v0.5.1 — Brand consistency pass

TWO files. Drag the `src` folder onto SortedPay/App repo root (both replace
existing). Leave this README out.

## What changed
1. CARD FACE = SITE CARD. The in-app Sorted card now uses the exact device
   shipped on paymentsorted.com: giant cropped lime "Sorted" wordmark
   spanning full card width, lime dot-grid texture on the ink face, larger
   @handle + last4, chip repositioned. Scales fluidly (container units).
   Frozen state greyscales the whole composition under the FROZEN pill.
2. PROFILE TAB CONSISTENCY. The Profile tab previously landed on a screen
   titled "Settings". Header now reads "YOUR ACCOUNT / Profile" in the same
   pattern as Home/Pay/Card/Perks. (Full profile build-out = Stage 2.)

Build verified (tsc + vite), screens screenshotted from the served build.

## Files
src/screens/Card.tsx
src/screens/Settings.tsx
