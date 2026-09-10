# Sorted — app

Mobile-first PWA for Sorted, an Australian P2P payments app: send to any @handle, tap the Sorted card, earn Sorted Points. Live at [app.paymentsorted.com](https://app.paymentsorted.com).

This build is a fully client-side demo. Every service is mocked in the browser and nothing leaves the device. Money in the beta is simulated and has no real financial value.

## Stack

- Vite 6 · React 19 · TypeScript (strict)
- Tailwind CSS 3 · Framer Motion
- Zustand (persisted to `localStorage`) · react-router v7
- vite-plugin-pwa (auto-updating service worker + manifest)
- qrcode-generator (profile QR codes)
- ESLint flat config (`@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh`)

## Scripts

```bash
npm install
npm run dev       # vite dev server with HMR
npm run build     # tsc -b && vite build → dist/
npm run preview   # serve the production bundle
npm run lint      # tsc -b --noEmit && eslint .
```

`vite.config.ts` injects `__APP_VERSION__` (from `package.json`) and `__BUILD_HASH__` (git SHA, or `VERCEL_GIT_COMMIT_SHA` on Vercel). Both show in Settings → footer and in feedback emails.

## Navigation

Bottom tabs: **Home · Pay · Card · Perks · Profile**. Flows (send, request, split, receive, top up, SMS, referrals, legal, contact detail) hide the tab bar and run edge to edge.

## Screens

- **Onboarding** — Splash, Welcome, Sign in, Verify code (demo code `123456`), Claim handle, Profile setup, Verifying identity, Wallet ready
- **Tabs** — Home (balance, points strip, pending requests, recent activity), Pay (hub), Card (freeze/unfreeze, recent taps), Perks (points, tier ladder, earn rules, perk teasers), Profile (shareable @handle card + QR, tier flair)
- **Money flows** — Send (who → amount → confirm → done), Send via SMS (number → amount → confirm → pending → all sorted), Request (who → amount → confirm → sent), Split (people → amount → sent), Receive, Top up (amount → PayID)
- **Activity** — filterable, searchable list; transaction detail as a bottom sheet (and at `/activity/:id`)
- **People** — Contacts, New contact, Contact detail, Referrals
- **Settings** — Profile, Verification (+ upgrade), Notifications, Security & 2FA, Tax & reports, Reset demo
- **Legal** — Terms, Privacy

## State and storage

- `src/lib/mockData.ts` — the seed world: @hannah, demo users, merchants, six weeks of transactions, the points ledger. Timestamps are relative to load time, so history always reads "today / yesterday".
- `src/lib/store.ts` — the Zustand store: balance, points, card, transactions, contacts and pins, referrals, money requests, notification / quiet-hours / security preferences, plus every action (`send`, `topUp` + `confirmTopUp`, `cashOut`, `requestMoney`, `payRequest`, …). Persisted under `sorted-app-state` (version 3) with migrations from v1 and v2.
- `src/lib/notifications.ts` — the notification toggle catalogue shared by the store and the Notifications screen.
- Avatars live in IndexedDB (`src/lib/imageStore.ts`). In-flight flow intent (pending send / request / split / top-up / SMS) lives in `sessionStorage`.
- Settings → Demo → Reset demo clears persisted state and restarts onboarding.

## Points, not yield

Sorted Points are a loyalty program. They are earned from **actions only** — sends, card taps, referrals, profile completion — never from balance held or time elapsed. Do not add interest, yield or APY language, and do not accrue anything from `balanceCents`. This is a legal line, not a style preference.

## What's mocked

- Sign-in, OTP, KYC and wallet provisioning
- Sends, requests, splits, top-ups (PayID), cash-outs, card taps and referral confirmations
- Contact search (a static demo pool), SMS sends and claims
- Push / email / SMS delivery — the toggles persist, nothing is sent
- "On-chain" details (network, fee, reference, settlement time)

## Next steps

Wire the API. The store already isolates every side effect behind an action, so the work is swapping mock bodies for real calls — auth (Privy), KYC (FrankieOne), AUDD on Solana, PayID via virtual accounts, Twilio for SMS claims — and replacing the seed data with fetched state while keeping the store shape.

## Design tokens

ink `#0E0E18` on paper `#F6F2E9`, lime `#C8F154` for actions. Display: Bricolage Grotesque · body: Plus Jakarta Sans · mono: JetBrains Mono · numeric: Inter (tabular). Hard ink drop-shadows (`shadow-ink*`) throughout.
