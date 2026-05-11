# Sorted — PWA (v0.2 beta)

The Sorted mobile-first PWA for beta testers. Vite + React 19 + TypeScript strict + Tailwind + Framer Motion + Zustand. All screens pixel-matched against the canonical Figma prototype.

**Identity:** @hannah (Hannah Reid) — wallet provisioned but **empty**. Beta testers go through the real onboarding flow and top up to start sending.

**Services:** All mocked locally in v0.2. Solana, AUDD, Privy, FrankieOne, and Twilio integrations land in v0.3.

---

## Screens (22 total)

### Onboarding (7)
- **Splash** — lime intro, 1.5s auto-advance
- **Welcome** — phone-number entry
- **Verify** — 6-digit SMS code (any digits succeed)
- **Claim handle** — @hannah pre-filled, availability check
- **Profile setup** — name + avatar colour
- **Verifying identity** — 4-step KYC simulation (FrankieOne → Privy → Wallet → Finalising)
- **Wallet ready** — "You're sorted." → tap into the app

### Main app (4 tabs)
- **Home** — empty state ($0, "Top up to get going") + 3.33% APY strip + bottom nav
- **Activity** — empty state until first transaction; grouped by day when populated
- **Yield (Earnings)** — 3.33% APY card, lifetime earned, how it works, recent payouts
- **Settings** — profile card with TIER 1 pill + grouped list

### Send flow — @handle (4)
- **Send · Who's it for?** — search input, lime SMS card, RECENT contacts (Jack, Maya, Naomi, Charlie)
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
- **Top up · PAY-ID** — lime PayID card with Copy, paper reference card, butter waiting pill, Simulate bank payment (paper-elevated)

### Settings sub-screens (3)
- **Profile** — edit name, avatar colour; @handle and mobile are read-only
- **Verification** — lime hero with $10k daily / $5k per-txn limits, grouped verified card, dark UNLOCK MORE card with TIER 2 plum pill
- **Notifications** — Money / Yield / Account toggle list

---

## Deploy to Vercel

The repo is Vercel-ready. `vercel.json` has SPA rewrites (so /home, /send/jackl etc. all resolve) and PWA-friendly cache headers (`sw.js` no-cache, static assets immutable).

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
npm run build       # tsc -b && vite build (clean prod bundle ~470 KB)
npm run preview     # vite preview of the prod bundle
```

---

## State & data

All state lives in `src/lib/store.ts` (Zustand). Seed values in `src/lib/mockData.ts`:

- `SEED_BALANCE_CENTS = 0` — beta testers start at $0
- `SEED_TRANSACTIONS = []` — Activity is empty on first launch
- `MOCK_CONTACTS` — always-visible Jack/Maya/Naomi/Charlie for SendWho RECENT list

To restore the "lived-in @hannah" demo state for screenshots/demos, restore `SEED_BALANCE_CENTS = 124750` and the original SEED_TRANSACTIONS array (recoverable from git history).

---

## What's next (v0.3)

- Wire Privy for real wallet creation
- Wire FrankieOne for real KYC (tier 1 only initially)
- Wire AUDD on Solana mainnet for actual stablecoin sends
- Real PayID integration via Australian Payments Plus
- Real Twilio SMS for the SMS send flow with one-time claim links
- Real recents derived from on-chain send history (replaces MOCK_CONTACTS)

---

Built end of April – early May 2026 in @hannah's voice. Brand: ink #0E0E18 on paper #F6F2E9 with lime #C8F154 as the action color. Display: Bricolage Grotesque Bold. Body: Plus Jakarta Sans. Mono: JetBrains Mono. Numeric: Inter tabular.
