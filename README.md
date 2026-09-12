# Sorted — app

Mobile-first PWA for Sorted, an Australian P2P payments app: send to any @handle, tap the Sorted card, earn Sorted Points. Live at [app.paymentsorted.com](https://app.paymentsorted.com).

The app talks to the Sorted API ([SortedPay/API](https://github.com/SortedPay/API), private): sign-in, balances, sends, requests, top-ups and points all come from there. Nothing is mocked in the browser any more. Money in the beta is simulated on the API's mock rails and has no real financial value until the API runs on mainnet AUDD.

## Stack

- Vite 6 · React 19 · TypeScript (strict)
- Tailwind CSS 3 · Framer Motion
- Zustand (API snapshot cached in `localStorage`) · react-router v7
- `@trpc/client` against the API's tRPC router (batched, typed facade in `src/lib/api`)
- `@privy-io/react-auth` (lazy-loaded, only when `VITE_PRIVY_APP_ID` is set) for SMS sign-in and embedded Solana wallet signing
- vite-plugin-pwa (auto-updating service worker + manifest)
- qrcode-generator (profile QR codes)
- ESLint flat config (`@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh`)

## Scripts

```bash
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:8787 (run the API with `npm run db:seed && npm run dev`)
npm run dev       # vite dev server with HMR
npm run build     # tsc -b && vite build → dist/
npm run preview   # serve the production bundle
npm run lint      # tsc -b --noEmit && eslint .
```

Sign in with any Australian mobile. Against a dev API (`AUTH_PROVIDER=dev`) any 6-digit code works and the API trusts a `dev:<mobile>` bearer token; the seeded demo account is 0412 345 921 (@hannah). With `VITE_PRIVY_APP_ID` set the same screens drive Privy's SMS login instead, and every send is signed in the browser by the user's Privy embedded wallet before the API co-signs and broadcasts it.

`vite.config.ts` injects `__APP_VERSION__` (from `package.json`) and `__BUILD_HASH__` (git SHA, or `VERCEL_GIT_COMMIT_SHA` on Vercel). Both show in Settings → footer and in feedback emails.

## Navigation

Bottom tabs: **Home · Pay · Card · Perks · Profile**. Flows (send, request, split, receive, top up, SMS, referrals, legal, contact detail) hide the tab bar and run edge to edge.

## Screens

- **Onboarding** — Splash, Welcome, Sign in, Verify code, Claim handle (availability + suggestions from the API), Profile setup, Verifying identity (Tier 1 KYC through the API), Wallet ready
- **Claim links** — `/c/:code` from an SMS send: preview who sent what, claim in one tap, or park the code through sign-up
- **Tabs** — Home (balance, points strip, pending requests, recent activity), Pay (hub), Card (freeze/unfreeze, recent taps), Perks (points, tier ladder, earn rules, perk teasers), Profile (shareable @handle card + QR, tier flair)
- **Money flows** — Send (who → amount → confirm → done), Send via SMS (number → amount → confirm → pending → all sorted), Request (who → amount → confirm → sent), Split (people → amount → sent), Receive, Top up (amount → PayID)
- **Activity** — filterable, searchable list; transaction detail as a bottom sheet (and at `/activity/:id`)
- **People** — Contacts, New contact, Contact detail, Referrals
- **Settings** — Profile, Verification (+ upgrade), Notifications, Security & 2FA, Tax & reports, Reset demo
- **Legal** — Terms, Privacy

## State and storage

- `src/lib/api/client.ts` — the tRPC client: `createTRPCUntypedClient` + `httpBatchLink` behind a typed facade (`api.sends.prepare(...)` etc.). Every error becomes a `SortedError` with the API's `sortedCode`. `src/lib/api/types.ts` transcribes the API's wire types; keep it in step with the API repo.
- `src/lib/auth.ts` — session and signing. Dev mode stores a `dev:<mobile>` token; Privy mode registers a bridge from `src/lib/privy.tsx` (access token, `useLoginWithSms`, `useSignTransaction`). `signPreparedTransaction` turns the API's base64 transaction into a user-signed one.
- `src/lib/store.ts` — the Zustand store. `boot()` reads `system.config` and restores the session, `bootstrap()` runs `auth.bootstrap` after sign-in, `refresh()` re-fetches every slice in one batched request. Money actions follow the API's two-step outflow: prepare → sign (Privy) → `sends.submit` → poll `sends.status` until the chain confirms. The last snapshot is cached under `sorted-app-state` (version 4; older mock state is dropped, preferences kept) so the app paints instantly on the next open.
- `src/lib/model.ts` — the shapes screens render, formatters, and the known-user cache that lets `/send/:handle` resolve without a round trip (`useResolvedUser` in `src/lib/search.ts` asks the API on a cold load).
- `src/lib/notifications.ts` — the notification toggle catalogue shared by the store and the Notifications screen.
- Avatars live in IndexedDB (`src/lib/imageStore.ts`). In-flight flow intent (pending send / request / split / top-up / SMS) lives in `sessionStorage`, read once per screen mount (`src/lib/intent.ts`).
- Settings → Session → Sign out clears the token and the cached snapshot.

## Points, not yield

Sorted Points are a loyalty program. They are earned from **actions only** — sends, card taps, referrals, profile completion — never from balance held or time elapsed. Do not add interest, yield or APY language, and do not accrue anything from `balanceCents`. This is a legal line, not a style preference.

## What's still mocked (on the API side)

Which rails are real is the API's call, not this app's: the API's `system.config` tells the app whether it must sign (`custody: privy`) and whether the demo affordances exist (`simulation`). Against a dev API the chain, PayID, KYC and SMS adapters are mocks, so the Top up screen shows a "Simulate bank payment" button and nothing is texted. In this app the only local-only state is preferences (notifications, quiet hours, security toggles) and the card is labelled demo until issuing exists.

## Environment

- `VITE_API_URL` — the API origin. Empty means the app shows a "not connected" state rather than pretending.
- `VITE_PRIVY_APP_ID` — enables Privy. Must match the API's `AUTH_PROVIDER`; the app refuses to run against a mismatched API.
- The API's `CORS_ORIGINS` must include the origin this app is served from.

## Design tokens

ink `#0E0E18` on paper `#F6F2E9`, lime `#C8F154` for actions. Display: Bricolage Grotesque · body: Plus Jakarta Sans · mono: JetBrains Mono · numeric: Inter (tabular). Hard ink drop-shadows (`shadow-ink*`) throughout.
