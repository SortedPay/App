# Sorted — PWA (v0.2.1 beta)

The Sorted mobile-first PWA for beta testers. Vite + React 19 + TypeScript strict + Tailwind + Framer Motion + Zustand. All screens pixel-matched against the canonical Figma prototype.

**Identity:** @hannah (Hannah Reid) — wallet provisioned but **empty**. Beta testers go through the real onboarding flow and top up to start sending.

**Services:** All mocked locally in v0.2.x. Solana, AUDD, Privy, FrankieOne, and Twilio integrations land in v0.3.

---

## What's new in v0.2.1

Six rounds of beta-tester feedback baked in:

- **Terms & Privacy stub pages** at `/legal/terms` and `/legal/privacy`, wired from Welcome
- **Settings scroll fix** — last toggle no longer cropped by bottom nav
- **Handle availability with suggestions** — coral input border + tappable chips when taken (`@jackl` → `@jackl1`, `@jackl_`, `@_jackl`)
- **Contacts** — auto-added on first send, plus explicit `+ New contact` button at top of RECENT
- **No-match SMS CTA** — when search returns nothing, prompts "Send via SMS instead" with a tappable lime pill
- **Profile pictures** — IndexedDB-backed upload + resize, camera badge on SettingsProfile + ProfileSetup
- **Top up honest mock** — per-session unique PayID like `topup+hannah-7ymk@sorted.au`, DEMO badge, 3-stage flow (Waiting → Bank payment received → Converting AUD to AUDD on Solana → Done) to teach testers the real v0.3 timing
- **Send feedback** item in Settings — opens mailto with pre-filled device info + build hash
- **Help & Support** — opens mailto instead of a "coming soon" toast
- **Real version footer** — `Sorted · v0.2.1 · {build-hash}`, tappable to copy build info for bug reports
- **Sign in stub** — `/signin` for testers who reset demo state
- **Offline banner** — fixed-top "You're offline" indicator when network drops

---

## Screens (28 total)

### Onboarding (8)
- **Splash** — lime intro, 1.5s auto-advance
- **Welcome** — phone-number entry + "Already on Sorted? Sign in" link
- **Sign in** — stub that drops testers back in as @hannah (real v0.3)
- **Verify** — 6-digit SMS code (any digits succeed)
- **Claim handle** — @hannah pre-filled, availability check + suggestions on taken
- **Profile setup** — name + avatar colour + photo upload
- **Verifying identity** — 4-step KYC simulation (FrankieOne → Privy → Wallet → Finalising)
- **Wallet ready** — "You're sorted." → tap into the app

### Main app (4 tabs)
- **Home** — empty state ($0, "Top up to get going") + 3.33% APY strip + bottom nav
- **Activity** — empty state until first transaction; grouped by day when populated
- **Yield (Earnings)** — 3.33% APY card, lifetime earned, how it works, recent payouts
- **Settings** — profile card with TIER 1 pill + grouped list with Send feedback + version footer

### Send flow — @handle (4)
- **Send · Who's it for?** — search input, lime SMS card, `+ New contact` button, RECENT contacts; no-match → "Send via SMS instead"
- **Send · Amount** — keypad + preset chips
- **Send · Confirm** — receipt card (Network, Network fee, Arrives), hold-to-send (1.2s)
- **Send · Done** — "Sent." + receipt with **Settled in 1.8s** + CONFIRMED status pill

### Send flow — via SMS (5)
- **SMS · Number** — mobile + optional name + HOW IT WORKS
- **SMS · Amount** — keypad, phone in dashed lime ring
- **SMS · Confirm** — PEACE OF MIND sky card, hold-to-send
- **SMS · Pending** — "On the way." + TEXT WE SENT preview with claim link (auto-advances 2.5s)
- **SMS · All sorted** — receipt with **Settled in 2.1s**

### Receive (1)
- **Receive** — Get paid. Lime @handle card with Copy/Share + stylised QR placeholder

### Top up (2)
- **Top up · Amount** — butter tile, COMMBANK · ····0421 line, presets
- **Top up · PAY-ID** — lime PayID card with unique per-session address + DEMO badge, paper Reference card, 3-stage status pill (Waiting → Received → Converting → Done)

### Settings sub-screens (3)
- **Profile** — edit name, avatar colour, **upload photo via camera badge**; @handle and mobile are read-only
- **Verification** — lime hero with $10k daily / $5k per-txn limits, grouped verified card, dark UNLOCK MORE card with TIER 2 plum pill
- **Notifications** — Money / Yield / Account toggle list

### Contacts (1)
- **New contact** (`/contacts/new`) — search by @handle/name, add existing demo users, or add a custom handle for someone not on Sorted yet

### Legal (2)
- **Terms** (`/legal/terms`) — 8 sections, Australian-aligned
- **Privacy** (`/legal/privacy`) — 7 sections, APP-aligned

---

## Deploy to Vercel

The repo is Vercel-ready. `vercel.json` has SPA rewrites (so /home, /send/jackl, /sms/confirm all resolve) and PWA-friendly cache headers (`sw.js` no-cache, static assets immutable).

The build process auto-detects the git commit SHA from `VERCEL_GIT_COMMIT_SHA` and embeds it as the build hash in Settings → footer. Testers can tap the footer to copy `Sorted v0.2.1 (abc1234)` for bug reports.

```bash
cd sorted-app
npm install
vercel              # preview deploy
vercel --prod       # production deploy
```

After the first prod deploy, point the custom domain `app.paymentsorted.com` at the project in the Vercel dashboard → Project → Settings → Domains.

---

## Local development

```bash
npm install
npm run dev         # vite dev server with HMR
npm run build       # tsc -b && vite build (clean prod bundle ~500 KB)
npm run preview     # vite preview of the prod bundle
```

---

## State, data, and storage

- All app state lives in `src/lib/store.ts` (Zustand). Seed values in `src/lib/mockData.ts`:
  - `SEED_BALANCE_CENTS = 0` — beta testers start at $0
  - `SEED_TRANSACTIONS = []` — Activity is empty on first launch
  - `MOCK_CONTACTS` — always-visible Jack/Maya/Naomi/Charlie for SendWho RECENT list
- Profile pictures stored as Blobs in **IndexedDB** (`src/lib/imageStore.ts`) — survive reloads, 5MB capacity per image, automatically resized to 512×512 JPEG @ 0.85 quality before storage.
- On app mount, `App.tsx` reads the user's avatar from IDB and creates an object URL on the store. The Avatar component switches to an `<img>` when `imageUrl` is set.

To restore the "lived-in @hannah" demo state for screenshots/demos, restore `SEED_BALANCE_CENTS = 124750` and the original SEED_TRANSACTIONS array (recoverable from git history).

---

## What's next (v0.3)

- Wire Privy for real wallet creation
- Wire FrankieOne for real KYC (tier 1 only initially)
- Wire AUDD on Solana mainnet for actual stablecoin sends
- Real PayID integration via Monoova or Zai virtual accounts (decision pending)
- Real Twilio SMS for the SMS send flow with one-time claim links
- Real recents derived from on-chain send history (replaces MOCK_CONTACTS seed)
- Real sign-in flow at `/signin` (Privy SMS-based)
- Pull-to-refresh on Home (gesture handler)

---

## Design tokens

ink #0E0E18 on paper #F6F2E9 with lime #C8F154 as the action color.
Display: Bricolage Grotesque Bold. Body: Plus Jakarta Sans. Mono: JetBrains Mono. Numeric: Inter tabular.
