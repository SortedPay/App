# Sorted App v0.5.2 — Card brand correction (SUPERSEDES v0.5.1)

Push this whether or not v0.5.1 went up — it contains both files.
Drag the `src` folder onto SortedPay/App repo root. Leave the README out.

## What changed
1. CARD WORDMARK = ACTUAL BRAND LOGOTYPE. Lowercase "sorted." with the
   full stop, Bricolage 700, -0.045em tracking, optical size pinned —
   identical spec to the site header logo and the site card (tweaks r2).
2. CHIP REMOVED from the card face. Cleaner composition: cropped
   wordmark / dot-grid field / handle + tap row.
3. (Carried from v0.5.1) Profile tab retitle: "YOUR ACCOUNT / Profile".

Build verified (tsc + vite), rendered and checked incl. frozen state
behaviour (wordmark greyscales with the card under the FROZEN pill).

## Files
src/screens/Card.tsx
src/screens/Settings.tsx
