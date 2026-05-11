<div align="center">

<img src="public/sorted-mark.svg" alt="Sorted" width="120" />

# Sorted

### Money, sorted.

**Free, instant peer-to-peer payments for every Aussie.** Built on Solana with AUDD.

[**▶ Live demo (Figma prototype)**](https://www.figma.com/proto/rFDpHGtF2gCwSayj42wgHq/?node-id=107-157&starting-point-node-id=107%3A157) · [**Marketing site**](https://paymentsorted.com) · [**Architecture doc**](./docs/architecture.pdf)

[![Built on Solana](https://img.shields.io/badge/Built_on-Solana-9945FF?style=flat-square)](https://solana.com) [![Stablecoin AUDD](https://img.shields.io/badge/Stablecoin-AUDD-C8F154?style=flat-square&labelColor=0E0E18)](https://novatti.com) [![License MIT](https://img.shields.io/badge/License-MIT-FFD66B?style=flat-square&labelColor=0E0E18)](./LICENSE)

</div>

---

## What is this?

26 million Australians still send each other money the same way they did in 2012 — by pasting a BSB into a chat, waiting three business days, and copping a "no transfers on weekends" message from their bank.

**Sorted fixes it.** Send to any `@handle` (or even an SMS number) — free, instant, 24/7. Your balance earns 3.33% APY paid daily, no lock-up. Built on Solana for sub-cent fees and <2-second finality. Powered by AUDD, Novatti's AUD-pegged stablecoin, so the unit of account is the Australian dollar end-to-end.

> "We're holding the same phone. It's 2026. Time to fix that."

---

## What's in this repo

This is the **mobile app prototype** — a Vite + React 19 + TypeScript + Tailwind PWA, mobile-first, brand-aligned to the marketing site. It runs locally or deploys to any static host (Vercel-ready out of the box).

| | |
|---|---|
| **15 screens** | Onboarding, home, send flow, receive, top-up, activity, settings, transaction detail |
| **Real state** | Zustand store with mocked Solana/AUDD operations: send, top up, cash out, yield ticking up in real time |
| **Demo identity** | Pre-populated as `@hannah` — Hannah Reid, $1,247.50 starting balance, 15 transactions across 7 days |
| **PWA** | Installable on iOS/Android home screen, offline-capable |
| **Brand-accurate** | Same design tokens, typography, and visual language as the marketing site and Figma prototype |

### What's mocked (for the hackathon)

To keep the build self-contained, the following are **simulated locally** rather than wired to real services:

- **Solana RPC + AUDD transfers** — calls resolve in ~1.8s to mimic mainnet finality
- **FrankieOne KYC** — onboarding step is a visual placeholder
- **Privy wallet provisioning** — mocked at the "Wallet ready" screen
- **PayID top-up** — "Simulate bank payment" button stands in for OSKO/PayID rails

The architecture document (`docs/architecture.pdf`) details how each of these gets wired in for v1.

### What's NOT in this codebase (but IS in the Figma prototype)

The full clickable demo is the [**Figma prototype**](https://www.figma.com/proto/rFDpHGtF2gCwSayj42wgHq/?node-id=107-157&starting-point-node-id=107%3A157), which includes some flows we designed but haven't ported back to the React codebase yet:

- **Send via SMS** — pay any Australian mobile number; recipient gets a Twilio claim link
- **Splash intro + animated onboarding** (OTP fill, KYC step progression, bouncy success states)
- **Stateful Home variants** — empty / funded / after-send / after-SMS, each with real balances and activity feeds
- **Settled-in receipts** — every successful send shows the actual Solana finality time on the receipt

If you're judging the *pitch*, watch the demo video. If you want to *run* something, this repo.

---

## Quick start

```bash
git clone https://github.com/paymentsorted/sorted-app.git
cd sorted-app
npm install
npm run dev          # http://localhost:5173
```

Production preview:

```bash
npm run build
npm run preview
```

That's it. No env vars needed for the demo build — all data is mocked locally.

---

## Deploy

### Vercel (one-click)

1. Fork or push this repo to GitHub
2. Visit https://vercel.com/new and import the repo
3. Vercel auto-detects Vite. Click **Deploy**.

The included `vercel.json` handles SPA routing (every URL falls back to `index.html`) and PWA caching headers.

### Vercel CLI

```bash
npm i -g vercel
vercel              # preview deploy
vercel --prod       # production deploy
```

### Anywhere else

The build output in `dist/` is a static SPA. Drop it on Netlify, Cloudflare Pages, S3 + CloudFront, or any static host. Configure the host to fall back to `index.html` for SPA routes.

---

## Demo walkthrough (90 seconds)

The flow that lands best when demoing live:

1. **Welcome** (`/`) — type any 10-digit phone → Continue
2. **Verify** (`/verify`) — type any 6 digits, auto-advances
3. **Claim @handle** (`/claim`) — `hannah` is special-cased as available; other names like `jackl` come back as taken
4. **Profile** (`/profile`) — name pre-filled; tap swatches to change avatar colour
5. **Wallet ready** (`/ready`) — auto-advances after 3.5s
6. **Home** (`/home`) — balance card, lime yield card (+$0.11 today, 3.33% APY), activity feed
7. **Send** → pick Jack → enter amount → "Review send" → "Hold to confirm" → success
8. Back to home — balance dropped, new tx at top of feed
9. **Receive** → `@hannah` card with Copy / Share / pseudo-QR
10. **+ Top up** → enter amount → "Simulate bank payment" → balance increases after 3s
11. Bottom nav → **Activity** (full feed grouped by day) → **Settings** → "Reset demo" wipes back to seed

Yield ticks up `+$0.01` per minute while the app is open, so the balance feels alive.

---

## Architecture

```
src/
├── App.tsx                  # Routing
├── main.tsx                 # React entry
├── styles/global.css        # Brand tokens, .hl, .btn primitives
├── lib/
│   ├── mockData.ts          # @hannah world: users, transactions, helpers
│   └── store.ts             # Zustand store: send / topUp / cashOut / reset / _tickYield
├── components/
│   ├── AppShell.tsx         # Wrapper + bottom tab nav
│   ├── Avatar.tsx           # Coloured initials tile (5 brand colours)
│   ├── Header.tsx           # Top bar with back / close
│   └── Screen.tsx           # Framer Motion entry / exit wrapper
└── screens/
    ├── Welcome.tsx          # Onboarding
    ├── VerifyCode.tsx
    ├── ClaimHandle.tsx
    ├── ProfileSetup.tsx
    ├── WalletReady.tsx
    ├── Home.tsx             # ⭐ The hero screen
    ├── Activity.tsx
    ├── Settings.tsx
    ├── SendWho.tsx          # Send flow
    ├── SendAmount.tsx
    ├── SendConfirm.tsx
    ├── SendDone.tsx
    ├── Receive.tsx
    ├── TopUpAmount.tsx      # Top up flow
    ├── TopUpPayID.tsx
    └── TxDetail.tsx
```

### Tech stack

| | |
|---|---|
| **Frontend** | React 19, TypeScript (strict), Vite, Tailwind CSS, Framer Motion |
| **State** | Zustand |
| **Routing** | React Router 7 |
| **PWA** | vite-plugin-pwa (workbox) |
| **Icons** | lucide-react + custom SVGs |
| **Chain** | Solana mainnet *(planned — currently mocked)* |
| **Stablecoin** | AUDD (Novatti) *(planned — currently mocked)* |
| **Wallet** | Privy (TEE-secured, no seed phrases for users) *(planned)* |
| **KYC** | FrankieOne (AUSTRAC-compliant) *(planned)* |
| **Fiat on-ramp** | PayID / OSKO via Novatti *(planned)* |
| **SMS claim links** | Twilio short-code *(planned)* |

### Brand tokens

```
paper      #F6F2E9    cream background
ink        #0E0E18    text + borders
lime       #C8F154    primary accent
coral      #FF5A4E    secondary accent
sky        #5BB7FF    tertiary
butter     #FFD66B    tertiary
plum       #6B4EFF    tertiary
```

Fonts: **Bricolage Grotesque** (display, 700/800) · **Plus Jakarta Sans** (body, 400-700) · **JetBrains Mono** (mono, 500/600) · **Inter** (numeric, 700)

---

## Why Solana?

Three non-negotiables for everyday Australian P2P payments:

1. **Sub-cent fees** — at $0.0008 per transaction, Sorted can be genuinely free at the user layer. No other L1 hits this number today.
2. **<2-second finality** — when a mate splits a bill at the pub, "settling tomorrow" is unacceptable. Solana's slot time + AUDD's instant-mint makes Splash-to-Sent feel like Venmo, but actually settle on-chain.
3. **Scale that won't choke** — 26M Australians paying their flatmates on the same Sunday evening needs throughput. Solana handles it.

AUDD (Novatti's AUD-pegged stablecoin) is the missing piece. Until 2024, an Aussie P2P app on a fast chain had to deal in USD or USDC, which means FX friction on every transaction. With AUDD, the unit of account stays Australian dollars end-to-end. Top up via PayID → AUDD in your wallet → send → recipient sees AUD. No "0.97 USDC = $1.50 AUD" confusion.

---

## Related repos / artefacts

| | |
|---|---|
| `sorted-app` *(this repo)* | The PWA prototype |
| `sorted-marketing-site` | The marketing site at [paymentsorted.com](https://paymentsorted.com) |
| `sorted-figma` | Figma file: [design + clickable prototype](https://www.figma.com/design/rFDpHGtF2gCwSayj42wgHq/) |
| `docs/architecture.pdf` | 20-page architecture document — Solana/AUDD integration, KYC flow, custody model, regulatory positioning |

---

## Roadmap

**v0.1 (current):** clickable prototype with mocked services, full design system

**v0.2 (next 4 weeks of dev):**
- Wire real Solana + AUDD via Helius RPC
- Privy wallet integration (no seed phrase UX)
- FrankieOne KYC for onboarding
- PayID/OSKO top-up via Novatti

**v0.3 (next 4 weeks):**
- Send via SMS (Twilio short-code + claim links)
- Settings sub-screens (notifications, security, KYC details)
- Cash-out to bank
- Yield calculator + APY history graph

**v1 (beta):**
- iOS + Android native builds (Capacitor)
- Real Sorted brand domain + invitation system
- Production AUDD reserves backing

---

## Built by

**Gray Sunderland** ([@graysun](https://github.com/graysun) · Brisbane, AU) — design + product, with heavy collaboration from Claude (Anthropic). 13 years designing financial products in Australia; finally building one I'd actually use.

---

## License

MIT — see [LICENSE](./LICENSE).

Use the code, fork it, learn from it. Don't ship a knockoff Sorted. The brand and trade marks belong to the project.

---

<div align="center">
<sub>Built for the <a href="https://solana.com">Solana</a> hackathon · 2026</sub>
</div>
