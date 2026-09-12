# Changelog

## 0.8.0 — September 2026

- The app is wired to the Sorted API. Sign-in, balances, activity, contacts, requests, points, referrals, the card and top-ups all come from `SortedPay/API`; the in-browser mock world (`mockData.ts`) is gone.
- tRPC client (`@trpc/client`, batched) behind a typed facade in `src/lib/api`; API errors surface as `SortedError` with the API's error codes.
- Two sign-in modes: the API's dev tokens (`dev:<mobile>`, any 6-digit code) and Privy SMS login when `VITE_PRIVY_APP_ID` is set. Privy loads lazily and never ships in a dev build.
- Sends, request payments, SMS sends and cash-outs follow the API's two-step outflow: the API prepares a sponsor-paid Solana transaction, the app signs it with the user's Privy embedded wallet (dev custody skips the signature), then submits and waits for the chain.
- Onboarding is real: handle availability and suggestions from the API, profile saved to the account, Tier 1 verification through the KYC adapter, wallet linked on the way in.
- Top up creates a PayID intent on the API and polls it until the payment lands; the simulate button only appears when the API allows simulation.
- SMS sends go into escrow with a real claim code; Undo reverses them on the ledger. New route `/c/:code` previews and claims an SMS send, parking the code through sign-up.
- Search resolves people through the API; deep links like `/send/:handle` work on a cold load.
- Sign out replaces Reset demo. Persisted state moves to v4: cached API snapshot plus preferences; old mock data is dropped on upgrade.
- Fixed: the split amount screen bounced back to the picker on mount; flow intents are now read once per screen so a refresh can't trip a cold-load redirect mid-transition.

## 0.7.0 — September 2026

- Referrals reward **500 Sorted Points** when a mate makes their first send (was $10 cash). Points land in the ledger; balance is never touched. Persisted state migrates v2 → v3.
- Contacts added via New Contact now resolve on every send / request / split / contact-detail screen (`resolveUser`, contacts first).
- Seeded history is relative to real time; relative labels use the real clock.
- Top-up split into `topUp` (pending row) and `confirmTopUp` (credit), driven by the PayID screen's stages instead of a hidden timer.
- SMS flow: the send is recorded exactly once, and Undo on the pending screen cancels it.
- Receive: Share uses the native share sheet with a copy fallback and shows Copied / Shared feedback.
- Transaction detail: card taps show the merchant with a card icon; `/activity/:id` and the Card screen reuse the shared detail content (Card opens a bottom sheet like Home).
- Tab bar: removed the marketing-site bleed band; honours the safe-area inset.
- Notifications, quiet hours and security toggles persist in the store; phone and email come from the user record.
- Sign-in, Terms and Privacy read the build version; company details filled in.
- QR codes come from the `qrcode-generator` package (was a vendored copy).
- ESLint flat config added; `npm run lint` runs tsc + eslint. Per-release READMEs folded into this changelog.

## 0.6.0 — July 2026

- Profile tab built out (Stage 2 of the pivot): shareable @handle card with a real, scannable QR, tier ring and badge, points summary with tier progress, quick rows to Contacts / Referrals / Settings.
- Tier ladder (Fresh → Local → Legend → Icon) shared between Perks and Profile via `lib/tiers`.

## 0.5.2 — June 2026

- Card wordmark uses the actual brand logotype ("sorted." with the full stop, Bricolage 700). Chip removed from the card face. Supersedes 0.5.1.

## 0.5.1 — June 2026

- Card face matches the site card: cropped lime wordmark, dot-grid texture, larger @handle and last4; frozen state greyscales the whole composition.
- Profile tab header reads "Your account / Profile" like the other tabs.

## 0.5.0 — June 2026 (the pivot build)

- All yield removed: no APY banner, no yield rows, no Yield screen, no yield tick.
- New nav: Home / Pay / Card / Perks / Profile. New Pay hub, Card screen (freeze / unfreeze, +1 point per $1, recent taps) and Perks screen (points hero, tier ladder, earn rules, locked local-business perks, points history).
- Data model: `yield` transactions replaced by `tap` with seeded Aussie merchants; seed balance recomputed to the exact net; points ledger attached to actions only.
- Sends earn +10 points. Persisted state migrates v1 → v2 (yield stripped). `/yield` redirects to `/perks`. Tax report swaps yield income for card spend.

## 0.2.1 — May 2026

- Terms and Privacy stubs, settings scroll fix, handle availability suggestions, contacts (auto-add on send + New contact), no-match SMS prompt, profile pictures (IndexedDB), staged PayID top-up mock, Send feedback and Help via mailto, version footer with build hash, sign-in stub, offline banner.
