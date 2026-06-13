# Sorted App v0.5.0 — The Pivot Build

Drop-in update for SortedPay/App -> app.paymentsorted.com.
Aligns the live demo with SORTED-PIVOT-BRIEF.md: yield is GONE, the card
and Sorted Points are in.

## What changed
- ALL yield removed: no 3.33% banner, no daily yield rows, no Yield screen,
  no yield tick. Verified by automated scan (zero banned-term hits).
- New nav: Home / Pay / Card / Perks / Profile (was Home/Activity/Contacts/Settings).
  Activity + Contacts stay reachable from Home ("See all") and the Pay hub.
- NEW Pay screen: hub for Send (hero) / Request / Split / Receive / Top up /
  SMS sends / Contacts.
- NEW Card screen: the Sorted card (ink + lime chip + @handle + Mastercard
  marks), one-tap freeze/unfreeze with animated frozen state, "+1 point per $1",
  recent taps list. Labelled "Demo card - rolls out with launch".
- NEW Perks screen: points hero, tier ladder (Fresh -> Local -> Legend -> Icon)
  with progress bar, how-you-earn rules, locked local-business perk teasers
  ("With launch"), recent points history.
- Home reworked: points strip (-> Perks) replaces the yield strip; fresh-user
  nudge reworded; card taps appear in activity with merchant names.
- Data model: 'yield' tx type replaced by 'tap' (real Aussie merchants seeded:
  Corner Cafe, Woolworths, 7-Eleven, Bunnings, Messina, Kmart). Seed balance
  recomputed to the exact transaction net ($565.50). Points ledger added -
  every entry attached to an ACTION, never to balance held (legal design law).
- Sends now earn +10 points live in the demo.
- localStorage migration (v1 -> v2): old testers' persisted yield state is
  stripped automatically; no stale yield rows survive.
- /yield redirects to /perks (old bookmarks keep working).
- Tax report: yield income line replaced by card-spend summary.

## Deploy
1. github.com/SortedPay/App -> "Add file" -> "Upload files"
2. Drag the whole `src` folder from this zip onto the upload area
   (3 new files: Pay.tsx, Card.tsx, Perks.tsx - rest replace existing)
3. Commit -> Vercel deploys in ~60s -> verify in incognito
Do NOT upload this README. No root files changed (package.json untouched).

## Verify after deploy
- Bottom nav shows Home/Pay/Card/Perks/Profile
- /card freezes and unfreezes; /perks shows 1,240 points, LOCAL tier
- No "3.33" or "yield" anywhere (existing testers may need one app refresh
  for the state migration to run)
- Old /yield URL lands on /perks

## Stage 2 (next zip)
Profiles built out (QR, flair, badges - "make it special"), multi-currency
wallet (AUDD default + USDC/USDT), deeper polish.

Build verified: tsc -b + vite build clean. Money, sorted.
